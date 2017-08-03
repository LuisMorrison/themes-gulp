$(function(){
    $.fn.appendJSON = function (source) {
        var html = '';
        $.each(source, function(i, row) {
            html += row.replace(/\|/g, "\"");
        });
        this.append(html);
    };
});
