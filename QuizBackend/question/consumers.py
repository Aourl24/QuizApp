import json
from channels.generic.websocket import AsyncWebsocketConsumer
import asyncio
from .models import Game,Player
from asgiref.sync import sync_to_async
from django.urls import reverse
import time

users = {'awwal':[{1:True},{2:False}],}
class QuizConsumer(AsyncWebsocketConsumer):
	player_status = None
	count = 10
	connected_users = {}
	user_can_join = True
	ready_players = 0
	timer = {}

	async def connect(self):
		self.room_id = self.scope['url_route']['kwargs']['game']
		self.group_name = f"quiz_room{self.room_id}"
		self.player = self.scope['url_route']['kwargs']['player']
		
		if self.player in self.connected_users.keys():
			self.close()
		else:
			self.connected_users[self.player] = []

		if self.user_can_join:
			await self.accept()
			await self.channel_layer.group_add(self.group_name,self.channel_name)
			users_number = len(self.channel_layer.groups[self.group_name])
			msg = dict(users=len(self.connected_users),type="joined",body=f"{self.player} has joined the room")
			await self.channel_layer.group_send(self.group_name,{'type':'group.message','payload':msg})
		else:
			self.close()
		#await self.wait_for_second_user()

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
	def getHost(self):
		game = Game.objects.get(id=int(self.room_id))
		return game.host

	@sync_to_async
	def checkUsers(self,players):
		if len(self.connected_users) == players:
			msg = dict(body='success',type='waiting')
		else:
			msg = dict(body='failed',type='waiting')
		return msg

	async def receive(self,text_data):
		data = json.loads(text_data)
		group = True
		countdown = False
		print(data,f"from {self.player}")
		users = {'awwal':[1,2,3],}
		msg=dict(type="",body="")
		if data['type'] == 'start':
			msg = dict(type="start",body="Game has started")
			# for k in self.connected_users.keys():
			# 	self.connected_users[k] = []
			self.user_can_join = False
		elif data['type'] == 'ready':
			questionNumber = data['question']
			if questionNumber not in self.connected_users[self.player]:
				self.connected_users[self.player].append(questionNumber)
			if self.player in self.timer:
				if not self.timer[self.player].done():
					self.timer[self.player].cancel()

			print(len(self.connected_users))
			#check = []
			#if self.ready_players == len(self.connected_users):#len(self.channel_layer.groups[self.group_name]) :
			#if all(self.connected_users.values()) and len(self.connected_users) >= 2:
			check = [True if questionNumber in i else False for i in self.connected_users.values()]
			print('check',check)
			print('values',self.connected_users.values())
			print('users',self.connected_users)
			print('player',self.player)
			if len(self.connected_users) >=2 :
				msg = dict(type="waiting_for_user",msg="Waiting for players to join")
			if all([True if questionNumber in i else False for i in self.connected_users.values()]):
				msg = dict(type="all_ready",body="All players are Ready and Countdown has begin",question=questionNumber)
			else:
				msg = dict(type="waiting_for_answer",body="Waiting for other players to Answer",player=self.player,question=questionNumber)
				group = False
			countdown = False
		elif data['type'] == 'countdown':
			group = False
			print("count down start")
			print("countdown end")
			msg = dict(type="countdown_end",body="Countdown has ended")
			if self.player in self.timer:
				if not self.timer[self.player].done():
					self.timer[self.player].cancel()
			counter = asyncio.ensure_future(self.send_message_after_delay(msg))
			self.timer[self.player] = counter			
			msg = dict(type="countdown_started",body="Countdown has started")

		elif data['type'] == 'timeout':
			questionNumber = data['question']
			if questionNumber not in self.connected_users[self.player]:
				self.connected_users[self.player].append(questionNumber)
			msg = dict(type="timeout",body="time out")

		elif data['type'] == 'score':
			await self.saveScore(data)
			msg = dict(body='saved',type='saved')
			self.connected_users.add(self.channel_name)
		
		
		if group:
			await self.channel_layer.group_send(self.group_name,{'type':'group.message','payload':msg})
		else:
			await self.send(text_data=json.dumps({'message':msg}))

					
	async def send_message_after_delay(self,msg):
		await asyncio.sleep(20)
		await self.send(text_data=json.dumps({'message':msg}))


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
		#await self.disconnectPlayer()
		await self.channel_layer.group_discard(self.group_name,self.channel_name)
