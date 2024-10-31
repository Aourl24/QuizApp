import jwt
from django.shortcuts import render
from .models import *
from .serializers import *
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

'''
A small functions to generate code for the game codes
'''
def getCode():
	length = 8
	characters = string.ascii_letters + string.digits
	code = ('').join([choice(characters) for i in range(length)])
	return code

@api_view(['GET'])
#@permission_classes([IsAuthenticated]) 
def userView(request):
	r_user = request.data.get('user')
	user = User.objects.get(id=r_user)
	profile = Pofile.objects.get(user=user)
	serializer = ProfileSerializer(profile)
	return Response({'success':True,'data':serializer.data})

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
		if request.user.is_authenticated:
			profile = Profile.objects.get(user=request.user)
			player.profile = profile
			player.save()
		serializer = PlayerSerializer(player)
		game.host = player
		game.players.add(player)
		game.code = f'{getCode()}{game.id}G'
		game.time = data.get('time')
		game.gameType = int(data.get('type'))
		game.multiplayer = data.get('multiplayer')

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
		if game.public:
			serializer = GameSerializer(game)
			return Response(serializer.data)
		else:
			return Response({'error':true,'message':'This game is private'})


@api_view(['GET'])
def quickPlay(request,category):
	#category = Category.objects.filter(name)
	questions = Question.objects.filter(category__name=category)
	serializer = QuestionSerializer(questions, many=True)
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

@api_view(['GET','POST'])
def saveScores(request,id,score):
	# playerId = request.data.get('playerId')
	# score = request.data.get('score')
	# game = request.data.get('gameId')
	# ended = request.data.get('ended')
	player = Player.objects.get(id=id)
	player.score = int(score)
	player.save()

	if request.user.is_authenticated and ended == True:
		profile = Profile.objects.get(user = request.user)
		profile.points += int(score)
		player.active = False
	
	return Response({'message':'score is saved succesfully'})

@api_view(['GET'])
def joinGame(request,id,player):
	game = Game.objects.get(code=id)
	if game.multiplayer == False:
		return Response({'error':True,'message':'This game is not a multiplayer Game'})
	if game.players.filter(name=player).exists():
		serializer = GameSerializer(game)
		return Response({"body":"User already Join","error":True,"game":serializer.data})
	if len(list(game.players)) > game.max_players:
		return Response({"error":True,"message":"The room is full, cannot accept new players"})
	player = Player.objects.create(name=player)
	game.players.add(player)
	game.save()
	serializer = GameSerializer(game)
	return Response(serializer.data)


@api_view(['GET'])
def getCategory(request):
	category = Category.objects.all()
	serializer = CategorySerializer(category,many=True)
	return Response(serializer.data)

@api_view(['POST'])
def signUp(request):
	data = request.data
	username = data.get('username')
	password = data.get('password')

	if username == "" or password == "":
		return Response({'error':True,'msg':"Username and password can not be empty"})

	if len(password) < 6 :
		return Response({'error':True,'msg':"Password is too short,(password character should be greater than 6)"})
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



'''
This Api view check helps users to create Question, it only work for authenticate user,
(this view is created to process only one question at a time because i think it is more efficient rather than bulk questions,and it also gives room for updating questions anytime.i might later change it to accept bulk question at a time,who knows)

Request
the data received from the request is in this format {'game':'','question':'','options':[{body:'',answer:''}]},
	game : it is use to get or create the game model if the game value is 0, it means the game does not exist then we have to 
		create the game or if it already exist we just have to get it
	question : it is the body of the question
	options : it is the options  

Response
The response comprised of two things :the message telling us the Question is saved and also the game object

Logic
so the logic behind this view is that,when the user send a request to create questions, we get the game data and the question data from the post request, then i check whether the game already exist or not , then we link all questions to a Game. if you check previous views and models you will see that all questions are link to a game. That is why questions can't stand alone, they are in group.So group of questions are called games according to this project.
The reason for checking whether a game exist or not is because, since this view accept one question at a time,so we need to keep track of the game model the questions are linked to.
Since the view require user to log in, automatically the host of the game will be request.user
'''
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def createQuestions(request):
	
	# if not request.is_authenticated:
	# 	return Response({'message':'You are not Log in'},status=status.HTTP_400_BAD_REQUEST)

	id = int(request.data.get('game'))
	title =  request.data.get('title')

	if id == 0 or id == None:
		creator = Profile.objects.get(user= request.user)
		game = Game.objects.create(creator=creator,title=title)
	else:
		game = Game.objects.get(id=id)
	
	receive_question = request.data.get('question')
	level = Level.objects.create(name="1")
	question = Question.objects.create(body=receive_question,level=level)
	options = request.data.get('options')
	for option in options:
		opt = Option.objects.create(question=question,body=option['body'],answer=option['answer'])
	
	game.question.add(question)
	game.save()
	serializer = GameSerializer(game)
	return Response({'message':'Question is saved','data':serializer.data})


	'''Users Ranking View '''

def userRanking(request):
	profile = Profile.objects.all().order_by('-points')
	serializer = ProfileSerializer(profile,many=True)
	return Response(serializer.data)


'''All games View '''

def getAllGames(request):
	games = Game.objects.filter(active=True,public=True,multiplayer=True)
	serializer = GameSerializer(game,many=True)
	return Response(serializer.data)




