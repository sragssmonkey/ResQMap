
import pandas as pd
import geopandas as gpd

from pathlib import Path
from shapely.geometry import box, Polygon, MultiPolygon
from shapely.ops import unary_union

# --------------------------------------------------
# 1. Paths
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parents[1]

PREDICTION_FILE = (
    BASE_DIR / "data" / "processed" /
    "earthquake_susceptibility_2025.csv"
)

BOUNDARY_FILE = (
    BASE_DIR / "data" / "raw" /
    "india_boundary.geojson"
)

OUTPUT_FILE = (
    BASE_DIR / "data" / "processed" /
    "earthquake_susceptibility.geojson"
)

GRID_SIZE = 0.5

# --------------------------------------------------
# 2. Load predictions and boundary
# --------------------------------------------------

predictions = pd.read_csv(PREDICTION_FILE)

boundary = gpd.read_file(BOUNDARY_FILE)

if boundary.crs is None:
    raise ValueError("Boundary file has no CRS.")

boundary = boundary.to_crs("EPSG:4326")

print("Prediction cells:", len(predictions))
print("Boundary features:", len(boundary))

# --------------------------------------------------
# 3. Create unified boundary geometry
# --------------------------------------------------

boundary["geometry"] = boundary.geometry.make_valid()

boundary_union = unary_union(
    boundary.geometry.tolist()
)

# --------------------------------------------------
# 4. Create and clip grid polygons
# --------------------------------------------------

records = []

for _, row in predictions.iterrows():

    lat = row["latitude"]
    lon = row["longitude"]

    # Construct 0.5 degree grid cell
    cell = box(
        lon - GRID_SIZE / 2,
        lat - GRID_SIZE / 2,
        lon + GRID_SIZE / 2,
        lat + GRID_SIZE / 2
    )

    # Clip cell to administrative boundary
    clipped = cell.intersection(boundary_union)

    if clipped.is_empty:
        continue

    # Keep polygonal geometry only
    if clipped.geom_type not in ["Polygon", "MultiPolygon"]:

        polygons = []

        if hasattr(clipped, "geoms"):
            for geom in clipped.geoms:
                if geom.geom_type == "Polygon":
                    polygons.append(geom)
                elif geom.geom_type == "MultiPolygon":
                    polygons.extend(list(geom.geoms))

        if not polygons:
            continue

        clipped = unary_union(polygons)

    records.append({
        "cell_id": row["cell_id"],
        "model_score": float(row["model_score"]),
        "susceptibility_percentile": float(
            row["susceptibility_percentile"]
        ),
        "events_5y": int(row["events_5y"]),
        "events_25km_5y": int(row["events_25km_5y"]),
        "events_50km_5y": int(row["events_50km_5y"]),
        "events_100km_5y": int(row["events_100km_5y"]),
        "feature_year": int(row["feature_year"]),
        "prediction_year": int(row["prediction_year"]),
        "geometry": clipped
    })

# --------------------------------------------------
# 5. Build GeoDataFrame
# --------------------------------------------------

geo_df = gpd.GeoDataFrame(
    records,
    geometry="geometry",
    crs="EPSG:4326"
)

if geo_df.empty:
    raise ValueError("No grid cells intersect the boundary.")

# --------------------------------------------------
# 6. Save GeoJSON
# --------------------------------------------------

geo_df.to_file(
    OUTPUT_FILE,
    driver="GeoJSON"
)

# --------------------------------------------------
# 7. Summary
# --------------------------------------------------

print("\nGeoJSON generated successfully!")

print("Output cells:", len(geo_df))
print("CRS:", geo_df.crs)
print("Geometry types:")
print(geo_df.geom_type.value_counts())

print("\nTop susceptibility cells:")
print(
    geo_df.nlargest(10, "model_score")[
        ["cell_id", "model_score", "susceptibility_percentile"]
    ].to_string(index=False)
)

print("\nSaved to:")
print(OUTPUT_FILE)

