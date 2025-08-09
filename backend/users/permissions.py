from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    """
    Permission to only allow admin users to access
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'admin'

class IsInstructorUser(permissions.BasePermission):
    """
    Permission to only allow instructor users to access
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'instructor'

class IsInstructorOrAdminUser(permissions.BasePermission):
    """
    Permission to allow instructors or admins to access
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (
            request.user.role == 'instructor' or request.user.role == 'admin'
        )

class IsInstructorOrReadOnly(permissions.BasePermission):
    """
    Permission to allow instructors to edit, others can only read
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and (
            request.user.role == 'instructor' or request.user.role == 'admin'
        )

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Permission to allow owners of an object to edit it
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Try to match the object's instructor/user with the request user
        if hasattr(obj, 'instructor'):
            return obj.instructor == request.user
        elif hasattr(obj, 'user'):
            return obj.user == request.user
        
        return False

class IsCourseInstructorOrReadOnly(permissions.BasePermission):
    """
    Permission to allow course instructors to edit their course contents
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # For lessons and other course-related content
        if hasattr(obj, 'course') and hasattr(obj.course, 'instructor'):
            return obj.course.instructor == request.user
        
        return False

class IsEnrolledOrInstructor(permissions.BasePermission):
    """
    Permission to allow access to students enrolled in a course or the instructor
    """
    def has_object_permission(self, request, view, obj):
        user = request.user
        
        # If it's a lesson, check the course
        if hasattr(obj, 'course'):
            course = obj.course
        elif hasattr(obj, 'lesson') and hasattr(obj.lesson, 'course'):
            course = obj.lesson.course
        else:
            course = obj
        
        # Check if user is the instructor
        if hasattr(course, 'instructor') and course.instructor == user:
            return True
        
        # Check if user is enrolled
        if user.is_authenticated and user.role == 'student':
            return course.enrollments.filter(student=user).exists()
        
        return False