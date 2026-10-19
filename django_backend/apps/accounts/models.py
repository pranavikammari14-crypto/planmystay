import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils import timezone

class UserManager(BaseUserManager):
    """Custom user manager supporting email as primary identifier."""

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email address is required')
        email = self.normalize_email(email).lower()
        extra_fields.setdefault('username', email)
        extra_fields.setdefault('role', User.Role.USER)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', User.Role.ADMIN)
        extra_fields.setdefault('name', 'Super Administrator')
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    """
    PlanMyStay User Model with strict Role-Based Access Control (RBAC).
    Roles:
      - USER (Customer)
      - OWNER (Hotel / Property Partner)
      - ADMIN (Platform Administrator)
    """

    class Role(models.TextChoices):
        USER = 'USER', 'Customer'
        OWNER = 'OWNER', 'Hotel Owner'
        ADMIN = 'ADMIN', 'Administrator'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField('Email Address', unique=True, db_index=True)
    name = models.CharField('Full Name', max_length=255)
    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.USER,
        db_index=True
    )
    phone = models.CharField(max_length=30, blank=True, null=True)
    avatar = models.CharField(max_length=255, blank=True, default='AP')
    title = models.CharField(max_length=100, blank=True, default='Member account')
    preferences = models.JSONField(
        default=dict,
        blank=True,
        help_text="User preferences: mealPref, seatPref, hotelClass"
    )

    # Password reset support
    reset_token = models.CharField(max_length=128, blank=True, null=True)
    reset_token_expires = models.DateTimeField(blank=True, null=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-date_joined']

    def __str__(self):
        return f"{self.name} ({self.email}) - [{self.role}]"

    @property
    def is_customer(self):
        return self.role == self.Role.USER

    @property
    def is_hotel_owner(self):
        return self.role in [self.Role.OWNER, self.Role.ADMIN]

    @property
    def is_platform_admin(self):
        return self.role == self.Role.ADMIN or self.is_superuser
