from django.db import models
from datetime import timedelta
import json
from statistics import mean, pstdev, pvariance


class Scenario(models.Model):
    """Models a scenario and its graph of activities"""
    ALL_PATHS = 'all'
    group = models.CharField(max_length=50)
    name = models.CharField(max_length=50)
    json = models.TextField()
    date = models.DateField(auto_now_add=True)

    def avg_time(self, path=ALL_PATHS):
        """Computes the average time spent by students to complete the scenario.

        :param path: if specified, restricts the computation to student that have followed this specific json path
        :return: average time taken by students to complete the scenario
        """
        times = []
        students = Student.objects.filter(scenario=self)
        if path != self.ALL_PATHS:
            students = students.filter(path=path)
        for student in students:
            if student.completion_date is not None:
                times.append(student.completion_date - student.start_date)

        if times:
            return str(sum(times, timedelta())/len(times))
        else:
            return "N/A"

    def progress_data(self, path=ALL_PATHS):
        """Computes each student's progress on this scenario

        :param path: if specified, restricts the computation to student that have followed this specific json path
        :return: a list of all students' progress
        """
        progress_list = []
        students = Student.objects.filter(scenario=self)
        if path != self.ALL_PATHS:
            students = students.filter(path=path)
        for student in students:
            results = student.get_results().order_by('timestamp')
            if results.count() >= 2:
                progress = results.last().score - results.first().score
                progress_list.append(progress)
        return progress_list

    def avg_learning(self, path=ALL_PATHS):
        """Computes the average progress made by students on this scenario

        :param path: if specified, restricts the computation to student that have followed this specific json path
        :return: average student progress
        """
        progress_list = self.progress_data(path=path)

        if progress_list:
            return str(round(100*mean(progress_list), 2)) + "%"
        else:
            return "N/A"

    def num_students(self, path=ALL_PATHS):
        """Computes the number of students taking part in this scenario

        :param path: if specified, restricts the computation to student that have followed this specific json path
        :return: number of students who take part in this scenario
        """
        students = Student.objects.filter(scenario=self)
        if path != self.ALL_PATHS:
            students = students.filter(path=path)
        return students.count()

    def learning_stdev(self, path=ALL_PATHS):
        """Computes the standard deviation of the students' learning gain

        :param path: if specified, restricts the computation to student that have followed this specific json path
        :return: standard deviation of the students' learning gain
        """
        progress_list = self.progress_data(path=path)

        if progress_list:
            return round(pstdev(progress_list), 4)
        else:
            return "N/A"

    def learning_variance(self, path=ALL_PATHS):
        """Computes the variance of the students' learning gain

        :param path: if specified, restricts the computation to student that have followed this specific json path
        :return: variance of the students' learning gain
        """
        progress_list = self.progress_data(path=path)

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


class Choice(models.Model):
    """Models a possible answer"""
    question = models.ForeignKey('Question', on_delete=models.CASCADE)
    text = models.CharField(max_length=100)
    image_source = models.CharField(max_length=100)

    def get_html(self):
        """Returns a string containing the image (if there is one) in an HTML tag, followed by the text"""
        if self.image_source is not None and self.image_source != "":
            return "<img src='" + self.image_source + "' height='128' > " + self.text
        else:
            return self.text


class Question(models.Model):
    """Models a question, which is part of one or more quiz/test activity"""
    text = models.CharField(max_length=1000)
    image_source = models.CharField(max_length=100, null=True)
    correct_answer = models.ForeignKey(Choice, related_name='+')
    activity = models.ManyToManyField(Activity)

    def get_choices(self):
        return Choice.objects.filter(question=self)


class Answer(models.Model):
    """Models a student's answer to a question"""
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    activity = models.ForeignKey(Activity, on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    given_answer = models.ForeignKey(Choice)
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
    """Models a student's score (percentage) on a quiz"""
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    quiz = models.ForeignKey(Activity, on_delete=models.CASCADE)
    score = models.FloatField()
    timestamp = models.DateTimeField(auto_now_add=True)

    @classmethod
    def create(cls, student, quiz):
        result = cls(student=student, quiz=quiz)
        return result


class TimeLog(models.Model):
    """Records the times at which each student starts/ends an activity"""
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    activity = models.ForeignKey(Activity, on_delete=models.CASCADE)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True)

    class Meta:
        unique_together = ('student', 'activity',)

    @classmethod
    def create(cls, student, activity):
        time_log = cls(student=student, activity=activity)
        return time_log
