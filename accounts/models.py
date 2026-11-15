
from django.db import models
from django.contrib.auth.models import AbstractUser, UserManager


class CustomUserManager(UserManager):

    def create_superuser(self, username, email=None, password=None, **extra_fields):
        extra_fields.setdefault("role", "ADMIN")
        return super().create_superuser(
            username, email, password, **extra_fields
        )


class User(AbstractUser):

    class Role(models.TextChoices):
        SURVIVOR = "SURVIVOR", "Survivor"
        RESCUE_TEAM = "RESCUE_TEAM", "Rescue Team"
        ADMIN = "ADMIN", "Admin"

    full_name = models.CharField(max_length=150)

    phone_number = models.CharField(
        max_length=15,
        unique=True
    )

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.SURVIVOR
    )

    is_verified = models.BooleanField(default=False)

    objects = CustomUserManager()

    REQUIRED_FIELDS = ["email", "full_name", "phone_number"]

    def __str__(self):
        return f"{self.full_name} ({self.role})"
