
import pandas as pd
import numpy as np

from pathlib import Path
from sklearn.neighbors import BallTree

# --------------------------------------------------
# 1. Paths and configuration
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parents[1]

GRID_FILE = (
    BASE_DIR / "data" / "processed" /
    "earthquake_grid_training.csv"
)

EVENT_FILE = (
    BASE_DIR / "data" / "processed" /
    "earthquake_india_filtered.csv"
)

OUTPUT_FILE = GRID_FILE

EARTH_RADIUS_KM = 6371.0088
RADII_KM = [25, 50, 100]
HISTORY_YEARS = 5

# --------------------------------------------------
# 2. Load datasets
# --------------------------------------------------

grid = pd.read_csv(GRID_FILE)
events = pd.read_csv(EVENT_FILE)

print("Grid observations:", len(grid))
print("Historical earthquake events:", len(events))

# Validate required columns
required_grid = {
    "cell_id", "year", "latitude", "longitude"
}

required_events = {
    "year", "latitude", "longitude"
}

if not required_grid.issubset(grid.columns):
    raise ValueError("Grid dataset is missing required columns.")

if not required_events.issubset(events.columns):
    raise ValueError("Earthquake dataset is missing required columns.")

# --------------------------------------------------
# 3. Prepare coordinates in radians
# --------------------------------------------------

# Unique grid cells: calculate their neighbourhood counts once per year
cells = grid[
    ["cell_id", "latitude", "longitude"]
].drop_duplicates("cell_id").reset_index(drop=True)

cell_coordinates = np.radians(
    cells[["latitude", "longitude"]].to_numpy()
)

# Event coordinates
events = events.dropna(
    subset=["year", "latitude", "longitude"]
).copy()

events["year"] = events["year"].astype(int)

# --------------------------------------------------
# 4. Calculate historical neighbourhood activity
# --------------------------------------------------

feature_records = []

years = sorted(grid["year"].unique())

for year in years:

    # Five-year historical window, including current year
    start_year = year - HISTORY_YEARS + 1

    historical_events = events[
        (events["year"] >= start_year) &
        (events["year"] <= year)
    ]

    print(
        f"Processing {year}: "
        f"{len(historical_events)} historical events"
    )

    # Initialise counts for all grid cells
    counts = {
        radius: np.zeros(len(cells), dtype=int)
        for radius in RADII_KM
    }

    if not historical_events.empty:

        event_coordinates = np.radians(
            historical_events[
                ["latitude", "longitude"]
            ].to_numpy()
        )

        # Build spatial index for historical earthquake events
        tree = BallTree(
            event_coordinates,
            metric="haversine"
        )

        for radius in RADII_KM:

            radius_radians = radius / EARTH_RADIUS_KM

            counts[radius] = tree.query_radius(
                cell_coordinates,
                r=radius_radians,
                count_only=True
            )

    # Store features for each cell and year
    for i, cell in cells.iterrows():

        record = {
            "cell_id": cell["cell_id"],
            "year": year,
        }

        for radius in RADII_KM:
            record[f"events_{radius}km_5y"] = int(
                counts[radius][i]
            )

        feature_records.append(record)

# --------------------------------------------------
# 5. Merge neighbourhood features
# --------------------------------------------------

neighbourhood = pd.DataFrame(feature_records)

grid = grid.drop(
    columns=[
        "events_25km_5y",
        "events_50km_5y",
        "events_100km_5y"
    ],
    errors="ignore"
)

grid = grid.merge(
    neighbourhood,
    on=["cell_id", "year"],
    how="left",
    validate="many_to_one"
)

feature_columns = [
    "events_25km_5y",
    "events_50km_5y",
    "events_100km_5y"
]

grid[feature_columns] = (
    grid[feature_columns].fillna(0).astype(int)
)

# --------------------------------------------------
# 6. Save updated dataset
# --------------------------------------------------

grid.to_csv(OUTPUT_FILE, index=False)

print("\nNeighbourhood features created successfully!")

print("Updated dataset shape:", grid.shape)

print("\nNew feature summary:")
print(grid[feature_columns].describe().to_string())

print("\nSample:")
print(
    grid[
        [
            "cell_id",
            "year",
            "events_25km_5y",
            "events_50km_5y",
            "events_100km_5y"
        ]
    ].head(10).to_string(index=False)
)

print("\nSaved to:", OUTPUT_FILE)
