from .models import (
    User, Profile, Category, Level, Option, Question, Game,
    Points, GameMode, GameAttempt, Setting, Badge, PlayerBadge
)
from rest_framework import serializers
from random import shuffle


# ─────────────────────────────────────────────────────────────
# USER
# ─────────────────────────────────────────────────────────────

class UserSerializer(serializers.ModelSerializer):
    """Basic user info for public display."""
    class Meta:
        model = User
        fields = ["id", "username"]


class UserDetailSerializer(serializers.ModelSerializer):
    """Extended user info for authenticated views."""
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "date_joined"]
        read_only_fields = ["date_joined"]


# ─────────────────────────────────────────────────────────────
# PROFILE
# ─────────────────────────────────────────────────────────────

class ProfileSerializer(serializers.ModelSerializer):
    """Full profile with user nested. Used for leaderboards and profiles."""
    user = UserSerializer(read_only=True)
    # avatar_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Profile
        fields = [
            "id", "user", "about",
            "total_points", "total_games_played",
            "current_streak", "longest_streak",
            "joined_at", "last_active"
        ]
        read_only_fields = ["joined_at", "last_active"]
    
    def get_avatar_url(self, obj):
        if obj.avatar:
            return obj.avatar.url
        return None


class ProfileMinimalSerializer(serializers.ModelSerializer):
    """Minimal profile for nested display (e.g., in leaderboards)."""
    username = serializers.CharField(source="user.username", read_only=True)
    
    class Meta:
        model = Profile
        fields = ["id", "username", "total_points"]
    
    def get_avatar_url(self, obj):
        if obj.avatar:
            return obj.avatar.url
        return None


class LeaderboardSerializer(serializers.ModelSerializer):
    """Optimized for leaderboard display."""
    username = serializers.CharField(source="user.username", read_only=True)
    rank = serializers.SerializerMethodField()
    
    class Meta:
        model = Profile
        fields = ["rank", "username", "total_points", "total_games_played", "longest_streak"]
    
    def get_rank(self, obj):
        return getattr(obj, 'rank', None)


# ─────────────────────────────────────────────────────────────
# CATEGORY & LEVEL
# ─────────────────────────────────────────────────────────────

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug", "description", "icon", "color", "is_active", "order"]


class LevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Level
        fields = ["id", "name", "description", "order", "color"]


# ─────────────────────────────────────────────────────────────
# OPTIONS (Player-safe vs Admin)
# ─────────────────────────────────────────────────────────────

class OptionPlayerSerializer(serializers.ModelSerializer):
    """Hides correct answer — used when sending questions to players."""
    class Meta:
        model = Option
        fields = ["id", "body", "order","answer"]


class OptionAdminSerializer(serializers.ModelSerializer):
    """Shows correct answer — used for creators/admins."""
    class Meta:
        model = Option
        fields = ["id", "body", "answer", "order"]


# ─────────────────────────────────────────────────────────────
# QUESTIONS (Player-safe vs Admin)
# ─────────────────────────────────────────────────────────────

class QuestionPlayerSerializer(serializers.ModelSerializer):
    """
    Questions sent to players during quiz.
    - Shuffles options
    - Hides correct answer
    - Includes hint if available
    """
    level = LevelSerializer(read_only=True)
    options = serializers.SerializerMethodField()
    
    class Meta:
        model = Question
        fields = ["id", "body", "options", "hint", "level", "order"]
    
    def get_options(self, obj):
        options = list(obj.options.all())
        shuffle(options)
        return OptionPlayerSerializer(options, many=True).data


class QuestionAdminSerializer(serializers.ModelSerializer):
    """
    Questions for creators/admins.
    - Shows correct answer(s)
    - Includes explanation
    - Includes all options with answers
    """
    level = LevelSerializer(read_only=True)
    options = OptionAdminSerializer(many=True, source="options.all", read_only=True)
    correct_answers = serializers.SerializerMethodField()
    
    class Meta:
        model = Question
        fields = [
            "id", "body", "options", "correct_answers",
            "explanation", "hint", "image", "level", "order",
            "created_at"
        ]
    
    def get_correct_answers(self, obj):
        correct = obj.options.filter(answer=True)
        return OptionAdminSerializer(correct, many=True).data


class QuestionMinimalSerializer(serializers.ModelSerializer):
    """Minimal question for lists."""
    class Meta:
        model = Question
        fields = ["id", "body", "order"]


# ─────────────────────────────────────────────────────────────
# GAME MODE
# ─────────────────────────────────────────────────────────────

class GameModeSerializer(serializers.ModelSerializer):
    locked = serializers.SerializerMethodField()
    guest_accessible = serializers.BooleanField(source="is_guest_allowed", read_only=True)
    
    class Meta:
        model = GameMode
        fields = [
            "id", "name", "slug", "instructions", "icon", "color",
            "score", "time", "order", "is_active", "is_guest_allowed",
            "verified_profile", "locked", "guest_accessible"
        ]
    
    def get_locked(self, obj):
        profile_id = self.context.get("profile_id") if self.context else None
        return obj.is_locked(profile_id)


# ─────────────────────────────────────────────────────────────
# GAME
# ─────────────────────────────────────────────────────────────

class GameListSerializer(serializers.ModelSerializer):
    """For game lists (browse, search)."""
    mode = GameModeSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    creator_username = serializers.CharField(source="creator.user.username", read_only=True)
    question_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Game
        fields = [
            "id", "title", "slug", "description", "mode", "category",
            "creator_username", "difficulty", "public", "multiplayer",
            "max_players", "play_count", "likes", "avg_score",
            "question_count", "created_at"
        ]
    
    def get_question_count(self, obj):
        return obj.questions.count()


class GameDetailSerializer(serializers.ModelSerializer):
    """For game detail page."""
    mode = GameModeSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    creator = ProfileMinimalSerializer(read_only=True)
    questions = QuestionPlayerSerializer(many=True, read_only=True)
    question_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Game
        fields = [
            "id", "title", "slug", "description", "mode", "category",
            "creator", "time_per_question", "difficulty",
            "public", "multiplayer", "max_players",
            "play_count", "likes", "avg_score",
            "questions", "question_count",
            "created_at", "updated_at"
        ]
    
    def get_question_count(self, obj):
        return obj.questions.count()


class GameAdminSerializer(serializers.ModelSerializer):
    """For creators/admins — shows everything including code."""
    mode = GameModeSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    creator = ProfileSerializer(read_only=True)
    questions = QuestionAdminSerializer(many=True, read_only=True)
    
    class Meta:
        model = Game
        fields = "__all__"


# ─────────────────────────────────────────────────────────────
# POINTS (Leaderboard Records)
# ─────────────────────────────────────────────────────────────

class PointsSerializer(serializers.ModelSerializer):
    """Individual game score record."""
    player = ProfileMinimalSerializer(read_only=True)
    game_title = serializers.CharField(source="game.title", read_only=True)
    
    class Meta:
        model = Points
        fields = [
            "id", "player", "game_title", "score",
            "best_score", "attempts_count", "last_played"
        ]


# ─────────────────────────────────────────────────────────────
# GAME ATTEMPT (History)
# ─────────────────────────────────────────────────────────────

class GameAttemptSerializer(serializers.ModelSerializer):
    """Detailed game attempt for history."""
    game_title = serializers.CharField(source="game.title", read_only=True)
    game_slug = serializers.CharField(source="game.slug", read_only=True)
    mode_name = serializers.CharField(source="game.mode.name", read_only=True)
    
    class Meta:
        model = GameAttempt
        fields = [
            "id", "game_title", "game_slug", "mode_name",
            "score", "total_possible", "percentage",
            "correct_answers", "wrong_answers", "skipped_answers",
            "time_taken_seconds", "completed", "created_at"
        ]
        read_only_fields = ["created_at"]


# ─────────────────────────────────────────────────────────────
# SETTINGS
# ─────────────────────────────────────────────────────────────

class SettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Setting
        fields = [
            "confirm", "sound", "dark_mode", "language",
            "email_notifications", "daily_reminder"
        ]


# ─────────────────────────────────────────────────────────────
# BADGES
# ─────────────────────────────────────────────────────────────

class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = [
            "id", "name", "description", "icon",
            "color", "requirement_type", "requirement_value"
        ]


class PlayerBadgeSerializer(serializers.ModelSerializer):
    badge = BadgeSerializer(read_only=True)
    
    class Meta:
        model = PlayerBadge
        fields = ["badge", "earned_at"]