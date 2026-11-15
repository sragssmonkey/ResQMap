
import json

from pathlib import Path
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


GEOJSON_FILE = (
    Path(__file__).resolve().parent
    / "data"
    / "processed"
    / "earthquake_susceptibility.geojson"
)


class EarthquakeSusceptibilityView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        if not GEOJSON_FILE.exists():
            return Response(
                {"error": "Earthquake susceptibility data not found."},
                status=404
            )

        try:
            with open(GEOJSON_FILE, "r", encoding="utf-8") as file:
                geojson_data = json.load(file)

            return Response(geojson_data)

        except (json.JSONDecodeError, OSError):
            return Response(
                {"error": "Unable to read GeoJSON data."},
                status=500
            )
