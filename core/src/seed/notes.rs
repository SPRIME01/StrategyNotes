use crate::node::EdgeType;
use crate::services::App;
use crate::Error;

use super::support::journal_title;
use super::StrategyIds;

pub(super) fn seed(app: &App<'_>, strategy: StrategyIds) -> Result<(), Error> {
    let agent = app.create_agent_run(
        "critic".to_string(),
        "Red-team: 3 assumptions untested, 1 contradiction needs owner review.".to_string(),
    )?;
    let _ = app.complete_agent_run(agent.id)?;

    let today = journal_title(app.clock.now().date_naive());
    let _ = app.create_note(
        today,
        "# Today's Focus\n\n- Review the speed bet\n- Run the onboarding timebox\n\n## Notes\n\nSpeed evidence is accepted and the activation hypothesis remains drafted. #strategy #onboarding\n"
            .to_string(),
    )?;
    let target = app.create_note(
        "Onboarding wedge".to_string(),
        "The one-day onboarding flow is the wedge that proves the speed thesis.".to_string(),
    )?;
    let note = app.create_note(
        "Strategy notes (demo)".to_string(),
        format!(
            "# Strategy working note\n\n- (({})) - embedded block reference\n- [[Onboarding wedge]] - wikilink\n- #speed #wedge\n\n> Evidence gap: activation depth still needs a validated cohort.\n",
            target.id
        ),
    )?;
    app.link(note.id, strategy.claim, EdgeType::Supports)?;
    app.link(note.id, strategy.contra, EdgeType::Contradicts)?;
    app.link(note.id, strategy.bet, EdgeType::Requires)?;
    app.clone_node(note.id, target.id)?;
    Ok(())
}
