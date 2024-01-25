from django.shortcuts import render
from .models import *
from .serializers import *
from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework.decorators import api_view

@api_view(['GET'])
def questionApi(request,gameType,level='easy'):
	game = Game.objects.get(id=int(gameType))
	query = game.question.all()
	serializer = QuestionSerializer(query,many=True)
	return Response(serializer.data)

@api_view(['GET'])
def createGame(request,playerName):
	player = Player.objects.create(name=playerName)
	serializer = PlayerSerializer(player)
	game = Game.objects.create()
	game.players.add(player)
	try:
		levelModel = Level.objects.get(name=level)
		queryset = Question.objects.filter(level=levelModel)

	except:
		queryset = Question.objects.all()
	for question in queryset:
		game.question.add(question)
		game.save()
	data = dict(id=game.id,player=serializer.data)
	return Response(data)

@api_view(['GET'])
def getPlayers(request,id):
	game = Game.objects.get(id=id)
	players = game.players.all()
	serializer = PlayerSerializer(players,many=True)
	return Response(serializer.data)

@api_view(['GET'])
def saveScores(request,id,score):
	player = Player.objects.get(id=id)
	player.score = int(score)
	player.save()
	return Response({'message':'score is saved succesfully'})

@api_view(['GET'])
def joinGame(request,id,player):
	player = Player.objects.create(name=player)
	game = Game.objects.get(id=id)
	game.players.add(player)
	return Response({'message':True})