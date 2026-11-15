
from django.urls import path
from .views import (
    EmergencyReportListCreateView,
    EmergencyReportReviewView,
)

urlpatterns = [
    path("", EmergencyReportListCreateView.as_view(), name="report-list-create"),
    path("<int:pk>/review/", EmergencyReportReviewView.as_view(), name="report-review"),
]
