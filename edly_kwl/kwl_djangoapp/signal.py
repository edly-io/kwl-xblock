from django.apps import apps
from django.dispatch import Signal

store_kwl_signal = Signal(providing_args=['scope_id', 'user', 'state', 'course_id'])


def store_kwl_handler(sender, **kwargs):
    KWLModel = apps.get_model('kwl_djangoapp', 'KWLModel')
    state = kwargs.get('state')
    item_id = state.get('id', None)
    if item_id: # Item already created, update dropped_in location
        KWLModel.objects.filter(id=item_id).update(dropped_in=state.get('dropped_in'))
    else:
        KWLModel.objects.create(
            scope_id=kwargs.get('scope_id'),
            user=kwargs.get('user'),
            course_id=kwargs.get('course_id'),
            type=state.get('type'),
            dropped_in=state.get('type'),
            content=state.get('content'),
            sort_order=state.get('sort_order'),
        )

