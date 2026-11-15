
import pandas as pd
import numpy as np
from pathlib import Path

# --------------------------------------------------
# 1. Paths and configuration
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parents[1]

INPUT_FILE = BASE_DIR / "data" / "processed" / "earthquake_india_filtered.csv"
OUTPUT_FILE = BASE_DIR / "data" / "processed" / "earthquake_grid_training.csv"

GRID_SIZE = 0.5
HISTORY_YEARS = 5

# --------------------------------------------------
# 2. Load earthquake data
# --------------------------------------------------

df = pd.read_csv(INPUT_FILE)

print("Loaded records:", len(df))

# Assign each earthquake to a geographical grid cell
df["lat_bin"] = np.floor(df["latitude"] / GRID_SIZE).astype(int)
df["lon_bin"] = np.floor(df["longitude"] / GRID_SIZE).astype(int)

df["cell_id"] = (
    df["lat_bin"].astype(str) + "_" + df["lon_bin"].astype(str)
)

# --------------------------------------------------
# 3. Aggregate earthquake events by cell and year
# --------------------------------------------------

annual = (
    df.groupby(["cell_id", "lat_bin", "lon_bin", "year"])
    .agg(
        event_count=("magnitude", "count"),
        magnitude_sum=("magnitude", "sum"),
        max_magnitude=("magnitude", "max"),
        depth_sum=("depth_km", "sum"),
    )
    .reset_index()
)

# --------------------------------------------------
# 4. Create a complete geographical grid
# --------------------------------------------------

lat_bins = range(df["lat_bin"].min(), df["lat_bin"].max() + 1)
lon_bins = range(df["lon_bin"].min(), df["lon_bin"].max() + 1)

cells = pd.MultiIndex.from_product(
    [lat_bins, lon_bins],
    names=["lat_bin", "lon_bin"]
).to_frame(index=False)

cells["cell_id"] = (
    cells["lat_bin"].astype(str) + "_" +
    cells["lon_bin"].astype(str)
)

years = pd.DataFrame({"year": range(2000, 2026)})

cells["key"] = 1
years["key"] = 1

grid = cells.merge(years, on="key").drop(columns="key")

# Attach annual earthquake statistics
grid = grid.merge(
    annual,
    on=["cell_id", "lat_bin", "lon_bin", "year"],
    how="left"
)

grid["event_count"] = grid["event_count"].fillna(0)
grid["magnitude_sum"] = grid["magnitude_sum"].fillna(0)
grid["depth_sum"] = grid["depth_sum"].fillna(0)

# --------------------------------------------------
# 5. Calculate rolling historical features
# --------------------------------------------------

grid = grid.sort_values(["cell_id", "year"]).reset_index(drop=True)

grouped = grid.groupby("cell_id", sort=False)

grid["events_5y"] = grouped["event_count"].transform(
    lambda x: x.rolling(HISTORY_YEARS, min_periods=1).sum()
)

grid["magnitude_sum_5y"] = grouped["magnitude_sum"].transform(
    lambda x: x.rolling(HISTORY_YEARS, min_periods=1).sum()
)

grid["depth_sum_5y"] = grouped["depth_sum"].transform(
    lambda x: x.rolling(HISTORY_YEARS, min_periods=1).sum()
)

grid["max_magnitude_5y"] = grouped["max_magnitude"].transform(
    lambda x: x.rolling(HISTORY_YEARS, min_periods=1).max()
)

grid["mean_magnitude_5y"] = (
    grid["magnitude_sum_5y"] /
    grid["events_5y"].replace(0, np.nan)
)

grid["mean_depth_5y"] = (
    grid["depth_sum_5y"] /
    grid["events_5y"].replace(0, np.nan)
)

# No recorded earthquakes in the historical window
grid["max_magnitude_5y"] = grid["max_magnitude_5y"].fillna(0)
grid["mean_magnitude_5y"] = grid["mean_magnitude_5y"].fillna(0)
grid["mean_depth_5y"] = grid["mean_depth_5y"].fillna(0)

# Cell centre coordinates
grid["latitude"] = (grid["lat_bin"] + 0.5) * GRID_SIZE
grid["longitude"] = (grid["lon_bin"] + 0.5) * GRID_SIZE

# --------------------------------------------------
# 6. Create next-year prediction target
# --------------------------------------------------

grid["next_year_events"] = grouped["event_count"].shift(-1)

grid["target_year"] = grid["year"] + 1

grid["earthquake_next_year"] = (
    grid["next_year_events"] > 0
).astype(int)

# Remove years without a complete five-year history
# and the final year, which has no following-year target
dataset = grid[
    (grid["year"] >= 2004) &
    (grid["year"] <= 2024)
].copy()

# --------------------------------------------------
# 7. Select model features and save
# --------------------------------------------------

feature_columns = [
    "cell_id",
    "year",
    "target_year",
    "latitude",
    "longitude",
    "events_5y",
    "mean_magnitude_5y",
    "max_magnitude_5y",
    "mean_depth_5y",
    "earthquake_next_year",
]

dataset = dataset[feature_columns]

dataset.to_csv(OUTPUT_FILE, index=False)

# --------------------------------------------------
# 8. Display results
# --------------------------------------------------

print("\nGrid dataset created successfully!")
print("Output:", OUTPUT_FILE)
print("Shape:", dataset.shape)

print("\nTarget distribution:")
print(dataset["earthquake_next_year"].value_counts())

print("\nTarget proportions:")
print(dataset["earthquake_next_year"].value_counts(normalize=True))

print("\nSample:")
print(dataset.head(10).to_string(index=False))
