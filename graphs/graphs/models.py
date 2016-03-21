from django.db import models
from django import forms
from django.forms.extras import widgets
from datetime import timedelta


class Scenario(models.Model):
    group = models.CharField(max_length=50)
    name = models.CharField(max_length=50)
    json = models.TextField()
    date = models.DateField(auto_now_add=True)

    def avg_time(self):
        times = []
        for student in Student.objects.filter(scenario=self):
            if student.completion_date is not None:
                times.append(student.completion_date - student.start_date)

        if times:
            return str(sum(times, timedelta())/len(times))
        else:
            return "N/A"

    def avg_learning(self):
        return "N/A"

    def num_students(self):
        return len(Student.objects.filter(scenario=self.pk))


class Activity(models.Model):
    name = models.CharField(max_length=50)
    type = models.CharField(max_length=50)
    source = models.CharField(max_length=1000)


class Student(models.Model):
    email = models.EmailField(max_length=50, unique=True)
    scenario = models.ForeignKey(Scenario, null=True, on_delete=models.SET_NULL)
    current_activity = models.ForeignKey(Activity, null=True, on_delete=models.SET_NULL)
    start_date = models.DateTimeField(auto_now_add=True)
    completion_date = models.DateTimeField(null=True)


class Question(models.Model):
    text = models.CharField(max_length=200)
    choices = models.CharField(max_length=1000)
    correct_answer = models.CharField(max_length=50)
    activity = models.ForeignKey(Activity, on_delete=models.CASCADE)
