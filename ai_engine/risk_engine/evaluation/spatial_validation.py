
import pandas as pd
import numpy as np

from pathlib import Path
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import GroupShuffleSplit
from sklearn.metrics import (
    precision_score,
    recall_score,
    f1_score,
    average_precision_score,
    roc_auc_score,
    confusion_matrix
)

# --------------------------------------------------
# 1. Configuration
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parents[1]

DATA_FILE = (
    BASE_DIR / "data" / "processed" /
    "earthquake_grid_training.csv"
)

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
# 2. Load data and assign spatial blocks
# --------------------------------------------------

df = pd.read_csv(DATA_FILE)

BLOCK_SIZE = 2.0

df["lat_block"] = np.floor(
    df["latitude"] / BLOCK_SIZE
).astype(int)

df["lon_block"] = np.floor(
    df["longitude"] / BLOCK_SIZE
).astype(int)

df["spatial_block"] = (
    df["lat_block"].astype(str) + "_" +
    df["lon_block"].astype(str)
)

unique_blocks = df["spatial_block"].drop_duplicates()

splitter = GroupShuffleSplit(
    n_splits=1,
    test_size=0.20,
    random_state=42
)

train_indices, test_indices = next(
    splitter.split(
        unique_blocks,
        groups=unique_blocks
    )
)

train_blocks = set(unique_blocks.iloc[train_indices])
test_blocks = set(unique_blocks.iloc[test_indices])

# --------------------------------------------------
# 3. Spatial + temporal separation
# --------------------------------------------------

# Model fitting: known locations, earlier years
train = df[
    (df["spatial_block"].isin(train_blocks)) &
    (df["year"] <= 2015)
].copy()

# Threshold selection: known locations, later years
validation = df[
    (df["spatial_block"].isin(train_blocks)) &
    (df["year"].between(2016, 2017))
].copy()

# Final test: unseen locations, later years
test = df[
    (df["spatial_block"].isin(test_blocks)) &
    (df["year"].between(2018, 2023))
].copy()

print("Training observations:", len(train))
print("Validation observations:", len(validation))
print("Testing observations:", len(test))

print("\nTraining blocks:", train["spatial_block"].nunique())
print("Testing blocks:", test["spatial_block"].nunique())

print("\nTest positive rate:", test[TARGET].mean())

# --------------------------------------------------
# 4. Model factory
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

# --------------------------------------------------
# 5. Train and evaluate each feature set
# --------------------------------------------------

def evaluate_model(name, features):

    print("\n" + "=" * 55)
    print("MODEL:", name)
    print("=" * 55)

    model = create_model()

    model.fit(
        train[features],
        train[TARGET]
    )

    # Select threshold using validation locations
    val_probabilities = model.predict_proba(
        validation[features]
    )[:, 1]

    best_threshold = 0.5
    best_f1 = -1

    for threshold in np.arange(0.05, 0.96, 0.05):

        val_predictions = (
            val_probabilities >= threshold
        ).astype(int)

        score = f1_score(
            validation[TARGET],
            val_predictions,
            zero_division=0
        )

        if score > best_f1:
            best_f1 = score
            best_threshold = threshold

    print("Validation threshold:", round(best_threshold, 2))
    print("Validation F1:", round(best_f1, 4))

    # Evaluate on unseen locations
    probabilities = model.predict_proba(
        test[features]
    )[:, 1]

    predictions = (
        probabilities >= best_threshold
    ).astype(int)

    precision = precision_score(
        test[TARGET],
        predictions,
        zero_division=0
    )

    recall = recall_score(
        test[TARGET],
        predictions,
        zero_division=0
    )

    f1 = f1_score(
        test[TARGET],
        predictions,
        zero_division=0
    )

    ap = average_precision_score(
        test[TARGET],
        probabilities
    )

    auc = (
        roc_auc_score(test[TARGET], probabilities)
        if test[TARGET].nunique() == 2
        else np.nan
    )

    print("\nTest precision:", round(precision, 4))
    print("Test recall:", round(recall, 4))
    print("Test F1:", round(f1, 4))
    print("Test PR-AUC:", round(ap, 4))
    print("Test ROC-AUC:", round(auc, 4))

    print("\nConfusion matrix:")
    print(confusion_matrix(test[TARGET], predictions))

    return {
        "Model": name,
        "Threshold": best_threshold,
        "Precision": precision,
        "Recall": recall,
        "F1": f1,
        "PR-AUC": ap,
        "ROC-AUC": auc
    }

# --------------------------------------------------
# 6. Compare models
# --------------------------------------------------

baseline = evaluate_model(
    "Baseline",
    BASELINE_FEATURES
)

enhanced = evaluate_model(
    "Neighbourhood Enhanced",
    ENHANCED_FEATURES
)

comparison = pd.DataFrame([baseline, enhanced])

print("\n\nFINAL SPATIAL COMPARISON")
print(comparison.round(4).to_string(index=False))

print("\nSpatial validation completed.")
