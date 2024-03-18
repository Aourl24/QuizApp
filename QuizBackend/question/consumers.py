import json
from channels.generic.websocket import AsyncWebsocketConsumer
import asyncio
from .models import Game,Player
from asgiref.sync import sync_to_async
from django.urls import reverse
import time

class QuizConsumer(AsyncWebsocketConsumer):
	player_status = None
	count = 10
	connected_users = set()

	async def connect(self):
		self.room_id = self.scope['url_route']['kwargs']['game']
		self.group_name = f"quiz_room{self.room_id}"
		self.player = self.scope['url_route']['kwargs']['player']
		#check = await self.getGame()
		await self.accept()
		await self.channel_layer.group_add(self.group_name,self.channel_name)
		await self.channel_layer.group_send(self.group_name,{'type':'group.message','payload':'joined'})
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
	 # 	player.channel = self.channel_name
	 # 	player.connected = True
	 # 	player.save()
	
	async def countDown(self,x):
		x -= 1
		if x <= 0:
			msg = dict(body=x,type='endTime')
		else:
			msg = dict(body=x,type='time')

		return msg
		#await self.channel_layer.group_send(self.group_name,{'type':'group.message','payload':msg})

	@sync_to_async
	def disconnectPlayer(self):
		player = Player.objects.get(name=self.player)
		player.connected = False
		player.save()
		return player.save()
		
	@sync_to_async
	def saveScore(self,data):
		player = Player.objects.get(id=data['id'])
		player.score = int(data['score'])
		player.active = False
		player.save()
		print('score saved')


	@sync_to_async
	def checkUsers(self,players):
		if len(self.connected_users) == players:
			msg = dict(body='success',type='waiting')
		else:
			msg = dict(body='failed',type='waiting')
		return msg

	async def receive(self,text_data):
		data = json.loads(text_data)
		print(data)
		print('data received')
		if data['type'] == 'start':
			msg = await self.countDown(data['body'])
			await asyncio.sleep(2)
		elif data['type'] == 'waiting':
			players = data['body']
			print(players)
			print(len(self.connected_users))
			msg = await self.checkUsers(players)

		elif data['type'] == 'answer':
			self.connected_users.add(self.channel_name)
			msg = await self.checkUsers(data['body'])
					
		else:
			await self.saveScore(data)
			msg = dict(body='saved',type='saved')
			self.connected_users.add(self.channel_name)
		#if self.count == 0:
		#	msg = {'body':self.count,'type':'endTime'}
		#url = reverse('SaveUrl',kwargs={'score':data['e']['score'],'id':data['e']['id']})
		#res = requests.get('http://127.0.0.1:8000' +url)
		#print(res.json())
		#print('request seen')
		
		#self.count += 1
		await self.channel_layer.group_send(self.group_name,{'type':'group.message','payload':msg})


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
