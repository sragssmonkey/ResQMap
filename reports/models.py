
from django.conf import settings
from django.db import models


class EmergencyReport(models.Model):

    class IncidentType(models.TextChoices):
        FLOOD = "FLOOD", "Flood"
        ROAD_BLOCKAGE = "ROAD_BLOCKAGE", "Road Blockage"
        FIRE = "FIRE", "Fire"
        MEDICAL = "MEDICAL", "Medical Emergency"
        BUILDING_COLLAPSE = "BUILDING_COLLAPSE", "Building Collapse"
        LANDSLIDE = "LANDSLIDE", "Landslide"
        OTHER = "OTHER", "Other"

    class Severity(models.TextChoices):
        LOW = "LOW", "Low"
        MEDIUM = "MEDIUM", "Medium"
        HIGH = "HIGH", "High"
        CRITICAL = "CRITICAL", "Critical"

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending Review"
        VERIFIED = "VERIFIED", "Verified"
        REJECTED = "REJECTED", "Rejected"
        RESOLVED = "RESOLVED", "Resolved"

    reported_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="emergency_reports"
    )

    incident_type = models.CharField(
        max_length=30,
        choices=IncidentType.choices
    )

    description = models.TextField()

    severity = models.CharField(
        max_length=10,
        choices=Severity.choices,
        default=Severity.MEDIUM
    )

    latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True
    )

    longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True
    )

    location_address = models.CharField(
        max_length=255,
        blank=True
    )

    image = models.ImageField(
        upload_to="emergency_reports/",
        null=True,
        blank=True
    )

    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.PENDING
    )

    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviewed_emergency_reports"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.incident_type} - {self.reported_by.username} - {self.status}"

    class Meta:
        ordering = ["-created_at"]
