# orchestration-graphs
Workflow engine for orchestration graphs

How to run the server:
* Make sure you're running Python 3
* Install Django 1.9 (easiest way using pip: `pip install django`)
* Install required packages `pip install -r requirements.txt`
* Run `manage.py runserver` (in the graphs directory)
* Now you can connect to e.g. `http://localhost:8000`.


You can create accounts to access the teacher area using the following manage.py command:
`python manage.py createsuperuser --usernname=your_name --email=your_email`
(or use an existing account).
