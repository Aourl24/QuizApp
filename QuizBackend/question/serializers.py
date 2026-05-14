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
    class Meta:
        model = User
        fields = ["id", "username"]


class UserDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "date_joined"]
        read_only_fields = ["date_joined"]


# ─────────────────────────────────────────────────────────────
# PROFILE
# ─────────────────────────────────────────────────────────────

class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

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
        return obj.avatar.url if obj.avatar else None


class ProfileMinimalSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = Profile
        fields = ["id", "username", "total_points"]

    def get_avatar_url(self, obj):
        return obj.avatar.url if obj.avatar else None


class LeaderboardSerializer(serializers.ModelSerializer):
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
# OPTIONS
# ─────────────────────────────────────────────────────────────

class OptionPlayerSerializer(serializers.ModelSerializer):
    """
    Sent to players — includes answer boolean.
    Note: answer is already exposed here, so frontend can check locally.
    """
    class Meta:
        model = Option
        fields = ["id", "body", "order", "answer"]


class OptionAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = ["id", "body", "answer", "order"]


# ─────────────────────────────────────────────────────────────
# QUESTIONS
# ─────────────────────────────────────────────────────────────

class QuestionPlayerSerializer(serializers.ModelSerializer):
    """
    Questions sent to players during quiz.
    - Shuffles options randomly
    - Exposes mark for per-question point display
    - Exposes has_multiple_answers so frontend knows to use multi-select UI
    - Exposes correct_answer_count so frontend knows exactly how many to select
    """
    level = LevelSerializer(read_only=True)
    options = serializers.SerializerMethodField()
    has_multiple_answers = serializers.BooleanField(read_only=True)
    correct_answer_count = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = [
            "id", "body", "options", "hint",
            "level", "order",
            "mark",                  # per-question points (null = use mode default)
            "has_multiple_answers",  # bool — triggers multi-select UI
            "correct_answer_count",  # int — how many options to select
        ]

    def get_options(self, obj):
        options = list(obj.options.all())
        shuffle(options)
        return OptionPlayerSerializer(options, many=True).data

    def get_correct_answer_count(self, obj):
        return obj.correct_options.count()


class QuestionAdminSerializer(serializers.ModelSerializer):
    level = LevelSerializer(read_only=True)
    options = OptionAdminSerializer(many=True, source="options.all", read_only=True)
    correct_answers = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = [
            "id", "body", "options", "correct_answers",
            "explanation", "hint", "image", "level", "order",
            "mark", "created_at"
        ]

    def get_correct_answers(self, obj):
        correct = obj.options.filter(answer=True)
        return OptionAdminSerializer(correct, many=True).data


class QuestionMinimalSerializer(serializers.ModelSerializer):
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
    mode = GameModeSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    creator_username = serializers.CharField(source="creator.user.username", read_only=True)
    question_count = serializers.SerializerMethodField()
    total_marks = serializers.SerializerMethodField()

    class Meta:
        model = Game
        fields = [
            "id", "title", "slug", "description", "mode", "category",
            "creator_username", "difficulty", "public", "multiplayer",
            "max_players", "play_count", "likes", "avg_score",
            "question_count", "total_marks", "created_at"
        ]

    def get_question_count(self, obj):
        return obj.questions.count()

    def get_total_marks(self, obj):
        """
        Sum of each question's mark value.
        Falls back to the game mode's default score for questions with null mark.
        Always accurate — recalculated at query time, never stale.
        """
        mode_score = obj.mode.score if obj.mode else 10
        return sum(
            q.mark if q.mark is not None else mode_score
            for q in obj.questions.all()
        )


class GameDetailSerializer(serializers.ModelSerializer):
    mode = GameModeSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    creator = ProfileMinimalSerializer(read_only=True)
    questions = QuestionPlayerSerializer(many=True, read_only=True)
    question_count = serializers.SerializerMethodField()
    total_marks = serializers.SerializerMethodField()

    class Meta:
        model = Game
        fields = [
            "id", "title", "slug", "description", "mode", "category",
            "creator", "time_per_question", "difficulty",
            "public", "multiplayer", "max_players",
            "play_count", "likes", "avg_score",
            "questions", "question_count", "total_marks",
            "created_at", "updated_at"
        ]

    def get_question_count(self, obj):
        return obj.questions.count()

    def get_total_marks(self, obj):
        mode_score = obj.mode.score if obj.mode else 10
        return sum(
            q.mark if q.mark is not None else mode_score
            for q in obj.questions.all()
        )


class GameAdminSerializer(serializers.ModelSerializer):
    mode = GameModeSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    creator = ProfileSerializer(read_only=True)
    questions = QuestionAdminSerializer(many=True, read_only=True)

    class Meta:
        model = Game
        fields = "__all__"


# ─────────────────────────────────────────────────────────────
# POINTS
# ─────────────────────────────────────────────────────────────

class PointsSerializer(serializers.ModelSerializer):
    player = ProfileMinimalSerializer(read_only=True)
    game_title = serializers.CharField(source="game.title", read_only=True)

    class Meta:
        model = Points
        fields = [
            "id", "player", "game_title", "score",
            "best_score", "attempts_count", "last_played"
        ]


# ─────────────────────────────────────────────────────────────
# GAME ATTEMPT
# ─────────────────────────────────────────────────────────────

class GameAttemptSerializer(serializers.ModelSerializer):
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
