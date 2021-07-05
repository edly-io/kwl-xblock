from voluptuous import Required, Schema, Optional

CONFIG_SCHEMA = Schema({
    Required('know_title'): str,
    Required('max_inputs'): str,
    Required('wonder_title'): str,
    Required('learned_title'): str,
    Required('knows_help_text'): str,
    Required('wonder_help_text'): str,
    Optional('kwl_display_name'): str,
    Required('learned_help_text'): str,
    Optional('show_learned_column'): str,
})
