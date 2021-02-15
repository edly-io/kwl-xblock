from voluptuous import Required, Schema, Optional

LIST_SCHEMA = Schema([
    Schema({
        Required('content'): str,
        Required('sort_order'): int,
    })
])

CONFIG_SCHEMA = Schema({
    Required('knows_help_text'): str,
    Required('wonder_help_text'): str,
    Required('learned_help_text'): str,
    Optional('show_learned_column'): str,
    Optional('kwl_display_name'): str,
})
