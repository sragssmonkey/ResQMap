
from rest_framework import serializers
from .models import RescueOperation, ReliefUpdate


class RescueOperationSerializer(serializers.ModelSerializer):
    assigned_team_name = serializers.CharField(
        source="assigned_team.username",
        read_only=True
    )
    created_by_name = serializers.CharField(
        source="created_by.username",
        read_only=True
    )

    class Meta:
        model = RescueOperation
        fields = "__all__"
        read_only_fields = (
            "created_by",
            "created_at",
            "updated_at",
            "completed_at",
        )


class ReliefUpdateSerializer(serializers.ModelSerializer):
    published_by_name = serializers.CharField(
        source="published_by.username",
        read_only=True
    )

    class Meta:
        model = ReliefUpdate
        fields = "__all__"
        read_only_fields = (
            "published_by",
            "is_published",
            "published_at",
            "created_at",
        )
