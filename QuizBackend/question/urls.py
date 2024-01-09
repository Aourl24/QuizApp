from django.urls import path,include
from .views import *


urlpatterns = [
	path('questionapi/<str:gameType>/<str:level>',questionApi)
]