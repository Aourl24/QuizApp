from django.urls import path,include
from .views import *


urlpatterns = [
	path('questionapi/<int:gameType>/<str:level>',questionApi),
	path('creategame/<str:playerName>',createGame),
]