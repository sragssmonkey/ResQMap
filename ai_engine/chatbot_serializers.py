from rest_framework import serializers


class ChatbotQuerySerializer(serializers.Serializer):
    question = serializers.CharField(
        required=True,
        allow_blank=False,
        max_length=2000
    )