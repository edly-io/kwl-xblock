# Generated by Django 2.2.14 on 2021-02-25 11:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('kwl_djangoapp', '0002_auto_20210215_2239'),
    ]

    operations = [
        migrations.AlterField(
            model_name='kwlmodel',
            name='content',
            field=models.CharField(max_length=256),
        ),
    ]
