from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, AdminUserSerializer
from .permissions import IsAdminUser, IsInstructorOrAdminUser

User = get_user_model()


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for user management
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Restrict users to:
        - Admin: all users
        - Instructor: only self
        - Student: only self
        """
        user = self.request.user
        if user.is_admin:  # type: ignore
            return User.objects.all()
        return User.objects.filter(pk=user.pk)

    def get_serializer_class(self):
        """
        Use different serializers based on user role
        """
        if self.request.user.is_admin:  # type: ignore
            return AdminUserSerializer
        return UserSerializer

    def get_permissions(self):
        """
        - List/retrieve: authenticated
        - Create/update/partial_update/destroy: admin only
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [permissions.IsAuthenticated()]

    @action(detail=False, methods=['get'], permission_classes=[IsAdminUser])
    def instructors(self, request):
        """List all instructors"""
        instructors = User.objects.filter(role='instructor')
        page = self.paginate_queryset(instructors)
        serializer = self.get_serializer(page, many=True)
        return self.get_paginated_response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAdminUser])
    def students(self, request):
        """List all students"""
        students = User.objects.filter(role='student')
        page = self.paginate_queryset(students)
        serializer = self.get_serializer(page, many=True)
        return self.get_paginated_response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def make_instructor(self, request, pk=None):
        """Convert a user to instructor role"""
        user = self.get_object()
        user.role = 'instructor'
        user.save()
        return Response({'status': 'User role set to instructor'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def make_student(self, request, pk=None):
        """Convert a user to student role"""
        user = self.get_object()
        user.role = 'student'
        user.save()
        return Response({'status': 'User role set to student'}, status=status.HTTP_200_OK)
