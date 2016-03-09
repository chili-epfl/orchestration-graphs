from django.views.generic import TemplateView, View
from django.views.generic.edit import FormView
from django.shortcuts import redirect
from django.http import HttpResponseRedirect
from graphs.models import Student
from django.core.exceptions import ObjectDoesNotExist

class ActivityView(TemplateView):
    """
    Default page seen by the user. Form to create the
    experiment instance within the session
    """
#    def get_context_data(self, *args, **kwargs):
#        context = super(ExperimentView, self).get_context_data(**kwargs)
#        context['user_id'] = self.request.session["user_id"]
#        return context

    def get_template_names(self):
        return ["activities/" + self.kwargs['id'] + ".html"]


def user_activity(request):
    try:
        student = Student.get(pk=request.session['user_id'])
        activity = student.current_activity
        return HttpResponseRedirect(activity.source)
    except ObjectDoesNotExist:
        return HttpResponseRedirect('/student/register/')
