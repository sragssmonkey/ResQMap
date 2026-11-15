
from rest_framework import serializers
from .models import EmergencyReport


class EmergencyReportSerializer(serializers.ModelSerializer):
    reported_by_name = serializers.CharField(
        source="reported_by.username",
        read_only=True
    )

    class Meta:
        model = EmergencyReport
        fields = [
            "id",
            "reported_by",
            "reported_by_name",
            "incident_type",
            "description",
            "severity",
            "latitude",
            "longitude",
            "location_address",
            "image",
            "status",
            "reviewed_by",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "reported_by",
            "reported_by_name",
            "status",
            "reviewed_by",
            "created_at",
            "updated_at",
        ]


class ReportReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmergencyReport
        fields = ["status"]
