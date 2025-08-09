from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _

# Create your models here.


class User(AbstractUser):
    """Custom user model with role field for Admin, Instructor, Student"""
    ADMIN = 'admin'
    INSTRUCTOR = 'instructor'
    STUDENT = 'student'
    
    ROLE_CHOICES = [
        (ADMIN, _('Admin')),
        (INSTRUCTOR, _('Instructor')),
        (STUDENT, _('Student')),
    ]
    
    email = models.EmailField(_('email address'), unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=STUDENT)
    bio = models.TextField(blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)
    date_joined = models.DateTimeField(auto_now_add=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')
        
    def __str__(self):
        return self.email
    
    @property
    def is_admin(self):
        return self.role == self.ADMIN
        
    @property
    def is_instructor(self):
        return self.role == self.INSTRUCTOR
        
    @property
    def is_student(self):
        return self.role == self.STUDENT