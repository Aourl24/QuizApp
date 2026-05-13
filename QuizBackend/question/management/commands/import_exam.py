import os
from django.core.management.base import BaseCommand
from django.db import transaction
from question.models import Game, GameMode, Question, Option, Level, Profile
from question.utils.md_parser import parse_md_exam


class Command(BaseCommand):
    help = 'Import exam questions from Markdown files'

    def add_arguments(self, parser):
        parser.add_argument('filepath', type=str, help='Path to .md exam file')
        parser.add_argument(
            '--mode',
            type=str,
            default='practice',
            help='Game mode name (default: practice)'
        )
        parser.add_argument(
            '--category',
            type=int,
            default=None,
            help='Category ID'
        )
        parser.add_argument(
            '--creator',
            type=int,
            default=1,
            help='Profile ID of the creator'
        )
        parser.add_argument(
            '--public',
            action='store_true',
            help='Make the game public'
        )

    @transaction.atomic
    def handle(self, *args, **options):
        filepath = options['filepath']
        
        if not os.path.exists(filepath):
            self.stdout.write(self.style.ERROR(f'File not found: {filepath}'))
            return
        
        # Parse the markdown
        parsed = parse_md_exam(filepath)
        
        self.stdout.write(f"Title: {parsed['title']}")
        self.stdout.write(f"Questions found: {len(parsed['questions'])}")
        
        # Get or create game mode
        mode, _ = GameMode.objects.get_or_create(
            name=options['mode'],
            defaults={'order': 0}
        )
        
        # Get creator profile
        try:
            creator = Profile.objects.get(id=options['creator'])
        except Profile.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'Creator profile {options["creator"]} not found'))
            return
        
        # Get or create default level
        level, _ = Level.objects.get_or_create(name="1")
        
        # Create the game
        game = Game.objects.create(
            title=parsed['title'],
            mode=mode,
            creator=creator,
            public=options['public'],
            active=True,
            multiplayer=False  # Practice exams are typically solo
        )
        
        if options['category']:
            from quiz.models import Category
            try:
                category = Category.objects.get(id=options['category'])
                game.category = category
                game.save()
            except Category.DoesNotExist:
                self.stdout.write(self.style.WARNING(f'Category {options["category"]} not found'))
        
        # Create questions and options
        created_count = 0
        for q_data in parsed['questions']:
            question = Question.objects.create(
                body=q_data['body'],
                level=level
            )
            
            # Create options
            for opt_data in q_data['options']:
                Option.objects.create(
                    question=question,
                    body=opt_data['body'],
                    answer=opt_data['answer']
                )
            
            # Link to game
            game.questions.add(question)
            created_count += 1
        
        self.stdout.write(self.style.SUCCESS(
            f'\n✓ Created game "{game.title}" (ID: {game.id}) with {created_count} questions'
        ))
        self.stdout.write(f'  Mode: {mode.name}')
        self.stdout.write(f'  Creator: {creator.user.username}')
        self.stdout.write(f'  Public: {game.public}')
