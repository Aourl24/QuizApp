import json
from channels.generic.websocket import AsyncWebsocketConsumer

class QuizConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		await self.accept()

	async def disconnect(self,close_code):
		pass

	async def receive(self):
		#text_data_json = json.loads(text_data)
		pass
		#self.send(text_data)