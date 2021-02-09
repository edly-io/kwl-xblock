from voluptuous import Invalid, Required, Schema

LIST_SCHEMA = Schema([
    Schema({
        Required('text'): str,
        Required('sort_order'): int
    })
])
