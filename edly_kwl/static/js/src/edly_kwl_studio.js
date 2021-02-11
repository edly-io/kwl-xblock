function EdlyKWLStudioXBlock(runtime, element) {
    var _EdlyKWLStudioXBlock = this;

    _EdlyKWLStudioXBlock.element = element;
    _EdlyKWLStudioXBlock.runtime = runtime;

    // Add urls here.
    _EdlyKWLStudioXBlock.URL = {
        UPDATE_SETTINGS: runtime.handlerUrl(element, 'update_settings')
    }

    _EdlyKWLStudioXBlock.Selector = {
        SUBMIT_BUTTON: 'button.save-button[type="submit"]',
        STUDIO_FORM: '#edly-kwl-configs',
    }

    _EdlyKWLStudioXBlock.View = {
        SUBMIT_BUTTON: $(_EdlyKWLStudioXBlock.Selector.SUBMIT_BUTTON, element),
        STUDIO_FORM: $(_EdlyKWLStudioXBlock.Selector.STUDIO_FORM, element),
    }


    $(function ($) {
        _EdlyKWLStudioXBlock.init($);
    });
}

EdlyKWLStudioXBlock.prototype.init = function ($) {
    var _EdlyKWLStudioXBlock = this;

    $(_EdlyKWLStudioXBlock.View.STUDIO_FORM).submit(function (e) {
        e.preventDefault();
        var formData = _EdlyKWLStudioXBlock.toJson(this);
        var config = {
            success: function (res) {
            //    TODO notify and close the studio view.
            }
        };
        _EdlyKWLStudioXBlock.submit(_EdlyKWLStudioXBlock.URL.UPDATE_SETTINGS, formData, config);
        return false;
    });

}

EdlyKWLStudioXBlock.prototype.toJson = function (form) {
    var serializedArray = $(form).serializeArray(), data = {};
    console.log(serializedArray)
    $.each(serializedArray, function (index, item) {
        data[item.name] = item.value
    });

    return data;
}

EdlyKWLStudioXBlock.prototype.submit = function (url, formData, config = undefined) {
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
