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
	connected_users = {}
	user_can_join = True
	ready_players = 0
	timer = {}
	host = ''

	async def connect(self):
		self.room_id = self.scope['url_route']['kwargs']['game']
		self.group_name = f"quiz_room{self.room_id}"
		self.player = self.scope['url_route']['kwargs']['player']
	
		print(self.player)
		print(self.connected_users.keys())
		print(self.user_can_join)
		if self.user_can_join:
			if await self.checkUser():
				await self.accept()
				self.connected_users[self.player] = []
			else:
				await self.close()
			await self.channel_layer.group_add(self.group_name,self.channel_name)
			users_number = len(self.channel_layer.groups[self.group_name])
			await self.getHost()
			print(self.player,'this is player')
			new_player = self.player
			msg = dict(users=len(self.connected_users),type="joined",body=f"{self.player} has joined the room",player=f"{self.player}")
			await self.channel_layer.group_send(self.group_name,{'type':'group.message','payload':msg})
		else:
			await self.close()
		

	@sync_to_async
	def disconnectPlayer(self):
		player = Player.objects.get(name=self.player)
		player.connected = False
		player.save()
		return player.save()
		
	@sync_to_async
	def saveScore(self,score):
		game = Game.objects.get(id=self.room_id)
		player = Player.objects.get(name=self.player,game=game)
		player.score = int(score)
		#player.active = False
		player.save()
		print('score saved')

	@sync_to_async
	def getHost(self):
		game = Game.objects.get(id=int(self.room_id))
		self.host = game.host.name
		return self.host

	@sync_to_async
	def checkUser(self):
		game = Game.objects.get(id=self.room_id)
		check = game.players.filter(name=self.player).exists()
		print(check)
		return check

	async def receive(self,text_data):
		data = json.loads(text_data)
		group = True
		countdown = False
		print(data,f"from {self.player}")
		users = {'awwal':[1,2,3],}
		msg=dict(type="",body="")
		if data['type'] == 'start':
			if len(self.connected_users)< 2:
				msg = dict(type="waiting_for_users")
			else:
				msg = dict(type="start",body="Game has started")
				self.user_can_join = False
		elif data['type'] == 'ready':
			questionNumber = data['question']
			if questionNumber not in self.connected_users[self.player]:
				self.connected_users[self.player].append(questionNumber)
			if self.player in self.timer:
				if not self.timer[self.player].done():
					self.timer[self.player].cancel()

			check = [True if questionNumber in i else False for i in self.connected_users.values()]
			check_2 = [len(i) for i in self.connected_users.values()]
			print(check,check_2)
			if len(self.connected_users) >=2 :
				msg = dict(type="waiting_for_user",msg="Waiting for players to join")
			
			if all(check) and all(element == check_2[0] for element in check_2):
				print('question length',data['question_length'])
				print('question number',questionNumber)
				if int(data['question_length'])-1 == questionNumber:
					msg = dict(type="end",body="Question has end",question=questionNumber)
				else:
					msg = dict(type="all_ready",body="All players are Ready and Countdown has begin",question=questionNumber)
					#await self.saveScore(data['score'])
			else:
				msg = dict(type="waiting_for_answer",body=f"{self.player} is ready",question=questionNumber)
				group = False
			

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
			await self.saveScore(data['score'])
			msg = dict(body='score saved',type='saved')
			#self.connected_users.add(self.channel_name)
		elif data['type'] == 'reconnect':
			msg = dict(body=f"{self.player} has reconnected",type="reconnect")	
		
		
		if group:
			await self.channel_layer.group_send(self.group_name,{'type':'group.message','payload':msg})
		else:
			await self.send(text_data=json.dumps({'message':msg}))

					
	async def send_message_after_delay(self,msg):
		await asyncio.sleep(20)
		await self.send(text_data=json.dumps({'message':msg}))


	async def group_message(self,event):
		message = event['payload']
		frequent = {'host':self.host}
		await self.send(text_data=json.dumps({'message':{**message,**frequent}}))

	async def disconnect(self,close_code):
		#await self.disconnectPlayer()
		#await asyncio.sleep(20)
		msg = dict(type="player_disconnect",body=f"{self.player} has disconnect")
		if self.player in self.timer:
			self.timer[self.player].cancel()
		#if self.player in self.connected_users:
			#del self.connected_users[self.player]
		await self.channel_layer.group_discard(self.group_name,self.channel_name)
		await self.channel_layer.group_send(self.group_name,{'type':'group.message','payload':msg})

