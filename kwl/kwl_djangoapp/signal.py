from django.apps import apps
from django.dispatch import Signal

store_kwl_signal = Signal(providing_args=['scope_id', 'user', 'state', 'course_id'])


def store_kwl_handler(sender, **kwargs):  # pylint: disable=unused-argument
    KWLModel = apps.get_model('kwl_djangoapp', 'KWLModel')
    state = kwargs.get('state')
    item_id = state.get('id', None)
    user = kwargs.get('user')
    content = state.get('content')
    course_id = kwargs.get('course_id')
    content_empty = content == ""
    if item_id:  # Item already created
        desired_model = KWLModel.objects.filter(id=item_id, user=user, course_id=course_id)
        desired_model.delete() if content_empty else desired_model.update(
            dropped_in=state.get('dropped_in'), content=content)

    elif not content_empty:
        KWLModel.objects.create(
            scope_id=kwargs.get('scope_id'),
            user=user,
            course_id=course_id,
            type=state.get('type'),
            dropped_in=state.get('type'),
            content=content,
            sort_order=state.get('sort_order'),
        )
