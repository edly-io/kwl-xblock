from django.apps import AppConfig

from edly_kwl.kwl_djangoapp.signal import store_kwl_handler, store_kwl_signal


class KwlDjangoappConfig(AppConfig):
    name = 'edly_kwl.kwl_djangoapp'

    def ready(self):
        store_kwl_signal.connect(store_kwl_handler)
