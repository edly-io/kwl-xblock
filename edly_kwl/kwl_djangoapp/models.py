from django.db import models

# Create your models here.
from opaque_keys.edx.django.models import CourseKeyField


class KWLModel(models.Model):
    content = models.TextField()
    type = models.CharField(max_length=1, choices=[('k', 'know'), ('w', 'wonder'), ('l', 'learned')])
    sort_order = models.IntegerField()
    user = models.CharField(max_length=500)
    course_id = CourseKeyField(max_length=255, blank=True, null=True, default=None)
    scope_id = models.CharField(max_length=500, blank=True, null=True)
    created_at = models.DateField(blank=True, null=True)
