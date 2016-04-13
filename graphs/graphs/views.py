from django.views.generic.edit import CreateView, DeleteView
from django.views.generic.detail import DetailView
from graphs.models import Scenario, Activity, Student, Result, Answer
from django import forms
from django.shortcuts import render
from django.core.urlresolvers import reverse_lazy
from graphs.forms import StudentRegistrationForm
from django.http import HttpResponseRedirect, HttpResponse
from activities.views import user_activity
import random
import json
import csv


class ScenarioCreateView(CreateView):
    model = Scenario
    fields = ['name', 'group', 'json']
    template_name = 'graph-editor.html'
    success_url = reverse_lazy("scenario-list")

    def get_form(self, form_class):
        form = super(ScenarioCreateView, self).get_form(form_class)
        form.fields['json'].widget = forms.HiddenInput()
        return form


class ScenarioDeleteView(DeleteView):
    model = Scenario
    success_url = reverse_lazy("scenario-list")


class ScenarioDetailView(DetailView):
    """DetailView subclass used to use multiple models in the template"""
    model = Scenario

    def get_context_data(self, **kwargs):
        context = super(ScenarioDetailView, self).get_context_data(**kwargs)
        context["activities"] = Activity.objects.all()
        return context


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
            if e['a1'] == path[-1]:
                next_act.append(e['a2'])

        if next_act:
            path.append(random.choice(next_act))
        else:
            break

    return json.dumps(path)


def student_registration(request):
    """Handles a new user's registration. Gives them a random scenario and path."""
    form = StudentRegistrationForm(request.POST)
    if form.is_valid():
        form.save()
        student = Student.objects.get(email=form.cleaned_data['email'])
        random_id = random.randint(0, Scenario.objects.count() - 1)
        student.scenario = Scenario.objects.all()[random_id]

        student.path = path_from_edges(student.scenario)
        student.save()
        request.session['user_id'] = student.pk

        return HttpResponseRedirect('/student/')
    else:
        return render(request, 'registration/student-registration.html', {'form': form})


def student_learning(request):
    """Redirects to current activity if a student is logged in, otherwise redirects to registration page"""
    if 'user_id' in request.session:
        return user_activity(request)
    else:
        return HttpResponseRedirect('/student/register/')


def stats_view(request, pk):
    """Shows some statistics.

    :param pk: Primary key of the scenario being viewed.
    """
    scenario = Scenario.objects.get(pk=pk)
    paths = Student.objects.filter(scenario=scenario).order_by('path').values_list('path', flat=True).distinct()
    data = []
    for path in paths:
        data.append([('Path', path),
                     ('Number of students', scenario.num_students(path)),
                     ('Average time', scenario.avg_time(path)),
                     ('Average learning gain', scenario.avg_learning(path)),
                     ('Standard deviation', scenario.learning_stdev(path)),
                     ('Variance', scenario.learning_variance(path))])

    return render(request, 'scenario-stats.html', context={'scenario': scenario, 'data': data})


def get_csv(request, pk):
    """Export scenario data as a CSV file

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
        writer.writerow([result.student.email, result.timestamp, result.quiz.name, result.score])
    return response


def get_psycho_csv(request, pk):
    """Export psychological results as a CSV file

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
        writer.writerow([answer.student.email, answer.question_id, answer.given_answer])
    return response
