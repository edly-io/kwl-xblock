/* Javascript for EdlyKWLXBlock. */
function EdlyKWLXBlock(runtime, element) {
    var _EdlyKWLXBlock = this, state = {};
    _EdlyKWLXBlock.element = element;
    _EdlyKWLXBlock.runtime = runtime;
    _EdlyKWLXBlock.showLearned = false;

    // Add urls here.
    _EdlyKWLXBlock.URL = {
        GET_STATE: runtime.handlerUrl(element, 'get_state'),
        SAVE_KNOW_ITEMS_LIST: runtime.handlerUrl(element, 'save_know_items'),
        SAVE_LEARNED_ITEMS_LIST: runtime.handlerUrl(element, 'save_learned_items'),
        SAVE_WONDER_ITEMS_LIST: runtime.handlerUrl(element, 'save_wonder_items'),
    }

    _EdlyKWLXBlock.Selector = {
        ITEM_EDIT_AREA: 'span.textarea[contenteditable]',
        KNOW_ITEMS: '#know-container',
        WONDER_ITEMS: '#wonder-container',
        LEARNED_ITEMS: '#learned-container',
        ADD_NEW_ITEM_BUTTON: 'button.add_field_button',
        LIST_VIEW_ITEM_TEMPLATE: 'script[name="item-template"]',
        LIST_VIEW_CONTAINER: '.list-container-view',
    }

    _EdlyKWLXBlock.View = {
        KNOW_ITEMS_DIV: $(_EdlyKWLXBlock.Selector.KNOW_ITEMS, element),
        WONDER_ITEMS_DIV: $(_EdlyKWLXBlock.Selector.WONDER_ITEMS, element),
        LEARNED_ITEMS_DIV: $(_EdlyKWLXBlock.Selector.LEARNED_ITEMS, element),
        ADD_NEW_ITEM_BUTTON: $(_EdlyKWLXBlock.Selector.ADD_NEW_ITEM_BUTTON, element),
        LIST_VIEW_ITEM_TEMPLATE: $($(_EdlyKWLXBlock.Selector.LIST_VIEW_ITEM_TEMPLATE, element).clone())
    }

    function getState(key) {
        return _EdlyKWLXBlock.state[key]
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
            _EdlyKWLXBlock.showLearned = getState('show_learned_column')
            _EdlyKWLXBlock.updateListView(element, _EdlyKWLXBlock.View.KNOW_ITEMS_DIV, getState('knows'));
            _EdlyKWLXBlock.updateListView(element, _EdlyKWLXBlock.View.WONDER_ITEMS_DIV, getState('wonder'));
            _EdlyKWLXBlock.updateListView(element, _EdlyKWLXBlock.View.LEARNED_ITEMS_DIV, getState('learned'));
        });

        $('#learned-container, #wonder-container, #know-container' ).droppable( {
            hoverClass: 'hovered',
            drop: function(event, ui) {
                _EdlyKWLXBlock.handleItemDrop(event, ui);
            }
        });
    });
}

EdlyKWLXBlock.prototype.init = function () {
    var _EdlyKWLXBlock = this;

    $(_EdlyKWLXBlock.View.ADD_NEW_ITEM_BUTTON).click(function (event) {
        _EdlyKWLXBlock.addListItem(this);
    });

    $(_EdlyKWLXBlock.View.KNOW_ITEMS_DIV).data('save-url', _EdlyKWLXBlock.URL.SAVE_KNOW_ITEMS_LIST);
    $(_EdlyKWLXBlock.View.WONDER_ITEMS_DIV).data('save-url', _EdlyKWLXBlock.URL.SAVE_WONDER_ITEMS_LIST);
    $(_EdlyKWLXBlock.View.LEARNED_ITEMS_DIV).data('save-url', _EdlyKWLXBlock.URL.SAVE_LEARNED_ITEMS_LIST);
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
        var editable = $(_EdlyKWLXBlock.Selector.ITEM_EDIT_AREA, itemView);
        var viewIndex = $(view).data('index')
        editable.text(item.text).attr({'data-index': viewIndex, 'data-type': item.type});
        $(itemView).attr("id", viewIndex+index)
        var divClassToAdd = "editable"
        // Learned items shouldn't be dragged
        if (_EdlyKWLXBlock.showLearned && item.type != 'learned') {
            _EdlyKWLXBlock.makeDraggable(itemView)
            divClassToAdd = "movable"
        }
        $(itemView).addClass(divClassToAdd);

        editable.focusout(function (e) {
            _EdlyKWLXBlock.save(this);
        });

        $(view).append(itemView);
    });
}

EdlyKWLXBlock.prototype.makeDraggable = function (item, targetDivID="learned-container") {
    var _EdlyKWLXBlock = this;
    $(item).draggable({
        containment: "#kwl_content",
        snap: "#kwl_content",
        stack: '#'+ targetDivID,
        cursor: 'auto',
        revert: true,
        helper: 'clone',
        zIndex: '2700',
        opacity: 0.8,
        start: _EdlyKWLXBlock.handleItemDragStart
    });
}

EdlyKWLXBlock.prototype.toJson = function (listView) {
    var _EdlyKWLXBlock = this;
    var list = [];
    $(_EdlyKWLXBlock.Selector.ITEM_EDIT_AREA, listView).each(function (index, item) {
        var text = $(this).text().trim();
        if (text)
            list.push({sort_order: index, text: text, type: $(this).attr("data-type")});
    });
    return list;
}

EdlyKWLXBlock.prototype.addListItem = function (targetEle) {
    var _EdlyKWLXBlock = this;
    var data = $(targetEle).data(), target = $(data.target, _EdlyKWLXBlock.element);
    var itemView = $(_EdlyKWLXBlock.View.LIST_VIEW_ITEM_TEMPLATE.text());
    var editable = $(_EdlyKWLXBlock.Selector.ITEM_EDIT_AREA, itemView);
    $(itemView).attr("id", data.index+$(target).children().length);
    editable.attr({'data-index': data.index, 'data-type': data.index});
    editable.focusout(function (e) {
        _EdlyKWLXBlock.save(this);
    });

    $(target).append(itemView);
}

EdlyKWLXBlock.prototype.save = function (targetElement) {
    var _EdlyKWLXBlock = this;
    var listView = $(targetElement).closest(_EdlyKWLXBlock.Selector.LIST_VIEW_CONTAINER);
    _EdlyKWLXBlock.saveList(listView)
}

EdlyKWLXBlock.prototype.saveList = function (targetListView) {
    var _EdlyKWLXBlock = this;
    var data = $(targetListView).data();

    var url = data.saveUrl, index = data.index;
    var payload = _EdlyKWLXBlock.toJson(targetListView);
    _EdlyKWLXBlock.submit(url, payload, function (res) {
        _EdlyKWLXBlock.state[index] = payload;
        _EdlyKWLXBlock.updateListView(_EdlyKWLXBlock.element, targetListView, _EdlyKWLXBlock.state[index]);
    });
}

EdlyKWLXBlock.prototype.submit = function (url, payload, cb) {
    $.post(url, JSON.stringify(payload)).done(function (res) {
        if (cb)
            cb(res);
    });
}

EdlyKWLXBlock.prototype.handleItemDragStart = function (event, ui) {
    ui.helper.css({'width' : $(this).css('width'), 'height' : $(this).css('height')});
}

EdlyKWLXBlock.prototype.handleItemDrop = function (event, ui) {
    console.log("Handle card drop")
    var _EdlyKWLXBlock = this;
    var draggedItem = ui.draggable;
    var dragItemList = draggedItem.parent();
    var dropList = event.target;
    var dragListID = $(dragItemList).attr("id"), dropListID = $(dropList).attr("id")

    if (dragListID === dropListID) {
        draggedItem.draggable('option', 'revert', true);
        return
    }
    console.log(draggedItem.attr("id"));
    var clone = $(draggedItem).clone();
    draggedItem.draggable('option', 'revert', false);
    $(draggedItem).remove()
    $(dropList).append(clone);
    // Reverse the drop region, to make it draggable again.
    _EdlyKWLXBlock.makeDraggable(clone, dragListID)

    _EdlyKWLXBlock.saveList(dropList)
    $.when($(draggedItem).remove()).then(function(_EdlyKWLXBlock){
        _EdlyKWLXBlock.saveList(dragItemList)
    })

}
