from rest_framework import serializers


class EmergencyAnalysisSerializer(serializers.Serializer):
    description = serializers.CharField(
        required=True,
        allow_blank=False,
        max_length=5000
    )