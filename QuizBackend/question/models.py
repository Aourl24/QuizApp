from django.db import models


class Level(models.Model):
	name = models.CharField(max_length=1000)

	def __str__(self):
		return self.name

class Question(models.Model):
	level = model.ForeignKey(Level,related_name='question',on_delete=models.CASCADE)
	body = models.TextField()

	def __str__(self):
		return self.body

class Option(models.Model):
	question = models.ForeignKey(Question,related_name='option',on_delete=models.CASCADE)
	body = models.TextField()
	answer = models.BooleanField()

	def __str__(self):
		return self.body

