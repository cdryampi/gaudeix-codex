"""
Management command to seed users from environment variables.
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
import environ

User = get_user_model()

class Command(BaseCommand):
    """
    Seeds the database with admin and system users from environment variables.
    """
    help = 'Seeds admin and system users from environment variables.'

    def handle(self, *args, **options):
        """
        Main command handler.
        Creates or updates admin and system users based on environment variables:
        - ADMIN_USER, ADMIN_PASSWORD
        - SYSTEM_USER, SYSTEM_PASSWORD
        """
        env = environ.Env()
        
        self.stdout.write('Seeding users...')

        # Admin user
        admin_username = env('ADMIN_USER', default='admin')
        admin_password = env('ADMIN_PASSWORD', default='admin123')
        
        admin_user, created = User.objects.get_or_create(
            username=admin_username,
            defaults={
                'is_staff': True,
                'is_superuser': True,
                'name': 'Administrator'
            }
        )
        
        if created or not admin_user.check_password(admin_password):
            admin_user.set_password(admin_password)
            admin_user.is_staff = True
            admin_user.is_superuser = True
            admin_user.save()
            
        if created:
            self.stdout.write(self.style.SUCCESS(f"Created admin user: {admin_username}"))
        else:
            self.stdout.write(self.style.WARNING(f"Updated admin user: {admin_username}"))

        # System user
        system_username = env('SYSTEM_USER', default='system')
        system_password = env('SYSTEM_PASSWORD', default='system123')
        
        system_user, created = User.objects.get_or_create(
            username=system_username,
            defaults={
                'is_staff': False,
                'is_superuser': False,
                'name': 'System User'
            }
        )
        
        if created or not system_user.check_password(system_password):
            system_user.set_password(system_password)
            system_user.save()
            
        if created:
            self.stdout.write(self.style.SUCCESS(f"Created system user: {system_username}"))
        else:
            self.stdout.write(self.style.WARNING(f"Updated system user: {system_username}"))

        self.stdout.write(self.style.SUCCESS('Successfully seeded users.'))
