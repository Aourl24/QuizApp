"""
ASGI config for QuizBackend project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""

import os

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from channels.security.websocket import AllowedHostsOriginValidator
from question.routing import websocket_urlpatterns

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'QuizBackend.settings')
#os.environ['DJANGO_ALLOw_ASYNC_UNSAFE'] = "true"

django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter(
	{'http':django_asgi_app,
		'websocket': AllowedHostsOriginValidator(AuthMiddlewareStack(URLRouter(websocket_urlpatterns)))
	}
	)