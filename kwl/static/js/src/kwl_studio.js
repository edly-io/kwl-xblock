function KWLStudioXBlock(runtime, element) {
    var _KWLStudioXBlock = this;

    _KWLStudioXBlock.element = element;
    _KWLStudioXBlock.runtime = runtime;
    _KWLStudioXBlock.notify = typeof (runtime.notify) !== 'undefined';

    // Add urls here.
    _KWLStudioXBlock.URL = {
        UPDATE_SETTINGS: runtime.handlerUrl(element, 'update_settings')
    }

    _KWLStudioXBlock.Selector = {
        SUBMIT_BUTTON: 'button.save-button[type="submit"]',
        STUDIO_FORM: '#kwl-configs',
    }

    _KWLStudioXBlock.View = {
        SUBMIT_BUTTON: $(_KWLStudioXBlock.Selector.SUBMIT_BUTTON, element),
        STUDIO_FORM: $(_KWLStudioXBlock.Selector.STUDIO_FORM, element),
    }


    $(function ($) {
        _KWLStudioXBlock.init($);
    });
}

KWLStudioXBlock.prototype.init = function ($) {
    var _KWLStudioXBlock = this;

    $(_KWLStudioXBlock.View.STUDIO_FORM).submit(function (e) {
        e.preventDefault();
        var formData = _KWLStudioXBlock.toJson(this);
        var config = {
            success: function (res) {
                if (_KWLStudioXBlock.notify) {
                    _KWLStudioXBlock.runtime.notify('save', {state: 'end'});
                }
            }
        };
        if (_KWLStudioXBlock.notify) {
            _KWLStudioXBlock.runtime.notify('save', {state: 'start', message: 'Saving'});
        }
        _KWLStudioXBlock.submit(_KWLStudioXBlock.URL.UPDATE_SETTINGS, formData, config);
        return false;
    });

}

KWLStudioXBlock.prototype.toJson = function (form) {
    var serializedArray = $(form).serializeArray(), data = {};
    $.each(serializedArray, function (index, item) {
        data[item.name] = item.value;
    });

    return data;
}

KWLStudioXBlock.prototype.submit = function (url, formData, config = undefined) {
    var _config = {
        url: url,
        type: "POST",
        contentType: false,
        cache: false,
        processData: false,
        data: JSON.stringify(formData)
    };
    _config = $.extend({}, _config, config);
    $.ajax(_config);
}

KWLStudioXBlock.prototype.save = function () {
    var _KWLStudioXBlock = this;

    $(_KWLStudioXBlock.View.STUDIO_FORM).submit();
}
