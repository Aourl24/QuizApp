from django.urls import path,include
from .views import *


urlpatterns = [
	path('category',getCategory),
	path('signup',signUp),
	path('login',loginView),
	path('checkuser',checkLogin),
	path('logout',logoutView),
	path('token',generateToken),
	path('userprofile',userView),
	path('createquestion',createQuestions),
	path('useranking',userRanking),
	path('getgame',getAllGames),
	path('getgame/<int:game>/<int:next>',getGame),
	path('getsinglegame/<int:game>',getGame),
	path('getgamename/<str:name>/<int:next>',getGame),
	path('dailychallenge/<int:player>',dailyChallenge),
	path('dailychallenge/<int:player>/<str:games>',dailyChallenge),
	path('completed/<int:player>/<int:score>/<int:game>',completeGame),
	path('leaderboard',leaderBoards),
	path('getgames/<int:category>/<int:mode>',getGames),
	path('getgamescat/<int:category>',getGames),
	path('getgamesmode/<int:mode>',getGames),
	path('getmodes',getGameMode),
	path('getmodes/<int:id>',getGameMode)
]