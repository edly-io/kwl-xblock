from opaque_keys.edx.keys import CourseKey

from kwl.kwl_djangoapp.signal import store_kwl_signal


def send_kwl_state_update_signal(sender, instance, state):
    store_kwl_signal.send(
        sender=sender,
        course_id=CourseKey.from_string(str(instance.course_id)),
        scope_id=instance.scope_ids.usage_id,
        user=instance.scope_ids.user_id,
        state=state
    )
