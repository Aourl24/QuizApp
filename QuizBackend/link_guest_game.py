# link_guest_game.py
# Run this AFTER loaddata to connect guest game to its 20 questions

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'QuizBackend.settings')
django.setup()

from question.models import Game, Question

try:
    game = Game.objects.get(pk=5)
    questions = Question.objects.filter(pk__in=range(241, 261))
    game.questions.set(questions)
    print(f"Linked Guest Game to {questions.count()} questions")
except Game.DoesNotExist:
    print("Guest Game (pk=5) not found")

print("Done!")