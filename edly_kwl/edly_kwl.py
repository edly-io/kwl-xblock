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
    __list_know_about = List(help="Enter details about Know columns description", default=[], scope=Scope.user_info)
    __list_wonder_about = List(help="Enter details about Know columns description", default=[], scope=Scope.user_info)
    __list_learned_about = List(help="Enter details about Learned columns description", default=[],
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
    def list_learned_about(self):
        return self.__list_wonder_about

    @list_learned_about.setter
    def list_learned_about(self, val):
        self.__list_learned_about = val

    @property
    def list_wonder_about(self):
        return self.__list_wonder_about

    @list_wonder_about.setter
    def list_wonder_about(self, val):
        self.__list_wonder_about = val

    @property
    def list_know_about(self):
        return self.__list_know_about

    @list_know_about.setter
    def list_know_about(self, val):
        self.__list_know_about = val

    def get_context_data(self):
        return dict(knows=self.__list_know_about, wonder=self.__list_wonder_about, learned=self.__list_learned_about)

    def json_response(self, payload):
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
    def save_what_you_know_about_list(self, data, suffix=''):
        return self.save_state('list_know_about', data)

    @XBlock.json_handler
    def save_what_you_learned_about_list(self, data, suffix=''):
        return self.save_state('list_learned_about', data)

    @XBlock.json_handler
    def save_what_you_wonder_about_list(self, data, suffix=''):
        return self.save_state('list_wonder_about', data)

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
