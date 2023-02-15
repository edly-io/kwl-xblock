from re import search
from django.template import Context, Template
from pkg_resources import resource_string as pkg_resource_string


def check_rtl_characters_in_string(string):
    """"
    check if the string contains rtl character or not
    :param string: (str) string value to check

    :return: (bool) True | False i.e True if contains
    """

    urdu_characters_pattern = r'[\u0600-\u06ff]'
    matched_groups = search(urdu_characters_pattern, string)
    return 'rtl' if matched_groups is not None else 'ltr'


def resource_string(path):
    """Handy helper for getting resources from our kit.
    :param path: (str) path of the resource to load

    :return: (str) encoded resource path
    """
    data = pkg_resource_string(__name__, path)
    return data.decode("utf8")


def render_template(template_path, context):
    """
    render resorce using django template engine and the give content object to it.
    :param template_path: (str) path of the resource to load
    :param context: {} dic object to pass to django template

    :return: template.render
    """
    template_str = resource_string(template_path)
    template = Template(template_str)
    return template.render(Context(context))
