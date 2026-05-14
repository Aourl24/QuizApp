from django.contrib import admin
from django.utils.html import format_html
from .models import (
    Profile, GameMode, Category, Game, Level,
    Question, Option, GameAttempt, Points,
    Setting, Badge, PlayerBadge
)


# ─────────────────────────────────────────────────────────────
# INLINES
# ─────────────────────────────────────────────────────────────

class OptionInline(admin.TabularInline):
    """Options shown inline when editing a Question."""
    model = Option
    extra = 2
    min_num = 2
    max_num = 5
    fields = ['body', 'answer', 'order']
    ordering = ['order']


class QuestionInline(admin.TabularInline):
    """Questions shown inline when editing a Game (read-only)."""
    model = Game.questions.through
    extra = 0
    readonly_fields = ['question_link', 'question_level', 'question_mark']
    fields = ['question_link', 'question_level', 'question_mark']

    def question_link(self, obj):
        from django.urls import reverse
        url = reverse('admin:question_question_change', args=[obj.question.id])
        return format_html('<a href="{}">{}</a>', url, obj.question.body[:60] + '...')
    question_link.short_description = 'Question'

    def question_level(self, obj):
        return obj.question.level
    question_level.short_description = 'Level'

    def question_mark(self, obj):
        return obj.question.mark
    question_mark.short_description = 'Mark'

    def has_add_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return True


class PlayerBadgeInline(admin.TabularInline):
    model = PlayerBadge
    extra = 0
    autocomplete_fields = ['badge']


class SettingInline(admin.StackedInline):
    model = Setting
    extra = 0
    fields = ['confirm', 'sound', 'dark_mode', 'language', 
              'email_notifications', 'daily_reminder']


class PointsInline(admin.TabularInline):
    model = Points
    extra = 0
    readonly_fields = ['game', 'score', 'best_score', 'attempts_count', 'last_played']
    fields = ['game', 'score', 'best_score', 'attempts_count', 'last_played']


class GameAttemptInline(admin.TabularInline):
    model = GameAttempt
    extra = 0
    readonly_fields = ['game', 'score', 'percentage', 'completed', 'created_at']
    fields = ['game', 'score', 'total_possible', 'percentage', 
              'correct_answers', 'wrong_answers', 'completed', 'created_at']


# ─────────────────────────────────────────────────────────────
# ADMIN CLASSES
# ─────────────────────────────────────────────────────────────

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'is_active', 'order', 'color_preview']
    list_editable = ['is_active', 'order']
    list_filter = ['is_active']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    fields = ['name', 'slug', 'description', 'icon', 'color', 'is_active', 'order']

    def color_preview(self, obj):
        return format_html(
            '<span style="background:{}; padding:4px 12px; border-radius:4px; color:white; font-weight:bold;">{}</span>',
            obj.color, obj.color
        )
    color_preview.short_description = 'Color'


@admin.register(Level)
class LevelAdmin(admin.ModelAdmin):
    list_display = ['name', 'order', 'color_preview', 'description']
    list_editable = ['order']
    ordering = ['order']
    search_fields = ['name', 'description']

    def color_preview(self, obj):
        return format_html(
            '<span style="background:{}; padding:4px 12px; border-radius:4px; color:white; font-weight:bold;">{}</span>',
            obj.color, obj.name
        )
    color_preview.short_description = 'Level'


@admin.register(GameMode)
class GameModeAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'score', 'time', 'order', 
                    'is_active', 'is_guest_allowed', 'verified_profile']
    list_editable = ['score', 'time', 'order', 'is_active', 
                     'is_guest_allowed', 'verified_profile']
    list_filter = ['is_active', 'is_guest_allowed', 'verified_profile']
    search_fields = ['name', 'instructions']
    prepopulated_fields = {'slug': ('name',)}
    fields = [
        'name', 'slug', 'instructions', 'icon', 'color',
        ('score', 'time'),
        ('order', 'is_active'),
        ('is_guest_allowed', 'verified_profile'),
    ]


@admin.register(Game)
class GameAdmin(admin.ModelAdmin):
    list_display = ['title', 'slug', 'mode', 'category', 'difficulty',
                    'question_count', 'time_per_question', 'public', 
                    'active', 'multiplayer', 'play_count', 'likes']
    list_editable = ['public', 'active', 'multiplayer']
    list_filter = ['mode', 'category', 'difficulty', 'public', 
                   'active', 'multiplayer', 'created_at']
    search_fields = ['title', 'slug', 'description', 'code']
    prepopulated_fields = {'slug': ('title',)}
    autocomplete_fields = ['creator', 'host', 'mode', 'category']
    filter_horizontal = ['questions']
    inlines = [QuestionInline]
    date_hierarchy = 'created_at'

    fieldsets = (
        ('Basic Info', {
            'fields': ('title', 'slug', 'description')
        }),
        ('Ownership & Mode', {
            'fields': ('creator', 'host', 'mode', 'category')
        }),
        ('Settings', {
            'fields': ('time_per_question', 'difficulty', 'max_players', 'code')
        }),
        ('Status', {
            'fields': ('public', 'active', 'multiplayer')
        }),
        ('Stats', {
            'fields': ('play_count', 'likes', 'avg_score'),
            'classes': ('collapse',)
        }),
    )

    readonly_fields = ['play_count', 'likes', 'avg_score', 'created_at', 'updated_at']

    def question_count(self, obj):
        return obj.questions.count()
    question_count.short_description = 'Q#'


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ['id', 'short_body', 'level', 'mark', 'option_count', 
                    'has_image', 'order', 'created_at']
    list_filter = ['level', 'mark', 'created_at']
    search_fields = ['body', 'explanation', 'hint']
    list_editable = ['mark', 'order']
    date_hierarchy = 'created_at'
    inlines = [OptionInline]
    autocomplete_fields = ['level']

    fieldsets = (
        ('Question', {
            'fields': ('body', 'level', 'mark', 'order')
        }),
        ('Media & Help', {
            'fields': ('image', 'hint'),
            'classes': ('collapse',)
        }),
        ('Explanation', {
            'fields': ('explanation',),
            'classes': ('collapse',)
        }),
    )

    def short_body(self, obj):
        return obj.body[:80] + '...' if len(obj.body) > 80 else obj.body
    short_body.short_description = 'Question'

    def option_count(self, obj):
        return obj.options.count()
    option_count.short_description = 'Opts'

    def has_image(self, obj):
        return bool(obj.image)
    has_image.boolean = True
    has_image.short_description = 'Img'

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.prefetch_related('options')


@admin.register(Option)
class OptionAdmin(admin.ModelAdmin):
    list_display = ['id', 'short_body', 'question_link', 'answer', 'order']
    list_filter = ['answer', 'question__level']
    search_fields = ['body', 'question__body']
    list_editable = ['answer', 'order']
    autocomplete_fields = ['question']

    def short_body(self, obj):
        return obj.body[:60] + '...' if len(obj.body) > 60 else obj.body
    short_body.short_description = 'Option'

    def question_link(self, obj):
        from django.urls import reverse
        url = reverse('admin:question_question_change', args=[obj.question.id])
        return format_html('<a href="{}">#{}</a>', url, obj.question.id)
    question_link.short_description = 'Q#'


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'total_points', 'total_games_played', 
                    'current_streak', 'longest_streak', 'last_active']
    list_filter = ['joined_at', 'last_active', 'current_streak']
    search_fields = ['user__username', 'user__email', 'about']
    readonly_fields = ['joined_at', 'last_active', 'last_played_date']
    inlines = [SettingInline, PointsInline, PlayerBadgeInline]
    date_hierarchy = 'joined_at'

    fieldsets = (
        ('User', {
            'fields': ('user', 'about', 'avatar')
        }),
        ('Stats', {
            'fields': ('total_points', 'total_games_played')
        }),
        ('Streak', {
            'fields': ('current_streak', 'longest_streak', 'last_played_date')
        }),
    )


@admin.register(GameAttempt)
class GameAttemptAdmin(admin.ModelAdmin):
    list_display = ['player', 'game', 'score', 'total_possible', 
                    'percentage_display', 'correct_answers', 'wrong_answers',
                    'skipped_answers', 'completed', 'created_at']
    list_filter = ['completed', 'game', 'created_at']
    search_fields = ['player__user__username', 'game__title']
    readonly_fields = ['percentage', 'created_at']
    date_hierarchy = 'created_at'
    autocomplete_fields = ['player', 'game']

    def percentage_display(self, obj):
        return f"{obj.percentage:.1f}%"
    percentage_display.short_description = '%'


@admin.register(Points)
class PointsAdmin(admin.ModelAdmin):
    list_display = ['player', 'game', 'score', 'best_score', 
                    'attempts_count', 'last_played']
    list_filter = ['game', 'last_played']
    search_fields = ['player__user__username', 'game__title']
    autocomplete_fields = ['player', 'game']
    readonly_fields = ['last_played']


@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    list_display = ['name', 'requirement_type', 'requirement_value', 
                    'color_preview', 'player_count']
    list_filter = ['requirement_type']
    search_fields = ['name', 'description']

    def color_preview(self, obj):
        return format_html(
            '<span style="background:{}; padding:4px 12px; border-radius:4px; color:white; font-weight:bold;">{}</span>',
            obj.color, obj.name
        )
    color_preview.short_description = 'Badge'

    def player_count(self, obj):
        return obj.players.count()
    player_count.short_description = 'Earned By'


@admin.register(PlayerBadge)
class PlayerBadgeAdmin(admin.ModelAdmin):
    list_display = ['profile', 'badge', 'earned_at']
    list_filter = ['badge', 'earned_at']
    search_fields = ['profile__user__username', 'badge__name']
    autocomplete_fields = ['profile', 'badge']
    date_hierarchy = 'earned_at'


@admin.register(Setting)
class SettingAdmin(admin.ModelAdmin):
    list_display = ['player', 'sound', 'dark_mode', 'language',
                    'email_notifications', 'daily_reminder']
    list_filter = ['sound', 'dark_mode', 'language', 
                   'email_notifications', 'daily_reminder']
    list_editable = ['sound', 'dark_mode', 'language',
                     'email_notifications', 'daily_reminder']
    search_fields = ['player__user__username']
    autocomplete_fields = ['player']
