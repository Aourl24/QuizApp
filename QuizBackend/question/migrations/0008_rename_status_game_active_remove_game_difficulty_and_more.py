# Generated by Django 4.2.2 on 2024-05-04 20:13

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('question', '0007_remove_player_connected_remove_player_total_score_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='game',
            old_name='status',
            new_name='active',
        ),
        migrations.RemoveField(
            model_name='game',
            name='difficulty',
        ),
        migrations.AddField(
            model_name='game',
            name='creator',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='game_creator', to='question.profile'),
        ),
        migrations.AddField(
            model_name='game',
            name='max_players',
            field=models.IntegerField(default=10),
        ),
        migrations.AddField(
            model_name='game',
            name='title',
            field=models.CharField(blank=True, max_length=100000, null=True),
        ),
    ]
