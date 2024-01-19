from django.db import models


class Player(models.Model):
	name = models.CharField(max_length=100000)

	def __str__(self):
		return self.name

class Game(models.Model):
	players = models.ManyToManyField(Player,related_name='game')
	question = models.ManyToManyField('Question',related_name='game')

	def __str__(self):
		return f'Game {self.id}'


class Level(models.Model):
	name = models.CharField(max_length=1000)

	def __str__(self):
		return self.name

class Question(models.Model):
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

