//! Application services (Phase 8-11 condensed). The driving-port layer: each
//! method is the sole entry point for its concern, calls the relevant gate
//! (Phase 7) BEFORE any mutation, and persists + emits activity on success.
//! Guards: every INV-* gate becomes reachable through these.
//!
//! Pure orchestration: depends on driven-port traits only. No I/O.

use chrono::{DateTime, Utc};

use crate::evidence::{EvidenceItem, EvidenceKind, EvidenceStatus, ProofLevel, Source, SourceChunk};
use crate::execution::{
    Completion, DecisionRecord, PomoEstimate, Timebox, TimeboxReview, TimeboxStatus, ValueClaim,
    WorkPackage,
};
use crate::gate::GateResult;
use crate::gates;
use crate::governance::{ActivityEvent, ActivityKind, AgentRun, AgentRunStatus, EventSource};
use crate::format;
use crate::identity::NodeId;
use crate::node::{EdgeStatus, EdgeType, Node, NodeType, TypedEdge};
use crate::ports::{Clock, EventSink, IdMinter, NodeVault};
use crate::strategy::{BetStatus, CasePhase, StrategicClaim, StrategyBet, StrategyCase};
use crate::views::TypedView;
use crate::Error;

/// Bundle of driven ports + the application services built on them. The driving
/// adapters (Tauri IPC, UI, CLI, tests) construct one of these and call methods.
pub struct App<'a> {
    pub vault: &'a dyn NodeVault,
    pub sink: &'a dyn EventSink,
    pub minter: &'a dyn IdMinter,
    pub clock: &'a dyn Clock,
}

impl<'a> App<'a> {
    fn emit(&self, node: NodeId, kind: ActivityKind) {
        self.sink.record(ActivityEvent {
            at: self.clock.now(),
            node,
            kind,
            source: Some(EventSource::User),
        });
    }

    fn put<V: TypedView>(&self, v: &V) -> Result<(), Error> {
        self.vault.put(&v.to_node()?)
    }

    // ---- generic note CRUD (the notes substrate) ----

    /// Create a generic note node. The foundation layer — every strategy object
    /// is a typed note; this is the plain capture form.
    pub fn create_note(&self, title: String, body: String) -> Result<Node, Error> {
        let id = self.minter.mint();
        let mut frontmatter = crate::node::Frontmatter::new();
        frontmatter.insert("title".into(), serde_yaml::Value::String(title));
        let node = Node {
            id,
            ty: NodeType::Note,
            frontmatter,
            body,
        };
        self.vault.put(&node)?;
        self.emit(id, ActivityKind::Created);
        Ok(node)
    }

    /// Update a node's body (and optionally title). Loads, mutates, persists.
    pub fn update_note(&self, id: NodeId, body: String, title: Option<String>) -> Result<Node, Error> {
        let mut node = self.vault.get(&id)?.ok_or(Error::NotFound(id.to_string()))?;
        node.body = body;
        if let Some(t) = title {
            node.frontmatter.insert("title".into(), serde_yaml::Value::String(t));
        }
        self.vault.put(&node)?;
        self.emit(id, ActivityKind::Modified);
        Ok(node)
    }

    /// Delete a node from the vault.
    pub fn delete_note(&self, id: NodeId) -> Result<(), Error> {
        self.vault.delete(&id)?;
        self.emit(id, ActivityKind::Modified);
        Ok(())
    }

    // ---- clone/placement operations (Phase 3, INV-CLONE) ----

    /// Clone a note to a new parent. The caller (HTTP layer with the index)
    /// must check would_create_placement_cycle BEFORE calling this.
    /// This just adds the Places edge.
    pub fn clone_node(&self, parent: NodeId, child: NodeId) -> Result<(), Error> {
        self.link(parent, child, EdgeType::Places)
    }

    /// Get all placements of a node (all parents that have a Places edge to it).
    pub fn placements_of(&self, id: NodeId) -> Result<Vec<NodeId>, Error> {
        let all = self.vault.all()?;
        let mut parents = Vec::new();
        for n in &all {
            let edges = format::edges_of(n).unwrap_or_default();
            if edges.iter().any(|e| e.edge_type == EdgeType::Places && e.to == id) {
                parents.push(n.id);
            }
        }
        Ok(parents)
    }

    // ---- note promotion (Phase 3) ----

    /// Promote a note to a typed strategy object (evidence, bet, claim, etc.).
    /// Creates a new node of the target type with the note's content.
    pub fn promote_note(&self, note_id: NodeId, target_type: NodeType) -> Result<Node, Error> {
        let note = self.vault.get(&note_id)?.ok_or(Error::NotFound(note_id.to_string()))?;
        let new_id = self.minter.mint();
        let new_node = Node {
            id: new_id,
            ty: target_type,
            frontmatter: note.frontmatter.clone(),
            body: note.body.clone(),
        };
        self.vault.put(&new_node)?;
        self.emit(new_id, ActivityKind::Created);
        Ok(new_node)
    }

    /// Get backlinks for a node (via the derived index).
    pub fn backlinks_for(&self, id: NodeId) -> Result<Vec<NodeId>, Error> {
        // The vault-level edges_of returns out-edges; backlinks need the index.
        // Ponytail: the index is the caller's concern; expose a vault-based
        // scan for now (the HTTP layer rebuilds the index first).
        let all = self.vault.all()?;
        let mut back = Vec::new();
        for n in &all {
            if n.id == id { continue; }
            // Check both frontmatter edges and body refs.
            let edges = format::edges_of(n).unwrap_or_default();
            if edges.iter().any(|e| e.to == id) { back.push(n.id); }
            let body_refs = crate::body::parse_body(&n.body);
            let id_lex = id.to_lexical();
            if body_refs.iter().any(|r| r.target == id_lex || r.target == node_title_of(n)) {
                back.push(n.id);
            }
        }
    Ok(back)
    }

    /// Add a typed edge `from --edge_type--> to` by mutating `from`'s
    /// frontmatter. INV-EDGE: edges live in frontmatter, reconstructable.
    pub fn link(&self, from: NodeId, to: NodeId, edge_type: EdgeType) -> Result<(), Error> {
        let mut node = self
            .vault
            .get(&from)?
            .ok_or(Error::NotFound(from.to_string()))?;
        let mut edges = format::edges_of(&node)?;
        edges.push(TypedEdge {
            from,
            to,
            edge_type,
            status: EdgeStatus::Active,
        });
        format::set_edges(&mut node, &edges)?;
        self.vault.put(&node)
    }

    /// Load - mutate in place - persist. Used to fill required fields between
    /// drafting an object and passing its gate.
    pub fn mutate_bet(
        &self,
        id: NodeId,
        f: impl FnOnce(&mut StrategyBet),
    ) -> Result<StrategyBet, Error> {
        let mut b = StrategyBet::from_node(
            &self.vault.get(&id)?.ok_or(Error::NotFound(id.to_string()))?,
        )?;
        f(&mut b);
        self.put(&b)?;
        Ok(b)
    }

    pub fn mutate_work_package(
        &self,
        id: NodeId,
        f: impl FnOnce(&mut WorkPackage),
    ) -> Result<WorkPackage, Error> {
        let mut wp = WorkPackage::from_node(
            &self.vault.get(&id)?.ok_or(Error::NotFound(id.to_string()))?,
        )?;
        f(&mut wp);
        self.put(&wp)?;
        Ok(wp)
    }

    // ---- case ----

    pub fn create_case(&self, title: String) -> Result<StrategyCase, Error> {
        let mut c = StrategyCase::new(self.minter.mint(), title);
        c.phase = CasePhase::EstablishReality;
        self.put(&c)?;
        self.emit(c.id, ActivityKind::Created);
        Ok(c)
    }

    // ---- sources + evidence ----

    pub fn add_source(&self, title: String, provenance: Option<String>) -> Result<Source, Error> {
        let s = Source {
            id: self.minter.mint(),
            title,
            provenance,
        };
        self.put(&s)?;
        self.emit(s.id, ActivityKind::Created);
        Ok(s)
    }

    pub fn add_source_chunk(
        &self,
        source: NodeId,
        locator: String,
        text: String,
    ) -> Result<SourceChunk, Error> {
        let c = SourceChunk {
            id: self.minter.mint(),
            source,
            locator,
            text,
        };
        self.put(&c)?;
        self.emit(c.id, ActivityKind::Created);
        Ok(c)
    }

    pub fn extract_evidence(
        &self,
        source_chunk: NodeId,
        text: String,
        proof_level: ProofLevel,
        kind: EvidenceKind,
    ) -> Result<EvidenceItem, Error> {
        let e = EvidenceItem {
            id: self.minter.mint(),
            kind,
            status: EvidenceStatus::Drafted,
            proof_level,
            source_chunk: Some(source_chunk),
            manual_basis_reviewer: None,
            text,
            supports: vec![],
            contradicts: vec![],
        };
        self.put(&e)?;
        self.emit(e.id, ActivityKind::Created);
        Ok(e)
    }

    pub fn accept_evidence(&self, id: NodeId) -> Result<GateResult, Error> {
        let mut e = EvidenceItem::from_node(&self.vault.get(&id)?.ok_or(Error::NotFound(id.to_string()))?)?;
        let result = gates::can_accept_evidence(&e);
        if result.is_approved() {
            e.status = EvidenceStatus::Accepted;
            self.put(&e)?;
            self.emit(id, ActivityKind::Accepted);
        }
        Ok(result)
    }

    // ---- claims ----

    pub fn create_claim(
        &self,
        statement: String,
        proof_level: ProofLevel,
        supports: Vec<NodeId>,
    ) -> Result<StrategicClaim, Error> {
        let c = StrategicClaim {
            id: self.minter.mint(),
            statement,
            proof_level,
            supports,
            contradicts: vec![],
        };
        self.put(&c)?;
        self.emit(c.id, ActivityKind::Created);
        Ok(c)
    }

    // ---- bets ----

    pub fn draft_bet(&self, case: NodeId, thesis: String) -> Result<StrategyBet, Error> {
        let b = StrategyBet {
            id: self.minter.mint(),
            case,
            thesis,
            linked_choice: None,
            assumptions: vec![],
            counterevidence_reviewed: false,
            success_metric: None,
            kill_criteria: None,
            owner: None,
            status: BetStatus::Draft,
        };
        self.put(&b)?;
        self.emit(b.id, ActivityKind::Created);
        Ok(b)
    }

    /// Approve a bet. Runs the INV-BET gate first; on block, returns the
    /// GateResult WITHOUT mutating. On approve: status -> Approved, an SDR is
    /// created, both persisted.
    pub fn approve_bet(&self, id: NodeId) -> Result<GateResult, Error> {
        let mut bet = StrategyBet::from_node(&self.vault.get(&id)?.ok_or(Error::NotFound(id.to_string()))?)?;
        let result = gates::can_approve_bet(&bet);
        if result.is_approved() {
            bet.status = BetStatus::Approved;
            self.put(&bet)?;
            // Create the linked Strategy Decision Record.
            let sdr = DecisionRecord {
                id: self.minter.mint(),
                case: bet.case,
                decision: format!("Approved bet: {}", bet.thesis),
                rationale: "Bet met INV-BET requirements.".into(),
                decided_at: Some(self.clock.now()),
            };
            self.put(&sdr)?;
            self.emit(id, ActivityKind::Accepted);
        }
        Ok(result)
    }

    // ---- work packages ----

    pub fn create_work_package(
        &self,
        case: NodeId,
        linked_bet: NodeId,
        objective: String,
    ) -> Result<WorkPackage, Error> {
        let wp = WorkPackage {
            id: self.minter.mint(),
            case,
            objective,
            linked_bet: Some(linked_bet),
            inputs: vec![],
            expected_outputs: vec![],
            tools: vec![],
            technique: None,
            exception_policy: None,
            evidence_required: vec![],
            status: crate::execution::WorkStatus::Intent,
        };
        self.put(&wp)?;
        self.emit(wp.id, ActivityKind::Created);
        Ok(wp)
    }

    pub fn commit_work_package(&self, id: NodeId) -> Result<GateResult, Error> {
        let mut wp = WorkPackage::from_node(&self.vault.get(&id)?.ok_or(Error::NotFound(id.to_string()))?)?;
        let result = gates::can_commit_work_package(&wp);
        if result.is_approved() {
            wp.status = crate::execution::WorkStatus::Committed;
            self.put(&wp)?;
            self.emit(id, ActivityKind::Accepted);
        }
        Ok(result)
    }

    // ---- timeboxes + review ----

    pub fn schedule_timebox(
        &self,
        work_package: NodeId,
        estimate: PomoEstimate,
        start: DateTime<Utc>,
        end: DateTime<Utc>,
        expected_output: String,
    ) -> Result<Timebox, Error> {
        let t = Timebox {
            id: self.minter.mint(),
            work_package,
            status: TimeboxStatus::Committed,
            estimate,
            scheduled_start: start,
            scheduled_end: end,
            expected_output: Some(expected_output),
            review_required: true,
        };
        self.put(&t)?;
        self.emit(t.id, ActivityKind::Scheduled);
        Ok(t)
    }

    /// Execute the timebox and attach a post-block review, then run the
    /// INV-REVIEW gate. On approve: timebox status -> Verified.
    pub fn review_and_verify_timebox(
        &self,
        timebox_id: NodeId,
        actual_pomos: u32,
        completion: Completion,
        evidence_links: Vec<NodeId>,
        no_evidence_reason: Option<String>,
        next_action: String,
    ) -> Result<(TimeboxReview, GateResult), Error> {
        let review = TimeboxReview {
            id: self.minter.mint(),
            timebox: timebox_id,
            executed: true,
            actual_pomos,
            completed_expected_output: completion,
            evidence_links,
            no_evidence_reason,
            friction_notes: None,
            hypothesis_update: None,
            next_action: Some(next_action),
        };
        self.put(&review)?;

        let result = gates::can_verify_timebox(&review);
        if result.is_approved() {
            // Mark the timebox Verified.
            let node = self.vault.get(&timebox_id)?.ok_or(Error::NotFound(timebox_id.to_string()))?;
            let mut tb = Timebox::from_node(&node)?;
            tb.status = TimeboxStatus::Verified;
            self.put(&tb)?;
            self.emit(timebox_id, ActivityKind::Verified);
        }
        Ok((review, result))
    }

    // ---- value ----

    pub fn claim_value(
        &self,
        case: NodeId,
        statement: String,
        proof_level: ProofLevel,
        evidence_links: Vec<NodeId>,
        linked_outcome: NodeId,
    ) -> Result<ValueClaim, Error> {
        let vc = ValueClaim {
            id: self.minter.mint(),
            case,
            statement,
            proof_level,
            evidence_links,
            linked_outcome: Some(linked_outcome),
            status: crate::execution::ValueStatus::Drafted,
        };
        self.put(&vc)?;
        self.emit(vc.id, ActivityKind::Created);
        Ok(vc)
    }

    pub fn validate_value(&self, id: NodeId) -> Result<GateResult, Error> {
        let mut vc = ValueClaim::from_node(&self.vault.get(&id)?.ok_or(Error::NotFound(id.to_string()))?)?;
        let result = gates::can_claim_value(&vc);
        if result.is_approved() {
            vc.status = crate::execution::ValueStatus::Validated;
            self.put(&vc)?;
            self.emit(id, ActivityKind::Accepted);
        }
        Ok(result)
    }

    // ---- agent runs (INV-HUMAN quarantine) ----

    pub fn create_agent_run(&self, agent: String, summary: String) -> Result<AgentRun, Error> {
        let run = AgentRun {
            id: self.minter.mint(),
            agent,
            status: AgentRunStatus::Running,
            started_at: Some(self.clock.now()),
            summary: Some(summary),
        };
        self.put(&run)?;
        self.emit(run.id, ActivityKind::Created);
        Ok(run)
    }

    /// Move a Running run to Completed (ready for human review).
    pub fn complete_agent_run(&self, id: NodeId) -> Result<AgentRun, Error> {
        let mut run = AgentRun::from_node(&self.vault.get(&id)?.ok_or(Error::NotFound(id.to_string()))?)?;
        run.status = AgentRunStatus::Completed;
        self.put(&run)?;
        Ok(run)
    }

    /// Accept a completed/quarantined run. INV-HUMAN: requires a non-empty
    /// human reviewer. The gate (agent_rules::can_accept_agent_run) blocks
    /// without one. On approve: status -> Accepted, human-approval event emitted.
    pub fn accept_agent_run(
        &self,
        id: NodeId,
        reviewer: Option<&str>,
    ) -> Result<GateResult, Error> {
        let mut run = AgentRun::from_node(&self.vault.get(&id)?.ok_or(Error::NotFound(id.to_string()))?)?;
        let result = crate::agent_rules::can_accept_agent_run(&run, reviewer);
        if result.is_approved() {
            run.status = AgentRunStatus::Accepted;
            self.put(&run)?;
            // Human-approval event (source = User, never Agent).
            self.sink.record(ActivityEvent {
                at: self.clock.now(),
                node: id,
                kind: ActivityKind::Accepted,
                source: Some(EventSource::User),
            });
        }
        Ok(result)
    }

    /// Reject a run. Status -> Rejected. Audit preserved (the node + its
    /// status history live in the vault; the daynote records the event).
    pub fn reject_agent_run(&self, id: NodeId) -> Result<AgentRun, Error> {
        let mut run = AgentRun::from_node(&self.vault.get(&id)?.ok_or(Error::NotFound(id.to_string()))?)?;
        run.status = AgentRunStatus::Rejected;
        self.put(&run)?;
        self.emit(id, ActivityKind::Modified);
        Ok(run)
    }

    /// Request changes: original output preserved (summary unchanged); the run
    /// moves to Quarantined pending a new review cycle.
    pub fn request_changes(&self, id: NodeId) -> Result<AgentRun, Error> {
        let mut run = AgentRun::from_node(&self.vault.get(&id)?.ok_or(Error::NotFound(id.to_string()))?)?;
        run.status = AgentRunStatus::Quarantined;
        self.put(&run)?;
        self.emit(id, ActivityKind::Modified);
        Ok(run)
    }
}

/// Extract a node's title from its frontmatter (for body-ref resolution).
fn node_title_of(node: &Node) -> String {
    node.frontmatter
        .get("title")
        .and_then(|v| v.as_str())
        .unwrap_or("")
        .to_string()
}
