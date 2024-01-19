from django.shortcuts import render
from .models import *
from .serializers import *
from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework.decorators import api_view

@api_view(['GET'])
def questionApi(request,gameType,level='easy'):
	game = Game.objects.get(id=int(gameType))

	try:
		levelModel = Level.objects.get(name=level)
		queryset = Question.objects.filter(level=levelModel)

	except:
		queryset = Question.objects.all()
	for question in queryset:
		game.question.add(question)
		game.save()

	query = game.question.all()
	serializer = QuestionSerializer(query,many=True)
	return Response(serializer.data)

@api_view(['GET'])
def createGame(request,playerName):
	player = Player.objects.create(name=playerName)
	game = Game.objects.create()
	game.players.add(player)
	game.save()
	data = dict(id=game.id)
	return Response(data)


