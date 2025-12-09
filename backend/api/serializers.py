from rest_framework import serializers
from django.contrib.auth.models import User
from core.models import Client, Case, Hearing, Notification, UserProfile

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')
    
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = '__all__'

class CaseSerializer(serializers.ModelSerializer):
    client_name = serializers.SerializerMethodField(read_only=True)
    client_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Case
        fields = '__all__'
        extra_kwargs = {
            'client': {'read_only': True}
        }
    
    def get_client_name(self, obj):
        return f"{obj.client.first_name} {obj.client.last_name}"
    
    def create(self, validated_data):
        client_id = validated_data.pop('client_id')
        client = Client.objects.get(client_id=client_id)
        validated_data['client'] = client
        return super().create(validated_data)

class HearingSerializer(serializers.ModelSerializer):
    case_title = serializers.SerializerMethodField()
    
    class Meta:
        model = Hearing
        fields = '__all__'
    
    def get_case_title(self, obj):
        return obj.case.case_title

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'

class UserProfileSerializer(serializers.ModelSerializer):
    email = serializers.SerializerMethodField()
    username = serializers.SerializerMethodField()
    
    class Meta:
        model = UserProfile
        fields = '__all__'
    
    def get_email(self, obj):
        return obj.django_user.email
    
    def get_username(self, obj):
        return obj.django_user.username
