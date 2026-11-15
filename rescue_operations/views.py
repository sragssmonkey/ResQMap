
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import RescueOperation, ReliefUpdate
from .serializers import (
    RescueOperationSerializer,
    ReliefUpdateSerializer,
)


def is_verified_rescue(user):
    return (
        user.role == "RESCUE_TEAM"
        and user.is_verified
    ) or user.role == "ADMIN"


class RescueOperationListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not is_verified_rescue(request.user):
            return Response(
                {"detail": "Access restricted."},
                status=status.HTTP_403_FORBIDDEN
            )

        operations = RescueOperation.objects.all().order_by("-created_at")

        serializer = RescueOperationSerializer(
            operations, many=True
        )
        return Response(serializer.data)

    def post(self, request):
        if not is_verified_rescue(request.user):
            return Response(
                {"detail": "Access restricted."},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = RescueOperationSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(created_by=request.user)
            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class RescueOperationDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        if not is_verified_rescue(request.user):
            return Response(
                {"detail": "Access restricted."},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            operation = RescueOperation.objects.get(pk=pk)
        except RescueOperation.DoesNotExist:
            return Response(
                {"detail": "Operation not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = RescueOperationSerializer(
            operation,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            new_status = request.data.get("status")

            if new_status == RescueOperation.Status.COMPLETED:
                operation.completed_at = timezone.now()

            serializer.save()
            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class ReliefUpdateListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if is_verified_rescue(request.user):
            updates = ReliefUpdate.objects.all()
        else:
            updates = ReliefUpdate.objects.filter(is_published=True)

        updates = updates.order_by("-published_at", "-created_at")

        serializer = ReliefUpdateSerializer(updates, many=True)
        return Response(serializer.data)

    def post(self, request):
        if not is_verified_rescue(request.user):
            return Response(
                {"detail": "Only verified rescue teams can publish updates."},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = ReliefUpdateSerializer(data=request.data)

        if serializer.is_valid():
            publish = request.data.get("is_published", False)

            update = serializer.save(
                published_by=request.user,
                is_published=publish,
                published_at=timezone.now() if publish else None
            )

            return Response(
                ReliefUpdateSerializer(update).data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class ReliefUpdatePublishView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        if not is_verified_rescue(request.user):
            return Response(
                {"detail": "Access restricted."},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            update = ReliefUpdate.objects.get(pk=pk)
        except ReliefUpdate.DoesNotExist:
            return Response(
                {"detail": "Update not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        publish = request.data.get("is_published")

        if publish is True:
            update.is_published = True
            update.published_at = timezone.now()
        elif publish is False:
            update.is_published = False
            update.published_at = None
        else:
            return Response(
                {"detail": "Provide is_published as true or false."},
                status=status.HTTP_400_BAD_REQUEST
            )

        update.save()
        return Response(ReliefUpdateSerializer(update).data)
