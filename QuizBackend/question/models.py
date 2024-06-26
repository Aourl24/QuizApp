from django.db import models
from django.shortcuts import reverse,redirect
from django.contrib.auth.models import User
from django.contrib.auth.signals import user_logged_in
from django.db.models.signals import post_save,pre_save
from django.dispatch import receiver
from django.contrib.sessions.models import Session
from django.utils import timezone

class Player(models.Model):
	user = models.OneToOneField(User, on_delete=models.CASCADE,null=True,blank=True)
	name = models.CharField(max_length=100000)
	score = models.IntegerField(default=0)
	active = models.BooleanField(default=True)
	connected = models.BooleanField(default=False)
	total_score = models.IntegerField(null=True,blank=True)
	# channel = models.CharField(max_length=100000000,blank=True,null=True)

	def __str__(self):
		return self.name


class Game(models.Model):
	host = models.ForeignKey(Player,related_name='game_host',on_delete=models.CASCADE,null=True,blank=True)
	players = models.ManyToManyField(Player,related_name='game')
	question = models.ManyToManyField('Question',related_name='game')
	time = models.IntegerField(default=10)
	difficulty = models.CharField(default='easy',max_length=20000)
	public = models.BooleanField(default=True)
	code = models.CharField(max_length=2000000,null=True,blank=True,unique=True,editable=False)
	status = models.BooleanField(default=True)
	gameType = models.IntegerField(default=0)



	def __str__(self):
		return f'Game {self.id}'

	def get_absolute_url(self):
		pass



class Level(models.Model):
	name = models.CharField(max_length=1000)

	def __str__(self):
		return f'level {self.name}'

class Category(models.Model):
	name =  models.CharField(max_length=200000)

	def __str__(self):
		return self.name

class Question(models.Model):
	category = models.ForeignKey(Category,related_name='category',on_delete=models.CASCADE,null=True,blank=True)
	level = models.ForeignKey(Level,related_name='question',on_delete=models.CASCADE)
	body = models.TextField()

	def __str__(self):
		return self.body

class Option(models.Model):
	question = models.ForeignKey(Question,related_name='option',on_delete=models.CASCADE)
	body = models.TextField()
	answer = models.BooleanField()

	def __str__(self):
		return self.body


@receiver(post_save,sender=User)
def createPlayer(sender,created,instance,**kwargs):
	if created:
		player = Player.objects.create(user=instance,name=instance.username)

# @receiver(user_logged_in)
# def clear_session(sender,request,user,**kwargs):
# 	sessions = Session.objects.filter(expire_date__gte=timezone.now())
# 	for session in sessions:
# 		session.delete()