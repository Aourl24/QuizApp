# Generated by Django 4.2.2 on 2024-03-29 08:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('question', '0004_player_connected'),
    ]

    operations = [
        migrations.AddField(
            model_name='game',
            name='gameType',
            field=models.IntegerField(default=0),
        ),
    ]
