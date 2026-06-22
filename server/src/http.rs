//! HTTP driving adapter (Phase 12 prep). Exposes the [`App`] services as a
//! REST API. A driving adapter per SPEC sec 3.4 - the UI/Tauri/CLI all reach
//! the core through here; gates are evaluated before any state change.

use std::net::SocketAddr;
use std::path::Path;
use std::sync::Arc;

use axum::{
    extract::{Path as AxumPath, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use tower_http::cors::CorsLayer;

use strategynotes_adapters::{DaynoteEventSink, MarkdownVault, SQLiteIndex, SystemClock, UlidMinter};
use strategynotes_core::evidence::{EvidenceKind, ProofLevel};
use strategynotes_core::execution::{Completion, PomoEstimate};
use strategynotes_core::ports::{DerivedIndex, NodeVault};
use strategynotes_core::services::App;
use strategynotes_core::trace::reachable_via_spine;
use strategynotes_core::views::TypedView;
use strategynotes_core::{AttentionMode, GateResult, NodeId, PomoPattern};

/// Owned bundle of concrete adapters; shared across handlers via Arc.
pub struct ServerState {
    pub vault: MarkdownVault,
    pub index: SQLiteIndex,
    pub sink: DaynoteEventSink,
    pub minter: UlidMinter,
    pub clock: SystemClock,
}

impl ServerState {
    /// Build an [`App`] borrowing from self.
    fn app(&self) -> App<'_> {
        App {
            vault: &self.vault,
            sink: &self.sink,
            minter: &self.minter,
            clock: &self.clock,
        }
    }
}

pub async fn serve(data_dir: &Path, port: u16) -> Result<(), Box<dyn std::error::Error>> {
    let state = Arc::new(ServerState {
        vault: MarkdownVault::open(data_dir.join("vault"))?,
        index: SQLiteIndex::open_file(data_dir.join("index.db"))?,
        sink: DaynoteEventSink::open(data_dir.join("daynotes"))?,
        minter: UlidMinter,
        clock: SystemClock,
    });

    let app = Router::new()
        .route("/api/health", get(health))
        .route("/api/node/:id", get(get_node))
        .route("/api/nodes/:ty", get(list_nodes_by_type))
        .route("/api/cases", post(create_case).get(list_cases))
        .route("/api/sources", post(add_source))
        .route("/api/source-chunks", post(add_source_chunk))
        .route("/api/evidence", post(extract_evidence))
        .route("/api/evidence/:id/accept", post(accept_evidence))
        .route("/api/claims", post(create_claim))
        .route("/api/bets", post(draft_bet))
        .route("/api/bets/:id/approve", post(approve_bet))
        .route("/api/work-packages", post(create_work_package))
        .route("/api/work-packages/:id/commit", post(commit_work_package))
        .route("/api/timeboxes", post(schedule_timebox))
        .route("/api/timeboxes/:id/review", post(review_timebox))
        .route("/api/value-claims", post(claim_value))
        .route("/api/value-claims/:id/validate", post(validate_value))
        .route("/api/agent-runs", get(list_agent_runs))
        .route("/api/agent-runs/:id", get(get_agent_run))
        .route("/api/agent-runs/:id/accept", post(accept_agent_run))
        .route("/api/agent-runs/:id/reject", post(reject_agent_run))
        .route("/api/agent-runs/:id/request-changes", post(request_changes))
        .route("/api/trace/:id", get(trace))
        .route("/api/search", get(search))
        .route("/api/daynote/:date", get(daynote))
        .layer(CorsLayer::permissive())
        .with_state(state);

    let addr = SocketAddr::from(([127, 0, 0, 1], port));
    println!("StrategyNotes HTTP server on http://{addr}");
    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;
    Ok(())
}

async fn health() -> &'static str {
    "ok"
}

/// GET /api/node/:id - return one node's raw frontmatter + body (for UI rendering).
async fn get_node(
    State(st): State<Arc<ServerState>>,
    AxumPath(id): AxumPath<String>,
) -> Result<Json<serde_json::Value>, AppError> {
    let nid = NodeId::parse(&id)?;
    let node = st
        .vault
        .get(&nid)?
        .ok_or(AppError(StatusCode::NOT_FOUND, format!("node {id} not found")))?;
    Ok(Json(serde_json::to_value(&node)?))
}

/// GET /api/nodes/:ty - list node ids of a given type (snake_case).
async fn list_nodes_by_type(
    State(st): State<Arc<ServerState>>,
    AxumPath(ty): AxumPath<String>,
) -> Result<Json<Vec<String>>, AppError> {
    st.index.rebuild(&st.vault)?;
    let nt: NodeType = strategynotes_core::naming::from_snake_case(&ty)?;
    let ids = st.index.nodes_by_type(nt)?;
    Ok(Json(ids.into_iter().map(|i| i.to_lexical()).collect()))
}

#[derive(Deserialize)]
struct TitleBody {
    title: String,
}

async fn create_case(
    State(st): State<Arc<ServerState>>,
    Json(b): Json<TitleBody>,
) -> Result<Json<serde_json::Value>, AppError> {
    let c = st.app().create_case(b.title)?;
    Ok(Json(serde_json::to_value(&c)?))
}

async fn list_cases(
    State(st): State<Arc<ServerState>>,
) -> Result<Json<Vec<String>>, AppError> {
    // Rebuild the index first so queries reflect current vault state.
    st.index.rebuild(&st.vault)?;
    let ids = st
        .index
        .nodes_by_type(strategynotes_core::node::NodeType::StrategyCase)?;
    Ok(Json(ids.into_iter().map(|i| i.to_lexical()).collect()))
}

#[derive(Deserialize)]
struct AddSourceBody {
    title: String,
    provenance: Option<String>,
}

async fn add_source(
    State(st): State<Arc<ServerState>>,
    Json(b): Json<AddSourceBody>,
) -> Result<Json<serde_json::Value>, AppError> {
    let s = st.app().add_source(b.title, b.provenance)?;
    Ok(Json(serde_json::to_value(&s)?))
}

#[derive(Deserialize)]
struct AddChunkBody {
    source: String,
    locator: String,
    text: String,
}

async fn add_source_chunk(
    State(st): State<Arc<ServerState>>,
    Json(b): Json<AddChunkBody>,
) -> Result<Json<serde_json::Value>, AppError> {
    let src = NodeId::parse(&b.source)?;
    let c = st.app().add_source_chunk(src, b.locator, b.text)?;
    Ok(Json(serde_json::to_value(&c)?))
}

#[derive(Deserialize)]
struct ExtractEvidenceBody {
    source_chunk: String,
    text: String,
    proof_level: ProofLevel,
    kind: EvidenceKind,
}

async fn extract_evidence(
    State(st): State<Arc<ServerState>>,
    Json(b): Json<ExtractEvidenceBody>,
) -> Result<Json<serde_json::Value>, AppError> {
    let sc = NodeId::parse(&b.source_chunk)?;
    let e = st.app().extract_evidence(sc, b.text, b.proof_level, b.kind)?;
    Ok(Json(serde_json::to_value(&e)?))
}

async fn accept_evidence(
    State(st): State<Arc<ServerState>>,
    AxumPath(id): AxumPath<String>,
) -> Result<Json<GateResult>, AppError> {
    let id = NodeId::parse(&id)?;
    Ok(Json(st.app().accept_evidence(id)?))
}

#[derive(Deserialize)]
struct CreateClaimBody {
    statement: String,
    proof_level: ProofLevel,
    supports: Vec<String>,
}

async fn create_claim(
    State(st): State<Arc<ServerState>>,
    Json(b): Json<CreateClaimBody>,
) -> Result<Json<serde_json::Value>, AppError> {
    let sup: Vec<NodeId> = b.supports.into_iter().map(|s| NodeId::parse(&s)).collect::<Result<_, _>>()?;
    let c = st.app().create_claim(b.statement, b.proof_level, sup)?;
    Ok(Json(serde_json::to_value(&c)?))
}

#[derive(Deserialize)]
struct DraftBetBody {
    case: String,
    thesis: String,
}

async fn draft_bet(
    State(st): State<Arc<ServerState>>,
    Json(b): Json<DraftBetBody>,
) -> Result<Json<serde_json::Value>, AppError> {
    let case = NodeId::parse(&b.case)?;
    let bet = st.app().draft_bet(case, b.thesis)?;
    Ok(Json(serde_json::to_value(&bet)?))
}

async fn approve_bet(
    State(st): State<Arc<ServerState>>,
    AxumPath(id): AxumPath<String>,
) -> Result<Json<GateResult>, AppError> {
    Ok(Json(st.app().approve_bet(NodeId::parse(&id)?)?))
}

#[derive(Deserialize)]
struct CreateWorkPackageBody {
    case: String,
    linked_bet: String,
    objective: String,
}

async fn create_work_package(
    State(st): State<Arc<ServerState>>,
    Json(b): Json<CreateWorkPackageBody>,
) -> Result<Json<serde_json::Value>, AppError> {
    let wp = st.app().create_work_package(NodeId::parse(&b.case)?, NodeId::parse(&b.linked_bet)?, b.objective)?;
    Ok(Json(serde_json::to_value(&wp)?))
}

async fn commit_work_package(
    State(st): State<Arc<ServerState>>,
    AxumPath(id): AxumPath<String>,
) -> Result<Json<GateResult>, AppError> {
    Ok(Json(st.app().commit_work_package(NodeId::parse(&id)?)?))
}

#[derive(Deserialize)]
struct ScheduleTimeboxBody {
    work_package: String,
    pomos: u32,
    start: chrono::DateTime<chrono::Utc>,
    end: chrono::DateTime<chrono::Utc>,
    expected_output: String,
}

async fn schedule_timebox(
    State(st): State<Arc<ServerState>>,
    Json(b): Json<ScheduleTimeboxBody>,
) -> Result<Json<serde_json::Value>, AppError> {
    let t = st.app().schedule_timebox(
        NodeId::parse(&b.work_package)?,
        PomoEstimate { pomos: b.pomos, pattern: PomoPattern::P25M5, attention_mode: AttentionMode::ExecutionBuild },
        b.start,
        b.end,
        b.expected_output,
    )?;
    Ok(Json(serde_json::to_value(&t)?))
}

#[derive(Deserialize)]
struct ReviewBody {
    actual_pomos: u32,
    completion: Completion,
    evidence_links: Vec<String>,
    next_action: String,
}

async fn review_timebox(
    State(st): State<Arc<ServerState>>,
    AxumPath(id): AxumPath<String>,
    Json(b): Json<ReviewBody>,
) -> Result<Json<serde_json::Value>, AppError> {
    let links: Vec<NodeId> = b.evidence_links.into_iter().map(|s| NodeId::parse(&s)).collect::<Result<_, _>>()?;
    let (_review, result) = st.app().review_and_verify_timebox(
        NodeId::parse(&id)?,
        b.actual_pomos,
        b.completion,
        links,
        None,
        b.next_action,
    )?;
    Ok(Json(serde_json::json!({"gate": result})))
}

#[derive(Deserialize)]
struct ClaimValueBody {
    case: String,
    statement: String,
    proof_level: ProofLevel,
    evidence_links: Vec<String>,
    linked_outcome: String,
}

async fn claim_value(
    State(st): State<Arc<ServerState>>,
    Json(b): Json<ClaimValueBody>,
) -> Result<Json<serde_json::Value>, AppError> {
    let links: Vec<NodeId> = b.evidence_links.into_iter().map(|s| NodeId::parse(&s)).collect::<Result<_, _>>()?;
    let vc = st.app().claim_value(
        NodeId::parse(&b.case)?,
        b.statement,
        b.proof_level,
        links,
        NodeId::parse(&b.linked_outcome)?,
    )?;
    Ok(Json(serde_json::to_value(&vc)?))
}

async fn validate_value(
    State(st): State<Arc<ServerState>>,
    AxumPath(id): AxumPath<String>,
) -> Result<Json<GateResult>, AppError> {
    Ok(Json(st.app().validate_value(NodeId::parse(&id)?)?))
}

// ---- agent runs (INV-HUMAN quarantine) ----

#[derive(Deserialize)]
struct CreateAgentRunBody {
    agent: String,
    summary: String,
}

async fn list_agent_runs(
    State(st): State<Arc<ServerState>>,
) -> Result<Json<Vec<String>>, AppError> {
    st.index.rebuild(&st.vault)?;
    let ids = st.index.nodes_by_type(strategynotes_core::node::NodeType::AgentRun)?;
    Ok(Json(ids.into_iter().map(|i| i.to_lexical()).collect()))
}

async fn get_agent_run(
    State(st): State<Arc<ServerState>>,
    AxumPath(id): AxumPath<String>,
) -> Result<Json<serde_json::Value>, AppError> {
    let nid = NodeId::parse(&id)?;
    let node = st.vault.get(&nid)?.ok_or(AppError(StatusCode::NOT_FOUND, "agent run not found".into()))?;
    let run = strategynotes_core::governance::AgentRun::from_node(&node)?;
    Ok(Json(serde_json::to_value(&run)?))
}

#[derive(Deserialize)]
struct ReviewerBody {
    reviewer: Option<String>,
}

async fn accept_agent_run(
    State(st): State<Arc<ServerState>>,
    AxumPath(id): AxumPath<String>,
    Json(b): Json<ReviewerBody>,
) -> Result<Json<GateResult>, AppError> {
    let r = b.reviewer.as_deref();
    Ok(Json(st.app().accept_agent_run(NodeId::parse(&id)?, r)?))
}

async fn reject_agent_run(
    State(st): State<Arc<ServerState>>,
    AxumPath(id): AxumPath<String>,
) -> Result<Json<serde_json::Value>, AppError> {
    let run = st.app().reject_agent_run(NodeId::parse(&id)?)?;
    Ok(Json(serde_json::to_value(&run)?))
}

async fn request_changes(
    State(st): State<Arc<ServerState>>,
    AxumPath(id): AxumPath<String>,
) -> Result<Json<serde_json::Value>, AppError> {
    let run = st.app().request_changes(NodeId::parse(&id)?)?;
    Ok(Json(serde_json::to_value(&run)?))
}

#[derive(Serialize)]
struct TraceResponse {
    reachable: Vec<String>,
}

async fn trace(
    State(st): State<Arc<ServerState>>,
    AxumPath(id): AxumPath<String>,
) -> Result<Json<TraceResponse>, AppError> {
    let start = NodeId::parse(&id)?;
    st.index.rebuild(&st.vault)?;
    let reach = reachable_via_spine(&st.index, start)?;
    Ok(Json(TraceResponse {
        reachable: reach.into_iter().map(|n| n.to_lexical()).collect(),
    }))
}

#[derive(Deserialize)]
struct SearchQuery {
    q: String,
}

async fn search(
    State(st): State<Arc<ServerState>>,
    axum::extract::Query(q): axum::extract::Query<SearchQuery>,
) -> Result<Json<Vec<strategynotes_core::search::SearchResult>>, AppError> {
    st.index.rebuild(&st.vault)?;
    Ok(Json(st.index.search(&q.q)?))
}

async fn daynote(
    State(st): State<Arc<ServerState>>,
    AxumPath(date): AxumPath<String>,
) -> Result<Json<serde_json::Value>, AppError> {
    let d = chrono::NaiveDate::parse_from_str(&date, "%Y-%m-%d")?;
    let content = st.sink.read(d)?;
    Ok(Json(serde_json::json!({ "content": content })))
}

/// Error type that maps core::Error -> HTTP 400/500.
pub struct AppError(pub StatusCode, pub String);

impl From<strategynotes_core::Error> for AppError {
    fn from(e: strategynotes_core::Error) -> Self {
        AppError(StatusCode::BAD_REQUEST, e.to_string())
    }
}
impl From<std::io::Error> for AppError {
    fn from(e: std::io::Error) -> Self {
        AppError(StatusCode::INTERNAL_SERVER_ERROR, e.to_string())
    }
}
impl From<ulid::DecodeError> for AppError {
    fn from(e: ulid::DecodeError) -> Self {
        AppError(StatusCode::BAD_REQUEST, e.to_string())
    }
}
impl From<serde_json::Error> for AppError {
    fn from(e: serde_json::Error) -> Self {
        AppError(StatusCode::INTERNAL_SERVER_ERROR, e.to_string())
    }
}
impl From<chrono::ParseError> for AppError {
    fn from(e: chrono::ParseError) -> Self {
        AppError(StatusCode::BAD_REQUEST, e.to_string())
    }
}
impl IntoResponse for AppError {
    fn into_response(self) -> axum::response::Response {
        (self.0, self.1).into_response()
    }
}
