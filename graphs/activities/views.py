from django.views.generic import TemplateView
from django.http import HttpResponseRedirect
from graphs.models import Student, Activity, TimeLog
from graphs.forms import QuizForm, PsychoForm
from django.core.exceptions import ObjectDoesNotExist
from django.shortcuts import render
from datetime import datetime


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
    """Displays an activity

    :param pk: The activity's primary key
    :param simple_layout: Whether the activity should be displayed in a basic way or with the header, buttons, etc.
    """
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
        if simple_layout:
            return quiz_preview(request, activity)
        else:
            return quiz_activity(request, activity, simple_layout)
    elif tpe == 'link':
        return render(request, 'link-activity.html', context=ctx)
    elif tpe == 'psycho':
        return psycho_activity(request, activity, simple_layout)
    else:
        return render(request, 'text-activity.html', context=ctx)


def simple_activity(request, pk):
    return activity_view(request, pk, simple_layout=True)


def user_activity(request):
    """Displays the current user's current activity"""
    try:
        student = Student.objects.get(pk=request.session['user_id'])
        activity = student.get_current_activity()

        if student.completion_date is not None:
            return render(request, 'completion.html')
        else:
            return activity_view(request, activity.pk)

    except ObjectDoesNotExist:
        return HttpResponseRedirect('/student/register/')


def next_activity(request):
    """Makes the current user proceed to their next activity"""
    try:
        student = Student.objects.get(pk=request.session['user_id'])
        log = TimeLog.objects.get(student=student, activity=student.get_current_activity())
        log.end_time = datetime.now()
        log.save()

        if student.current_activity + 1 >= len(student.path_list()):
            if student.completion_date is None:
                student.completion_date = datetime.now()
                student.save()
            return render(request, 'completion.html')

        else:
            student.current_activity += 1
            student.save()
            log = TimeLog.create(student=student, activity=student.get_current_activity())
            log.save()
            return HttpResponseRedirect('/student/')

    except ObjectDoesNotExist:
        return HttpResponseRedirect('/student/register/')


def quiz_activity(request, activity, simple_layout=False):
    """Displays a submittable quiz form

    :param activity: The quiz activity to display
    :param simple_layout: If true, displays the quiz as plain text instead of a form (default false)
    """
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


def psycho_activity(request, activity, simple_layout=False):
    """Displays a submittable psychological test form

    :param activity: The test activity to display
    :param simple_layout: If true, displays the test as plain text instead of a form (default false)
    """
    student = Student.objects.get(pk=request.session['user_id'])
    ctx = {'title': activity.name}
    base_template = 'base.html'

    if simple_layout:
        base_template = 'simple-base.html'
        ctx['simple'] = True

    ctx['base_template'] = base_template

    if request.method == 'POST':
        form = PsychoForm(request.POST, test=activity, student=student)
        ctx['form'] = form
        if form.is_valid():
            form.save()
            return next_activity(request)
    else:
        form = PsychoForm(test=activity, student=student)
        ctx['form'] = form
    return render(request, 'quiz-activity.html', ctx)


def quiz_preview(request, activity):
    """Displays a quiz activity as text rather than as a radio button form

    :param activity: The quiz to display"""
    ctx = {'title': activity.name, 'questions': activity.get_questions()}
    return render(request, 'quiz-preview.html', ctx)
