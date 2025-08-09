from rest_framework import serializers
from django.contrib.auth import get_user_model
from dj_rest_auth.serializers import UserDetailsSerializer
from .models import Address

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""

    class Meta:
        model = User
        fields = ['id', 'email', 'phone', 'username', 'first_name',
                  'last_name', 'role', 'bio', 'profile_picture']
        read_only_fields = ['email']


class CustomUserDetailsSerializer(UserDetailsSerializer):
    """Custom user details serializer for dj-rest-auth"""
    role = serializers.CharField(read_only=True)

    class Meta(UserDetailsSerializer.Meta):
        fields = UserDetailsSerializer.Meta.fields + \
            ('role', 'bio', 'profile_picture')


class AdminUserSerializer(serializers.ModelSerializer):
    """Serializer for admins to manage users"""

    class Meta:
        model = User
        fields = ['id', 'email', 'phone', 'username', 'first_name',
                  'last_name', 'role', 'is_active', 'date_joined']
        read_only_fields = ['date_joined']


class UserAddressSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        user_id = self.context['user_id']
        return Address.objects.create(user_id=user_id, **validated_data)

    class Meta:
        model = Address
        fields = ['id', 'user_id', 'street', 'city', 'state', 'postal_code',
                  'country']
