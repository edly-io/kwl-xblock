from django.db import models

# Create your models here.
from opaque_keys.edx.django.models import CourseKeyField

TYPE_CHOICES = [('k', 'know'), ('w', 'wonder'), ('l', 'learned')]


class KWLModel(models.Model):
    content = models.CharField(max_length=256)
    type = models.CharField(max_length=1, choices=TYPE_CHOICES)
    dropped_in = models.CharField(max_length=1, choices=TYPE_CHOICES, blank=True)
    sort_order = models.IntegerField()
    user = models.CharField(max_length=500)
    course_id = CourseKeyField(max_length=255, blank=True, null=True, default=None)
    scope_id = models.CharField(max_length=500, blank=True, null=True)
    created_at = models.DateField(auto_now_add=True, blank=True)
    updated_at = models.DateField(auto_now=True, blank=True)
