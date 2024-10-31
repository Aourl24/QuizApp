from django.urls import path,include
from .views import *


urlpatterns = [
	path('questionapi/<int:gameType>/<str:level>',questionApi),
	path('creategame',createGame),
	path('creategame/<int:id>',createGame),
	path('game/<int:id>/players',getPlayers),
	path('save/<int:id>/<int:score>',saveScores,name='SaveUrl'),
	path('join/<str:id>/<str:player>',joinGame),
	path('category',getCategory),
	path('nextlevel/<int:game>/<str:level>',nextLevel),
	path('signup',signUp),
	path('login',loginView),
	path('checkuser',checkLogin),
	path('logout',logoutView),
	path('token',generateToken),
	path('userprofile',userView),
	path('createquestion',createQuestions),
	path('useranking',userRanking),
	path('getgame',getAllGames),
	path('quickplay/<str:category>',quickPlay)
]