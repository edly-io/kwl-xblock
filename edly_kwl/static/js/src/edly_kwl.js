/* Javascript for EdlyKWLXBlock. */
function EdlyKWLXBlock(runtime, element) {
    var _EdlyKWLXBlock = this, state = {};
    _EdlyKWLXBlock.element = element;
    _EdlyKWLXBlock.runtime = runtime;
    _EdlyKWLXBlock.showLearned = false;

    // Add urls here.
    _EdlyKWLXBlock.URL = {
        GET_STATE: runtime.handlerUrl(element, 'get_state'),
        CREATE_UPDATE_ITEM: runtime.handlerUrl(element, 'create_update_item'),
    }

    _EdlyKWLXBlock.Selector = {
        ITEM_EDIT_AREA: 'span.textarea[contenteditable]',
        KNOW_ITEMS: '#know-container',
        WONDER_ITEMS: '#wonder-container',
        LEARNED_ITEMS: '#learned-container',
        ADD_NEW_ITEM_BUTTON: 'button.add_field_button',
        LIST_VIEW_ITEM_TEMPLATE: 'script[name="item-template"]',
        LIST_VIEW_CONTAINER: '.list-container-view',
        DROPPABLE_COLUMNS: '#column-know, #column-wonder, #column-learned',
    }

    _EdlyKWLXBlock.View = {
        KNOW_ITEMS_DIV: $(_EdlyKWLXBlock.Selector.KNOW_ITEMS, element),
        WONDER_ITEMS_DIV: $(_EdlyKWLXBlock.Selector.WONDER_ITEMS, element),
        LEARNED_ITEMS_DIV: $(_EdlyKWLXBlock.Selector.LEARNED_ITEMS, element),
        ADD_NEW_ITEM_BUTTON: $(_EdlyKWLXBlock.Selector.ADD_NEW_ITEM_BUTTON, element),
        LIST_VIEW_ITEM_TEMPLATE: $($(_EdlyKWLXBlock.Selector.LIST_VIEW_ITEM_TEMPLATE, element).clone()),
        DROPPABLE_COLUMNS: $(_EdlyKWLXBlock.Selector.DROPPABLE_COLUMNS, element)
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

        _EdlyKWLXBlock.View.DROPPABLE_COLUMNS.droppable( {
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

    $(_EdlyKWLXBlock.View.KNOW_ITEMS_DIV).data('save-url', _EdlyKWLXBlock.URL.CREATE_UPDATE_ITEM);
    $(_EdlyKWLXBlock.View.WONDER_ITEMS_DIV).data('save-url', _EdlyKWLXBlock.URL.CREATE_UPDATE_ITEM);
    $(_EdlyKWLXBlock.View.LEARNED_ITEMS_DIV).data('save-url', _EdlyKWLXBlock.URL.CREATE_UPDATE_ITEM);
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
        editable.text(item.content).attr({'data-index': viewIndex, 'data-type': item.type,
                                          'data-id': item.id, 'data-dropped': item.dropped_in});
        $(itemView).attr("id", index)
        var divClassToAdd = "editable"
        // Learned items shouldn't be dragged
        if (_EdlyKWLXBlock.showLearned && item.type != 'l') {
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

EdlyKWLXBlock.prototype.toItemJson = function (targetItem) {
    var _EdlyKWLXBlock = this;
    return {'sort_order': 1, content: targetItem.textContent.trim(),
            type: $(targetItem).attr("data-type"), id: $(targetItem).attr("data-id"),
            "dropped_in": $(targetItem).attr("data-dropped")}
}

EdlyKWLXBlock.prototype.addListItem = function (targetEle) {
    var _EdlyKWLXBlock = this;
    var data = $(targetEle).data(), target = $(data.target, _EdlyKWLXBlock.element);
    var itemView = $(_EdlyKWLXBlock.View.LIST_VIEW_ITEM_TEMPLATE.text());
    var editable = $(_EdlyKWLXBlock.Selector.ITEM_EDIT_AREA, itemView);
    $(itemView).attr("id", data.index+$(target).children().length);
    $(itemView).addClass("editable");
    var index = data.index;
    editable.attr({'data-index': index, 'data-type': index.charAt(0)});
    editable.focusout(function (e) {
        _EdlyKWLXBlock.save(this);
    });

    $(target).append(itemView);
}


EdlyKWLXBlock.prototype.save = function (targetElement) {
    var _EdlyKWLXBlock = this;
    var listView = $(targetElement).closest(_EdlyKWLXBlock.Selector.LIST_VIEW_CONTAINER);
    _EdlyKWLXBlock.saveItem(listView, targetElement)
}

EdlyKWLXBlock.prototype.saveItem = function (targetListView, targetElement) {
    var _EdlyKWLXBlock = this;
    var data = $(targetListView).data();
    var url = data.saveUrl, index = data.index;
    var payload = _EdlyKWLXBlock.toItemJson(targetElement);

    if (targetElement.textContent.trim() === "") {
        $(targetElement.parentElement).remove()
        if (typeof payload["id"] === 'undefined') {
            return
        }
    }

    _EdlyKWLXBlock.submit(url, payload, function (res) {
        _EdlyKWLXBlock.state[index] = res[index];
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

EdlyKWLXBlock.prototype.getObject = function(el) {
    if (typeof jQuery === "function" && el instanceof jQuery) {
        el = el[0];
    }
    return el
}

EdlyKWLXBlock.prototype.isDropRestricted = function(dragList, dropList, type) {
    var _EdlyKWLXBlock = this;
    var droppedIndex = $(dropList).attr("data-index")
    var draggedIndex = $(dragList).attr("data-index")
    var restricedDrops = "knows wonder"
    var dragListID = $(dragList).attr("id"), dropListID = $(dropList).attr("id")
    var isNotAllowed = ((droppedIndex !== "learned") && (type !== droppedIndex.charAt(0)))
    // restrict same column drop or swap between Know & Wonder items
    // item should be dragged back to its original column
    return  (dragListID === dropListID ||
            (restricedDrops.includes(droppedIndex) && restricedDrops.includes(draggedIndex)) ||
            isNotAllowed)
}

EdlyKWLXBlock.prototype.getItemsList = function(targetElement) {
    var _EdlyKWLXBlock = this;
    return targetElement.querySelector(_EdlyKWLXBlock.Selector.LIST_VIEW_CONTAINER)
}

EdlyKWLXBlock.prototype.handleItemDrop = function (event, ui) {
    var _EdlyKWLXBlock = this;
    var draggedItem = ui.draggable;

    var dragItemList = _EdlyKWLXBlock.getObject(draggedItem.parent());
    var dropList = _EdlyKWLXBlock.getItemsList(event.target);
    var clone = $(draggedItem).clone();
    var cloneContext = _EdlyKWLXBlock.getObject(clone)

    var editable = _EdlyKWLXBlock.getObject($(_EdlyKWLXBlock.Selector.ITEM_EDIT_AREA, cloneContext));
    $(editable).attr("data-dropped", droppedIn)
    if (_EdlyKWLXBlock.isDropRestricted(dragItemList, dropList, $(editable).attr("data-type"))) {
        draggedItem.draggable('option', 'revert', true);
        return
    }

    var droppedIn = $(dropList).attr("data-index").charAt(0)
    $(editable).attr("data-dropped", droppedIn)
    $(dropList).append(clone);
    draggedItem.draggable('option', 'revert', false);

    _EdlyKWLXBlock.saveItem(dropList, editable)
    var index = $(dragItemList).data().index;
    $(draggedItem).remove()
}
