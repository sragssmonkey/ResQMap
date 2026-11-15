from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .chatbot_serializers import ChatbotQuerySerializer
from .rag.answer_generator import generate_rag_answer

from .serializers import EmergencyAnalysisSerializer
from .analyser import analyse_emergency

class ResQChatbotView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        serializer = ChatbotQuerySerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        question = serializer.validated_data["question"]

        try:
            result = generate_rag_answer(question)

            return Response({
                "question": question,
                "answer": result["answer"],
                "sources": result["sources"]
            }, status=status.HTTP_200_OK)

        except Exception:
            return Response(
                {
                    "error": "ResQ AI is temporarily unavailable."
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )


class EmergencyAnalysisView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        serializer = EmergencyAnalysisSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        description = serializer.validated_data["description"]

        try:
            result = analyse_emergency(description)

            return Response(result, status=status.HTTP_200_OK)

        except Exception:
            return Response(
                {"error": "Emergency analysis is temporarily unavailable."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )