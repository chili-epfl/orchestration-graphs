# -*- coding: utf-8 -*-
# Generated by Django 1.9.2 on 2016-05-04 08:56
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('graphs', '0024_auto_20160504_0850'),
    ]

    operations = [
        migrations.AlterField(
            model_name='question',
            name='correct_answer',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='+', to='graphs.Choice'),
        ),
        migrations.AlterField(
            model_name='question',
            name='image_source',
            field=models.CharField(max_length=100, null=True),
        ),
    ]