"""Setup for kwl XBlock."""

from __future__ import absolute_import

import os

from setuptools import setup


def package_data(pkg, roots):
    """Generic function to find package_data.

    All of the files under each of the `roots` will be declared as package
    data for package `pkg`.

    """
    data = []
    for root in roots:
        for dirname, _, files in os.walk(os.path.join(pkg, root)):
            for fname in files:
                data.append(os.path.relpath(os.path.join(dirname, fname), pkg))

    return {pkg: data}


setup(
    name='kwl-xblock',
    author='Edly',
    version='0.1.0',
    description='kwl XBlock allows users to enter points they already know & wonder '
                'they\'ll learn from course and validate those points at the end of the course',
    license='',
    packages=[
        'kwl',
    ],
    install_requires=[
        'XBlock',
        'voluptuous==0.12.0',
        'web-fragments==0.3.2',
    ],
    entry_points={
        'xblock.v1': [
            'kwl = kwl:KWLXBlock',
        ]
    },
    package_data=package_data("kwl", ["static", "public"]),
)
