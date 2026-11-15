
import re

SEVERITY_RULES = {
    "CRITICAL": [
        "trapped", "people trapped", "building collapsed",
        "multiple casualties", "life threatening",
        "unconscious", "unable to breathe",
        "people missing", "entire building collapsed"
    ],
    "HIGH": [
        "severely injured", "houses flooded",
        "rising water", "fire spreading",
        "major fire", "people stranded",
        "bridge collapsed", "multiple people injured"
    ],
    "MEDIUM": [
        "minor injuries", "waterlogging",
        "blocked road", "fallen tree",
        "power outage", "property damage"
    ],
    "LOW": [
        "small leak", "minor damage",
        "no injuries", "road partially blocked"
    ]
}


def analyse_severity(description):

    if not isinstance(description, str) or not description.strip():
        raise ValueError("Description cannot be empty.")

    text = re.sub(r"\s+", " ", description.lower())

    matched_indicators = {}

    for severity, keywords in SEVERITY_RULES.items():
        matches = [
            keyword for keyword in keywords
            if keyword in text
        ]

        if matches:
            matched_indicators[severity] = matches

    priority_order = ["CRITICAL", "HIGH", "MEDIUM", "LOW"]

    suggested_severity = next(
        (
            severity for severity in priority_order
            if severity in matched_indicators
        ),
        "REQUIRES_REVIEW"
    )

    all_indicators = [
        indicator
        for indicators in matched_indicators.values()
        for indicator in indicators
    ]

    return {
        "suggested_severity": suggested_severity,
        "matched_indicators": all_indicators,
        "severity_indicators": matched_indicators,
        "needs_human_review": True
    }
