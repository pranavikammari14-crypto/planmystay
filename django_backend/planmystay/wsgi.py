"""
WSGI config for PlanMyStay project.
"""
import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'planmystay.settings')
application = get_wsgi_application()
