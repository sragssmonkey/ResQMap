
from rest_framework import serializers
from .models import User


class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True,
        min_length=8
    )

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "full_name",
            "email",
            "phone_number",
            "password",
        ]
        read_only_fields = ["id"]

    def to_internal_value(self, data):
        # Reject attempts to select privileged roles
        if "role" in data:
            raise serializers.ValidationError({
                "role": "Role selection is not permitted during public registration."
            })

        if "is_verified" in data:
            raise serializers.ValidationError({
                "is_verified": "Verification status cannot be set by users."
            })

        return super().to_internal_value(data)

    def create(self, validated_data):
        password = validated_data.pop("password")

        user = User(
            **validated_data,
            role=User.Role.SURVIVOR,
            is_verified=False,
            is_staff=False,
            is_superuser=False
        )

        user.set_password(password)
        user.save()

        return user
