from django.forms import ModelForm, ChoiceField, RadioSelect, Form
from graphs.models import Student, Question, Result, Answer
from django.utils.safestring import mark_safe


class StudentRegistrationForm(ModelForm):
    class Meta:
        model = Student
        fields = ['email']


class QuizForm(ModelForm):
    """Form for quizzes. Stores a score based on the percentage of correct answers."""
    class Meta:
        model = Result
        fields = []

    def __init__(self, *args, **kwargs):
        self.quiz = kwargs.pop('quiz')
        self.student = kwargs.pop('student')
        self.questions = Question.objects.filter(activity__in=[self.quiz])
        super(QuizForm, self).__init__(*args, **kwargs)

        data = kwargs.get('data')
        for question in self.questions:
            field_name = "question_%d" % question.pk
            choices = tuple((c.pk, c.get_html()) for c in question.get_choices())

            self.fields[field_name] = ChoiceField(label=question.get_html(), required=True, choices=choices, widget=RadioSelect)
            if data:
                self.fields[field_name].initial = data.get(field_name)

    def save(self, commit=True):
        result = Result.create(self.student, self.quiz)
        results = []

        for field_name, field_value in self.cleaned_data.items():
            if field_name.startswith("question_"):
                q_id = int(field_name.split("_")[1])
                q = Question.objects.get(pk=q_id)

                if field_value == str(q.correct_answer_id):
                    results.append(1)
                else:
                    results.append(0)

        result.score = sum(results)/len(results)
        result.save()

        return result


class PsychoForm(Form):
    """Form for psychological test. Saves the answers as is instead of computing a score since there are no right or
    wrong answers.
    """
    def __init__(self, *args, **kwargs):
        self.test = kwargs.pop('test')
        self.student = kwargs.pop('student')
        self.questions = Question.objects.filter(activity__in=[self.test])
        super(PsychoForm, self).__init__(*args, **kwargs)

        data = kwargs.get('data')
        for question in self.questions:
            field_name = "question_%d" % question.pk
            choices = tuple((c.pk, mark_safe(c.get_html())) for c in question.get_choices())

            if question.image_source is not None:
                label = "<img src='" + question.image_source + "' height='250' ><br>" + question.text
            else:
                label = question.text

            self.fields[field_name] = ChoiceField(label=mark_safe(label), required=True, choices=choices, widget=RadioSelect)
            if data:
                self.fields[field_name].initial = data.get(field_name)

    def save(self):
        for field_name, field_value in self.cleaned_data.items():
            if field_name.startswith("question_"):
                q_id = int(field_name.split("_")[1])
                q = Question.objects.get(pk=q_id)
                answer = Answer.create(self.student, self.test, q)
                answer.given_answer_id = field_value
                answer.save()
