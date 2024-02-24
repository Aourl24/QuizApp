from django.urls import re_path,path
from .consumers import QuizConsumer
#from django.conf.urls import url

websocket_urlpatterns = [
	path('quizroom/<int:game>/<str:player>',QuizConsumer.as_asgi())
]