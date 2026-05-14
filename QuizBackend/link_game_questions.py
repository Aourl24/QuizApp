# link_game_questions.py
# Run this AFTER loaddata to connect games to their questions

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'QuizBackend.settings')
django.setup()

from question.models import Game, Question

# Define which questions belong to which game
# Game 1: Questions 1-60
# Game 2: Questions 61-120
# Game 3: Questions 121-180
# Game 4: Questions 181-240

game_question_map = {
    1: list(range(1, 61)),
    2: list(range(61, 121)),
    3: list(range(121, 181)),
    4: list(range(181, 241)),
}

for game_id, question_ids in game_question_map.items():
    try:
        game = Game.objects.get(pk=game_id)
        questions = Question.objects.filter(pk__in=question_ids)
        game.questions.set(questions)
        print(f"Linked Game {game_id} to {questions.count()} questions")
    except Game.DoesNotExist:
        print(f"Game {game_id} not found")

print("Done! All games linked to their questions.")