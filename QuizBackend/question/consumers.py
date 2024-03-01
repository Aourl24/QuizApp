import json
from channels.generic.websocket import AsyncWebsocketConsumer
import asyncio
from .models import Game,Player
from asgiref.sync import sync_to_async
from django.urls import reverse
import requests

class QuizConsumer(AsyncWebsocketConsumer):
	player_status = None

	async def connect(self):
		self.room_id = self.scope['url_route']['kwargs']['game']
		self.group_name = f"quiz_room{self.room_id}"
		self.player = self.scope['url_route']['kwargs']['player']
		#check = await self.getGame()
		await self.accept()
		await self.channel_layer.group_add(self.group_name,self.channel_name)
		#await self.wait_for_second_user()
		

	# @sync_to_async
	# def getGame(self):
	# 	game = Game.objects.get(id=self.room_id)
	# 	player = Player.objects.get(name=self.player)
	# 	print(player.name) 
	# 	if player.connected:
	# 		return True
	# 	else:
	# 		return False

	# @sync_to_async
	# def identifyPlayer(self):
	# 	player = Player.objects.get(name=self.player)
	# 	player.connected = True
	# 	return player.save()
	
	@sync_to_async
	def disconnectPlayer(self):
		player = Player.objects.get(name=self.player)
		player.connected = False
		player.save()
		return player.save()
		
	@sync_to_async
	def saveScore(self,data):
		player = Player.objects.get(id=data['e']['id'])
		player.score = int(data['e']['score'])
		player.active = False
		player.save()
		print('score saved')


	async def receive(self,text_data):
		data = json.loads(text_data)
		await self.saveScore(data)

		#url = reverse('SaveUrl',kwargs={'score':data['e']['score'],'id':data['e']['id']})
		#res = requests.get('http://127.0.0.1:8000' +url)
		#print(res.json())
		#print('request seen')
		msg = 'answered'

		await self.channel_layer.group_send(self.group_name,{'type':'group.message','payload':'saved'})


	# async def wait_for_second_user(self):
	# 	await asyncio.sleep(5)
	# 	users_number = len(self.channel_layer.groups[self.group_name])
	# 	print('number of user in this room ', users_number)
	# 	print('room name', self.group_name)
	# 	print('player disconnect status',self.player_status) 
	# 	if users_number < 2:
	# 		await self.send(text_data=json.dumps({"message":"wait_timeout"}))

	# 	else:
	# 		await self.send(text_data=json.dumps({'message':'user_join'}))

	async def group_message(self,event):
		message = event['payload']
		await self.send(text_data=json.dumps({'message':message}))

	async def disconnect(self,close_code):
		await self.disconnectPlayer()
		await self.channel_layer.group_discard(self.group_name,self.channel_name)
