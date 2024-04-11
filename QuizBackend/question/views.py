import jwt
from django.shortcuts import render
from .models import *
from .serializers import *
from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework.decorators import api_view,authentication_classes, permission_classes
import json
import string
from django.http import HttpResponse, JsonResponse , HttpRequest
from random import choice
from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate,login,logout
from django.db import IntegrityError
from django.views.decorators.http import require_POST
from django.contrib.sessions.models import Session
from django.middleware.csrf import get_token
from rest_framework_simplejwt.tokens import Token, RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication

def getCode():
	length = 8
	characters = string.ascii_letters + string.digits
	code = ('').join([choice(characters) for i in range(length)])
	return code

@api_view(['GET'])
@permission_classes([IsAuthenticated]) 
def userView(request):
	user = User.objects.get(id=request.user.id)
	player = Player.objects.get(user=user)
	serializer = PlayerSerializer(player)
	return Response({'success':True,'msg':serializer.data})

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
		data = request.data
		playerName = data.get('name')
		player = Player.objects.create(name=playerName)
		serializer = PlayerSerializer(player)
		game.host = player
		game.players.add(player)
		game.code = f'{getCode()}{game.id}G'
		game.time = data.get('time')
		game.difficulty = data.get('level')
		game.gameType = int(data.get('type'))
		
		questionNumber = int(data.get('questionNumber'))
		if questionNumber == None or questionNumber == 0:
			questionNumber = 20
		category = data.get('category')
		print(category)
		if category == 'Any Category':
			queryset = Question.objects.all().order_by('?')[:20]
		else:
			queryset = Question.objects.filter(category__name=category).order_by('?')[:20]
		

		for question in queryset:
			game.question.add(question)
			print('done here')
		game.save()
		data = dict(id=game.id,player=serializer.data,code=game.code)
		return Response(data)
	else:
		game = Game.objects.get(id=id)
		serializer = GameSerializer(game)
		return Response(serializer.data)

@api_view(['GET'])
def nextLevel(request,game,level):
	game = Game.objects.get(id=game)
	queryset = Question.objects.filter(level__name=level)
	for question in queryset:
		game.question.add(question)
		game.save()
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
	if request.user.is_authenticated:
		player = Player.objects.get(user = request.user)
		player.total_score += int(score)
	else:
		player = Player.objects.get(id=id)
	player.score = int(score)
	player.active = False
	player.save()
	return Response({'message':'score is saved succesfully'})

@api_view(['GET'])
def joinGame(request,id,player):
	print("game code is ",id)
	game = Game.objects.get(code=id)
	if game.players.filter(name=player).exists():
		serializer = GameSerializer(game)
		return Response({"body":"User already Join","error":True,"game":serializer.data})
	player = Player.objects.create(name=player)
	game.players.add(player)
	game.save()
	serializer = GameSerializer(game)
	return Response(serializer.data)


@api_view(['GET'])
def getCategory(request):
	category = Category.objects.all()
	serializer = CategorySerializer(category,many=True)
	print('category fetched')
	return Response(serializer.data)

@api_view(['POST'])
def signUp(request):
	data = request.data
	username = data.get('username')
	password = data.get('password')

	if username == "" or password == "":
		return Response({'error':True,'msg':"Username and password can not be empty"})

	if len(password) < 6 :
		return Response({'error':True,'msg':"Password is too short"})
	try:
		user = User.objects.create_user(username=username,password=password)
	except IntegrityError:
		return Response({'error':True,'msg':'User with the username already exist'})
	except :
		return Response({'error':True,'msg':'Something went Wrong'})
	
	return Response({'success':True,'msg':f'{username} has signup succesfully'})



#@authentication_classes([SessionAuthentication])
@api_view(['POST'])
def loginView(request):
	data = request.data
	username = data.get('username')
	password = data.get('password')
	user = authenticate(username=username,password=password)

	if user is not None:
		serializer = UserSerializer(user)
		refresh = RefreshToken.for_user(user)
		token = str(refresh.access_token)
		return Response({'msg':'login successfull','status':True,'user':serializer.data,'token':token})
	else:
		return Response({'msg':'Invalid Credentials','status':False,'user':user})


@api_view(['POST'])
def checkLogin(request):
	authenticate = JWTAuthentication()
	response = authenticate.authenticate(request)
	if response is not None:
		user = User.objects.get(username=request.user.username)
		serializer = UserSerializer(user)
		return Response({'user':serializer.data,'status':True})

	else:
		return Response({'user':None,'status':False,'msg':"invalid Token"})


@api_view(['GET'])
def logoutView(request):
	logout(request)
	return Response({'logout':True})


@api_view(['GET'])
def generateToken(request):
	token = get_token(request)
	return Response({'token':token})