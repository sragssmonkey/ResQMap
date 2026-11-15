
from django.urls import path

from .views import (
    RescueOperationListCreateView,
    RescueOperationDetailView,
    ReliefUpdateListCreateView,
    ReliefUpdatePublishView,
)

urlpatterns = [
    path(
        "operations/",
        RescueOperationListCreateView.as_view(),
        name="operation-list-create"
    ),
    path(
        "operations/<int:pk>/",
        RescueOperationDetailView.as_view(),
        name="operation-detail"
    ),
    path(
        "updates/",
        ReliefUpdateListCreateView.as_view(),
        name="relief-update-list-create"
    ),
    path(
        "updates/<int:pk>/publish/",
        ReliefUpdatePublishView.as_view(),
        name="relief-update-publish"
    ),
]
