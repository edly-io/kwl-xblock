from django.apps import AppConfig

from kwl.kwl_djangoapp.signal import store_kwl_handler, store_kwl_signal


class KwlDjangoappConfig(AppConfig):
    name = 'kwl.kwl_djangoapp'

    def ready(self):
        store_kwl_signal.connect(store_kwl_handler)
