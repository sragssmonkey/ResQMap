
from pathlib import Path

import numpy as np
import pandas as pd


# Project paths
BASE_DIR = Path(__file__).resolve().parents[1]

RAW_FILE = (
    BASE_DIR
    / "data"
    / "raw"
    / "earthquake_india_2000_2025.csv"
)

OUTPUT_DIR = BASE_DIR / "data" / "processed"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

OUTPUT_FILE = OUTPUT_DIR / "earthquake_cleaned.csv"


def prepare_earthquake_data():

    print("Loading historical earthquake data...")

    df = pd.read_csv(RAW_FILE)

    required_columns = [
        "time",
        "place",
        "magnitude",
        "depth_km",
        "latitude",
        "longitude",
    ]

    missing_columns = set(required_columns) - set(df.columns)

    if missing_columns:
        raise ValueError(
            f"Missing required columns: {missing_columns}"
        )

    print("Original records:", len(df))

    # Convert numerical columns
    numerical_columns = [
        "magnitude",
        "depth_km",
        "latitude",
        "longitude",
    ]

    for column in numerical_columns:
        df[column] = pd.to_numeric(
            df[column], errors="coerce"
        )

    # Parse dates
    df["time"] = pd.to_datetime(
        df["time"], errors="coerce", utc=True
    )

    # Remove invalid observations
    df = df.dropna(
        subset=[
            "time",
            "magnitude",
            "depth_km",
            "latitude",
            "longitude",
        ]
    ).copy()

    # Remove physically invalid coordinates
    df = df[
        df["latitude"].between(-90, 90)
        & df["longitude"].between(-180, 180)
        & (df["depth_km"] >= 0)
    ].copy()

    # Keep original source columns
    df = df.sort_values("time")

    # Create time-based features
    df["year"] = df["time"].dt.year
    df["month"] = df["time"].dt.month

    print("Valid records:", len(df))
    print("Date range:", df["time"].min(), "to", df["time"].max())

    print("\nMagnitude summary:")
    print(df["magnitude"].describe())

    # Save cleaned observations
    df.to_csv(OUTPUT_FILE, index=False)

    print("\nSaved cleaned dataset to:")
    print(OUTPUT_FILE)


if __name__ == "__main__":
    prepare_earthquake_data()
