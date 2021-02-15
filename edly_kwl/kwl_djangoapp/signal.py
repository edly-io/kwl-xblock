from django.apps import apps
from django.dispatch import Signal

store_kwl_signal = Signal(providing_args=['scope_id', 'user', 'state', 'course_id', 'type'])


def store_kwl_handler(sender, **kwargs):
    KWLModel = apps.get_model('kwl_djangoapp', 'KWLModel')
    filter = dict(type=kwargs.get('type'), user=kwargs.get('user'), course_id=kwargs.get('course_id'))
    KWLModel.objects.filter(**filter).delete()

    for kwl_object in kwargs.get('state'):
        KWLModel.objects.create(
            scope_id=kwargs.get('scope_id'),
            user=kwargs.get('user'),
            course_id=kwargs.get('course_id'),
            type=kwargs.get('type'),
            content=kwl_object['content'],
            sort_order=kwl_object['sort_order'],
        )
