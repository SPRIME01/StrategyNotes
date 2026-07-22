use crate::node::{EdgeType, NodeType};
use crate::services::App;
use crate::Error;

use super::support::{doc_fm, fm, id, list, s};
use super::DocumentIds;

pub(super) fn seed(app: &App<'_>, case_id: crate::identity::NodeId) -> Result<DocumentIds, Error> {
    let erd = app.create_node(
        NodeType::Erd,
        doc_fm(case_id, "ERD - GodSpeed Reality Base"),
        "Accepted evidence favors speed as the first wedge; activation depth remains under review."
            .to_string(),
    )?;
    let outcome = app.create_node(
        NodeType::Ord,
        fm(&[
            ("title", s("ORD - 60 day traction requirement")),
            ("case", id(case_id)),
            ("statement", s("3 paying customers in 60 days")),
            (
                "acceptance_criteria",
                list(&[
                    "signed contract",
                    "payment received",
                    "onboarding completed within 24 hours",
                ]),
            ),
        ]),
        String::new(),
    )?;
    let sld = app.create_node(
        NodeType::Sld,
        doc_fm(case_id, "SLD - Speed is the strategy"),
        "The strategic logic is to compress time-to-value until it becomes the buying reason."
            .to_string(),
    )?;
    let eds = app.create_node(
        NodeType::Eds,
        doc_fm(case_id, "EDS - One-day onboarding execution"),
        "Execution is bounded to one wedge, one owner, and one measurable activation loop."
            .to_string(),
    )?;
    let vsd = app.create_node(
        NodeType::Vsd,
        doc_fm(case_id, "VSD - Validate activation speed"),
        "Validation compares conversion and invitation depth for the next five prospects."
            .to_string(),
    )?;
    let vrd = app.create_node(
        NodeType::Vrd,
        doc_fm(case_id, "VRD - Value realization ledger"),
        "Value claims stay split between validated learning and proof debt.".to_string(),
    )?;

    app.link(erd.id, outcome.id, EdgeType::DerivesFrom)?;
    Ok(DocumentIds {
        erd: erd.id,
        outcome: outcome.id,
        sld: sld.id,
        eds: eds.id,
        vsd: vsd.id,
        vrd: vrd.id,
    })
}
