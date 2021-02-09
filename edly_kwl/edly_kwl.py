"""Know Wonder Learn Activity XBlock"""

from xblock.core import XBlock
from xblock.fields import String, Scope
from web_fragments.fragment import Fragment

from edly_kwl.utils import render_template, resource_string


class EdlyKWLXBlock(XBlock):
    """
    Know Wonder Learn Activity XBlock
    """

    display_name = String(help="This name appears in horizontal navigation at the top of the page.",
                          default="Edly KWL",
                          scope=Scope.content)
    know_text = String(help="Enter details about Know columns description",
                       default="Step1, Enter things that you already know about this topic",
                       scope=Scope.content)
    wonder_text = String(help="Enter details about Know columns description",
                         default="Step 2, Enter things that you wonder about this topic",
                         scope=Scope.content)
    learned_text = String(help="Enter details about Learned columns description",
                          default="Step 3, Move the things that you have learned during this training to Learned column",
                          scope=Scope.content)

    # Context argument is specified for xblocks, but we are not using herein
    def student_view(self, context=None):   # pylint: disable=unused-argument
        """
        The primary view of the EdlyKWLXBlock, shown to students
        when viewing courses.
        """

        html = render_template("static/html/edly_kwl.html",
                               {"self": self})
        fragment = Fragment()
        fragment.add_content(html)
        fragment.add_css(resource_string("static/css/edly_kwl.css"))
        fragment.add_javascript(resource_string("static/js/src/edly_kwl.js"))
        fragment.initialize_js('EdlyKWLXBlock')
        return fragment

    # TO-DO: change this handler to perform your own actions.  You may need more
    # than one handler, or you may not need any handlers at all.
    @XBlock.json_handler
    def increment_count(self, data, suffix=''):
        """
        An example handler, which increments the data.
        """
        # Just to show data coming in...
        assert data['hello'] == 'world'

        self.count += 1
        return {"count": self.count}

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
