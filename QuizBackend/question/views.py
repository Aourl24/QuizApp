from django.shortcuts import render
from .models import *
from .serializers import *
from rest_framework.response import Response
from rest_framework.decorators import api_view

@api_view(['GET'])
def questionApi(request):
	queryset = Question.objects.all()
	serializer = QuestionSerializer(queryset,many=True)
	return Response(serializer.data)

