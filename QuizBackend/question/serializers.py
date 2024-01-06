from .models import *
from rest_framework import serializers

class LevelSerializer(serializers.ModelSerializers):
	class Meta:
		model = Level
		fields = '__all__'

class OptionSerializer(serializers.ModelSerializers):
	class Meta:
		model = Option
		fields = '__all__'

class QuestionSerializer(serializers.ModelSerializers):
	level = LevelSerializer()
	Option = OptionSerializer(many=True)

	class Meta:
		model = Question
		fields = '__all__'