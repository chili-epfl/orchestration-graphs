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
        return 0
