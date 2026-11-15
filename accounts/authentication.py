from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import AuthenticationFailed

class ResQMapTokenSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):
        return super().get_token(user)

    def validate(self, attrs):
        data = super().validate(attrs)

        user = self.user

        if (
            user.role == "RESCUE_TEAM"
            and not user.is_verified
        ):
            raise AuthenticationFailed(
                "Your rescue team account has not been approved."
            )

        return data