
from django.contrib import admin
from .models import EmergencyReport


@admin.register(EmergencyReport)
class EmergencyReportAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "incident_type",
        "reported_by",
        "severity",
        "status",
        "created_at",
    )

    list_filter = ("incident_type", "severity", "status")
    search_fields = ("description", "location_address", "reported_by__username")
    readonly_fields = ("created_at", "updated_at")
