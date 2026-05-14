from django.db import models
from django.urls import reverse
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone


# ─────────────────────────────────────────────────────────────
# PROFILE
# ─────────────────────────────────────────────────────────────

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    about = models.TextField(default='', blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    
    total_points = models.IntegerField(default=0)
    total_games_played = models.IntegerField(default=0)
    
    joined_at = models.DateTimeField(auto_now_add=True)
    last_active = models.DateTimeField(auto_now=True)
    
    current_streak = models.IntegerField(default=0)
    longest_streak = models.IntegerField(default=0)
    last_played_date = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ['-total_points']

    def __str__(self):
        return f'{self.user.username} Profile'

    def update_streak(self):
        today = timezone.now().date()
        
        if self.last_played_date == today:
            return
        
        if self.last_played_date and (today - self.last_played_date).days == 1:
            self.current_streak += 1
        else:
            self.current_streak = 1
        
        if self.current_streak > self.longest_streak:
            self.longest_streak = self.current_streak
        
        self.last_played_date = today
        self.save(update_fields=['current_streak', 'longest_streak', 'last_played_date'])


# ─────────────────────────────────────────────────────────────
# GAME MODE
# ─────────────────────────────────────────────────────────────

class GameMode(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True, blank=True)
    instructions = models.TextField(null=True, blank=True)
    icon = models.CharField(max_length=50, default="fas fa-gamepad")
    color = models.CharField(max_length=7, default="#b8ff57", help_text="Hex color code")
    
    score = models.IntegerField(default=10)
    time = models.IntegerField(default=20)
    order = models.IntegerField(default=1)
    
    is_active = models.BooleanField(default=True)
    is_guest_allowed = models.BooleanField(default=False, help_text="Can guests play this mode without logging in?")
    verified_profile = models.BooleanField(default=True)
    
    profiles = models.ManyToManyField(Profile, related_name='unlocked_modes', blank=True)

    class Meta:
        ordering = ['order', 'name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            from django.utils.text import slugify
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def is_locked(self, profile_id=None):
        """
        Check if mode is locked for a given profile.
        Returns True if locked, False if accessible.
        For guests (no profile_id), uses is_guest_allowed.
        """
        if not profile_id:
            # Guest user — lock if mode doesn't allow guests
            return not self.is_guest_allowed
        
        if not self.verified_profile:
            return False
        
        try:
            profile = Profile.objects.get(id=profile_id)
            return not self.profiles.filter(id=profile.id).exists()
        except Profile.DoesNotExist:
            return True


# ─────────────────────────────────────────────────────────────
# CATEGORY
# ─────────────────────────────────────────────────────────────

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, default="fas fa-tag")
    color = models.CharField(max_length=7, default="#6366f1")
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=1)

    class Meta:
        ordering = ['order', 'name']
        verbose_name_plural = 'Categories'

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            from django.utils.text import slugify
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


# ─────────────────────────────────────────────────────────────
# GAME
# ─────────────────────────────────────────────────────────────

class Game(models.Model):
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]
    
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(blank=True)
    
    creator = models.ForeignKey(
        Profile, 
        related_name='created_games', 
        on_delete=models.CASCADE,
        null=True, 
        blank=True
    )
    host = models.ForeignKey(
        Profile, 
        related_name='hosted_games', 
        on_delete=models.CASCADE,
        null=True, 
        blank=True
    )
    
    mode = models.ForeignKey(
        GameMode, 
        related_name="games",
        on_delete=models.SET_NULL,
        null=True, 
        blank=True
    )
    category = models.ForeignKey(
        Category,
        related_name='games',
        on_delete=models.SET_NULL,
        null=True, 
        blank=True
    )
    
    questions = models.ManyToManyField('Question', related_name='games', blank=True)
    
    time_per_question = models.IntegerField(default=20, help_text="Seconds per question")
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='medium')
    
    public = models.BooleanField(default=True)
    active = models.BooleanField(default=True)
    
    multiplayer = models.BooleanField(default=False)
    max_players = models.IntegerField(default=10)
    
    code = models.CharField(max_length=20, null=True, blank=True, unique=True)
    
    play_count = models.PositiveIntegerField(default=0)
    likes = models.PositiveIntegerField(default=0)
    avg_score = models.FloatField(default=0.0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title or f"Game {self.id}"

    def save(self, *args, **kwargs):
        if not self.slug:
            from django.utils.text import slugify
            base_slug = slugify(self.title or "game")
            slug = base_slug
            counter = 1
            while Game.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def get_absolute_url(self):
        return reverse('game-detail', kwargs={'slug': self.slug})

    def increment_plays(self):
        self.play_count += 1
        self.save(update_fields=['play_count'])

    def update_average_score(self):
        from django.db.models import Avg
        avg = GameAttempt.objects.filter(game=self).aggregate(Avg('percentage'))['percentage__avg']
        if avg is not None:
            self.avg_score = round(avg, 2)
            self.save(update_fields=['avg_score'])


# ─────────────────────────────────────────────────────────────
# LEVEL
# ─────────────────────────────────────────────────────────────

class Level(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.CharField(max_length=200, blank=True)
    order = models.IntegerField(default=1)
    color = models.CharField(max_length=7, default="#f59e0b")

    class Meta:
        ordering = ['order', 'name']

    def __str__(self):
        return f'Level {self.name}'


# ─────────────────────────────────────────────────────────────
# QUESTION
# ─────────────────────────────────────────────────────────────

class Question(models.Model):
    level = models.ForeignKey(
        Level,
        related_name='questions',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    body = models.TextField()
    explanation = models.TextField(
        blank=True,
        help_text="Explanation shown after answering (for learning)"
    )
    image = models.ImageField(upload_to='questions/', null=True, blank=True)
    hint = models.CharField(max_length=300, blank=True)
    
    order = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    mark = models.IntegerField(null=True,blank=True)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return self.body[:80] + '...' if len(self.body) > 80 else self.body

    @property
    def correct_options(self):
        return self.options.filter(answer=True)

    @property
    def has_multiple_answers(self):
        return self.correct_options.count() > 1


# ─────────────────────────────────────────────────────────────
# OPTION
# ─────────────────────────────────────────────────────────────

class Option(models.Model):
    question = models.ForeignKey(
        Question,
        related_name='options',
        on_delete=models.CASCADE
    )
    body = models.TextField()
    answer = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return self.body[:50]


# ─────────────────────────────────────────────────────────────
# GAME ATTEMPT (Detailed History)
# ─────────────────────────────────────────────────────────────

class GameAttempt(models.Model):
    player = models.ForeignKey(
        Profile,
        related_name='attempts',
        on_delete=models.CASCADE
    )
    game = models.ForeignKey(
        Game,
        related_name='attempts',
        on_delete=models.CASCADE
    )
    
    score = models.IntegerField(default=0)
    total_possible = models.IntegerField(default=0)
    percentage = models.FloatField(default=0.0)
    
    questions_answered = models.IntegerField(default=0)
    correct_answers = models.IntegerField(default=0)
    wrong_answers = models.IntegerField(default=0)
    skipped_answers = models.IntegerField(default=0)
    
    time_taken_seconds = models.PositiveIntegerField(null=True, blank=True)
    completed = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ['player', 'game', 'created_at']

    def __str__(self):
        return f"{self.player.user.username} - {self.game.title}: {self.score}"

    def save(self, *args, **kwargs):
        if self.total_possible > 0:
            self.percentage = round((self.score / self.total_possible) * 100, 2)
        super().save(*args, **kwargs)


# ─────────────────────────────────────────────────────────────
# POINTS (Leaderboard / Best Scores)
# ─────────────────────────────────────────────────────────────

class Points(models.Model):
    player = models.ForeignKey(
        Profile,
        related_name="points_records",
        on_delete=models.CASCADE
    )
    game = models.ForeignKey(
        Game,
        related_name='points_records',
        on_delete=models.CASCADE
    )
    
    score = models.IntegerField(default=0)
    best_score = models.IntegerField(default=0)
    attempts_count = models.PositiveIntegerField(default=1)
    
    last_played = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['game', 'player']
        ordering = ['-score']
        verbose_name_plural = 'Points'

    def __str__(self):
        return f"{self.player.user.username}: {self.score} in {self.game.title}"

    def update_score(self, new_score):
        self.attempts_count += 1
        if new_score > self.best_score:
            self.best_score = new_score
        self.score = new_score
        self.save()


# ─────────────────────────────────────────────────────────────
# PLAYER SETTINGS
# ─────────────────────────────────────────────────────────────

class Setting(models.Model):
    player = models.OneToOneField(
        Profile,
        related_name="settings",
        on_delete=models.CASCADE
    )
    confirm = models.BooleanField(default=False, help_text="Require confirmation before answering")
    sound = models.BooleanField(default=True)
    dark_mode = models.BooleanField(default=True)
    language = models.CharField(max_length=10, default='en')
    
    email_notifications = models.BooleanField(default=True)
    daily_reminder = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.player.user.username}'s Settings"


# ─────────────────────────────────────────────────────────────
# ACHIEVEMENT / BADGE SYSTEM
# ─────────────────────────────────────────────────────────────

class Badge(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    icon = models.CharField(max_length=50, default="fas fa-medal")
    color = models.CharField(max_length=7, default="#f59e0b")
    requirement_type = models.CharField(max_length=50, choices=[
        ('games_played', 'Games Played'),
        ('total_score', 'Total Score'),
        ('streak', 'Streak'),
        ('perfect_score', 'Perfect Score'),
    ])
    requirement_value = models.PositiveIntegerField()

    def __str__(self):
        return self.name


class PlayerBadge(models.Model):
    profile = models.ForeignKey(Profile, related_name='badges', on_delete=models.CASCADE)
    badge = models.ForeignKey(Badge, related_name='players', on_delete=models.CASCADE)
    earned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['profile', 'badge']

    def __str__(self):
        return f"{self.profile.user.username} - {self.badge.name}"


# ─────────────────────────────────────────────────────────────
# SIGNALS
# ─────────────────────────────────────────────────────────────

@receiver(post_save, sender=User)
def create_profile(sender, created, instance, **kwargs):
    """Auto-create Profile and Settings when User is created."""
    if created:
        profile = Profile.objects.create(
            user=instance,
            about='',
            total_points=0
        )
        Setting.objects.create(player=profile)