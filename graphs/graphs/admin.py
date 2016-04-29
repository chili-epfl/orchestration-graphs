# -*- coding: utf-8 -*-
from django.contrib import admin
from graphs.models import *
from django.utils.translation import ugettext_lazy as _

admin.site.register(Scenario)
admin.site.register(Activity)
admin.site.register(Student)
admin.site.register(Choice)
admin.site.register(Question)
admin.site.register(Answer)
admin.site.register(Result)
admin.site.register(TimeLog)

