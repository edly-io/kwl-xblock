/* Javascript for EdlyKWLXBlock. */
function EdlyKWLXBlock(runtime, element) {

    function updateCount(result) {
        $('.count', element).text(result.count);
    }

    var handlerUrl = runtime.handlerUrl(element, 'increment_count');

    $('p', element).click(function(eventObject) {
        $.ajax({
            type: "POST",
            url: handlerUrl,
            data: JSON.stringify({"hello": "world"}),
            success: updateCount
        });
    });

    $(function ($) {
        /* Here's where you'd do things on page load. */

        $('.textarea').focus(function(){
            $(this).parent('.edly_kwl_block .field-row').addClass('focus');
        });

        $('.textarea').blur(function() {
            $(this).parent('.edly_kwl_block .field-row').removeClass('focus');
        });
    });
}
