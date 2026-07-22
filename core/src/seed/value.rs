use crate::evidence::ProofLevel;
use crate::node::{EdgeType, NodeType};
use crate::services::App;
use crate::Error;

use super::support::{fm, id, s};
use super::{DocumentIds, ExecutionIds, RealityIds, StrategyIds};

pub(super) fn seed(
    app: &App<'_>,
    case_id: crate::identity::NodeId,
    reality: RealityIds,
    docs: DocumentIds,
    strategy: StrategyIds,
    execution: ExecutionIds,
) -> Result<(), Error> {
    let value = app.claim_value(
        case_id,
        "2 of 5 prospects converted in the first 30 days".to_string(),
        ProofLevel::Validated,
        vec![reality.ev1, execution.review],
        docs.outcome,
    )?;
    let _ = app.validate_value(value.id)?;
    app.update_node(
        value.id,
        None,
        None,
        fm(&[("title", s("30-day conversion signal"))]),
    )?;
    let debt = app.claim_value(
        case_id,
        "Speed advantage remains defensible for 12 months".to_string(),
        ProofLevel::Speculative,
        vec![],
        docs.outcome,
    )?;
    app.update_node(
        debt.id,
        None,
        None,
        fm(&[("title", s("Proof debt: 12-month defensibility"))]),
    )?;
    app.link(execution.review, value.id, EdgeType::Validates)?;
    app.link(value.id, docs.vrd, EdgeType::ClaimsValueFor)?;

    let experiment = app.create_node(
        NodeType::Experiment,
        fm(&[
            ("title", s("Five-prospect onboarding offer")),
            (
                "statement",
                s("Offer one-day onboarding to the next five prospects"),
            ),
            ("case", id(case_id)),
        ]),
        String::new(),
    )?;
    let metric = app.create_node(
        NodeType::Metric,
        fm(&[
            ("title", s("Time-to-first-value")),
            ("statement", s("Time-to-first-value in days")),
            ("case", id(case_id)),
        ]),
        String::new(),
    )?;
    app.link(strategy.bet, experiment.id, EdgeType::Tests)?;
    app.link(experiment.id, metric.id, EdgeType::Validates)?;
    app.link(experiment.id, docs.vsd, EdgeType::Implements)?;
    app.link(docs.erd, strategy.claim, EdgeType::Supports)?;
    Ok(())
}
