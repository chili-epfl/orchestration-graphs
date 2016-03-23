from django.views.generic import TemplateView
from django.http import HttpResponseRedirect
from graphs.models import Student, Activity
from graphs.forms import QuizForm
from django.core.exceptions import ObjectDoesNotExist
from django.shortcuts import render
from datetime import datetime
import json
import random


class ActivityView(TemplateView):
    """
    Default page seen by the user. Form to create the
    experiment instance within the session
    """

    model = Activity

#    def get_context_data(self, *args, **kwargs):
#        context = super(ExperimentView, self).get_context_data(**kwargs)
#        context['user_id'] = self.request.session["user_id"]
#        return context

    def get_template_names(self):
        activity = Activity.objects.get(pk=self.kwargs['id'])
        tpe = activity.type

        if tpe == 'text':
            return ["activities/" + self.kwargs['id'] + ".html"]
        elif tpe == 'quiz':
            return ["activities/" + self.kwargs['id'] + ".html"]
        elif tpe == 'link':
            return ["activities/" + self.kwargs['id'] + ".html"]
        else:
            return ["activities/" + self.kwargs['id'] + ".html"]


def activity_view(request, pk, simple_layout=False):
    activity = Activity.objects.get(pk=pk)
    tpe = activity.type
    ctx = {'source': activity.source, 'title': activity.name}
    base_template = 'base.html'

    if simple_layout:
        base_template = 'simple-base.html'
        ctx['simple'] = True

    ctx['base_template'] = base_template

    if tpe == 'text':
        return render(request, 'text-activity.html', context=ctx)
    elif tpe == 'quiz':
        return quiz_activity(request, activity, simple_layout)
    elif tpe == 'link':
        return render(request, 'link-activity.html', context=ctx)
    else:
        return render(request, 'text-activity.html', context=ctx)


def simple_activity(request, pk):
    return activity_view(request, pk, simple_layout=True)


def user_activity(request):
    try:
        student = Student.objects.get(pk=request.session['user_id'])
        activity_id = student.current_activity_id

        if student.completion_date is not None:
            return render(request, 'completion.html')
        else:
            return activity_view(request, activity_id)

    except ObjectDoesNotExist:
        return HttpResponseRedirect('/student/register/')


def next_activity(request):
    try:
        student = Student.objects.get(pk=request.session['user_id'])
        scenario = json.loads(student.scenario.json)
        next_act = []
        edges = scenario['edges']

        for e in edges:
            if e['a1'] == student.current_activity_id:
                next_act.append(Activity.objects.get(pk=e['a2']))

        if next_act:
            student.current_activity = random.choice(next_act)
            student.save()
            return HttpResponseRedirect('/student/')
        else:
            if student.completion_date is None:
                student.completion_date = datetime.now()
                student.save()
            return render(request, 'completion.html')

    except ObjectDoesNotExist:
        return HttpResponseRedirect('/student/register/')


def quiz_activity(request, activity, simple_layout=False):
    student = Student.objects.get(pk=request.session['user_id'])
    ctx = {'title': activity.name}
    base_template = 'base.html'

    if simple_layout:
        base_template = 'simple-base.html'
        ctx['simple'] = True

    ctx['base_template'] = base_template

    if request.method == 'POST':
        form = QuizForm(request.POST, quiz=activity, student=student)
        ctx['form'] = form
        if form.is_valid():
            form.save()
            return next_activity(request)
    else:
        form = QuizForm(quiz=activity, student=student)
        ctx['form'] = form
    return render(request, 'quiz-activity.html', ctx)
