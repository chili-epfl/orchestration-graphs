# -*- coding: utf-8 -*-
# Generated by Django 1.9.2 on 2016-03-21 10:42
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('graphs', '0006_student_completion_date'),
    ]

    operations = [
        migrations.CreateModel(
            name='Question',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('text', models.CharField(max_length=200)),
                ('choices', models.CharField(max_length=1000)),
                ('correct_answer', models.CharField(max_length=50)),
                ('activity', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='graphs.Activity')),
            ],
        ),
    ]