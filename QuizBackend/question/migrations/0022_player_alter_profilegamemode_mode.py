# Generated by Django 5.1.4 on 2025-01-18 22:36

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("question", "0021_remove_gamemode_locked_remove_gamemode_player_and_more"),
    ]

    operations = [
        migrations.CreateModel(
            name="Player",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
            ],
        ),
        migrations.AlterField(
            model_name="profilegamemode",
            name="mode",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="profilegame",
                to="question.gamemode",
            ),
        ),
    ]
