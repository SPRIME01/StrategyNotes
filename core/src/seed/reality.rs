use crate::evidence::{EvidenceKind, ProofLevel};
use crate::node::EdgeType;
use crate::services::App;
use crate::Error;

use super::RealityIds;

pub(super) fn seed(app: &App<'_>) -> Result<RealityIds, Error> {
    let src = app.add_source(
        "Founder interviews and onboarding telemetry".to_string(),
        Some("12 calls and product telemetry, Q2 2026".to_string()),
    )?;
    let sc1 = app.add_source_chunk(
        src.id,
        "interview #4".to_string(),
        "\"Speed matters more than feature depth for our buyers.\"".to_string(),
    )?;
    let sc2 = app.add_source_chunk(
        src.id,
        "competitor scan".to_string(),
        "Competitor X ships in 2 weeks; StrategyNotes can ship in 1.".to_string(),
    )?;
    let sc3 = app.add_source_chunk(
        src.id,
        "activation telemetry".to_string(),
        "Teams completing onboarding within 24 hours invite 2.4x more collaborators.".to_string(),
    )?;

    let ev1 = app.extract_evidence(
        sc1.id,
        "Speed is the primary buying criterion for the initial ICP".to_string(),
        ProofLevel::Supported,
        EvidenceKind::DirectQuote,
    )?;
    app.link(sc1.id, ev1.id, EdgeType::Supports)?;
    let _ = app.accept_evidence(ev1.id)?;
    let ev2 = app.extract_evidence(
        sc2.id,
        "A one-week onboarding wedge can beat the visible competitor cadence".to_string(),
        ProofLevel::Observed,
        EvidenceKind::Observation,
    )?;
    app.link(sc2.id, ev2.id, EdgeType::Supports)?;
    let _ = app.accept_evidence(ev2.id)?;
    let ev3 = app.extract_evidence(
        sc3.id,
        "Activation speed predicts collaboration depth".to_string(),
        ProofLevel::Hypothesized,
        EvidenceKind::DataPoint,
    )?;
    app.link(sc3.id, ev3.id, EdgeType::Supports)?;

    Ok(RealityIds {
        ev1: ev1.id,
        ev2: ev2.id,
    })
}
