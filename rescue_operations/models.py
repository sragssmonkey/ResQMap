

from django.conf import settings
from django.db import models


class RescueOperation(models.Model):

    class Priority(models.TextChoices):
        LOW = "LOW", "Low"
        MEDIUM = "MEDIUM", "Medium"
        HIGH = "HIGH", "High"
        CRITICAL = "CRITICAL", "Critical"

    class Status(models.TextChoices):
        PLANNED = "PLANNED", "Planned"
        DISPATCHED = "DISPATCHED", "Dispatched"
        IN_PROGRESS = "IN_PROGRESS", "In Progress"
        COMPLETED = "COMPLETED", "Completed"
        CANCELLED = "CANCELLED", "Cancelled"

    title = models.CharField(max_length=200)
    description = models.TextField()

    # Optional connection to an existing emergency report
    related_report = models.ForeignKey(
        "reports.EmergencyReport",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="rescue_operations"
    )

    assigned_team = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_rescue_operations"
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_rescue_operations"
    )

    priority = models.CharField(
        max_length=10,
        choices=Priority.choices,
        default=Priority.MEDIUM
    )

    status = models.CharField(
        max_length=15,
        choices=Status.choices,
        default=Status.PLANNED
    )

    location_address = models.CharField(max_length=255)

    latitude = models.DecimalField(
        max_digits=10,
        decimal_places=7,
        null=True,
        blank=True
    )

    longitude = models.DecimalField(
        max_digits=10,
        decimal_places=7,
        null=True,
        blank=True
    )

    team_remarks = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.title


class ReliefUpdate(models.Model):

    class Category(models.TextChoices):
        EMERGENCY = "EMERGENCY", "Emergency Alert"
        RELIEF_CAMP = "RELIEF_CAMP", "Relief Camp"
        FOOD_WATER = "FOOD_WATER", "Food and Water"
        ROAD = "ROAD", "Road and Accessibility"
        WEATHER = "WEATHER", "Weather and Safety"
        RESCUE = "RESCUE", "Rescue Progress"
        GENERAL = "GENERAL", "General Update"

    title = models.CharField(max_length=200)
    message = models.TextField()

    category = models.CharField(
        max_length=15,
        choices=Category.choices,
        default=Category.GENERAL
    )

    location_address = models.CharField(
        max_length=255,
        blank=True
    )

    operation = models.ForeignKey(
        RescueOperation,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="relief_updates"
    )

    published_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="published_relief_updates"
    )

    is_published = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    published_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.title
