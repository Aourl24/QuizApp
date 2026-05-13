from django.urls import path
from .views import (
    # Authentication
    sign_up,
    login_view,
    check_login,
    logout_view,

    # User Profile & Stats
    user_view,
    my_profile,
    my_game_history,
    my_stats,
    user_settings,

    # Categories & Modes
    get_categories,
    get_game_modes,

    # Games
    get_games,
    get_game,
    get_all_games,
    get_game_detail,

    # Questions
    create_questions,
    import_exam_from_md,

    # Daily Challenge
    daily_challenge,

    # Game Completion
    complete_game,
    complete_mode,

    # Leaderboards
    leaderboards,
    game_leaderboard,
    user_ranking,

    # Badges
    get_badges,
    my_badges,
)


urlpatterns = [
    # ─── Authentication ───
    path('signup/', sign_up, name='signup'),
    path('login/', login_view, name='login'),
    path('checkuser/', check_login, name='check-user'),
    path('logout/', logout_view, name='logout'),

    # ─── User Profile ───
    path('userprofile/', user_view, name='user-profile'),
    path('myprofile/', my_profile, name='my-profile'),
    path('myhistory/', my_game_history, name='my-history'),
    path('mystats/', my_stats, name='my-stats'),
    path('mysettings/', user_settings, name='user-settings'),

    # ─── Categories & Game Modes ───
    path('category/', get_categories, name='categories'),
    path('getmodes/', get_game_modes, name='game-modes'),
    path('getmodes/<int:id>/', get_game_modes, name='game-modes-filtered'),

    # ─── Games ───
    # List games with optional filters
    path('getgames/<int:category>/<int:mode>/', get_games, name='games-filtered'),
    path('getgamescat/<int:category>/', get_games, name='games-by-category'),
    path('getgamesmode/<int:mode>/', get_games, name='games-by-mode'),

    # All public games
    path('getallgames/', get_all_games, name='all-games'),

    # Get specific game with paginated questions
    path('getgame/<int:game>/<int:next>/', get_game, name='game-by-id'),
    path('getgamebyname/<str:name>/<int:next>/', get_game, name='game-by-name'),

    # Game detail by id
    path('game/<int:id>/', get_game_detail, name='game-detail'),

    # ─── Daily Challenge ───
    path('dailychallenge/<int:player>/', daily_challenge, name='daily-challenge'),

    # ─── Game Completion ───
    path('completegame/', complete_game, name='complete-game'),
    path('completemode/', complete_mode, name='complete-mode'),

    # ─── Question Creation ───
    path('createquestion/', create_questions, name='create-question'),
    path('importexam/', import_exam_from_md, name='import-exam'),

    # ─── Leaderboards ───
    path('leaderboard/', leaderboards, name='leaderboards'),
    path('leaderboard/<int:game_id>/', game_leaderboard, name='game-leaderboard'),
    path('userranking/', user_ranking, name='user-ranking'),

    # ─── Badges ───
    path('badges/', get_badges, name='all-badges'),
    path('mybadges/', my_badges, name='my-badges'),
]
