# Generated by Django 4.2.2 on 2024-11-02 10:05

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('question', '0010_gamemode_game_date_alter_game_host_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='question',
            name='level',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='question', to='question.level'),
        ),
    ]
