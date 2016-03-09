from django.db import models
from django import forms
from django.forms.extras import widgets


class Scenario(models.Model):
    group = models.CharField(max_length=50)
    name = models.CharField(max_length=50)
    json = models.TextField()
    date = models.DateField(auto_now_add=True)
    
    def avg_time(self):
        return "N/A"

    def avg_learning(self):
        return "N/A"

    def num_students(self):
        return Student.objects.filter(scenario=self.pk).len()


class Activity(models.Model):
    name = models.CharField(max_length=50)
    type = models.CharField(max_length=50)
    source = models.CharField(max_length=1000)


class Student(models.Model):
    email = models.EmailField(max_length=50, unique=True)
    scenario = models.ForeignKey(Scenario, null=True, on_delete=models.SET_NULL)
    current_activity = models.ForeignKey(Activity, null=True, on_delete=models.SET_NULL)
    start_date = models.DateTimeField
    completion_date = models.DateTimeField
