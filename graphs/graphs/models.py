from django.db import models
from datetime import timedelta
import json
from statistics import mean, pstdev, pvariance


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

    def progress_data(self):
        progress_list = []
        for student in Student.objects.filter(scenario=self):
            results = student.get_results().order_by('timestamp')
            if results.count() >= 2:
                progress = results.last().score - results.first().score
                progress_list.append(progress)
        return progress_list

    def avg_learning(self):
        progress_list = self.progress_data()

        if progress_list:
            return str(round(100*mean(progress_list), 2)) + "%"
        else:
            return "N/A"

    def num_students(self):
        return Student.objects.filter(scenario=self.pk).count()

    def learning_stdev(self):
        progress_list = self.progress_data()

        if progress_list:
            return round(pstdev(progress_list), 4)
        else:
            return "N/A"

    def learning_variance(self):
        progress_list = self.progress_data()

        if progress_list:
            return round(pvariance(progress_list), 4)
        else:
            return "N/A"


class Activity(models.Model):
    TYPE_CHOICES = (
        ('text', 'Text'),
        ('quiz', 'Quiz'),
        ('link', 'Link'),
        ('psycho', 'Psycho'),
    )

    name = models.CharField(max_length=50)
    type = models.CharField(max_length=8, choices=TYPE_CHOICES)
    source = models.CharField(max_length=1000)

    def get_questions(self):
        """Returns the questions that are part of this activity"""
        return Question.objects.filter(activity=self)


class Student(models.Model):
    email = models.EmailField(max_length=50, unique=True)
    scenario = models.ForeignKey(Scenario, null=True, on_delete=models.SET_NULL)
    current_activity = models.IntegerField(default=0)  # index of current activity in the path
    path = models.CharField(max_length=1000, null=True)  # sequence of activities in JSON format
    start_date = models.DateTimeField(auto_now_add=True)
    completion_date = models.DateTimeField(null=True)

    def get_results(self):
        return Result.objects.filter(student=self)

    def get_current_activity(self):
        act_id = json.loads(self.path)[self.current_activity]
        return Activity.objects.get(pk=act_id)

    def path_list(self):
        return json.loads(self.path)

    def get_psycho_answers(self):
        tests = Activity.objects.filter(type='psycho')
        return Answer.objects.filter(student=self, activity__in=tests)


class Question(models.Model):
    text = models.CharField(max_length=1000)
    choices = models.CharField(max_length=1000)
    correct_answer = models.CharField(max_length=100)
    activity = models.ManyToManyField(Activity)

    def get_choices(self):
        choices_list = []
        for c in json.loads(self.choices):
            choices_list.append(c)
        return choices_list


class Answer(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    activity = models.ForeignKey(Activity, on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    given_answer = models.CharField(max_length=100)
    timestamp = models.DateTimeField(auto_now_add=True)

    @classmethod
    def create(cls, student, activity, question):
        answer = cls(student=student, activity=activity, question=question)
        return answer

    def is_correct(self):
        if self.activity.type == 'quiz':
            return self.given_answer == self.question.correct_answer
        else:
            # i.e. the activity is a psychological test
            return True


class Result(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    quiz = models.ForeignKey(Activity, on_delete=models.CASCADE)
    score = models.FloatField()
    timestamp = models.DateTimeField(auto_now_add=True)

    @classmethod
    def create(cls, student, quiz):
        result = cls(student=student, quiz=quiz)
        return result
