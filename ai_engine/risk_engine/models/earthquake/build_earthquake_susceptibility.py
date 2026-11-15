
import pandas as pd
import numpy as np
import joblib

from pathlib import Path
from sklearn.ensemble import RandomForestClassifier

# --------------------------------------------------
# 1. Paths
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parents[2]

DATA_FILE = (
    BASE_DIR / "data" / "processed" /
    "earthquake_grid_training.csv"
)

MODEL_FILE = (
    Path(__file__).resolve().parent /
    "earthquake_susceptibility_final.joblib"
)

OUTPUT_FILE = (
    BASE_DIR / "data" / "processed" /
    "earthquake_susceptibility_2025.csv"
)

# --------------------------------------------------
# 2. Features
# --------------------------------------------------

FEATURES = [
    "year",
    "latitude",
    "longitude",
    "events_5y",
    "mean_magnitude_5y",
    "max_magnitude_5y",
    "mean_depth_5y",
    "events_25km_5y",
    "events_50km_5y",
    "events_100km_5y"
]

TARGET = "earthquake_next_year"

# --------------------------------------------------
# 3. Load data
# --------------------------------------------------

df = pd.read_csv(DATA_FILE)

# Train only on rows whose target year is fully represented
# in the historical catalogue: feature years 2004–2023.
train = df[
    (df["year"] >= 2004) &
    (df["year"] <= 2023)
].copy()

# Latest feature year: historical information through 2024
prediction_data = df[
    df["year"] == 2024
].copy()

if train.empty or prediction_data.empty:
    raise ValueError("Training or prediction dataset is empty.")

print("Training observations:", len(train))
print("Prediction cells:", len(prediction_data))

print("\nTraining target distribution:")
print(train[TARGET].value_counts())

# --------------------------------------------------
# 4. Train final enhanced model
# --------------------------------------------------

model = RandomForestClassifier(
    n_estimators=300,
    max_depth=12,
    min_samples_split=10,
    min_samples_leaf=5,
    class_weight="balanced_subsample",
    random_state=42,
    n_jobs=-1
)

print("\nTraining final neighbourhood-enhanced model...")

model.fit(
    train[FEATURES],
    train[TARGET]
)

print("Training completed.")

# --------------------------------------------------
# 5. Generate continuous model scores
# --------------------------------------------------

probabilities = model.predict_proba(
    prediction_data[FEATURES]
)[:, 1]

results = prediction_data[
    [
        "cell_id",
        "latitude",
        "longitude",
        "events_5y",
        "events_25km_5y",
        "events_50km_5y",
        "events_100km_5y"
    ]
].copy()

# Model scores are ranking signals, not calibrated probabilities.
results["model_score"] = probabilities

# Relative percentile among all scored cells.
results["susceptibility_percentile"] = (
    results["model_score"].rank(pct=True) * 100
)

results["feature_year"] = 2024
results["prediction_year"] = 2025

results = results.sort_values(
    "model_score",
    ascending=False
)

# --------------------------------------------------
# 6. Save predictions
# --------------------------------------------------

results.to_csv(OUTPUT_FILE, index=False)

# Save model and feature metadata
joblib.dump(
    {
        "model": model,
        "features": FEATURES,
        "model_type": "Random Forest",
        "model_version": "neighbourhood_enhanced_final_v1",
        "prediction_target": (
            "Recorded earthquake occurrence in the following year"
        ),
        "score_interpretation": (
            "Uncalibrated model score for relative ranking; "
            "not an earthquake probability"
        ),
        "feature_year": 2024,
        "prediction_year": 2025,
        "grid_size_degrees": 0.5
    },
    MODEL_FILE
)

# --------------------------------------------------
# 7. Feature importance
# --------------------------------------------------

importance = pd.DataFrame({
    "feature": FEATURES,
    "importance": model.feature_importances_
}).sort_values(
    "importance",
    ascending=False
)

print("\nFeature importance:")
print(importance.to_string(index=False))

# --------------------------------------------------
# 8. Summary
# --------------------------------------------------

print("\nPrediction summary:")
print(results["model_score"].describe())

print("\nTop 10 cells:")
print(results.head(10).to_string(index=False))

print("\nSaved prediction file:")
print(OUTPUT_FILE)

print("\nSaved model:")
print(MODEL_FILE)
