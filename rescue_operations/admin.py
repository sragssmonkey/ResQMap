from django.contrib import admin
from .models import RescueOperation, ReliefUpdate


@admin.register(RescueOperation)
class RescueOperationAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "assigned_team",
        "priority",
        "status",
        "created_at",
    )

    list_filter = ("priority", "status")
    search_fields = ("title", "location_address")


@admin.register(ReliefUpdate)
class ReliefUpdateAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "category",
        "is_published",
        "published_by",
        "created_at",
    )

    list_filter = ("category", "is_published")
    search_fields = ("title", "message")
