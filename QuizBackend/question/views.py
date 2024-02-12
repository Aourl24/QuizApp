from django.shortcuts import render
from .models import *
from .serializers import *
from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework.decorators import api_view
import json
import string
from django.http import HttpResponse, JsonResponse
from random import choice
from rest_framework import status

def getCode():
	length = 8
	characters = string.ascii_letters + string.digits
	code = ('').join([choice(characters) for i in range(length)])
	return code

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
		game.code = f'{getCode()}{game.id}G'
		game.time = data.get('time')
		game.difficulty = data.get('level')
		
		questionNumber = int(data.get('questionNumber'))
		category = data.get('category')
		queryset = Question.objects.filter(level__name=game.difficulty,category__name=category)[:questionNumber]
		
		for question in queryset:
			game.question.add(question)
			game.save()
		data = dict(id=game.id,player=serializer.data,code=game.code)
		return Response(data)
	else:
		game = Game.objects.get(id=id)
		serializer = GameSerializer(game)
		return Response(serializer.data)



@api_view(['GET'])
def getPlayers(request,id):
	game = Game.objects.get(id=id)
	players = game.players.all().order_by('-score')
	serializer = PlayerSerializer(players,many=True)
	return Response(serializer.data)

@api_view(['GET'])
def saveScores(request,id,score):
	player = Player.objects.get(id=id)
	player.score = int(score)
	player.active = False
	player.save()
	return Response({'message':'score is saved succesfully'})

@api_view(['GET'])
def joinGame(request,id,player):
	game = Game.objects.get(code=id)
	if game.players.filter(name=player).exists():
		return Response({"message":"Name Already Exists"})
	player = Player.objects.create(name=player)
	game.players.add(player)
	game.save()
	return Response({'id':game.id})


@api_view(['GET'])
def getCategory(request):
	category = Category.objects.all()
	serializer = CategorySerializer(category,many=True)
	print('category fetched')
	return Response(serializer.data)