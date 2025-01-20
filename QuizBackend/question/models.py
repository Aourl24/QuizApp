from django.db import models
from django.shortcuts import reverse,redirect
from django.contrib.auth.models import User
from django.contrib.auth.signals import user_logged_in
from django.db.models.signals import post_save,pre_save
from django.dispatch import receiver
from django.contrib.sessions.models import Session
from django.utils import timezone


class Profile(models.Model):
	user = models.OneToOneField(User, on_delete=models.CASCADE)
	about = models.TextField()
	points = models.IntegerField()

	def __str__(self):
		return f'{self.user.username} Profile'


class GameMode(models.Model):
	name = models.CharField(max_length=2000000,unique=True)
	instructions = models.TextField(null=True,blank=True)
	icon = models.CharField(max_length=200 , default="fas fa-")
	score=models.IntegerField(default=10)
	time=models.IntegerField(default=20)
	order=models.IntegerField(default=1)
	profiles = models.ManyToManyField(Profile,related_name='gameMode',blank=True)
	verified_profile = models.BooleanField(default=True)


	def __str__(self):
		return self.name

	def locked(self,id):
		if self.verified_profile == False :
			return False
		if not id:
			return True
		profile = Profile.objects.get(id=id)
		check = self.profiles.filter(id=profile.id).exists()
		if check:
			return False
		else:
			return True

class Player(models.Model):
	pass

# class ProfileGameMode(models.Model):
# 	profile = models.ForeignKey(Profile,related_name="gameMode",on_delete=models.CASCADE,null=True,blank=True)
# 	mode = models.ForeignKey(GameMode,on_delete=models.CASCADE,related_name='profilegame',null=True,blank=True)
# 	locked = models.BooleanField(default=False)

# 	class Meta:
# 		unique_together = ('profile','mode')

# 	def __str__ (self):
# 		return f"{self.profile} - {self.mode}"



class Category(models.Model):
	name =  models.CharField(max_length=200000)

	def __str__(self):
		return f"{self.name} {self.id}" 


class Game(models.Model):
	title = models.CharField(max_length=100000,blank=True,null=True)
	creator = models.ForeignKey(Profile,related_name='game_creator',on_delete=models.CASCADE,null=True,blank=True)
	host = models.ForeignKey(Profile,related_name='game_host',on_delete=models.CASCADE,null=True,blank=True)
	mode = models.ForeignKey(GameMode , related_name="game",on_delete=models.CASCADE,null=True,blank=True)
	category = models.ForeignKey(Category,related_name='category',on_delete=models.CASCADE,null=True,blank=True)

	players = models.ManyToManyField(Profile,related_name='game',blank=True)
	question = models.ManyToManyField('Question',related_name='game')
	time = models.IntegerField(default=20,null=True,blank=True)
	public = models.BooleanField(default=True)
	code = models.CharField(max_length=2000000,null=True,blank=True,unique=True,editable=False)
	active = models.BooleanField(default=True)
	gameType = models.IntegerField(default=0)
	max_players = models.IntegerField(default=10)
	multiplayer = models.BooleanField(default=False)
	date = models.DateTimeField(auto_now_add=True,null=True,blank=True) 
	

	def __str__(self):
		return f'{self.title}'

	def get_absolute_url(self):
		pass



class Level(models.Model):
	name = models.CharField(max_length=1000)

	def __str__(self):
		return f'level {self.name}'

class Question(models.Model):
	level = models.ForeignKey(Level,related_name='question',on_delete=models.CASCADE,null=True,blank=True)
	body = models.TextField()

	def __str__(self):
		return self.body

class Option(models.Model):
	question = models.ForeignKey(Question,related_name='option',on_delete=models.CASCADE)
	body = models.TextField(null=True,blank=True)
	answer = models.BooleanField()

	def __str__(self):
		return self.body

class Points(models.Model):
	player = models.ForeignKey(Profile,related_name="score",on_delete=models.CASCADE)
	score = models.IntegerField(default=0)
	game = models.ForeignKey(Game,related_name='player_points',on_delete=models.CASCADE)

	def __str__(self):
		return f"{self.player.user} score in {self.game.title}"

class Setting(models.Model):
	player = models.OneToOneField(Profile,related_name="settings",on_delete=models.CASCADE)
	confirm = models.BooleanField(default=False)
	sound = models.BooleanField(default=True)

@receiver(post_save,sender=User)
def createPlayer(sender,created,instance,**kwargs):
	if created:
		player = Profile.objects.create(user=instance,points=0)

# @receiver(user_logged_in)
# def clear_session(sender,request,user,**kwargs):
# 	sessions = Session.objects.filter(expire_date__gte=timezone.now())
# 	for session in sessions:
# 		session.delete()