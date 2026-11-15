
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import EmergencyReport
from .serializers import (
    EmergencyReportSerializer,
    ReportReviewSerializer,
)


class EmergencyReportListCreateView(generics.ListCreateAPIView):
    serializer_class = EmergencyReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role == "SURVIVOR":
            return EmergencyReport.objects.filter(reported_by=user)

        if user.role == "RESCUE_TEAM" and user.is_verified:
            return EmergencyReport.objects.all()

        if user.role == "ADMIN":
            return EmergencyReport.objects.all()

        return EmergencyReport.objects.none()

    def perform_create(self, serializer):
        if self.request.user.role != "SURVIVOR":
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied(
                "Only survivor accounts can submit emergency reports."
            )

        serializer.save(reported_by=self.request.user)


class EmergencyReportReviewView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        user = request.user

        if user.role == "RESCUE_TEAM" and not user.is_verified:
            return Response(
                {"detail": "Your rescue account is not verified."},
                status=status.HTTP_403_FORBIDDEN
            )

        if user.role not in ["RESCUE_TEAM", "ADMIN"]:
            return Response(
                {"detail": "Only authorised rescue personnel can review reports."},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            report = EmergencyReport.objects.get(pk=pk)
        except EmergencyReport.DoesNotExist:
            return Response(
                {"detail": "Report not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = ReportReviewSerializer(
            report,
            data=request.data,
            partial=True
        )

        serializer.is_valid(raise_exception=True)
        serializer.save(reviewed_by=user)

        return Response(EmergencyReportSerializer(report).data)
