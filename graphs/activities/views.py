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

        if tpe == 'Text':
            return ["activities/" + self.kwargs['id'] + ".html"]
        elif tpe == 'Quiz':
            return ["activities/" + self.kwargs['id'] + ".html"]
        elif tpe == 'Link':
            return ["activities/" + self.kwargs['id'] + ".html"]
        else:
            return ["activities/" + self.kwargs['id'] + ".html"]


def user_activity(request):
    try:
        student = Student.objects.get(pk=request.session['user_id'])
        activity = student.current_activity
        tpe = activity.type

        if tpe == 'Text':
            ctx = {'activity_template': activity.source}
            return render(request, 'text-activity.html', context=ctx)
        elif tpe == 'Quiz':
            return quiz_activity(request, activity, student)
        elif tpe == 'Link':
            ctx = {'link': activity.source}
            return render(request, 'link-activity.html', context=ctx)
        else:
            ctx = {'activity_template': activity.source}
            return render(request, 'text-activity.html', context=ctx)

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


def quiz_activity(request, activity, student):
    if request.method == 'POST':
        form = QuizForm(request.POST, quiz=activity, student=student)
        if form.is_valid():
            form.save()
            return next_activity(request)
    else:
        form = QuizForm(quiz=activity, student=student)
    return render(request, 'quiz-activity.html', {'form': form})


