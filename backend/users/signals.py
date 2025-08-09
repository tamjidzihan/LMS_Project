from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from allauth.account.signals import user_signed_up

User = get_user_model()


@receiver(post_save, sender=User)
def set_default_role(sender, instance, created, **kwargs):
    """
    Signal to set default role for new users
    """
    if created and not instance.role:
        instance.role = User.STUDENT  # type: ignore
        instance.save()


@receiver(user_signed_up)
def handle_user_signed_up(request, user, **kwargs):
    """
    Signal to handle user creation when signing up via social auth
    """
    # Default to student role for social auth users
    if not user.role:
        user.role = User.STUDENT  # type: ignore
        user.save()
