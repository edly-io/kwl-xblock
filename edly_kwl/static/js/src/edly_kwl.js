/* Javascript for EdlyKWLXBlock. */
function EdlyKWLXBlock(runtime, element) {
    var _EdlyKWLXBlock = this, state = {};
    _EdlyKWLXBlock.element = element;
    _EdlyKWLXBlock.runtime = runtime;

    // Add urls here.
    _EdlyKWLXBlock.URL = {
        GET_STATE: runtime.handlerUrl(element, 'get_state'),
        SAVE_YOU_KNOW_ABOUT: runtime.handlerUrl(element, 'save_what_you_know_about_list'),
        SAVE_YOU_LEARNED_ABOUT: runtime.handlerUrl(element, 'save_what_you_learned_about_list'),
        SAVE_YOU_WONDER_ABOUT: runtime.handlerUrl(element, 'save_what_you_wonder_about_list'),
    }

    _EdlyKWLXBlock.Selector = {
        ITEM_EDIT_AREA: 'span.textarea[contenteditable]',
        KNOW_ABOUT_LIST: 'div.knows',
        WONDER_ABOUT_LIST: 'div.wonder',
        LEARNED_ABOUT_LIST: 'div.learned',
        ADD_NEW_ITEM_BUTTON: 'button.add_field_button',
        LIST_VIEW_ITEM_TEMPLATE: 'script[name="item-template"]',
        LIST_VIEW_CONTAINER: '.list-container-view',
    }

    _EdlyKWLXBlock.View = {
        KNOW_ABOUT_LIST: $(_EdlyKWLXBlock.Selector.KNOW_ABOUT_LIST, element),
        WONDER_ABOUT_LIST: $(_EdlyKWLXBlock.Selector.WONDER_ABOUT_LIST, element),
        LEARNED_ABOUT_LIST: $(_EdlyKWLXBlock.Selector.LEARNED_ABOUT_LIST, element),
        ADD_NEW_ITEM_BUTTON: $(_EdlyKWLXBlock.Selector.ADD_NEW_ITEM_BUTTON, element),
        LIST_VIEW_ITEM_TEMPLATE: $($(_EdlyKWLXBlock.Selector.LIST_VIEW_ITEM_TEMPLATE, element).clone())
    }

    $(function ($) {
        /* Here's where you'd do things on page load. */

        $('.textarea').focus(function () {
            $(this).parent('.edly_kwl_block .field-row').addClass('focus');
        });

        $('.textarea').blur(function () {
            $(this).parent('.edly_kwl_block .field-row').removeClass('focus');
        });

        _EdlyKWLXBlock.init();
        _EdlyKWLXBlock.updateState(function (res) {
            _EdlyKWLXBlock.updateListView(element, _EdlyKWLXBlock.View.KNOW_ABOUT_LIST, _EdlyKWLXBlock.state['knows']);
            _EdlyKWLXBlock.updateListView(element, _EdlyKWLXBlock.View.WONDER_ABOUT_LIST, _EdlyKWLXBlock.state['wonder']);
            _EdlyKWLXBlock.updateListView(element, _EdlyKWLXBlock.View.LEARNED_ABOUT_LIST, _EdlyKWLXBlock.state['learned']);
        });
    });
}

EdlyKWLXBlock.prototype.init = function () {
    var _EdlyKWLXBlock = this;

    $(_EdlyKWLXBlock.View.ADD_NEW_ITEM_BUTTON).click(function (event) {
        _EdlyKWLXBlock.addListItem(this);
    });

    $(_EdlyKWLXBlock.View.KNOW_ABOUT_LIST).data('save-url', _EdlyKWLXBlock.URL.SAVE_YOU_KNOW_ABOUT);
    $(_EdlyKWLXBlock.View.WONDER_ABOUT_LIST).data('save-url', _EdlyKWLXBlock.URL.SAVE_YOU_WONDER_ABOUT);
    $(_EdlyKWLXBlock.View.LEARNED_ABOUT_LIST).data('save-url', _EdlyKWLXBlock.URL.SAVE_YOU_LEARNED_ABOUT);
}

EdlyKWLXBlock.prototype.updateState = function (cb) {
    var _EdlyKWLXBlock = this;
    $.get(_EdlyKWLXBlock.URL.GET_STATE, function (res) {
        _EdlyKWLXBlock.state = res;
        if (cb)
            cb(res);
    });
}

EdlyKWLXBlock.prototype.updateListView = function (element, view, list) {
    var _EdlyKWLXBlock = this;
    $(view).empty();
    $.each(list, function (index, item) {
        var itemView = $(_EdlyKWLXBlock.View.LIST_VIEW_ITEM_TEMPLATE.text());
        var $editable = $(_EdlyKWLXBlock.Selector.ITEM_EDIT_AREA, itemView);

        $editable.text(item.text).attr('data-index', $(view).data('index'));

        $editable.focusout(function (e) {
            _EdlyKWLXBlock.save(this);
        });

        $(view).append(itemView);
    });
}

EdlyKWLXBlock.prototype.toJson = function (listView) {
    var _EdlyKWLXBlock = this;
    var list = [];
    $(_EdlyKWLXBlock.Selector.ITEM_EDIT_AREA, listView).each(function (index, item) {
        var text = $(this).text().trim();
        if (text)
            list.push({sort_order: index, text: text});
    });
    return list;
}

EdlyKWLXBlock.prototype.addListItem = function (targetEle) {
    var _EdlyKWLXBlock = this;
    var data = $(targetEle).data(), $target = $(data.target, _EdlyKWLXBlock.element);
    var itemView = $(_EdlyKWLXBlock.View.LIST_VIEW_ITEM_TEMPLATE.text());
    var $editable = $(_EdlyKWLXBlock.Selector.ITEM_EDIT_AREA, itemView);

    $editable.attr({'data-index': data.index});
    $editable.focusout(function (e) {
        _EdlyKWLXBlock.save(this);
    });

    $($target).append(itemView);
}

EdlyKWLXBlock.prototype.save = function (targetElement) {
    var _EdlyKWLXBlock = this;
    var listView = $(targetElement).closest(_EdlyKWLXBlock.Selector.LIST_VIEW_CONTAINER);
    var data = $(listView).data();
    var url = data.saveUrl, index = data.index;

    var payload = _EdlyKWLXBlock.toJson(listView);

    _EdlyKWLXBlock.submit(url, payload, function (res) {
        _EdlyKWLXBlock.state[index] = payload;
        _EdlyKWLXBlock.updateListView(_EdlyKWLXBlock.element, listView, _EdlyKWLXBlock.state[index]);
    });
}

EdlyKWLXBlock.prototype.submit = function (url, payload, cb) {
    $.post(url, JSON.stringify(payload)).done(function (res) {
        if (cb)
            cb(res);
    });
}
