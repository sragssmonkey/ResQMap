
import pandas as pd
import numpy as np
import joblib

from pathlib import Path
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    precision_score,
    recall_score,
    f1_score,
    average_precision_score,
    roc_auc_score,
    confusion_matrix
)

# --------------------------------------------------
# 1. Paths
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parents[2]

DATA_FILE = (
    BASE_DIR / "data" / "processed" /
    "earthquake_grid_training.csv"
)

MODEL_DIR = Path(__file__).resolve().parent

MODEL_FILE = MODEL_DIR / "earthquake_rf_neighbourhood_model.joblib"

# --------------------------------------------------
# 2. Feature sets
# --------------------------------------------------

BASELINE_FEATURES = [
    "year",
    "latitude",
    "longitude",
    "events_5y",
    "mean_magnitude_5y",
    "max_magnitude_5y",
    "mean_depth_5y"
]

ENHANCED_FEATURES = BASELINE_FEATURES + [
    "events_25km_5y",
    "events_50km_5y",
    "events_100km_5y"
]

TARGET = "earthquake_next_year"

# --------------------------------------------------
# 3. Load and split data
# --------------------------------------------------

df = pd.read_csv(DATA_FILE)

train = df[df["year"] <= 2015]
validation = df[
    (df["year"] >= 2016) &
    (df["year"] <= 2017)
]
test = df[
    (df["year"] >= 2018) &
    (df["year"] <= 2023)
]

print("Training:", len(train))
print("Validation:", len(validation))
print("Testing:", len(test))

# --------------------------------------------------
# 4. Model training function
# --------------------------------------------------

def create_model():

    return RandomForestClassifier(
        n_estimators=300,
        max_depth=12,
        min_samples_split=10,
        min_samples_leaf=5,
        class_weight="balanced_subsample",
        random_state=42,
        n_jobs=-1
    )


def train_and_evaluate(name, features):

    print(f"\n{'=' * 55}")
    print(f"MODEL: {name}")
    print(f"{'=' * 55}")

    model = create_model()

    model.fit(
        train[features],
        train[TARGET]
    )

    # Validation predictions
    val_probabilities = model.predict_proba(
        validation[features]
    )[:, 1]

    # Select threshold using validation F1
    threshold_results = []

    for threshold in np.arange(0.05, 0.96, 0.05):

        val_predictions = (
            val_probabilities >= threshold
        ).astype(int)

        threshold_results.append({
            "threshold": threshold,
            "f1": f1_score(
                validation[TARGET],
                val_predictions,
                zero_division=0
            )
        })

    best_result = max(
        threshold_results,
        key=lambda x: x["f1"]
    )

    best_threshold = best_result["threshold"]

    print("\nSelected threshold:", round(best_threshold, 2))
    print("Validation F1:", round(best_result["f1"], 4))

    # Final untouched test evaluation
    test_probabilities = model.predict_proba(
        test[features]
    )[:, 1]

    test_predictions = (
        test_probabilities >= best_threshold
    ).astype(int)

    precision = precision_score(
        test[TARGET],
        test_predictions,
        zero_division=0
    )

    recall = recall_score(
        test[TARGET],
        test_predictions,
        zero_division=0
    )

    f1 = f1_score(
        test[TARGET],
        test_predictions,
        zero_division=0
    )

    ap = average_precision_score(
        test[TARGET],
        test_probabilities
    )

    auc = roc_auc_score(
        test[TARGET],
        test_probabilities
    )

    print("\nTest results:")
    print("Precision:", round(precision, 4))
    print("Recall:", round(recall, 4))
    print("F1:", round(f1, 4))
    print("PR-AUC:", round(ap, 4))
    print("ROC-AUC:", round(auc, 4))

    print("\nConfusion matrix:")
    print(confusion_matrix(
        test[TARGET],
        test_predictions
    ))

    return {
        "model": model,
        "threshold": float(best_threshold),
        "features": features,
        "precision": precision,
        "recall": recall,
        "f1": f1,
        "pr_auc": ap,
        "roc_auc": auc
    }


# --------------------------------------------------
# 5. Compare both models
# --------------------------------------------------

baseline = train_and_evaluate(
    "BASELINE RANDOM FOREST",
    BASELINE_FEATURES
)

enhanced = train_and_evaluate(
    "NEIGHBOURHOOD RANDOM FOREST",
    ENHANCED_FEATURES
)

# --------------------------------------------------
# 6. Comparison table
# --------------------------------------------------

comparison = pd.DataFrame([
    {
        "Model": "Baseline",
        "Precision": baseline["precision"],
        "Recall": baseline["recall"],
        "F1": baseline["f1"],
        "PR-AUC": baseline["pr_auc"],
        "ROC-AUC": baseline["roc_auc"]
    },
    {
        "Model": "Neighbourhood Enhanced",
        "Precision": enhanced["precision"],
        "Recall": enhanced["recall"],
        "F1": enhanced["f1"],
        "PR-AUC": enhanced["pr_auc"],
        "ROC-AUC": enhanced["roc_auc"]
    }
])

print("\n\nFINAL MODEL COMPARISON")
print(comparison.round(4).to_string(index=False))

# --------------------------------------------------
# 7. Save enhanced model
# --------------------------------------------------

joblib.dump(
    {
        "model": enhanced["model"],
        "features": enhanced["features"],
        "threshold": enhanced["threshold"],
        "grid_size": 0.5,
        "prediction_target": (
            "Recorded earthquake occurrence in the next year"
        ),
        "model_version": "neighbourhood_enhanced_v1"
    },
    MODEL_FILE
)

print("\nEnhanced model saved:")
print(MODEL_FILE)
