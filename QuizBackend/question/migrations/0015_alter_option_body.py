# Generated by Django 4.2.2 on 2024-11-08 10:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('question', '0014_remove_question_category_game_category'),
    ]

    operations = [
        migrations.AlterField(
            model_name='option',
            name='body',
            field=models.TextField(blank=True, null=True),
        ),
    ]
