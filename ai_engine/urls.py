from django.urls import path
from .views import EmergencyAnalysisView, ResQChatbotView
from .risk_engine.views import EarthquakeSusceptibilityView

urlpatterns = [
    path(
        "analyse/",
        EmergencyAnalysisView.as_view(),
        name="emergency-analysis"
    ),
    path("chat/", ResQChatbotView.as_view(), name="resq-chatbot"),
    path(
    "earthquake-susceptibility/",
    EarthquakeSusceptibilityView.as_view(),
    name="earthquake-susceptibility"
    ),
]