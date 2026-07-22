use chrono::Duration;

use crate::execution::{AttentionMode, Completion, PomoEstimate, PomoPattern};
use crate::node::EdgeType;
use crate::services::App;
use crate::Error;

use super::support::{fm, s};
use super::{DocumentIds, ExecutionIds, RealityIds};

pub(super) fn seed(
    app: &App<'_>,
    case_id: crate::identity::NodeId,
    bet: crate::identity::NodeId,
    reality: RealityIds,
    docs: DocumentIds,
) -> Result<ExecutionIds, Error> {
    let wp_intent =
        app.create_work_package(case_id, bet, "Red-team the speed thesis".to_string())?;
    app.update_node(
        wp_intent.id,
        None,
        None,
        fm(&[("title", s("Red-team the speed thesis"))]),
    )?;
    let wp = app.create_work_package(case_id, bet, "Ship one-day onboarding".to_string())?;
    app.mutate_work_package(wp.id, |w| {
        w.inputs = vec![reality.ev1, reality.ev2, docs.outcome];
        w.expected_outputs = vec![
            "shipped one-day flow".to_string(),
            "activation dashboard".to_string(),
        ];
        w.tools = vec![
            "Figma".to_string(),
            "React".to_string(),
            "calendar timebox".to_string(),
        ];
        w.technique = Some("smallest end-to-end path".to_string());
        w.exception_policy = Some("capture ideas; solve local blockers only".to_string());
        w.evidence_required = vec![
            "conversion measurement".to_string(),
            "post-block review".to_string(),
        ];
    })?;
    let _ = app.commit_work_package(wp.id)?;
    app.update_node(
        wp.id,
        None,
        None,
        fm(&[("pomos", s("6")), ("title", s("Ship one-day onboarding"))]),
    )?;
    app.link(bet, wp.id, EdgeType::Requires)?;
    app.link(wp.id, docs.eds, EdgeType::Implements)?;

    let start = app.clock.now();
    let active_tb = app.schedule_timebox(
        wp.id,
        PomoEstimate {
            pomos: 6,
            pattern: PomoPattern::DeepPacket,
            attention_mode: AttentionMode::ExecutionBuild,
        },
        start,
        start + Duration::hours(3),
        "Draft the one-day onboarding flow".to_string(),
    )?;
    let review_tb = app.schedule_timebox(
        wp.id,
        PomoEstimate {
            pomos: 2,
            pattern: PomoPattern::P25M5,
            attention_mode: AttentionMode::EvidenceReview,
        },
        start + Duration::days(1),
        start + Duration::days(1) + Duration::hours(1),
        "Review onboarding evidence".to_string(),
    )?;
    app.update_node(
        active_tb.id,
        None,
        None,
        fm(&[("title", s("Draft the one-day onboarding flow"))]),
    )?;
    app.link(wp.id, active_tb.id, EdgeType::ScheduledBy)?;
    app.link(wp.id, review_tb.id, EdgeType::ScheduledBy)?;
    let (review, _) = app.review_and_verify_timebox(
        review_tb.id,
        2,
        Completion::Partial,
        vec![reality.ev1],
        None,
        "Keep the wedge; test activation depth next".to_string(),
    )?;
    app.update_node(
        review_tb.id,
        None,
        None,
        fm(&[("title", s("Review onboarding evidence"))]),
    )?;
    app.update_node(
        review.id,
        None,
        None,
        fm(&[("title", s("Review: keep the onboarding wedge"))]),
    )?;
    app.link(review_tb.id, review.id, EdgeType::ReviewedBy)?;

    Ok(ExecutionIds { review: review.id })
}
