from django.http import JsonResponse
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import permission_classes
from .serializers import UserSerializer, ClientSerializer, CaseSerializer, HearingSerializer
from core.models import Client, Case, Hearing

@permission_classes([AllowAny])
def health_check(request):
    return JsonResponse({'status': 'ok', 'message': 'Backend is running'})

class CaseListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        cases = Case.objects.all()
        serializer = CaseSerializer(cases, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request):
        serializer = CaseSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CaseDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get_object(self, case_id):
        try:
            return Case.objects.get(case_id=case_id)
        except Case.DoesNotExist:
            return None
    
    def get(self, request, case_id):
        case = self.get_object(case_id)
        if not case:
            return Response({'error': 'Case not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = CaseSerializer(case)
        return Response(serializer.data)
    
    def put(self, request, case_id):
        case = self.get_object(case_id)
        if not case:
            return Response({'error': 'Case not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = CaseSerializer(case, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, case_id):
        case = self.get_object(case_id)
        if not case:
            return Response({'error': 'Case not found'}, status=status.HTTP_404_NOT_FOUND)
        case.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class ClientListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        clients = Client.objects.all()
        serializer = ClientSerializer(clients, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request):
        serializer = ClientSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ClientDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get_object(self, client_id):
        try:
            return Client.objects.get(client_id=client_id)
        except Client.DoesNotExist:
            return None
    
    def get(self, request, client_id):
        client = self.get_object(client_id)
        if not client:
            return Response({'error': 'Client not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = ClientSerializer(client)
        return Response(serializer.data)
    
    def put(self, request, client_id):
        client = self.get_object(client_id)
        if not client:
            return Response({'error': 'Client not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = ClientSerializer(client, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, client_id):
        client = self.get_object(client_id)
        if not client:
            return Response({'error': 'Client not found'}, status=status.HTTP_404_NOT_FOUND)
        client.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class HearingListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        hearings = Hearing.objects.all().order_by('-hearing_date')
        serializer = HearingSerializer(hearings, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request):
        serializer = HearingSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class HearingDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get_object(self, hearing_id):
        try:
            return Hearing.objects.get(hearing_id=hearing_id)
        except Hearing.DoesNotExist:
            return None
    
    def get(self, request, hearing_id):
        hearing = self.get_object(hearing_id)
        if not hearing:
            return Response({'error': 'Hearing not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = HearingSerializer(hearing)
        return Response(serializer.data)
    
    def put(self, request, hearing_id):
        hearing = self.get_object(hearing_id)
        if not hearing:
            return Response({'error': 'Hearing not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = HearingSerializer(hearing, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, hearing_id):
        hearing = self.get_object(hearing_id)
        if not hearing:
            return Response({'error': 'Hearing not found'}, status=status.HTTP_404_NOT_FOUND)
        hearing.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({'message': 'User created successfully'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
