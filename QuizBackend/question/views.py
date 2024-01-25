from django.shortcuts import render
from .models import *
from .serializers import *
from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework.decorators import api_view
import json

@api_view(['GET'])
def questionApi(request,gameType,level='easy'):
	game = Game.objects.get(id=int(gameType))
	query = game.question.all()
	serializer = QuestionSerializer(query,many=True)
	return Response(serializer.data)

@api_view(['POST','GET'])
def createGame(request,id=None):
	if request.method == 'POST':
		game = Game.objects.create()
		data = json.loads(request.body.decode())
		playerName = data.get('name')
		player = Player.objects.create(name=playerName)
		serializer = PlayerSerializer(player)
		game.host = player
		game.players.add(player)
		game.time = data.get('time')
		game.difficulty = data.get('level')

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
	else:
		game = Game.objects.get(id=id)
		serializer = GameSerializer(game)
		return Response(serializer.data)



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