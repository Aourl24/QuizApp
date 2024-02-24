import json
from channels.generic.websocket import AsyncWebsocketConsumer
import asyncio
from .models import Game,Player
from asgiref.sync import sync_to_async

class QuizConsumer(AsyncWebsocketConsumer):
	player_status = None

	async def connect(self):
		self.room_id = self.scope['url_route']['kwargs']['game']
		self.group_name = f"quiz_room{self.room_id}"
		self.player = self.scope['url_route']['kwargs']['player']

		#game = await sync_to_async(Game.objects.get(id=self.room_id))
		#check = await sync_to_async(game.players.filter(name=self.player).exists())
		check = await self.getGame()
		#if check:
			#await self.close()
		#else:
		await self.accept()
		#await self.identifyPlayer()

		await self.channel_layer.group_add(self.group_name,self.channel_name)
		#await self.channel_layer.group_send(self.group_name,{'type':'group.message','payload':})
		await self.wait_for_second_user()
		

	@sync_to_async
	def getGame(self):
		game = Game.objects.get(id=self.room_id)
		player = Player.objects.get(name=self.player)
		print(player.name) 
		#check = game.players.filter(name=self.player).exists()
		if player.connected:
			return True
		else:
			return False

	@sync_to_async
	def identifyPlayer(self):
		player = Player.objects.get(name=self.player)
		player.connected = True
		return player.save()
		#print(player.connectd, 'suppose to be True')

	
	@sync_to_async
	def disconnectPlayer(self):
		player = Player.objects.get(name=self.player)
		player.connected = False
		player.save()
		return player.save()
		#self.player_status = False
		#print(player.connectd, 'suppose to be False')
		
	async def receive(self,text_data):
		data = json.loads(text_data)
		print(data)
		msg = 'answered'
		#await self.send(text_data=json.dumps({'message':'answered'}))
		await self.channel_layer.group_send(self.group_name,{'type':'group.message','payload':msg})
		#text_data_json = json.loads(text_data)

	async def wait_for_second_user(self):
		await asyncio.sleep(5)
		users_number = len(self.channel_layer.groups[self.group_name])
		print('number of user in this room ', users_number)
		print('room name', self.group_name)
		print('player disconnect status',self.player_status) 
		if users_number < 2:
			await self.send(text_data=json.dumps({"message":"wait_timeout"}))

		else:
			await self.send(text_data=json.dumps({'message':'user_join'}))

	async def group_message(self,event):
		message = event['payload']
		await self.send(text_data=json.dumps({'message':message}))

	async def disconnect(self,close_code):
		await self.disconnectPlayer()
		await self.channel_layer.group_discard(self.group_name,self.channel_name)
		print(self.player_status)
	#async def handle_user_join(self,data):
