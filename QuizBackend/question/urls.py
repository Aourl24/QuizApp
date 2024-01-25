from django.urls import path,include
from .views import *


urlpatterns = [
	path('questionapi/<int:gameType>/<str:level>',questionApi),
	path('creategame/<str:playerName>',createGame),
	path('game/<int:id>/players',getPlayers),
	path('save/<int:id>/<int:score>',saveScores),
	path('join/<int:id>/<str:player>',joinGame),
]