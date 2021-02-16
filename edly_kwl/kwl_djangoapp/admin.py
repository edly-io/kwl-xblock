from django.contrib import admin

# Register your models here.
from edly_kwl.kwl_djangoapp.models import KWLModel


class KWLAdminManager(admin.ModelAdmin):
    """This is admin manager for model Goal"""
    list_display = ('id', 'content', 'type', 'dropped_in', 'sort_order')


admin.site.register(KWLModel, KWLAdminManager)
