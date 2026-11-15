from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):

    fieldsets = UserAdmin.fieldsets + (
        ("ResQMap Information", {
            "fields": (
                "full_name",
                "phone_number",
                "role",
                "is_verified",
            )
        }),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        ("ResQMap Information", {
            "fields": (
                "full_name",
                "phone_number",
                "role",
            )
        }),
    )