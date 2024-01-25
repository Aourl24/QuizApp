# Generated by Django 4.2.2 on 2024-01-25 10:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('question', '0003_player_score'),
    ]

    operations = [
        migrations.AddField(
            model_name='game',
            name='difficulty',
            field=models.CharField(default='easy', max_length=20000),
        ),
        migrations.AddField(
            model_name='game',
            name='privacy',
            field=models.CharField(default='public', max_length=20000),
        ),
        migrations.AddField(
            model_name='game',
            name='time',
            field=models.IntegerField(default=10),
        ),
    ]
