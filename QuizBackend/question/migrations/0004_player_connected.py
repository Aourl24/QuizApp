# Generated by Django 4.2.2 on 2024-02-24 01:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('question', '0003_player_user'),
    ]

    operations = [
        migrations.AddField(
            model_name='player',
            name='connected',
            field=models.BooleanField(default=False),
        ),
    ]
