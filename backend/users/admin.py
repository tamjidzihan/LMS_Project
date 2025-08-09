from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import Address

User = get_user_model()


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'phone', 'username', 'role', 'is_active',
                    'is_staff', 'is_superuser', 'date_joined')
    list_filter = ('role', 'is_active', 'is_staff', 'is_superuser')
    search_fields = ('email', 'username', 'first_name', 'last_name')
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        (_('Personal Info'), {'fields': ('first_name',
         'last_name', 'email', 'phone', 'bio', 'profile_picture')}),
        (_('Role'), {'fields': ('role',)}),
        (_('Permissions'), {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )
    readonly_fields = ('date_joined',)
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'role', 'password1', 'password2'),
        }),
    )
    ordering = ('email',)


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ['user',  'street', 'city',
                    'state', 'postal_code', 'country']
    list_select_related = ['user']
    search_fields = ('user__first_name__istartswith', 'user__email__istartswith',       'user__last_name__istartswith',
                     'street', 'city')
    list_per_page = 10
    list_filter = ['city']
