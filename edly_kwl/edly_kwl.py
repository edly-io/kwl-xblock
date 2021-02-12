"""Know Wonder Learn Activity XBlock"""
import datetime
import json

from voluptuous import MultipleInvalid
from web_fragments.fragment import Fragment
from webob import Response
from xblock.core import XBlock
from xblock.exceptions import JsonHandlerError
from xblock.fields import String, Scope, List, Any

from edly_kwl.schema import LIST_SCHEMA, CONFIG_SCHEMA
from edly_kwl.utils import render_template, resource_string


class EdlyKWLXBlock(XBlock):
    """
    Know Wonder Learn Activity XBlock
    """

    display_name = String(help="This name appears in horizontal navigation at the top of the page.",
                          default="Edly KWL", scope=Scope.settings)
    __know_items = List(help="Enter details about Know columns description", default=[], scope=Scope.user_info)
    __wonder_items = List(help="Enter details about Know columns description", default=[], scope=Scope.user_info)
    __learned_items = List(help="Enter details about Learned columns description", default=[],
                           scope=Scope.user_info)

    config = Any(scope=Scope.settings, default={
        'knows_help_text': '''
            <p>Step 01: List things you already know about the topic.</p>
            <p><span class="info">For example: Pollution is leading to global warming.</span></p>
        ''',
        'wonder_help_text': '''
            <p>Step 02: List things you wonder about the topic.</p>
            <p><span class="info">For example: What changes can I make to minimize my impact on the environment?</span></p>
        ''',
        'learned_help_text': '''
            <p>Step 01: List things you have learned</p>
            <p><span class="info">For example: Pollution is leading to global warming.</span></p>
        ''',
    })

    @property
    def learned_items(self):
        return self.__learned_items

    @learned_items.setter
    def learned_items(self, val):
        self.__learned_items = val

    @property
    def wonder_items(self):
        return self.__wonder_items

    @wonder_items.setter
    def wonder_items(self, val):
        self.__wonder_items = val

    @property
    def know_items(self):
        return self.__know_items

    @know_items.setter
    def know_items(self, val):
        self.__know_items = val

    def get_context_data(self):
        return dict(knows=self.__know_items, wonder=self.__wonder_items, learned=self.__learned_items,
                    show_learned_column=self.config.get('show_learned_column', False))

    @staticmethod
    def json_response(payload):
        """
        This function is to convert dictionary to json http response object.
        :param payload: dict
        :return: Response
        """

        def default(o):
            if isinstance(o, (datetime.date, datetime.datetime)):
                return o.strftime("%d/%m/%y")

        return Response(json.dumps(payload, default=default), content_type='application/json', charset='UTF-8')

    def save_state(self, state_attr_name, payload):
        try:
            setattr(self, state_attr_name, LIST_SCHEMA(payload))
        except MultipleInvalid as e:
            raise JsonHandlerError(500, str(e))
        return self.get_context_data()

    @XBlock.json_handler
    def save_know_items(self, data, suffix=''):
        return self.save_state('know_items', data)

    @XBlock.json_handler
    def save_learned_items(self, data, suffix=''):
        return self.save_state('learned_items', data)

    @XBlock.json_handler
    def save_wonder_items(self, data, suffix=''):
        return self.save_state('wonder_items', data)

    @XBlock.json_handler
    def update_settings(self, config, suffix=''):

        try:
            self.config = CONFIG_SCHEMA(config)
            self.display_name = config['kwl_display_name']
        except MultipleInvalid as e:
            raise JsonHandlerError(500, str(e))

        return config

    @XBlock.handler
    def get_state(self, request, suffix=''):
        state = self.get_context_data()
        return self.json_response(state)

    # Context argument is specified for xblocks, but we are not using herein
    def student_view(self, context=None):  # pylint: disable=unused-argument
        """
        The primary view of the EdlyKWLXBlock, shown to students
        when viewing courses.
        """

        html = render_template("static/html/edly_kwl.html", {"self": self})
        fragment = Fragment()
        fragment.add_content(html)
        fragment.add_css(resource_string("static/css/edly_kwl.css"))
        fragment.add_javascript(resource_string("static/js/src/edly_kwl.js"))
        fragment.initialize_js('EdlyKWLXBlock')
        return fragment

    def studio_view(self, context=None):
        html = render_template("static/html/edly_kwl_studio.html", {"self": self})
        fragment = Fragment()
        fragment.add_content(html)
        fragment.add_css(resource_string("static/css/edly_kwl_studio.css"))
        fragment.add_javascript(resource_string("static/js/src/edly_kwl_studio.js"))
        fragment.initialize_js('EdlyKWLStudioXBlock')
        return fragment

    # TO-DO: change this to create the scenarios you'd like to see in the
    # workbench while developing your XBlock.
    @staticmethod
    def workbench_scenarios():
        """A canned scenario for display in the workbench."""
        return [
            ("EdlyKWLXBlock",
             """<edly_kwl/>
             """),
            ("Multiple EdlyKWLXBlock",
             """<vertical_demo>
                <edly_kwl/>
                <edly_kwl/>
                <edly_kwl/>
                </vertical_demo>
             """),
        ]
