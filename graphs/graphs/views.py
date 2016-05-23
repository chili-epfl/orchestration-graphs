from django.views.generic.edit import CreateView, DeleteView, UpdateView
from django.views.generic.detail import DetailView
from django.views.generic.list import ListView
from graphs.models import Scenario, Activity, Student, Result, Answer, TimeLog
from django import forms
from django.shortcuts import render
from django.core.urlresolvers import reverse_lazy
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from graphs.forms import StudentRegistrationForm
from django.http import HttpResponseRedirect, HttpResponse
from activities.views import user_activity
from datetime import timedelta
import random
import json
import csv


class ScenarioUpdateView(LoginRequiredMixin, UpdateView):
    """UpdateView subclass for the graph editor"""
    model = Scenario
    template_name = 'graph-editor.html'
    fields = ['name', 'json', 'raphaelJson']
    success_url = reverse_lazy("scenario-list")

    def get_form(self, form_class):
        form = super(ScenarioUpdateView, self).get_form(form_class)
        form.fields['json'].widget = forms.HiddenInput()
        form.fields['raphaelJson'].widget = forms.HiddenInput()
        return form

    def get_context_data(self, **kwargs):
        context = super(ScenarioUpdateView, self).get_context_data(**kwargs)
        context["activities"] = Activity.objects.all()
        context["action"] = reverse_lazy('scenario-editor',
                                    kwargs={'pk': self.get_object().id})

        return context


class ScenarioCreateView(LoginRequiredMixin, CreateView):
    """CreateView subclass for the graph editor"""
    model = Scenario
    template_name = 'graph-editor.html'
    fields = ['name', 'json', 'raphaelJson']
    success_url = reverse_lazy('scenario-list')

    def get_form(self, form_class):
        form = super(ScenarioCreateView, self).get_form(form_class)
        form.fields['json'].widget = forms.HiddenInput()
        form.fields['raphaelJson'].widget = forms.HiddenInput()
        return form

    def get_context_data(self, **kwargs):
        context = super(ScenarioCreateView, self).get_context_data(**kwargs)
        context["activities"] = Activity.objects.all()
        context["action"] = reverse_lazy('scenario-creator')

        return context


class ActivityUpdateView(LoginRequiredMixin, UpdateView):
    """UpdateView subclass for the activity editor"""
    model = Activity
    template_name = 'activity-editor.html'
    fields = ['name', 'type', 'source', 'description']
    success_url = reverse_lazy("activity-list")

    def get_form(self, form_class):
        form = super(ActivityUpdateView, self).get_form(form_class)
        # Impossible to change type when editing an activity
        form.fields['type'].widget = forms.HiddenInput()
        form.fields['source'].widget = forms.HiddenInput()
        return form

    def get_context_data(self, **kwargs):
        context = super(ActivityUpdateView, self).get_context_data(**kwargs)
        context["activities"] = Activity.objects.all()
        context["action"] = reverse_lazy('activity-editor',
                                    kwargs={'pk': self.get_object().id})

        return context


class ActivityCreateView(LoginRequiredMixin, CreateView):
    """CreateView subclass for the activity editor"""
    model = Activity
    template_name = 'activity-editor.html'
    fields = ['name', 'type', 'source', 'description']
    success_url = reverse_lazy('activity-list')

    def get_form(self, form_class):
        form = super(ActivityCreateView, self).get_form(form_class)
        # Impossible to create Quiz or Psycho via the form
        form.fields['type'].widget.choices.remove(('quiz', 'Quiz'))
        form.fields['type'].widget.choices.remove(('psycho', 'Psycho'))
        form.fields['source'].widget = forms.HiddenInput()
        return form

    def get_context_data(self, **kwargs):
        context = super(ActivityCreateView, self).get_context_data(**kwargs)
        context["activities"] = Activity.objects.all()
        context["action"] = reverse_lazy('activity-creator')

        return context


class ScenarioDeleteView(LoginRequiredMixin, DeleteView):
    model = Scenario
    success_url = reverse_lazy("scenario-list")


class ActivityDeleteView(LoginRequiredMixin, DeleteView):
    model = Activity
    template_name = 'activity-delete.html'
    success_url = reverse_lazy("activity-list")

    def get_context_data(self, **kwargs):
        context = super(ActivityDeleteView, self).get_context_data(**kwargs)
        context["scenarios"] = Scenario.objects.all()

        return context


class StudentDeleteView(LoginRequiredMixin, DeleteView):
    model = Student

    def get_success_url(self):
        student = Student.objects.get(pk=self.kwargs['pk'])
        return reverse_lazy("student-list", kwargs={'pk': student.scenario_id})


class ScenarioDetailView(LoginRequiredMixin, DetailView):
    """DetailView subclass used to use multiple models in the template"""
    model = Scenario

    def get_context_data(self, **kwargs):
        context = super(ScenarioDetailView, self).get_context_data(**kwargs)
        context["activities"] = Activity.objects.all()
        return context


@login_required
def purge_students(request, pk):
    """Delete students that haven't completed the scenario

    :param pk: Scenario primary key
    """
    students = Student.objects.filter(scenario_id=pk, completion_date=None)
    students.delete()
    return HttpResponseRedirect('/teacher/student/list/' + str(pk))


@login_required
def purge_by_time(request, pk, minutes):
    """Delete students that spent less than the specified amount of time to complete the scenario

    :param pk: Scenario primary key
    :param minutes: The time below which students will be deleted
    """
    students = Student.objects.filter(completion_date__isnull=False, scenario_id=pk)
    delta = timedelta(minutes=int(minutes))

    for student in students:
        if student.completion_date - student.start_date < delta:
            student.delete()

    return HttpResponseRedirect('/teacher/student/list/' + str(pk))


def path_from_edges(scenario):
    """Picks a random learning path based on the scenario graph

    :param scenario: The scenario from which you want a random path
    """
    json_data = json.loads(scenario.json)
    edges = json_data['edges']
    act = json_data['start']
    path = [act]

    while True:
        next_act = []
        for e in edges:
            if e['a1']['id'] == path[-1]['id'] and e['a1']['counter'] == path[-1]['counter']:
                next_act.append(e['a2'])

        if next_act:
            path.append(random.choice(next_act))
        else:
            break

    id_path = [a['id'] for a in path]

    return json.dumps(id_path)


def student_registration(request, pk=0):
    """Handles a new user's registration. Gives them a random scenario and path.

    :param pk: Primary key of the scenario to register in. Random if not provided.
    """
    form = StudentRegistrationForm(request.POST)

    if form.is_valid():
        form.save()
        student = Student.objects.get(email=form.cleaned_data['email'])

        if str(pk) == '0':
            scenario_id = random.randint(0, Scenario.objects.count() - 1)
            student.scenario = Scenario.objects.all()[scenario_id]
        else:
            student.scenario = Scenario.objects.get(pk=pk)

        student.path = path_from_edges(student.scenario)
        student.save()
        log = TimeLog.create(student=student, activity=student.get_current_activity())
        log.save()
        request.session['user_id'] = student.pk

        return HttpResponseRedirect('/student/')
    else:
        return render(request, 'registration/student-registration.html', {'form': form, 'scenario_id': pk})


def student_learning(request):
    """Redirects to current activity if a student is logged in, otherwise redirects to registration page"""
    if 'user_id' in request.session:
        return user_activity(request)
    else:
        return HttpResponseRedirect('/student/register/')


@login_required
def stats_view(request, pk):
    """Shows some statistics.

    :param pk: Primary key of the scenario being viewed.
    """
    scenario = Scenario.objects.get(pk=pk)
    paths = Student.objects.filter(scenario=scenario).order_by('path').values_list('path', flat=True).distinct()
    data = []
    path_learning = []
    for path in paths:
        data.append([('Path', path),
                     ('Number of students', scenario.num_students(path)),
                     ('Average time', scenario.avg_time(path)),
                     ('Average learning gain', scenario.avg_learning(path)),
                     ('Standard deviation', scenario.learning_stdev(path)),
                     ('Variance', scenario.learning_variance(path))])
        path_learning.append((path, scenario.avg_learning_num(path)))

    return render(request, 'scenario-stats.html', context={'scenario': scenario,
                                                           'data': data,
                                                           'path_learning': path_learning})


@login_required
def get_csv(request, pk):
    """Exports scenario data as a CSV file

    :param pk: Scenario primary key
    """
    scenario = Scenario.objects.get(pk=pk)
    students = Student.objects.filter(scenario=scenario)
    results = Result.objects.filter(student__in=students).order_by('student', 'timestamp')
    filename = 'scenario_' + str(scenario.pk) + '.csv'
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename=' + filename
    writer = csv.writer(response)
    for result in results:
        writer.writerow([result.student.email, result.timestamp, result.quiz_id, result.quiz.name, result.score])
    return response


@login_required
def get_psycho_csv(request, pk):
    """Exports psychological results as a CSV file

    :param pk: Primary key of the scenario results should be pulled from
    """
    scenario = Scenario.objects.get(pk=pk)
    students = Student.objects.filter(scenario=scenario)
    tests = Activity.objects.filter(type='psycho')
    answers = Answer.objects.filter(student__in=students, activity__in=tests).order_by('student', 'question')
    filename = 'psycho_scenario_' + str(scenario.pk) + '.csv'
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename=' + filename
    writer = csv.writer(response)
    for answer in answers:
        writer.writerow([answer.student.email, answer.question_id, answer.question.text, answer.given_answer_id, answer.given_answer.text])
    return response


@login_required
def get_time_csv(request, pk):
    """Exports activities time logs as a CSV file

    :param pk: Primary key of the scenario logs should be pulled from
    """
    scenario = Scenario.objects.get(pk=pk)
    students = Student.objects.filter(scenario=scenario)
    time_logs = TimeLog.objects.filter(student__in=students)
    filename = 'time_scenario_' + str(scenario.pk) + '.csv'
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename=' + filename
    writer = csv.writer(response)
    for log in time_logs:
        writer.writerow([log.student.email, log.activity_id, log.activity.name, log.start_time, log.end_time])
    return response


def home_view(request):
    """The website's home page"""
    ctx = {'scenarios': Scenario.objects.all()}
    return render(request, 'home.html', ctx)


class StudentListView(ListView, LoginRequiredMixin):
    model = Student
    template_name = 'student-list.html'

    def get_queryset(self):
        qs = super(StudentListView, self).get_queryset()
        return qs.filter(scenario_id=self.kwargs['pk'])

    def get_context_data(self, **kwargs):
        context = super(StudentListView, self).get_context_data(**kwargs)
        context['scenario'] = Scenario.objects.get(pk=self.kwargs['pk'])
        return context


@login_required
def dashboard_view(request):
    ctx = {'scenarios': Scenario.objects.all(), 'activities': Activity.objects.all()}
    return render(request, 'teacher-dashboard.html', ctx)
