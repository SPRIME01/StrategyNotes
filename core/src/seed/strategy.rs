use crate::evidence::ProofLevel;
use crate::node::{EdgeType, NodeType};
use crate::services::App;
use crate::Error;

use super::support::{fm, id, s};
use super::{DocumentIds, RealityIds, StrategyIds};

pub(super) fn seed(
    app: &App<'_>,
    case_id: crate::identity::NodeId,
    reality: RealityIds,
    docs: DocumentIds,
) -> Result<StrategyIds, Error> {
    let claim = app.create_claim(
        "Speed is a defensible, durable advantage".to_string(),
        ProofLevel::Supported,
        vec![reality.ev1, reality.ev2],
    )?;
    app.link(reality.ev1, claim.id, EdgeType::Supports)?;
    app.link(reality.ev2, claim.id, EdgeType::Supports)?;
    app.link(claim.id, docs.sld, EdgeType::DerivesFrom)?;
    let contra = app.create_node(
        NodeType::Counterevidence,
        fm(&[(
            "statement",
            s("Competitor Y claims feature parity at lower cost"),
        )]),
        String::new(),
    )?;
    app.link(claim.id, contra.id, EdgeType::Contradicts)?;
    let assumption = app.create_node(
        NodeType::Assumption,
        fm(&[(
            "statement",
            s("Buyers will pay a premium for one-day onboarding"),
        )]),
        String::new(),
    )?;
    let choice = app.create_node(
        NodeType::ChoiceCascade,
        fm(&[
            ("case", id(case_id)),
            ("level", s("where_to_play")),
            (
                "statement",
                s("Speed-obsessed founder/operators with urgent launch timelines"),
            ),
        ]),
        String::new(),
    )?;
    let draft_bet = app.draft_bet(case_id, "Win founder-market on speed".to_string())?;
    app.update_node(
        draft_bet.id,
        None,
        None,
        fm(&[("title", s("Win founder-market on speed"))]),
    )?;
    let bet = app.draft_bet(case_id, "One-day onboarding as wedge".to_string())?;
    app.mutate_bet(bet.id, |b| {
        b.linked_choice = Some(choice.id);
        b.assumptions = vec![assumption.id];
        b.counterevidence_reviewed = true;
        b.success_metric = Some("3 paying customers in 60 days".to_string());
        b.kill_criteria = Some("Fewer than 1 paying customer after 30 qualified demos".to_string());
        b.owner = Some("Sam".to_string());
    })?;
    app.link(claim.id, bet.id, EdgeType::DerivesFrom)?;
    let _ = app.approve_bet(bet.id)?;
    app.update_node(
        bet.id,
        None,
        None,
        fm(&[("title", s("One-day onboarding as wedge"))]),
    )?;

    Ok(StrategyIds {
        claim: claim.id,
        contra: contra.id,
        bet: bet.id,
    })
}
