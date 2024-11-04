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
	path('quickplay/<str:category>/<int:next>',quickPlay),
	path('dailychallenge/<int:player>',dailyChallenge),
	path('completed/<int:player>/<int:score>/<int:game>',completeGame),
	path('blitz/<int:next>',blitzMode),
	path('survival/<int:next>',survivalMode),
	path('leaderboard',leaderBoards)
]