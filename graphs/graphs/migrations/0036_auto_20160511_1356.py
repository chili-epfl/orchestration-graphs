# -*- coding: utf-8 -*-
# Generated by Django 1.9.2 on 2016-05-11 11:56
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('graphs', '0035_auto_20160504_1234'),
    ]

    operations = [
        migrations.CreateModel(
            name='ActivityGroup',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50)),
            ],
        ),
        migrations.AddField(
            model_name='activity',
            name='description',
            field=models.CharField(blank=True, max_length=1000, null=True),
        ),
        migrations.AddField(
            model_name='activity',
            name='group',
            field=models.ManyToManyField(blank=True, to='graphs.ActivityGroup'),
        ),
    ]