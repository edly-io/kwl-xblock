Edly Know Wonder Learn  ![Pylint Workflow](https://github.com/PakistanX/edly-kwl-xblock/actions/workflows/pylint.yml/badge.svg)
![ESLint workflow](https://github.com/PakistanX/edly-kwl-xblock/actions/workflows/es-lint.yml/badge.svg)
---------------------------------------------

This XBlock allows Learners to Enter the points they already know about the course they are about to 
start, and the points that they wonder they'll learn through this course. At the end of course learners can
validate those points and move items to a third category name `Learned`, showing what they learned from this course. 

Installation
------------

Install the requirements into the python virtual environment of your
``edx-platform`` installation by running the following command from the
root folder:

    pip install -e git@github.com:PakistanX/edly-kwl-xblock.git@release-v0.1.2#egg=edly-kwl

Enabling in Studio
------------------

You can enable the Edly Assessment XBlock in studio through the
advanced settings.

1. From the main page of a specific course, navigate to
   `Settings -> Advanced Settings` from the top menu.
2. Check for the ``advanced_modules`` policy key, and add
   ``"edly_kwl"``.
3. Click the `"Save changes"` button.


Enabling in Studio
------------------

Settings in studio:

To show `Learned` columns to learner check the marker named `Enable learned column`

Enter details for each step from the studio.

Running the workbench
---------------------
`python manage.py runserver 8000`

Access it at 

`http://localhost:8000/` <http://localhost:8000>.
