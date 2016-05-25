from django.db import models
from datetime import timedelta
import json
from statistics import mean, pstdev, pvariance
from django.utils.safestring import mark_safe
from datetime import timedelta


class Scenario(models.Model):
    """Models a scenario and its graph of activities"""
    ALL_PATHS = 'all'
    name = models.CharField(max_length=50)
    json = models.TextField()
    raphaelJson = models.TextField()
    date = models.DateField(auto_now_add=True)

    def __str__(self):
        return self.name

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
            return str(sum(times, timedelta())/len(times)).split('.')[0]
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

    def num_by_gain(self, path=ALL_PATHS):
        """Computes the number of students in each gain bracket. Results start from 0%, or the lowest non-empty sub-zero
         bracket if there is one.

        :param path: if specified, restricts the computation to student that have followed this specific json path
        :return: a list of tuples containing the number of students in each bracket
        """
        progress_list = [round(p, 1)*100 for p in self.progress_data(path)]
        gain_data = []
        start_found = False

        for i in range(-10, 10):
            count = progress_list.count(i*10)
            if start_found or count > 0 or i >= 0:
                gain_data.append((str(i*10) + '%', count))
                start_found = True
        return gain_data

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

    def avg_learning_num(self, path=ALL_PATHS):
        """Computes the average progress made by students on this scenario, as an integer between -100 and +100

        :param path: if specified, restricts the computation to student that have followed this specific json path
        :return: average student progress
        """
        progress_list = self.progress_data(path=path)

        if progress_list:
            return round(100*mean(progress_list))
        else:
            return 0

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


class ActivityGroup(models.Model):
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name


class Activity(models.Model):
    """Models an activity. Activities can be of several types:

        Text: simple text
        Quiz: A test containing multiple choice questions
        Link: An embedded web page or video
        Psycho: A psychological test, similar to quizzes
    """
    class Meta:
        verbose_name_plural = "activities"

    TYPE_CHOICES = (
        ('text', 'Text'),
        ('quiz', 'Quiz'),
        ('link', 'Link'),
        ('psycho', 'Psycho'),
    )

    name = models.CharField(max_length=50)
    type = models.CharField(max_length=8, choices=TYPE_CHOICES)
    # The 'source' field contains raw text for text activities, and a URL for link activities.
    source = models.CharField(max_length=10000, blank=True, null=True)
    description = models.CharField(max_length=1000, blank=True, null=True)
    group = models.ManyToManyField(ActivityGroup, blank=True)

    def __str__(self):
        return str(self.pk) + ": " + self.name

    @classmethod
    def create(cls, name, tpe):
        activity = cls(name=name, type=tpe)
        return activity

    def get_questions(self):
        """Returns the questions that are part of this activity"""
        return Question.objects.filter(activity=self)

    def avg_time(self):
        """"Computes the average time spent on this activity, in seconds"""
        timelogs = TimeLog.objects.filter(activity=self, end_time__isnull=False)
        times = [t.end_time - t.start_time for t in timelogs]
        if times:
            return (sum(times, timedelta())/len(times)).seconds
        else:
            return 0

    def avg_time_str(self):
        """Returns the average time spent on this activity in a more human-readable format"""
        time = timedelta(seconds=self.avg_time())
        return str(time) if time > timedelta() else "N/A"
    

class Student(models.Model):
    """Models a student, i.e. a participant to the experiment"""
    email = models.EmailField(max_length=50, unique=True)
    scenario = models.ForeignKey(Scenario, null=True, on_delete=models.SET_NULL)
    current_activity = models.IntegerField(default=0)  # index of current activity in the path
    path = models.CharField(max_length=1000, null=True)  # sequence of activities in JSON format
    start_date = models.DateTimeField(auto_now_add=True)
    completion_date = models.DateTimeField(null=True)

    def get_results(self):
        """Returns all results from this student"""
        return Result.objects.filter(student=self)

    def get_current_activity(self):
        """Returns this student's current activity (as an Activity object)"""
        act_id = json.loads(self.path)[self.current_activity]
        return Activity.objects.get(pk=act_id)

    def path_list(self):
        """Returns this student's path in list form"""
        return json.loads(self.path)

    def get_psycho_answers(self):
        """Returns all answers to psychological questions from this student"""
        tests = Activity.objects.filter(type='psycho')
        return Answer.objects.filter(student=self, activity__in=tests)

    def completion_time(self):
        """Returns the time it took for this student to complete their scenario"""
        if self.completion_date is not None:
            return str(self.completion_date - self.start_date).split('.')[0]
        else:
            return "N/A"


class Choice(models.Model):
    """Models a possible answer"""
    question = models.ForeignKey('Question', on_delete=models.CASCADE)
    text = models.CharField(max_length=100, blank=True, null=True)
    image_source = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return self.text

    def get_html(self):
        """Returns a string containing the image (if there is one) in an HTML tag, followed by the text"""
        if self.image_source is not None and self.image_source != "":
            return mark_safe("<img src='" + self.image_source + "' height='128' > " + self.text)
        else:
            return self.text


class Question(models.Model):
    """Models a question, which is part of one or more quiz/test activity"""
    text = models.CharField(max_length=1000, blank=True, null=True)
    image_source = models.CharField(max_length=100, blank=True, null=True)
    correct_answer = models.ForeignKey(Choice, blank=True, null=True, related_name='+')
    activity = models.ManyToManyField(Activity, blank=True)

    def __str__(self):
        limit = 50
        text = self.text[0:limit] + "..." if len(self.text) > limit + 1 else self.text
        return str(self.pk) + ": " + text

    def get_choices(self):
        return Choice.objects.filter(question=self)

    def get_html(self, img_height=250):
        if self.image_source is not None and self.image_source != "":
            return mark_safe("<img src='" + self.image_source + "' height='" + str(img_height) + "' > <p>" + self.text + "</p>")
        else:
            return self.text


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

    @classmethod
    def create(cls, student, activity):
        time_log = cls(student=student, activity=activity)
        return time_log
