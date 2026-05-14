# management/commands/load_aws_exams.py
import json
from django.core.management.base import BaseCommand
from django.db import transaction
from question.models import Category, Level, GameMode, Game, Question, Option

class Command(BaseCommand):
    help = 'Load AWS Cloud Practitioner exam sets from JSON fixture'

    def add_arguments(self, parser):
        parser.add_argument(
            '--file',
            type=str,
            default='aws_exam_fixture.json',
            help='Path to the JSON fixture file'
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing exam data before loading'
        )

    def handle(self, *args, **options):
        filepath = options['file']
        clear_data = options['clear']

        if clear_data:
            self.stdout.write(self.style.WARNING('Clearing existing exam data...'))
            Option.objects.filter(question__game__mode__slug='aws-cloud-practitioner').delete()
            Question.objects.filter(game__mode__slug='aws-cloud-practitioner').delete()
            Game.objects.filter(mode__slug='aws-cloud-practitioner').delete()
            GameMode.objects.filter(slug='aws-cloud-practitioner').delete()

        with open(filepath, 'r') as f:
            data = json.load(f)

        with transaction.atomic():
            created_counts = {'categories': 0, 'levels': 0, 'game_modes': 0, 
                            'games': 0, 'questions': 0, 'options': 0}

            for item in data:
                model_name = item['model'].split('.')[-1]
                fields = item['fields']
                pk = item['pk']

                if model_name == 'category':
                    Category.objects.get_or_create(id=pk, defaults=fields)
                    created_counts['categories'] += 1

                elif model_name == 'level':
                    Level.objects.get_or_create(id=pk, defaults=fields)
                    created_counts['levels'] += 1

                elif model_name == 'gamemode':
                    GameMode.objects.get_or_create(id=pk, defaults=fields)
                    created_counts['game_modes'] += 1

                elif model_name == 'game':
                    # Handle ManyToMany and ForeignKey relationships
                    mode_id = fields.pop('mode_id', None)
                    category_id = fields.pop('category_id', None)
                    if mode_id:
                        fields['mode'] = GameMode.objects.get(id=mode_id)
                    if category_id:
                        fields['category'] = Category.objects.get(id=category_id)
                    Game.objects.get_or_create(id=pk, defaults=fields)
                    created_counts['games'] += 1

                elif model_name == 'question':
                    game_id = fields.pop('game_id', None)
                    level_id = fields.pop('level_id', None)
                    category_id = fields.pop('category_id', None)
                    if game_id:
                        fields['game'] = Game.objects.get(id=game_id)
                    if level_id:
                        fields['level'] = Level.objects.get(id=level_id)
                    # Remove non-model fields
                    fields.pop('correct_answers', None)
                    fields.pop('difficulty', None)
                    fields.pop('is_multiple', None)
                    Question.objects.get_or_create(id=pk, defaults=fields)
                    created_counts['questions'] += 1

                elif model_name == 'option':
                    question_id = fields.pop('question_id', None)
                    if question_id:
                        fields['question'] = Question.objects.get(id=question_id)
                    fields.pop('letter', None)  # Remove helper field
                    Option.objects.get_or_create(id=pk, defaults=fields)
                    created_counts['options'] += 1

            self.stdout.write(self.style.SUCCESS(
                f"Successfully loaded AWS exam data:"
                f"  Categories: {created_counts['categories']}"
                f"  Levels: {created_counts['levels']}"
                f"  Game Modes: {created_counts['game_modes']}"
                f"  Games (Exam Sets): {created_counts['games']}"
                f"  Questions: {created_counts['questions']}"
                f"  Options: {created_counts['options']}"
            ))