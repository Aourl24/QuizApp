from .models import *
from rest_framework import serializers
from random import shuffle
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
	class Meta:
		model = User
		fields = ["id","username"]

class ProfileSerializer(serializers.ModelSerializer):
	user = UserSerializer()
	total_points = serializers.IntegerField()

	class Meta:
		model = Profile
		fields = ["user","total_points"]

class CategorySerializer(serializers.ModelSerializer):
	class Meta:
		model = Category
		fields = '__all__'
		
class PlayerSerializer(serializers.ModelSerializer):
	class Meta:
		model = Player
		fields = '__all__'

class LevelSerializer(serializers.ModelSerializer):
	class Meta:
		model = Level
		fields = '__all__'

class OptionSerializer(serializers.ModelSerializer):
	class Meta:
		model = Option
		fields = '__all__'

class QuestionSerializer(serializers.ModelSerializer):
	level = LevelSerializer()
	options = OptionSerializer(many=True,source='option.all')
	answer = OptionSerializer(many=True,source='option.all')

	class Meta:
		model = Question
		fields = '__all__'

	def to_representation(self,instance):
		representation = super().to_representation(instance)
		options = [option['body'] for option in representation['options']]
		shuffle(options)
		representation['options'] = options
		condition = lambda option: option['answer'] == True
		answer_in_list = list(filter(condition,representation['answer']))
		if answer_in_list:
			representation['answer'] = answer_in_list[0]['body']
		else:
			representation['answer'] = None
		return representation

class GameSerializer(serializers.ModelSerializer):
	# host = ProfileSerializer()
	# players = PlayerSerializer(many=True)
	# question =QuestionSerializer(many=True)

	class Meta:
		model = Game
		fields = '__all__'

class PointSerializer(serializers.ModelSerializer):
	# player = UserSerializer()
	total_points = serializers.IntegerField()
	class Meta:
		model = Points
		fields = ['score','total_points',]