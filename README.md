# orchestration-graphs
Workflow engine for orchestration graphs

How to run the server:
* Make sure you're running Python 3
* Install Django 1.9 (easiest way using pip: 'pip install django')
* Run 'manage.py runserver' (in the graphs directory)
* Now you can connect to e.g. localhost:8000/student or any other URL from /graphs/graphs/urls.py.


You can create accounts to access the teacher area using the following manage.py command:
'createsuperuser --name=your_name --email=your_email'
(or use an existing account).