"""Setup for edly_kwl XBlock."""

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
    name='edly_kwl-xblock',
    author='Edly Enterprise',
    version='0.1.0',
    description='edly_kwl XBlock allows users to enter points they already know & wonder '
                'they\'ll learn from course and validate those points at the end of the course',
    license='',
    packages=[
        'edly_kwl',
    ],
    install_requires=[
        'XBlock',
        'lxml==4.5.0',
        'voluptuous==0.11.7',
        'web-fragments==0.3.2',
        'edx-opaque-keys==2.0.2'
    ],
    entry_points={
        'xblock.v1': [
            'edly_kwl = edly_kwl:EdlyKWLXBlock',
        ]
    },
    package_data=package_data("edly_kwl", ["static", "public"]),
)
