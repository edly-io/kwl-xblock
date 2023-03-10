"""Know Wonder Learn Activity XBlock"""
import datetime
from json import JSONEncoder

from django.apps import apps
from opaque_keys.edx.keys import CourseKey
from voluptuous import MultipleInvalid
from web_fragments.fragment import Fragment
from webob import Response
from xblock.core import XBlock
from xblock.exceptions import JsonHandlerError
from xblock.fields import String, Scope, Any

from kwl.kwl_djangoapp.utils import send_kwl_state_update_signal
from kwl.schema import CONFIG_SCHEMA
from kwl.utils import render_template, resource_string


class KWLXBlock(XBlock):
    """
    Know Wonder Learn Activity XBlock
    """

    has_score = True

    display_name = String(help="This name appears in horizontal navigation at the top of the page.",
                          default="Know-Wonder-Learn", scope=Scope.settings)
    config = Any(scope=Scope.settings, default={
        'know_title': 'Know',
        'wonder_title': 'Wonder',
        'learned_title': 'Learned',
        'knows_help_text': '''
            <p>Step 01: List things you already know about the topic.</p>
            <p><span class="info">For example: Pollution is leading to global warming.</span></p>
        ''',
        'wonder_help_text': '''
            <p>Step 02: List things you wonder about the topic.</p>
            <p><span class="info">For example: What changes can I make to minimize my impact on the environment?</span></p>
        ''',
        'learned_help_text': '''
            <p>Step 03: List things you have learned</p>
            <p><span class="info">For example: Pollution is leading to global warming.</span></p>
        ''',
    })

    def get_kel_data(self):
        KWLModel = apps.get_model('kwl_djangoapp', 'KWLModel')
        return KWLModel.objects.filter(course_id=CourseKey.from_string(str(self.course_id)),
                                       user=self.scope_ids.user_id)

    @property
    def show_learned_column(self):
        return self.config.get('show_learned_column', False)

    @property
    def max_inputs(self):
        return self.config.get('max_inputs', 3)

    @property
    def list_learned_about(self):
        return list(self.get_kel_data().filter(dropped_in='l'))

    @property
    def list_wonder_about(self):
        return list(self.get_kel_data().filter(dropped_in='w'))

    @property
    def list_know_about(self):
        return list(self.get_kel_data().filter(dropped_in='k'))

    def get_context_data(self):
        return {
            "knows": self.list_know_about,
            "wonder": self.list_wonder_about,
            "learned": self.list_learned_about,
            "show_learned_column": self.show_learned_column,
            "max_inputs": self.max_inputs
        }

    @staticmethod
    def json_response(payload):
        """
        This function is to convert dictionary to json http response object.
        :param payload: dict
        :return: Response
        """
        class CustomJSONEncoder(JSONEncoder):
            def default(self, o):
                if isinstance(o, datetime.date):
                    return {'year': o.year, 'month': o.month, 'day': o.day}
                return o.__dict__
        return Response(CustomJSONEncoder().encode(payload), content_type='application/json', charset='UTF-8')

    def update_state(self, payload):
        try:
            send_kwl_state_update_signal(sender=KWLXBlock, instance=self, state=payload)
            self.runtime.publish(self, "grade", {'max_value': 1.0, 'value': 1.0})
        except MultipleInvalid as e:
            raise JsonHandlerError(500, str(e)) from e
        return self.get_context_data()

    @XBlock.json_handler
    def create_update_item(self, data, suffix=''):  # pylint: disable=unused-argument
        return self.json_response(self.update_state(data))

    @XBlock.json_handler
    def update_settings(self, config, suffix=''):  # pylint: disable=unused-argument

        try:
            self.config = CONFIG_SCHEMA(config)
            self.display_name = config['kwl_display_name']
        except MultipleInvalid as e:
            raise JsonHandlerError(500, str(e)) from e

        return config

    @XBlock.handler
    def get_state(self, request, suffix=''):  # pylint: disable=unused-argument
        state = self.get_context_data()
        return self.json_response(state)

    # Context argument is specified for xblocks, but we are not using herein
    def student_view(self, context=None):  # pylint: disable=unused-argument
        """
        The primary view of the KWLXBlock, shown to students
        when viewing courses.
        """

        html = render_template("static/html/kwl.html", {"self": self})
        fragment = Fragment()
        fragment.add_content(html)
        fragment.add_css(resource_string("static/css/kwl.css"))
        fragment.add_javascript(resource_string("static/js/src/kwl.js"))
        fragment.initialize_js('KWLXBlock')
        return fragment

    def studio_view(self, context=None):  # pylint: disable=unused-argument
        html = render_template("static/html/kwl_studio.html", {"self": self})
        fragment = Fragment()
        fragment.add_content(html)
        fragment.add_css(resource_string("static/css/kwl_studio.css"))
        fragment.add_javascript(resource_string("static/js/src/kwl_studio.js"))
        fragment.initialize_js('KWLStudioXBlock')
        return fragment

    @staticmethod
    def workbench_scenarios():
        """A canned scenario for display in the workbench."""
        return [
            ("KWLXBlock",
             """<kwl/>
             """),
            ("Multiple KWLXBlock",
             """<vertical_demo>
                <kwl/>
                <kwl/>
                <kwl/>
                </vertical_demo>
             """),
        ]
