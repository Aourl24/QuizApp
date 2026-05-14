# Direct import script for AWS exam data
import json
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'your_project.settings')
django.setup()

from quiz.models import Category, Level, GameMode, Game, Question, Option

def load_exam_data(filepath='aws_exam_sets.json'):
    with open(filepath, 'r') as f:
        data = json.load(f)

    # Load categories
    for cat in data['categories']:
        Category.objects.get_or_create(
            id=cat['id'],
            defaults={
                'name': cat['name'],
                'slug': cat['slug'],
                'description': cat['description'],
                'color': cat['color']
            }
        )

    # Load levels
    for lvl in data['levels']:
        Level.objects.get_or_create(
            id=lvl['id'],
            defaults={
                'name': lvl['name'],
                'description': lvl['description'],
                'color': lvl['color'],
                'order': lvl['order']
            }
        )

    # Load game mode
    for gm in data['game_modes']:
        GameMode.objects.get_or_create(
            id=gm['id'],
            defaults={
                'name': gm['name'],
                'slug': gm['slug'],
                'instructions': gm['instructions'],
                'icon': gm['icon'],
                'color': gm['color'],
                'score': gm['score'],
                'time': gm['time'],
                'order': gm['order'],
                'is_active': gm['is_active'],
                'is_guest_allowed': gm['is_guest_allowed'],
                'verified_profile': gm['verified_profile']
            }
        )

    # Load games (exam sets)
    for game in data['games']:
        Game.objects.get_or_create(
            id=game['id'],
            defaults={
                'title': game['title'],
                'slug': game['slug'],
                'description': game['description'],
                'mode_id': game['mode_id'],
                'category_id': game['category_id'],
                'time_per_question': game['time_per_question'],
                'difficulty': game['difficulty'],
                'public': game['public'],
                'active': game['active'],
                'multiplayer': game['multiplayer'],
                'max_players': game['max_players']
            }
        )

    # Load questions
    for q in data['questions']:
        Question.objects.get_or_create(
            id=q['id'],
            defaults={
                'level_id': q['level_id'],
                'body': q['body'],
                'explanation': q['explanation'],
                'hint': q['hint'],
                'order': q['order'],
                'mark': q['mark']
            }
        )

    # Load options
    for opt in data['options']:
        Option.objects.get_or_create(
            id=opt['id'],
            defaults={
                'question_id': opt['question_id'],
                'body': opt['body'],
                'answer': opt['answer'],
                'order': opt['order']
            }
        )

    print(f"Loaded {len(data['games'])} exam sets with {len(data['questions'])} questions")

if __name__ == '__main__':
    load_exam_data()