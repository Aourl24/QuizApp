import string
from random import choice

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.db import IntegrityError
from django.db.models import Sum, Q, Avg, Count
from django.core.paginator import Paginator, EmptyPage
from django.utils import timezone

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import (
    User, Profile, GameMode, Game, Category, Question, 
    Option, Level, Points, GameAttempt, Setting, Badge, PlayerBadge
)
from .serializers import (
    UserSerializer, UserDetailSerializer,
    ProfileSerializer, ProfileMinimalSerializer, LeaderboardSerializer, GameListSerializer, GameDetailSerializer, GameAdminSerializer,
    GameModeSerializer, CategorySerializer,
    QuestionPlayerSerializer, QuestionAdminSerializer,
    OptionPlayerSerializer, OptionAdminSerializer,
    PointsSerializer, GameAttemptSerializer,
    SettingSerializer, BadgeSerializer, PlayerBadgeSerializer
)


"""
Utility Functions
"""

def get_code(length=8):
    """Generate a random alphanumeric code for private games."""
    characters = string.ascii_letters + string.digits
    return ''.join([choice(characters) for _ in range(length)])


def paginate_questions(queryset, page_size, page_number, game_instance=None):
    """
    Paginate questions and return serialized data with game info.
    Uses QuestionPlayerSerializer to hide correct answers.
    """
    paginator = Paginator(queryset, page_size)

    try:
        page = paginator.page(page_number)
    except EmptyPage:
        return Response({
            "questions": [],
            "has_next": False,
            "pages_number": paginator.count,
            "next_page_number": None
        })

    question_serializer = QuestionPlayerSerializer(page.object_list, many=True)

    response_data = {
        "questions": question_serializer.data,
        "has_next": page.has_next(),
        "pages_number": paginator.count,
        "next_page_number": page.next_page_number() if page.has_next() else None
    }

    if game_instance:
        game_serializer = GameListSerializer(game_instance)
        response_data["game"] = game_serializer.data

    return Response(response_data)


def check_guest_access(mode, user):
    """
    Check if a user (guest or authenticated) can access a game mode.
    Returns (allowed: bool, error_response: Response|None)
    """
    if user and user.is_authenticated:
        return True, None

    # Guest user
    if not mode.is_guest_allowed:
        return False, Response(
            {"error": "Login required to access this mode", "requires_auth": True},
            status=status.HTTP_403_FORBIDDEN
        )

    return True, None


"""
User & Authentication Views
"""

@api_view(['GET'])
def user_view(request):
    """
    Get user profile by ID.
    Expected: request.data contains 'user' (user ID)
    """
    user_id = request.data.get('user')

    if not user_id:
        return Response(
            {'success': False, 'error': 'User ID is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = User.objects.get(id=user_id)
        profile = Profile.objects.get(user=user)
    except User.DoesNotExist:
        return Response(
            {'success': False, 'error': 'User not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Profile.DoesNotExist:
        return Response(
            {'success': False, 'error': 'Profile not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = ProfileSerializer(profile)
    return Response({'success': True, 'data': serializer.data})


@api_view(['POST'])
def sign_up(request):
    """
    Register a new user.
    Expected: {'username': '', 'password': ''}
    """
    data = request.data
    username = data.get('username', '').strip()
    password = data.get('password', '')

    if not username or not password:
        return Response(
            {'error': True, 'msg': "Username and password cannot be empty"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if len(password) < 6:
        return Response(
            {'error': True, 'msg': "Password must be at least 6 characters"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = User.objects.create_user(username=username, password=password)
    except IntegrityError:
        return Response(
            {'error': True, 'msg': 'Username already exists'},
            status=status.HTTP_409_CONFLICT
        )
    except Exception:
        return Response(
            {'error': True, 'msg': 'Something went wrong'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    return Response({
        'success': True,
        'msg': f'{username} signed up successfully',
        'error': False
    })


@api_view(['POST'])
def login_view(request):
    """
    Authenticate user and return JWT tokens.
    Expected: {'username': '', 'password': ''}
    """
    data = request.data
    username = data.get('username', '').strip()
    password = data.get('password', '')

    if not username or not password:
        return Response(
            {'msg': 'Username and password are required', 'status': False},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = authenticate(username=username, password=password)

    if user is not None:
        serializer = UserSerializer(user)
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        if hasattr(user, 'profile'):
            user.profile.save()

        return Response({
            'msg': 'Login successful',
            'status': True,
            'user': serializer.data,
            'token': access_token,
            'refresh': str(refresh)
        })

    return Response(
        {'msg': 'Invalid credentials', 'status': False},
        status=status.HTTP_401_UNAUTHORIZED
    )


@api_view(['POST'])
def check_login(request):
    """
    Verify JWT token and return user data.
    """
    auth = JWTAuthentication()
    result = auth.authenticate(request)

    if result is not None:
        user, token = result
        serializer = UserSerializer(user)
        return Response({
            'user': serializer.data,
            'status': True
        })

    return Response(
        {'user': None, 'status': False, 'msg': "Invalid token"},
        status=status.HTTP_401_UNAUTHORIZED
    )


@api_view(['POST'])
def logout_view(request):
    """
    Logout user (client should discard token).
    """
    logout(request)
    return Response({'logout': True})


"""
User Profile & Stats Views
"""

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_profile(request):
    """
    Get current user's full profile with stats.
    """
    profile = request.user.profile
    serializer = ProfileSerializer(profile)

    recent_attempts = GameAttempt.objects.filter(player=profile)[:10]
    attempts_serializer = GameAttemptSerializer(recent_attempts, many=True)

    badges = PlayerBadge.objects.filter(profile=profile).select_related('badge')
    badge_data = [{
        'name': b.badge.name,
        'description': b.badge.description,
        'icon': b.badge.icon,
        'color': b.badge.color,
        'earned_at': b.earned_at
    } for b in badges]

    return Response({
        'profile': serializer.data,
        'stats': {
            'total_games': profile.total_games_played,
            'total_points': profile.total_points,
            'current_streak': profile.current_streak,
            'longest_streak': profile.longest_streak,
        },
        'recent_attempts': attempts_serializer.data,
        'badges': badge_data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_game_history(request):
    """
    Get logged-in user's game history.
    Query params: ?limit=20&mode=survival
    """
    profile = request.user.profile
    limit = int(request.GET.get('limit', 50))
    mode_filter = request.GET.get('mode')

    attempts = GameAttempt.objects.filter(player=profile)

    if mode_filter:
        attempts = attempts.filter(game__mode__name=mode_filter)

    attempts = attempts.select_related('game', 'game__mode')[:limit]
    serializer = GameAttemptSerializer(attempts, many=True)

    return Response({
        'total_games': profile.total_games_played,
        'total_points': profile.total_points,
        'history': serializer.data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_stats(request):
    """
    Get user's overall statistics.
    """
    profile = request.user.profile
    attempts = GameAttempt.objects.filter(player=profile)

    if not attempts.exists():
        return Response({
            'total_games': 0,
            'average_score': 0,
            'best_score': 0,
            'total_points': 0,
            'favorite_mode': None,
            'accuracy': 0
        })

    total_questions = attempts.aggregate(
        total=Sum('questions_answered'),
        correct=Sum('correct_answers')
    )

    accuracy = 0
    if total_questions['total']:
        accuracy = round((total_questions['correct'] / total_questions['total']) * 100, 2)

    favorite_mode = attempts.values('game__mode__name').annotate(
        count=Count('id')
    ).order_by('-count').first()

    stats = {
        'total_games': profile.total_games_played,
        'total_points': profile.total_points,
        'average_score': round(attempts.aggregate(avg=Avg('percentage'))['avg'] or 0, 2),
        'best_score': attempts.aggregate(best=Avg('percentage'))['best'] or 0,
        'favorite_mode': favorite_mode['game__mode__name'] if favorite_mode else None,
        'accuracy': accuracy,
        'current_streak': profile.current_streak,
        'longest_streak': profile.longest_streak,
        'member_since': profile.joined_at,
    }

    return Response(stats)


"""
Settings Views
"""

@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def user_settings(request):
    """
    Get or update user settings.
    """
    profile = request.user.profile
    setting, _ = Setting.objects.get_or_create(player=profile)

    if request.method == 'GET':
        serializer = SettingSerializer(setting)
        return Response(serializer.data)

    serializer = SettingSerializer(setting, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({'success': True, 'settings': serializer.data})

    return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


"""
Game Mode & Category Views
"""

@api_view(['GET'])
@permission_classes([AllowAny])
def get_game_modes(request, id=None):
    """
    Get all active game modes.
    For guests: only returns modes with is_guest_allowed=True.
    For authenticated: returns all modes with lock status based on profile.
    """
    print(request.user)
    if request.user.is_authenticated:
        # Logged in: show all active modes
        modes = GameMode.objects.filter(is_active=True).order_by('order')
        profile_id = request.user.profile.id
        
    else:
        # Guest: only show guest-allowed modes
        modes = GameMode.objects.filter(is_active=True, is_guest_allowed=True).order_by('order')
        profile_id = None
    
    if id:
        modes = modes.filter(games__id=id)

    serializer = GameModeSerializer(
        modes, 
        many=True, 
        context={'profile_id': profile_id}
    )
    print(modes)
    
    return Response(serializer.data)


@api_view(['GET'])
def get_categories(request):
    """
    Get all active categories.
    """
    categories = Category.objects.filter(is_active=True).order_by('order')
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data)


"""
Game Views
"""

@api_view(['GET'])
def get_games(request, mode=None, category=None):
    """
    Get active public games filtered by mode and/or category.
    """
    games = Game.objects.filter(active=True, public=True)
    if mode and category:
        games = games.filter(mode__id=mode, category__id=category)
    elif mode:
        games = games.filter(mode__id=mode)
    elif category:
        games = games.filter(
            Q(category__id=category) | Q(mode__isnull=True)
        )

    serializer = GameListSerializer(games, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def get_game(request, next=1, game=None, name=None):
    """
    Get paginated questions for a specific game or random game by mode name.
    Checks guest access permissions.
    """
    get_game = None
    questions = None

    if game:
        try:
            get_game = Game.objects.get(id=game, active=True)
            questions = get_game.questions.order_by('?')

            # Check guest access
            if get_game.mode:
                allowed, error_response = check_guest_access(get_game.mode, request.user)
                if not allowed:
                    return error_response

        except Game.DoesNotExist:
            return Response(
                {'error': 'Game not found or inactive'},
                status=status.HTTP_404_NOT_FOUND
            )

    elif name:
        try:
            mode = GameMode.objects.get(name=name, is_active=True)
        except GameMode.DoesNotExist:
            return Response(
                {'error': f'Game mode "{name}" not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check guest access for this mode
        allowed, error_response = check_guest_access(mode, request.user)
        if not allowed:
            return error_response

        get_game = Game.objects.filter(mode=mode, active=True).order_by('?').first()

        if get_game:
            questions = get_game.questions.all()
        else:
            get_game = Game.objects.create(
                title=name,
                mode=mode,
                public=True,
                active=True
            )
            questions = Question.objects.filter(
                games__mode=mode
            ).order_by('?').distinct()
            get_game.questions.set(questions)

    else:
        return Response(
            {'error': 'Please provide either game ID or mode name'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not questions or not questions.exists():
        return Response(
            {'error': 'No questions available for this game'},
            status=status.HTTP_404_NOT_FOUND
        )

    return paginate_questions(questions, 20, next, game_instance=get_game)


@api_view(['GET'])
def get_all_games(request):
    """
    Get all active, public, multiplayer games.
    """
    games = Game.objects.filter(active=True, public=True, multiplayer=True)
    serializer = GameListSerializer(games, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def get_game_detail(request, id):
    """
    Get detailed info about a specific game by ID.
    Checks guest access permissions.
    """
    try:
        game = Game.objects.get(id=id, active=True)
    except Game.DoesNotExist:
        return Response({'error': 'Game not found'}, status=status.HTTP_404_NOT_FOUND)

    # Check guest access
    if game.mode:
        allowed, error_response = check_guest_access(game.mode, request.user)
        if not allowed:
            return error_response

    print(game)
    serializer = GameDetailSerializer(game)

    personal_best = None
    if request.user.is_authenticated:
        try:
            points = Points.objects.get(game=game, player=request.user.profile)
            personal_best = {
                'score': points.score,
                'best_score': points.best_score,
                'attempts': points.attempts_count
            }
        except Points.DoesNotExist:
            pass
    print(serializer.data)
    return Response({
        'game': serializer.data,
        'personal_best': personal_best,
        'total_plays': game.play_count,
        'average_score': game.avg_score
    })


"""
Daily Challenge Views
"""

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def daily_challenge(request, player):
    """
    Get daily challenge game. Track if player already played.
    Pass ?info=true to get game info only.
    """
    try:
        game = Game.objects.filter(
            mode__name="daily challenge",
            active=True
        ).latest('created_at')
    except Game.DoesNotExist:
        return Response(
            {'error': 'No daily challenge available'},
            status=status.HTTP_404_NOT_FOUND
        )

    try:
        profile = Profile.objects.get(id=player)
    except Profile.DoesNotExist:
        return Response(
            {'error': 'Player not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    if request.user != profile.user and not request.user.is_staff:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

    already_played = game.players.filter(id=profile.id).exists()

    if request.GET.get('info') == 'true':
        game_serializer = GameListSerializer(game)
        return Response({
            'game': game_serializer.data,
            'already_played': already_played
        })

    if already_played:
        try:
            points = Points.objects.get(game=game, player=profile)
            return Response({
                'message': 'Challenge already played today',
                'score': points.score,
                'best_score': points.best_score
            })
        except Points.DoesNotExist:
            return Response({
                'message': 'Challenge already played',
                'score': None
            })

    questions = game.questions.all()
    return paginate_questions(questions, 10, game_instance=game)


"""
Game Completion Views
"""

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_game(request):
    """
    Record game completion with full stats.
    """
    data = request.data
    player_id = data.get('player')
    score = data.get('score')
    game_id = data.get('game')
    total_possible = data.get('total_possible', 0)
    correct_count = data.get('correct_count', 0)
    wrong_count = data.get('wrong_count', 0)
    time_taken = data.get('time_taken', None)

    if not all([player_id, score is not None, game_id]):
        return Response(
            {'error': 'player, score, and game are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        game = Game.objects.get(id=game_id)
        profile = Profile.objects.get(id=player_id)
    except Game.DoesNotExist:
        return Response(
            {'error': 'Game not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Profile.DoesNotExist:
        return Response(
            {'error': 'Player not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    if request.user != profile.user and not request.user.is_staff:
        return Response(
            {'error': 'Unauthorized'},
            status=status.HTTP_403_FORBIDDEN
        )

    # 1. Create detailed attempt record
    GameAttempt.objects.create(
        player=profile,
        game=game,
        score=score,
        total_possible=total_possible,
        correct_answers=correct_count,
        wrong_answers=wrong_count,
        time_taken_seconds=time_taken,
        completed=True
    )

    # 2. Update Points (leaderboard)
    points, created = Points.objects.get_or_create(
        game=game,
        player=profile,
        defaults={'score': score, 'best_score': score, 'attempts_count': 1}
    )

    if not created:
        points.update_score(score)

    # 3. Update profile totals and streak
    profile.total_games_played += 1
    profile.total_points += score
    profile.update_streak()
    profile.save()

    # 4. Update game stats
    game.increment_plays()
    game.update_average_score()
    game.players.add(profile)

    # 5. Check for badge achievements
    new_badges = check_and_award_badges(profile)

    return Response({
        'message': "Game completed",
        'score': score,
        'best_score': points.best_score,
        'attempts': points.attempts_count,
        'percentage': round((score / total_possible) * 100, 2) if total_possible else 0,
        'streak': profile.current_streak,
        'new_badges': new_badges
    })


def check_and_award_badges(profile):
    """Check if user qualifies for new badges and award them."""
    new_badges = []

    badges = Badge.objects.all()
    for badge in badges:
        if PlayerBadge.objects.filter(profile=profile, badge=badge).exists():
            continue

        earned = False

        if badge.requirement_type == 'games_played':
            if profile.total_games_played >= badge.requirement_value:
                earned = True
        elif badge.requirement_type == 'total_score':
            if profile.total_points >= badge.requirement_value:
                earned = True
        elif badge.requirement_type == 'streak':
            if profile.current_streak >= badge.requirement_value:
                earned = True
        elif badge.requirement_type == 'perfect_score':
            perfect_attempts = GameAttempt.objects.filter(
                player=profile, percentage=100.0
            ).count()
            if perfect_attempts >= badge.requirement_value:
                earned = True

        if earned:
            PlayerBadge.objects.create(profile=profile, badge=badge)
            new_badges.append({
                'name': badge.name,
                'icon': badge.icon,
                'color': badge.color
            })

    return new_badges


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_mode(request):
    """
    Mark a game mode as completed/unlocked for a profile.
    Expected: {'profile': id, 'mode': id}
    """
    data = request.data
    profile_id = data.get('profile')
    mode_id = data.get('mode')

    if not all([profile_id, mode_id]):
        return Response(
            {'error': 'profile and mode are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        mode = GameMode.objects.get(id=mode_id)
        profile = Profile.objects.get(id=profile_id)
    except GameMode.DoesNotExist:
        return Response(
            {'error': 'Mode not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Profile.DoesNotExist:
        return Response(
            {'error': 'Profile not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    if request.user != profile.user and not request.user.is_staff:
        return Response(
            {'error': 'Unauthorized'},
            status=status.HTTP_403_FORBIDDEN
        )

    mode.profiles.add(profile)

    return Response({
        'message': f'Mode "{mode.name}" unlocked',
        'mode': mode.name,
        'unlocked_at': timezone.now()
    })


"""
Question Creation Views
"""

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_questions(request):
    """
    Create a single question with options, linked to a game.
    Returns GameAdminSerializer for full creator view.
    """
    data = request.data

    game_id = data.get('game')
    title = data.get('title', '').strip()
    mode_id = data.get('mode')
    question_body = data.get('question', '').strip()
    options_data = data.get('options')
    explanation = data.get('explanation', '').strip()
    level_name = data.get('level', '1')

    if not all([game_id is not None, mode_id, question_body]):
        return Response(
            {'error': 'Game, mode, and question body are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not options_data or not isinstance(options_data, list) or len(options_data) < 2:
        return Response(
            {'error': 'At least 2 options required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    correct_count = sum(1 for opt in options_data if opt.get('answer'))
    if correct_count == 0:
        return Response(
            {'error': 'At least one option must be correct'},
            status=status.HTTP_400_BAD_REQUEST
        )

    level, _ = Level.objects.get_or_create(name=level_name)

    try:
        game_mode = GameMode.objects.get(id=int(mode_id))
    except (GameMode.DoesNotExist, ValueError):
        return Response(
            {'error': 'Invalid game mode'},
            status=status.HTTP_400_BAD_REQUEST
        )

    game_id = int(game_id) if game_id != '' and game_id is not None else 0

    if game_id == 0:
        creator = request.user.profile
        game = Game.objects.create(
            creator=creator,
            title=title or "Untitled Game",
            mode=game_mode
        )
    else:
        try:
            game = Game.objects.get(id=game_id, mode=game_mode)
        except Game.DoesNotExist:
            return Response(
                {'error': 'Game not found or mode mismatch'},
                status=status.HTTP_404_NOT_FOUND
            )

    question = Question.objects.create(
        body=question_body,
        level=level,
        explanation=explanation
    )

    for i, option_data in enumerate(options_data):
        Option.objects.create(
            question=question,
            body=option_data['body'],
            answer=bool(option_data['answer']),
            order=i
        )

    game.questions.add(question)

    serializer = GameAdminSerializer(game)
    return Response({
        'message': 'Question saved successfully',
        'data': serializer.data,
        'question_count': game.questions.count()
    })


"""
Leaderboard Views
"""

@api_view(['GET'])
def leaderboards(request):
    """
    Get leaderboards: global, survival, daily challenge, blitz.
    Uses LeaderboardSerializer for optimized output.
    """
    global_leaderboards = Profile.objects.filter(
        total_points__gt=0
    ).order_by("-total_points")[:15]

    survival_leaderboards = Profile.objects.filter(
        attempts__game__mode__name="survival"
    ).annotate(
        mode_points=Sum('attempts__score')
    ).order_by("-mode_points")[:15]

    daily_leaderboards = Profile.objects.filter(
        attempts__game__mode__name="daily challenge"
    ).annotate(
        mode_points=Sum('attempts__score')
    ).order_by("-mode_points")[:15]

    blitz_leaderboards = Profile.objects.filter(
        attempts__game__mode__name="blitz"
    ).annotate(
        mode_points=Sum('attempts__score')
    ).order_by("-mode_points")[:15]

    global_serializer = LeaderboardSerializer(global_leaderboards, many=True)
    daily_serializer = LeaderboardSerializer(daily_leaderboards, many=True)
    survival_serializer = LeaderboardSerializer(survival_leaderboards, many=True)
    blitz_serializer = LeaderboardSerializer(blitz_leaderboards, many=True)

    return Response({
        "global_leaderboards": global_serializer.data,
        "daily_leaderboards": daily_serializer.data,
        "blitz_leaderboards": blitz_serializer.data,
        "survival_leaderboards": survival_serializer.data
    })


@api_view(['GET'])
def game_leaderboard(request, game_id):
    """
    Get leaderboard for a specific game.
    """
    try:
        game = Game.objects.get(id=game_id)
    except Game.DoesNotExist:
        return Response({'error': 'Game not found'}, status=404)

    top_scores = Points.objects.filter(
        game=game
    ).select_related('player', 'player__user').order_by('-score')[:20]

    leaderboard = []
    for i, point in enumerate(top_scores, 1):
        leaderboard.append({
            'rank': i,
            'username': point.player.user.username,
            'score': point.score,
            'best_score': point.best_score,
            'attempts': point.attempts_count,
            'last_played': point.last_played
        })

    personal = None
    if request.user.is_authenticated:
        try:
            my_points = Points.objects.get(game=game, player=request.user.profile)
            my_rank = Points.objects.filter(
                game=game, score__gt=my_points.score
            ).count() + 1
            personal = {
                'rank': my_rank,
                'score': my_points.score,
                'best_score': my_points.best_score,
                'attempts': my_points.attempts_count
            }
        except Points.DoesNotExist:
            pass

    return Response({
        'game': game.title,
        'leaderboard': leaderboard,
        'personal': personal,
        'total_players': Points.objects.filter(game=game).count()
    })


@api_view(['GET'])
def user_ranking(request):
    """
    Get all users ranked by total points.
    """
    profiles = Profile.objects.filter(
        total_points__gt=0
    ).order_by('-total_points')

    serializer = LeaderboardSerializer(profiles, many=True)
    return Response(serializer.data)


"""
Badge Views
"""

@api_view(['GET'])
def get_badges(request):
    """
    Get all available badges.
    """
    badges = Badge.objects.all()
    serializer = BadgeSerializer(badges, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_badges(request):
    """
    Get current user's earned badges.
    """
    badges = PlayerBadge.objects.filter(
        profile=request.user.profile
    ).select_related('badge').order_by('-earned_at')

    data = [{
        'name': b.badge.name,
        'description': b.badge.description,
        'icon': b.badge.icon,
        'color': b.badge.color,
        'earned_at': b.earned_at
    } for b in badges]

    return Response({
        'total_badges': len(data),
        'badges': data
    })


"""
Exam Import View
"""

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def import_exam_from_md(request):
    """
    Upload a .md exam file and create questions automatically.
    """
    from .utils.md_parser import parse_md_exam
    import tempfile
    import os

    file_obj = request.FILES.get('file')
    if not file_obj:
        return Response({'error': 'No file uploaded'}, status=400)

    if not file_obj.name.endswith('.md'):
        return Response({'error': 'File must be .md'}, status=400)

    try:
        with tempfile.NamedTemporaryFile(mode='wb', suffix='.md', delete=False) as tmp:
            for chunk in file_obj.chunks():
                tmp.write(chunk)
            tmp_path = tmp.name

        parsed = parse_md_exam(tmp_path)

        mode_id = request.data.get('mode')
        if mode_id:
            mode = GameMode.objects.get(id=int(mode_id))
        else:
            mode, _ = GameMode.objects.get_or_create(name='practice', defaults={'order': 0})

        creator = request.user.profile
        level, _ = Level.objects.get_or_create(name="1")

        title = request.data.get('title', parsed['title'])

        game = Game.objects.create(
            title=title,
            mode=mode,
            creator=creator,
            public=request.data.get('public', False),
            active=True,
            multiplayer=False
        )

        category_id = request.data.get('category')
        if category_id:
            try:
                game.category = Category.objects.get(id=int(category_id))
                game.save()
            except (Category.DoesNotExist, ValueError):
                pass

        created = 0
        for q_data in parsed['questions']:
            question = Question.objects.create(
                body=q_data['body'],
                level=level
            )

            for opt_data in q_data['options']:
                Option.objects.create(
                    question=question,
                    body=opt_data['body'],
                    answer=opt_data['answer']
                )

            game.questions.add(question)
            created += 1

        return Response({
            'success': True,
            'message': f'Imported {created} questions',
            'game': {
                'id': game.id,
                'title': game.title,
                'slug': game.slug,
                'question_count': created
            }
        })

    except Exception as e:
        return Response({'error': str(e)}, status=500)

    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
