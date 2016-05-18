from django.conf.urls import patterns, include, url
from django.views.generic import TemplateView
from django.conf.urls.static import static
from django.conf import settings
from activities.views import next_activity, activity_view, simple_activity
from graphs.views import *
from django.contrib.auth.decorators import login_required
from django.views.generic.list import ListView
from graphs.models import Scenario, Activity

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^teacher/scenario/editor/$', ScenarioCreateView.as_view(), name="scenario-creator"),
    url(r'^teacher/scenario/editor/(?P<pk>\d+)/$', ScenarioUpdateView.as_view(), name='scenario-editor',),
    url(r'^teacher/scenario/delete/(?P<pk>\w+)/$', ScenarioDeleteView.as_view(), name="scenario-delete"),
    url(r'^teacher/activity/editor/$', ActivityCreateView.as_view(), name="activity-creator"),
    url(r'^teacher/activity/editor/(?P<pk>\d+)/$', ActivityUpdateView.as_view(), name='activity-editor',),
    url(r'^teacher/activity/delete/(?P<pk>\w+)/$', ActivityDeleteView.as_view(), name="activity-delete"),
    url(r'^teacher/student/delete/(?P<pk>\w+)/$', StudentDeleteView.as_view(), name="student-delete"),

    url(r'^scenario/(?P<pk>\w+)/$', ScenarioDetailView.as_view(template_name='scenario.html'), name="scenario"),
    url(r'^scenario/(?P<pk>\w+)/stats/$', stats_view, name="scenario-stats"),
    url(r'^scenario/csv/(?P<pk>\w+)/$', get_csv, name="scenario-csv"),
    url(r'^scenario/csv/psycho/(?P<pk>\w+)/$', get_psycho_csv, name="scenario-psycho-csv"),
    url(r'^scenario/csv/time/(?P<pk>\w+)/$', get_time_csv, name="scenario-time-csv"),
    url(r'^teacher/dashboard/$', login_required(TemplateView.as_view(template_name='teacher-base.html')), name="teacher-dashboard"),
    url(r'^teacher/scenario/list/$', login_required(ListView.as_view(template_name='scenario-list.html', model=Scenario)), name="scenario-list"),
    url(r'^teacher/activity/list/$', login_required(ListView.as_view(template_name='activity-list.html', model=Activity)), name="activity-list"),
    url(r'^teacher/student/list/(?P<pk>\w+)/$', login_required(StudentListView.as_view()), name="student-list"),

    url(r'^student/register/scenario/(?P<pk>\w+)/$', student_registration, name="student-registration"),
    url(r'^student/register/$', student_registration, name="student-registration"),
    url(r'^student/$', student_learning, name="student-learning"),
    url(r'^student/activity/next/$', next_activity, name="next-activity"),

    url(r'^activity/(?P<pk>\w+)/$', activity_view, name="activity"),
    url(r'^activity/simple/(?P<pk>\w+)/$', simple_activity, name="activity"),

    url(r'^accounts/login/$', 'django.contrib.auth.views.login', name='login'),
    url(r'^accounts/logout/$', 'django.contrib.auth.views.logout', {'next_page': '/teacher/scenario/list/'}, name='logout'),

    url(r'^admin/', include(admin.site.urls)),

    url(r'^$', home_view),
) + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
