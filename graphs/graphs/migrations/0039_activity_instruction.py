# -*- coding: utf-8 -*-
# Generated by Django 1.9.2 on 2016-05-26 15:13
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('graphs', '0038_auto_20160525_1351'),
    ]

    operations = [
        migrations.AddField(
            model_name='activity',
            name='instruction',
            field=models.CharField(blank=True, max_length=1000, null=True),
        ),
    ]
