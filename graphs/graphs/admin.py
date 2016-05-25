# -*- coding: utf-8 -*-
from django.contrib import admin
from graphs.models import *

admin.site.register(Scenario)


class ActivityAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'source')
    list_filter = ('group',)
    filter_horizontal = ('group',)

admin.site.register(Activity, ActivityAdmin)

admin.site.register(ActivityGroup)

admin.site.register(Answer)


class StudentAdmin(admin.ModelAdmin):
    list_display = ('email', 'scenario', 'current_activity')
admin.site.register(Student, StudentAdmin)


class QuestionAdmin(admin.ModelAdmin):
    list_display = ('get_text', 'image_source', 'correct_answer')
    filter_horizontal = ('activity',)

    def get_text(self, obj):
        text = obj.text
        return text if text is not None and text != "" else "Question #" + str(obj.id)
    get_text.short_description = 'Question'
admin.site.register(Question, QuestionAdmin)


class ResultAdmin(admin.ModelAdmin):
    list_display = ('get_email', 'get_activity', 'score')

    def get_email(self, obj):
        return obj.student.email
    get_email.short_description = 'Student'

    def get_activity(self, obj):
        return obj.quiz.name
    get_activity.short_description = 'Activity'
admin.site.register(Result, ResultAdmin)


class ChoiceAdmin(admin.ModelAdmin):
    def get_question(self, obj):
        text = obj.question.text
        return text if text is not None and text != "" else "Question #" + str(obj.question.id)
    get_question.short_description = 'Question'
    list_display = ('get_question', 'image_source', 'text')

admin.site.register(Choice, ChoiceAdmin)


class TimeLogAdmin(admin.ModelAdmin):
    list_display = ('get_email', 'get_activity', 'start_time', 'end_time')

    def get_email(self, obj):
        return obj.student.email
    get_email.short_description = 'Student'
        
    def get_activity(self, obj):
        return obj.activity.name
    get_activity.short_description = 'Activity'

admin.site.register(TimeLog, TimeLogAdmin)
