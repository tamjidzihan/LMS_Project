from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Course, Lesson, Category, Review
from .serializers import (
    CourseListSerializer, CourseDetailSerializer, CourseCreateUpdateSerializer,
    LessonSerializer, CategorySerializer, ReviewSerializer
)
from users.permissions import (
    IsInstructorOrReadOnly, IsOwnerOrReadOnly,
    IsCourseInstructorOrReadOnly, IsAdminUser, IsEnrolledOrInstructor
)


class CategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for course categories
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        """
        - List/retrieve: authenticated
        - Create/update/partial_update/destroy: admin only
        """
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [permissions.IsAuthenticated()]


class CourseViewSet(viewsets.ModelViewSet):
    """
    ViewSet for courses with different serializers for list/detail
    """
    queryset = Course.objects.all()
    filter_backends = [DjangoFilterBackend,
                       filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'instructor', 'price', 'is_published']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'price', 'title']

    def get_queryset(self):
        """
        Filter courses based on user role and published status
        """
        user = self.request.user

        # Check if user is authenticated before accessing role
        if user.is_authenticated:
            # Instructors see only their own courses
            if user.role == 'instructor':  # type: ignore
                return Course.objects.filter(instructor=user)

            # Admins see all courses
            if user.role == 'admin':  # type: ignore
                return Course.objects.all()

        # Students and unauthenticated users see only published courses
        return Course.objects.filter(is_published=True)

    def get_serializer_class(self):
        """
        Use different serializers for different actions
        """
        if self.action == 'list':
            return CourseListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return CourseCreateUpdateSerializer
        return CourseDetailSerializer

    def get_permissions(self):
        """
        - List/retrieve: authenticated
        - Create: instructor or admin
        - Update/partial_update/destroy: owner or admin
        """
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsOwnerOrReadOnly()]
        elif self.action == 'create':
            return [IsInstructorOrReadOnly()]
        return [permissions.IsAuthenticated()]

    @action(detail=True, methods=['post'], permission_classes=[IsOwnerOrReadOnly])
    def publish(self, request, pk=None):
        """Publish a course"""
        course = self.get_object()
        course.is_published = True
        course.save()
        return Response({'status': 'Course published'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[IsOwnerOrReadOnly])
    def unpublish(self, request, pk=None):
        """Unpublish a course"""
        course = self.get_object()
        course.is_published = False
        course.save()
        return Response({'status': 'Course unpublished'}, status=status.HTTP_200_OK)


class LessonViewSet(viewsets.ModelViewSet):
    """
    ViewSet for lessons
    """
    serializer_class = LessonSerializer
    permission_classes = [permissions.IsAuthenticated,
                          IsCourseInstructorOrReadOnly]

    def get_queryset(self):
        """
        Filter lessons based on course if provided in URL
        """
        queryset = Lesson.objects.all()
        course_id = self.request.query_params.get(  # type: ignore
            'course_id', None)  # type: ignore
        if course_id is not None:
            queryset = queryset.filter(course_id=course_id)

        user = self.request.user
        if user.role == 'instructor':  # type: ignore
            return queryset.filter(course__instructor=user)
        elif user.role == 'admin':  # type: ignore
            return queryset
        else:
            # Students can only see lessons for published courses they're enrolled in
            enrolled_courses = user.enrollments.values_list(  # type: ignore
                'course_id', flat=True)  # type: ignore
            return queryset.filter(course__is_published=True, course__id__in=enrolled_courses)

    def perform_create(self, serializer):
        """Set course and validate instructor"""
        course_id = self.request.data.get('course')  # type: ignore
        course = Course.objects.get(pk=course_id)

        # Check if user is the instructor of the course
        if course.instructor != self.request.user and not self.request.user.is_admin:  # type: ignore
            self.permission_denied(
                self.request, message="You do not have permission to add lessons to this course")

        serializer.save(course=course)


class ReviewViewSet(viewsets.ModelViewSet):
    """
    ViewSet for reviews
    """
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]

    def get_queryset(self):
        """
        Filter reviews based on course if provided in URL
        """
        queryset = Review.objects.all()
        course_id = self.request.query_params.get(  # type: ignore
            'course_id', None)  # type: ignore
        if course_id is not None:
            queryset = queryset.filter(course_id=course_id)
        return queryset

    def perform_create(self, serializer):
        """Set user and course for the review"""
        course_id = self.request.data.get('course')  # type: ignore
        serializer.save(user=self.request.user, course_id=course_id)
