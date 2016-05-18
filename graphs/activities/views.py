from django.http import HttpResponseRedirect
from django.utils import timezone
from graphs.models import Student, Activity, TimeLog
from graphs.forms import QuizForm, PsychoForm
from django.core.exceptions import ObjectDoesNotExist
from django.shortcuts import render
from datetime import datetime


def activity_view(request, pk, simple_layout=False):
    """Displays an activity

    :param pk: The activity's primary key
    :param simple_layout: Whether the activity should be displayed in a basic way or with the header, buttons, etc.
    """

    ctx = {}

    # Checking that the current user is allowed to view this activity
    if 'user_id' in request.session:
        try:
            student = Student.objects.get(pk=request.session['user_id'])
            ctx['percentage'] = (student.current_activity/len(student.path_list()))*100
            if not student.get_current_activity() == Activity.objects.get(pk=pk):
                if request.user.is_staff:
                    simple_layout = True
                else:
                    return user_activity()
        except ObjectDoesNotExist:
            if request.user.is_staff:
                simple_layout = True
            else:
                return HttpResponseRedirect('/student/register/')
    elif request.user.is_staff:
        simple_layout = True
    else:
        return HttpResponseRedirect('/student/register/')

    activity = Activity.objects.get(pk=pk)
    tpe = activity.type
    ctx['source'] = activity.source
    ctx['title'] = activity.name
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
        if activity.source[-4:] == ".mp4":
            return render(request, 'video-activity.html', context=ctx)
        else:
            return render(request, 'link-activity.html', context=ctx)
    elif tpe == 'psycho':
        if simple_layout:
            return quiz_preview(request, activity)
        else:
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
            results = student.get_results().order_by('timestamp')
            pre_test = round(results.first().score * 100)
            post_test = round(results.last().score * 100)
            ctx = {'pretest': pre_test, 'posttest': post_test, 'diff': post_test - pre_test}
            return render(request, 'completion.html', context=ctx)
        else:
            return activity_view(request, activity.pk)

    except ObjectDoesNotExist:
        return HttpResponseRedirect('/student/register/')


def next_activity(request):
    """Makes the current user proceed to their next activity"""
    try:
        student = Student.objects.get(pk=request.session['user_id'])
        log = TimeLog.objects.get(student=student, activity=student.get_current_activity(), end_time__isnull=True)
        log.end_time = timezone.now()
        log.save()

        if student.current_activity + 1 >= len(student.path_list()):
            if student.completion_date is None:
                student.completion_date = timezone.now()
                student.save()
            return render(request, 'completion.html')

        else:
            # We make sure we're not creating duplicate logs
            if not TimeLog.objects.filter(student=student, activity=student.get_current_activity(), end_time__isnull=True).exists():
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
    ctx['percentage'] = (student.current_activity/len(student.path_list()))*100

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
    ctx['percentage'] = (student.current_activity/len(student.path_list()))*100

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
