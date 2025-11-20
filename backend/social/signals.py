from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import SocialLink

@receiver(post_save, sender=SocialLink)
def social_link_saved(sender, instance, created, **kwargs):
    """
    Signal handler triggered after a SocialLink is saved.
    
    Args:
        sender: The model class.
        instance: The actual instance being saved.
        created (bool): True if a new record was created.
        kwargs: Additional keyword arguments.
    """
    action = "Created" if created else "Updated"
    print(f"SocialLink {action}: {instance}")
    # Here we could invalidate cache or trigger other updates

@receiver(post_delete, sender=SocialLink)
def social_link_deleted(sender, instance, **kwargs):
    """
    Signal handler triggered after a SocialLink is deleted.
    
    Args:
        sender: The model class.
        instance: The actual instance being deleted.
        kwargs: Additional keyword arguments.
    """
    print(f"SocialLink Deleted: {instance}")
    # Here we could invalidate cache
