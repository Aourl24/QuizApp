from django.core.management.base import BaseCommand
from question.models import Question, Category, Level,Option
import requests


'''[{'type': 'multiple', 'difficulty': 'normal', 'category': 'Python', 'question': 'What is the capital of Indonesia?', 'correct_answer': 'Jakarta', 'incorrect_answers': ['Bandung', 'Medan', 'Palembang']}]'''
url = 'https://opentdb.com/api.php?amount=20&category=18'
[{'type': 'multiple', 'difficulty': 'easy', 'category': 'Python',
  'question': 'What does the keyword `print` do in Python?',
  'correct_answer': 'Prints the value to the console',
  'incorrect_answers': ['Defines a function', 'Reads user input', 'Creates a variable']}]


class Command(BaseCommand):
	help = "Generate api"

	def handle(self,*args,**options):
		print('working on api')
		#data = requests.get(url)
		#response = data.json()
		for res in questions:#['results']:
			try:
				category = Category.objects.get(name=res['category'])
			except Category.DoesNotExist:
				category = Category.objects.create(name=res['category'])

			try:
				level = Level.objects.get(name=res['difficulty'])
			except Level.DoesNotExist:
				level = Level.objects.create(name=res['difficulty'])

			question = Question.objects.create(category=category,level=level,body=res['question'])

			correct_option = Option.objects.create(question=question,body=res['correct_answer'],answer=True)
			for opt in res['incorrect_answers']:
				option = Option.objects.create(question=question,body=opt,answer=False)

			print('done')

		