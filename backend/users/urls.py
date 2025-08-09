from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_nested.routers import NestedDefaultRouter

from . import views

router = DefaultRouter()

router.register('users', views.UserViewSet)

user_nested_router = NestedDefaultRouter(router, 'users', lookup='users')
user_nested_router.register(
    'address', views.UserAddressViewset, basename='address')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(user_nested_router.urls)),
]
