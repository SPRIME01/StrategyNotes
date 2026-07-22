use crate::identity::NodeId;
use crate::services::App;
use crate::Error;

mod documents;
mod execution;
mod notes;
mod reality;
mod strategy;
mod support;
mod value;

use support::{demo_case, fm, fm_str, s};

const DEMO_TITLE: &str = "GodSpeed Founder-Market Bet (demo)";
const SEED_VERSION: &str = "ui_full_v1";

#[derive(Clone, Copy)]
struct RealityIds {
    ev1: NodeId,
    ev2: NodeId,
}

#[derive(Clone, Copy)]
struct DocumentIds {
    erd: NodeId,
    outcome: NodeId,
    sld: NodeId,
    eds: NodeId,
    vsd: NodeId,
    vrd: NodeId,
}

#[derive(Clone, Copy)]
struct StrategyIds {
    claim: NodeId,
    contra: NodeId,
    bet: NodeId,
}

#[derive(Clone, Copy)]
struct ExecutionIds {
    review: NodeId,
}

impl<'a> App<'a> {
    pub fn seed_demo(&self) -> Result<usize, Error> {
        let before = self.vault.all()?.len();
        if demo_case(self)?.is_some_and(|case| fm_str(&case, "seed_version") == SEED_VERSION) {
            return Ok(0);
        }

        let case_id = match demo_case(self)? {
            Some(case) => case.id,
            None => self.create_case(DEMO_TITLE.to_string())?.id,
        };
        self.update_node(
            case_id,
            None,
            None,
            fm(&[
                ("phase", s("choose_and_bet")),
                ("owner", s("Sam")),
                ("arena", s("founder/operator AI")),
            ]),
        )?;

        let reality = reality::seed(self)?;
        let docs = documents::seed(self, case_id)?;
        let strategy = strategy::seed(self, case_id, reality, docs)?;
        let execution = execution::seed(self, case_id, strategy.bet, reality, docs)?;
        value::seed(self, case_id, reality, docs, strategy, execution)?;
        notes::seed(self, strategy)?;

        self.update_node(
            case_id,
            None,
            None,
            fm(&[("seed_version", s(SEED_VERSION))]),
        )?;
        Ok(self.vault.all()?.len().saturating_sub(before))
    }
}
