
from .classifier import analyse_report
from .severity import analyse_severity


def analyse_emergency(description):
    """
    Run incident classification and severity analysis.
    AI outputs are suggestions requiring human review.
    """

    classification = analyse_report(description)
    severity = analyse_severity(description)

    return {
        "incident_analysis": {
            "predicted_category": classification["predicted_category"],
            "confidence": classification["confidence"],
            "confidence_percentage": classification["confidence_percentage"],
            "top_predictions": classification["top_predictions"],
            "needs_human_review": classification["needs_human_review"],
        },
        "severity_analysis": severity,
        "overall_human_review_required": True,
    }
