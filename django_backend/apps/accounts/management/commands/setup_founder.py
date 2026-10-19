import secrets
import string
from django.core.management.base import BaseCommand
from apps.accounts.models import User

class Command(BaseCommand):
    help = "Securely initialize or upgrade the PlanMyStay Administrator / Founder account without hardcoding credentials."

    def add_arguments(self, parser):
        parser.add_argument('--email', type=str, default='founder@planmystay.in', help='Founder/Admin email address')
        parser.add_argument('--name', type=str, default='Alluri Vijaya Priya', help='Founder full name')
        parser.add_argument('--password', type=str, default=None, help='Admin password (optional; auto-generates secure random password if omitted)')

    def handle(self, *args, **options):
        email = options['email'].strip().lower()
        name = options['name'].strip()
        provided_password = options['password']

        if provided_password:
            password = provided_password
            generated = False
        else:
            # Generate cryptographically secure 20-character password
            alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
            password = ''.join(secrets.choice(alphabet) for _ in range(20))
            generated = True

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'name': name,
                'role': User.Role.ADMIN,
                'is_staff': True,
                'is_superuser': True,
                'avatar': 'AP',
                'title': 'Founder & Managing Director',
            }
        )

        user.set_password(password)
        user.role = User.Role.ADMIN
        user.is_staff = True
        user.is_superuser = True
        user.save()

        action = "Created new" if created else "Updated existing"
        self.stdout.write(self.style.SUCCESS(f"Successfully {action} Administrator account for {email}"))
        if generated:
            self.stdout.write(self.style.WARNING(f"\n[SECURITY CREDENTIALS - STORE SAFELY]\nEmail:    {email}\nPassword: {password}\n"))
        else:
            self.stdout.write(self.style.SUCCESS(f"Password set from argument for {email}"))
