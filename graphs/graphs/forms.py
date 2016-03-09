from django.forms import ModelForm
from graphs.models import Student


class StudentRegistrationForm(ModelForm):
    class Meta:
        model = Student
        fields = ['email']
