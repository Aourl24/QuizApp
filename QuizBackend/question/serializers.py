from .models import *
from rest_framework import serializers

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
		representation['options'] = [option['body'] for option in representation['options']]
		condition = lambda option: option['answer'] == True
		answer_in_list = list(filter(condition,representation['answer']))
		representation['answer'] = answer_in_list[0]['body']
		return representation