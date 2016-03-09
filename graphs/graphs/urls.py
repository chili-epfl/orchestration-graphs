from django.conf.urls import patterns, include, url
from django.views.generic import TemplateView
from django.conf.urls.static import static
from django.conf import settings
from activities.views import ActivityView
from graphs.views import ScenarioCreateView, ScenarioDeleteView, ScenarioDetailView, student_registration, student_learning
from django.views.generic.list import ListView
from graphs.models import Scenario

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    url(r'^teacher/scenario/editor/$', ScenarioCreateView.as_view(), name="scenario-editor"),
    url(r'^teacher/scenario/delete/(?P<pk>\w+)/$', ScenarioDeleteView.as_view(), name="scenario-delete"),

    url(r'^scenario/(?P<pk>\w+)/$', ScenarioDetailView.as_view(template_name='scenario.html'), name="scenario"),
    url(r'^teacher/$', TemplateView.as_view(template_name='teacher-base.html'), name="teacher-dashboard"),
    url(r'^teacher/scenario/list/$', ListView.as_view(template_name='scenario-list.html', model=Scenario), name="scenario-list"),

    url(r'^student/register/$', student_registration, name="student-registration"),
    url(r'^student/(?P<user_id>\d+)/$', student_learning, name="student-learning"),

    url(r'^activity/(?P<id>\w+)/$', ActivityView.as_view(), name="scenario-save"),
    # url(r'^blog/', include('blog.urls')),

    url(r'^accounts/login/$', 'django.contrib.auth.views.login', name='login'),
    url(r'^accounts/logout/$', 'django.contrib.auth.views.logout', {'next_page': '/teacher/'}, name='logout'),

    url(r'^admin/', include(admin.site.urls)),
) + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)


