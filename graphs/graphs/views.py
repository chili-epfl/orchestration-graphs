from django.views.generic.edit import CreateView, DeleteView
from django.views.generic.detail import DetailView
from graphs.models import Scenario, Activity
from django import forms
from django.core.urlresolvers import reverse_lazy


class ScenarioCreateView(CreateView):
    model = Scenario
    fields = ['name','group','json']
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
        context["activity"] = Activity.objects.all()
        return context
