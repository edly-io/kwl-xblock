/* Javascript for KWLXBlock. */
function KWLXBlock(runtime, element) {
    var _KWLXBlock = this, state = {};
    _KWLXBlock.limit = 256
    _KWLXBlock.element = element;
    _KWLXBlock.runtime = runtime;
    _KWLXBlock.showLearned = false;

    // Add urls here.
    _KWLXBlock.URL = {
        GET_STATE: runtime.handlerUrl(element, 'get_state'),
        CREATE_UPDATE_ITEM: runtime.handlerUrl(element, 'create_update_item'),
    }

    _KWLXBlock.Selector = {
        COUNTER: '.counter',
        FOCUS_EVENT: 'focus',
        EDITABLE: '[contenteditable]',
        ITEM_EDIT_AREA: 'span.textarea[contenteditable]',
        KNOW_ITEMS: '#know-container',
        FIELD_ROWS: '.field-row',
        CHANGE_EVENTS: 'blur keyup paste input',
        KEYDOWN_EVENTS: 'keydown',
        WONDER_ITEMS: '#wonder-container',
        LEARNED_ITEMS: '#learned-container',
        ADD_NEW_ITEM_BUTTON: 'button.add_field_button',
        LIST_VIEW_ITEM_TEMPLATE: 'script[name="item-template"]',
        LIST_VIEW_CONTAINER: '.list-container-view',
        DROPPABLE_COLUMNS: '#column-know, #column-wonder, #column-learned',
    }

    _KWLXBlock.View = {
        KNOW_ITEMS_DIV: $(_KWLXBlock.Selector.KNOW_ITEMS, element),
        WONDER_ITEMS_DIV: $(_KWLXBlock.Selector.WONDER_ITEMS, element),
        LEARNED_ITEMS_DIV: $(_KWLXBlock.Selector.LEARNED_ITEMS, element),
        ADD_NEW_ITEM_BUTTON: $(_KWLXBlock.Selector.ADD_NEW_ITEM_BUTTON, element),
        LIST_VIEW_ITEM_TEMPLATE: $($(_KWLXBlock.Selector.LIST_VIEW_ITEM_TEMPLATE, element).clone()),
        DROPPABLE_COLUMNS: $(_KWLXBlock.Selector.DROPPABLE_COLUMNS, element)
    }

    function getState(key) {
        return _KWLXBlock.state[key]
    }

    function placeCaretAtEnd(el) {
        el.focus();
        if (typeof window.getSelection !== "undefined" && typeof document.createRange !== "undefined") {
            var range = document.createRange();
            range.selectNodeContents(el[0]);
            range.collapse(false);
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        }
    }

    function enterPressed(event) {
        return (event.key === 'Enter' || event.keyCode === 13)
    }

    function resetItemText(editable) {
        editable.text(editable.data('before'))
    }

    function updateBeforeData(editable) {
        editable.data('before', editable.text());
    }

    function checkAndSaveForEnterKey(editable, event) {
        if (enterPressed(event)) {
            event.preventDefault();
            resetItemText(editable)
            editable.blur();
            return false;
        }
        return true;
    }

    function checkCharacterLimit(editable) {
        if (editable.data('before') !== editable.text()) {
            var counterLabel = $(editable).siblings(_KWLXBlock.Selector.COUNTER)
            var contentLength = editable.text().length;
            if ( contentLength > _KWLXBlock.limit && contentLength > editable.data('before').length) {
                // If limit has exceeded reset the content
                resetItemText(editable)
                placeCaretAtEnd(editable)
            } else {
                $(counterLabel).text(_KWLXBlock.limit - editable.text().length)
                updateBeforeData(editable)
            }
        }
    }

    $(function ($) {
        /* Here's where you'd do things on page load. */

        $('#kwl_content').on(_KWLXBlock.Selector.FOCUS_EVENT, _KWLXBlock.Selector.EDITABLE, function() {
            var editable = $(this);
            updateBeforeData(editable)
        }).on(_KWLXBlock.Selector.KEYDOWN_EVENTS, _KWLXBlock.Selector.EDITABLE, function(e) {
            checkAndSaveForEnterKey($(this), e)
        }).on(_KWLXBlock.Selector.CHANGE_EVENTS, _KWLXBlock.Selector.EDITABLE, function() {
            checkCharacterLimit($(this));
        });

        _KWLXBlock.init();
        _KWLXBlock.updateState(function (res) {
            _KWLXBlock.maxInputs = getState('max_inputs')
            _KWLXBlock.showLearned = getState('show_learned_column')
            _KWLXBlock.updateListView(element, _KWLXBlock.View.KNOW_ITEMS_DIV, getState('knows'));
            _KWLXBlock.updateListView(element, _KWLXBlock.View.WONDER_ITEMS_DIV, getState('wonder'));
            _KWLXBlock.updateListView(element, _KWLXBlock.View.LEARNED_ITEMS_DIV, getState('learned'));
        });

        _KWLXBlock.View.DROPPABLE_COLUMNS.droppable( {
            hoverClass: 'hovered',
            drop: function(event, ui) {
                _KWLXBlock.handleItemDrop(event, ui);
            }
        });
    });
}

KWLXBlock.prototype.init = function () {
    var _KWLXBlock = this;

    $(_KWLXBlock.View.ADD_NEW_ITEM_BUTTON).click(function (event) {
        _KWLXBlock.addListItem(this);
    });

    $(_KWLXBlock.View.KNOW_ITEMS_DIV).data('save-url', _KWLXBlock.URL.CREATE_UPDATE_ITEM);
    $(_KWLXBlock.View.WONDER_ITEMS_DIV).data('save-url', _KWLXBlock.URL.CREATE_UPDATE_ITEM);
    $(_KWLXBlock.View.LEARNED_ITEMS_DIV).data('save-url', _KWLXBlock.URL.CREATE_UPDATE_ITEM);
}

KWLXBlock.prototype.updateState = function (cb) {
    var _KWLXBlock = this;
    $.get(_KWLXBlock.URL.GET_STATE, function (res) {
        _KWLXBlock.state = res;
        if (cb) {
            cb(res);
        }
    });
}

KWLXBlock.prototype.checkItemLimit = function(view, itemCount) {
    var _KWLXBlock = this;
    var targetButton = _KWLXBlock.getObject($(view).siblings(_KWLXBlock.Selector.ADD_NEW_ITEM_BUTTON));

    if (itemCount >= _KWLXBlock.maxInputs) {
        $(targetButton).addClass("button-disabled").attr('disabled', 'disabled')
    } else {
        $(targetButton).removeClass("button-disabled").removeAttr('disabled')
    }
}

KWLXBlock.prototype.updateListView = function (element, view, list) {
    var _KWLXBlock = this;
    $(view).empty();

    $.each(list, function (index, item) {
        var itemView = $(_KWLXBlock.View.LIST_VIEW_ITEM_TEMPLATE.text());
        var editable = $(_KWLXBlock.Selector.ITEM_EDIT_AREA, itemView);
        var viewIndex = $(view).data('index')
        editable.text(item.content).attr({'data-index': viewIndex, 'data-type': item.type,
                                          'data-id': item.id, 'data-dropped': item.dropped_in,
                                          'onpaste': 'return false'});
        $(itemView).attr("id", index)
        var counterLabel = $(editable).siblings(".counter")
        $(counterLabel).text(_KWLXBlock.limit - editable.text().length)
        var divClassToAdd = "editable"
        // Learned items shouldn't be dragged
        if (_KWLXBlock.showLearned && item.type !== 'l') {
            _KWLXBlock.makeDraggable(itemView)
            divClassToAdd = "movable"
            $(counterLabel).hide()
        }
        $(itemView).addClass(divClassToAdd);

        editable.focusout(function (e) {
            _KWLXBlock.save(this);
        });

        $(view).append(itemView);
    });

    _KWLXBlock.validateList(view);
}

KWLXBlock.prototype.makeDraggable = function (item, targetDivID = "learned-container") {
    var _KWLXBlock = this;
    $(item).draggable({
        snap: "#kwl_content",
        stack: '#' + targetDivID,
        cursor: 'auto',
        revert: true,
        helper: 'clone',
        zIndex: '2700',
        opacity: 0.8,
        start: _KWLXBlock.handleItemDragStart
    });
}

KWLXBlock.prototype.toItemJson = function (targetItem) {
    var _KWLXBlock = this;
    return {'sort_order': 1, content: targetItem.textContent.trim(),
            type: $(targetItem).attr("data-type"), id: $(targetItem).attr("data-id"),
            "dropped_in": $(targetItem).attr("data-dropped")}
}

KWLXBlock.prototype.validateList = function (targetListView, removingItem = false) {
    var _KWLXBlock = this;
    var list = $(_KWLXBlock.getObject(targetListView)).children(_KWLXBlock.Selector.FIELD_ROWS);
    var data = $(targetListView).data();
    if (!data){return}
    var children = list.children("span.textarea[data-type='" + data.index.charAt(0) + "']")
    var childCount = removingItem ? children.length - 1 : children.length
    _KWLXBlock.checkItemLimit(targetListView, childCount);
}

KWLXBlock.prototype.validateAddItem = function (targetElement) {
    var _KWLXBlock = this;
    var targetListView = $(targetElement).siblings(_KWLXBlock.Selector.LIST_VIEW_CONTAINER);
    _KWLXBlock.validateList(targetListView)
}

KWLXBlock.prototype.validateRemoveItem = function (targetElement) {
    var _KWLXBlock = this;
    var listView = targetElement.parentElement.parentElement;
    _KWLXBlock.validateList(listView, true)
}

KWLXBlock.prototype.addListItem = function (targetEle) {
    var _KWLXBlock = this;
    var data = $(targetEle).data(), target = $(data.target, _KWLXBlock.element);
    var itemView = $(_KWLXBlock.View.LIST_VIEW_ITEM_TEMPLATE.text());
    var editable = $(_KWLXBlock.Selector.ITEM_EDIT_AREA, itemView);
    $(itemView).attr("id", data.index + $(target).children().length);
    $(itemView).addClass("editable");
    var index = data.index;

    editable.attr({'data-index': index, 'data-type': index.charAt(0),
                   'onpaste': 'return false'});

    editable.focusout(function (e) {
        _KWLXBlock.save(this);
    });

    $(target).append(itemView);
    _KWLXBlock.validateAddItem(targetEle);
}


KWLXBlock.prototype.save = function (targetElement) {
    var _KWLXBlock = this;
    var listView = $(targetElement).closest(_KWLXBlock.Selector.LIST_VIEW_CONTAINER);
    _KWLXBlock.saveItem(listView, targetElement)
}

KWLXBlock.prototype.saveItem = function (targetListView, targetElement) {
    var _KWLXBlock = this;
    var data = $(targetListView).data();
    var url = data.saveUrl, index = data.index;
    var payload = _KWLXBlock.toItemJson(targetElement);

    if (targetElement.textContent.trim() === "") {
        _KWLXBlock.validateRemoveItem(targetElement)
        $(targetElement.parentElement).remove()
        if (typeof payload["id"] === 'undefined') {
            return
        }
    }

    _KWLXBlock.submit(url, payload, function (res) {
        _KWLXBlock.state[index] = res[index];
        _KWLXBlock.updateListView(_KWLXBlock.element, targetListView, _KWLXBlock.state[index]);
    });
}

KWLXBlock.prototype.submit = function (url, payload, cb) {
    $.post(url, JSON.stringify(payload)).done(function (res) {
        if (cb){
            cb(res);
        }
    });
}

KWLXBlock.prototype.handleItemDragStart = function (event, ui) {
    ui.helper.css({'width': $(this).css('width'), 'height': $(this).css('height')});
}

KWLXBlock.prototype.getObject = function(el) {
    if (typeof jQuery === "function" && el instanceof jQuery) {
        el = el[0];
    }
    return el
}

KWLXBlock.prototype.isDropRestricted = function(dragList, dropList, type) {
    var _KWLXBlock = this;
    var droppedIndex = $(dropList).attr("data-index")
    var draggedIndex = $(dragList).attr("data-index")
    var restricedDrops = "knows wonder"
    var dragListID = $(dragList).attr("id"), dropListID = $(dropList).attr("id")
    var isNotAllowed = ((droppedIndex !== "learned") && (type !== droppedIndex.charAt(0)))
    // restrict same column drop or swap between Know & Wonder items
    // item should be dragged back to its original column
    return (dragListID === dropListID ||
            (restricedDrops.includes(droppedIndex) && restricedDrops.includes(draggedIndex)) ||
            isNotAllowed)
}

KWLXBlock.prototype.getItemsList = function(targetElement) {
    var _KWLXBlock = this;
    return targetElement.querySelector(_KWLXBlock.Selector.LIST_VIEW_CONTAINER)
}

KWLXBlock.prototype.handleItemDrop = function (event, ui) {
    var _KWLXBlock = this;
    var draggedItem = ui.draggable;

    var dragItemList = _KWLXBlock.getObject(draggedItem.parent());
    var dropList = _KWLXBlock.getItemsList(event.target);
    var clone = $(draggedItem).clone();
    var cloneContext = _KWLXBlock.getObject(clone)

    var editable = _KWLXBlock.getObject($(_KWLXBlock.Selector.ITEM_EDIT_AREA, cloneContext));
    if (_KWLXBlock.isDropRestricted(dragItemList, dropList, $(editable).attr("data-type"))) {
        draggedItem.draggable('option', 'revert', true);
        return
    }

    var droppedIn = $(dropList).attr("data-index").charAt(0)
    $(editable).attr("data-dropped", droppedIn)
    $(dropList).append(clone);
    draggedItem.draggable('option', 'revert', false);

    _KWLXBlock.saveItem(dropList, editable)
    var index = $(dragItemList).data().index;
    $(draggedItem).remove()
}
