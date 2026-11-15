
from pathlib import Path

import geopandas as gpd
import pandas as pd


BASE_DIR = Path(__file__).resolve().parents[1]

RAW_DIR = BASE_DIR / "data" / "raw"
PROCESSED_DIR = BASE_DIR / "data" / "processed"

EARTHQUAKE_FILE = RAW_DIR / "earthquake_india_2000_2025.csv"
BOUNDARY_FILE = RAW_DIR / "india_boundary.geojson"

INPUT_FILE = PROCESSED_DIR / "earthquake_cleaned.csv"

OUTPUT_FILE = PROCESSED_DIR / "earthquake_india_filtered.csv"

PROCESSED_DIR.mkdir(parents=True, exist_ok=True)


def filter_india_earthquakes():

    print("Loading earthquake observations...")

    earthquakes = pd.read_csv(INPUT_FILE)

    print("Loading India district boundaries...")

    districts = gpd.read_file(BOUNDARY_FILE)

    # Convert district boundaries to WGS84
    districts = districts.to_crs("EPSG:4326")

    # Validate and repair invalid geometries if necessary
    districts["geometry"] = districts.geometry.make_valid()

    # Dissolve district polygons into one national geometry
    india = districts.dissolve()

    # Convert earthquake observations into geographic points
    points = gpd.GeoDataFrame(
        earthquakes,
        geometry=gpd.points_from_xy(
            earthquakes["longitude"],
            earthquakes["latitude"]
        ),
        crs="EPSG:4326"
    )

    # Retain observations inside India's boundary
    filtered = gpd.sjoin(
        points,
        india[["geometry"]],
        how="inner",
        predicate="within"
    )

    # Remove spatial join helper columns
    filtered = filtered.drop(
        columns=["geometry", "index_right"],
        errors="ignore"
    )

    print("\nFiltering results")
    print("-----------------")
    print("Original observations:", len(earthquakes))
    print("Observations inside India:", len(filtered))
    print(
        "Observations outside India:",
        len(earthquakes) - len(filtered)
    )

    filtered.to_csv(OUTPUT_FILE, index=False)

    print("\nSaved filtered dataset:")
    print(OUTPUT_FILE)


if __name__ == "__main__":
    filter_india_earthquakes()
