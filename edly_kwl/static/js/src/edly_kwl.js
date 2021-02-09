/* Javascript for EdlyKWLXBlock. */
function EdlyKWLXBlock(runtime, element) {
    var _EdlyKWLXBlock = this;

    // Add urls here.
    _EdlyKWLXBlock.URL = {
        GET_STATE: runtime.handlerUrl(element, 'get_state'),
        SAVE_YOU_KNOW_ABOUT: runtime.handlerUrl(element, 'save_what_you_know_about_list'),
        SAVE_YOU_LEARNED_ABOUT: runtime.handlerUrl(element, 'save_what_you_learned_about_list'),
        SAVE_YOU_WONDER_ABOUT: runtime.handlerUrl(element, 'save_what_you_wonder_about_list'),
    }

    $(function ($) {
        /* Here's where you'd do things on page load. */
        $.post(_EdlyKWLXBlock.URL.SAVE_YOU_KNOW_ABOUT,JSON.stringify([{'text':'lorem ipsum','sort_order':1}])).done(function (res) {
            console.log(res);
        });
        $.post(_EdlyKWLXBlock.URL.SAVE_YOU_LEARNED_ABOUT,JSON.stringify([{'text':'lorem ipsum','sort_order':1}])).done(function (res) {
            console.log(res);
        });
        $.post(_EdlyKWLXBlock.URL.SAVE_YOU_WONDER_ABOUT,JSON.stringify([{'text':'lorem ipsum','sort_order':1}])).done(function (res) {
            console.log(res);
        });
        $.get(_EdlyKWLXBlock.URL.GET_STATE, function (res) {
            console.log(res);
        });
    });
}
