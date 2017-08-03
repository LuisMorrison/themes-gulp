if (window.jQuery)
    (function($) {

        $.fn.SearchBox = function(options)
        {
            return this.each(function()
            {
                var element = $(this);
                // Return early if this element already has a plugin instance
                if (element.data('SearchBox'))
                    return;
                // pass options to plugin constructor
                var myplugin = new SearchBox(this, options);
                // Store plugin object in this element's data
                element.data('SearchBox', myplugin);
                element.data().SearchBox.methods.init();
            });
        };
        var SearchBox = function(target, options) {
            var componentObj = {
                store_id: 0,
                urlSearch: "",
                limit: 5,
                totalitems: 0,
                selectedindex: -1,
                remoteURI:"/api/stores/get_store_items",
                forceKichink: false,
                methods: {
                    init: function() {
                        if (options.store_id != undefined) {
                            componentObj.store_id = options.store_id;
                        }
                        if (options.limit != undefined) {
                            componentObj.limit = options.limit;
                        }
                        if (options.forceKichink != undefined) {
                            componentObj.forceKichink = options.forceKichink;
                        }
                        if (options.urlSearch != undefined) {
                            componentObj.urlSearch = options.urlSearch;
                        }
                        if (options.remoteURI != undefined) {
                            componentObj.remoteURI = options.remoteURI;
                        }

                        $(target).keyup(function(e) {
                            e.preventDefault();
                            if (e.keyCode == 38) { //up
                                if (componentObj.selectedindex > 0) {
                                    componentObj.selectedindex--;
                                    $(target).parent().find(".search-result").find('ul').find('li').removeClass("selected");
                                    $($(target).parent().find(".search-result").find('ul').find('li')[componentObj.selectedindex]).addClass("selected");
                                }

                            } else if (e.keyCode == 40) { //down
                                if (componentObj.selectedindex < componentObj.totalitems - 1) {
                                    componentObj.selectedindex++;
                                    $(target).parent().find(".search-result").find('ul').find('li').removeClass("selected");
                                    $($(target).parent().find(".search-result").find('ul').find('li')[componentObj.selectedindex]).addClass("selected");
                                    //componentObj.methods.displayContent();
                                }
                            } else if (e.keyCode == 13) { //enter
                                if($(target).parent().find(".search-result").find(".selected").length>0){
                                    window.location.href = $($(target).parent().find(".search-result").find('ul').find('li')[componentObj.selectedindex]).data("href");
                                }
                                $(target).parent().find(".search-result").fadeOut(500);
                            } else if (e.keyCode == 27) { //esc
                                $(target).parent().find(".search-result").fadeOut(500);
                            } else {
                                if ($(target).val() != "") {
                                    delay(function() {
                                        componentObj.methods.search($(target).val());
                                    }, 500);
                                }
                            }
                            return false;
                        });

                        $(target).on("focus", function() {
                            if ($(target).val() !== "")
                                $(target).parent().find(".search-result").fadeIn(500);
                        });
                        $(target).on("blur", function() {
                            $(target).parent().find(".search-result").fadeOut(500);
                        });

                        var div = document.createElement("div");
                        $(div).addClass("search-result");
                        $(target).after(div);

                        var delay = (function() {
                            var timer = 0;
                            return function(callback, ms) {
                                clearTimeout(timer);
                                timer = setTimeout(callback, ms);
                            };
                        })();

                    },
                    search: function(q) {

                        $.ajax({
                            type: "POST",
                            data: {
                                store_id: componentObj.store_id,
                                limit: componentObj.limit,
                                offset: 0,
                                search: q
                            },
                            xhrFields: {
                                withCredentials: true
                            },
                            beforeSend:function(){
                                $(target).parent().find(".search-result").html("<div align='center' style='padding:10px'><img width='50px' src='https://www.kichink.com/img/loading.gif'></div>");
                                $(target).parent().find(".search-result").fadeIn(500);
                            },
                            crossDomain: true,
                            url: componentObj.remoteURI,
                            success: function(data) {
                                var ajax_request = jQuery.parseJSON(data);
                                if (ajax_request.data.length > 0) {
                                    componentObj.totalitems = ajax_request.result_count;
                                    $(target).parent().find(".search-result").html("<h4>Se encontraron " + ajax_request.result_count + " art&iacute;culos</h4>");
                                    var u = document.createElement("ul");
                                    for (var k in ajax_request.data) {
                                        var li = document.createElement("li");
                                        $(li).attr("data-id", ajax_request.data[k].id);
                                        $(li).attr("data-href", (componentObj.forceKichink?"https://www.kichink.com":"")+"/buy/" + ajax_request.data[k].id);
                                        var a = document.createElement("a");
                                        $(a).attr("href", (componentObj.forceKichink?"https://www.kichink.com":"")+"/buy/" + ajax_request.data[k].id);
                                        $(a).attr("target", "_top");
                                        $(a).append('<img class="pull-left" src="https://img.kichink.com/item_id/' + ajax_request.data[k].id + '?width=150&height=150&rs_mode=crop" height="40px" width="40px">');
                                        $(a).append('<div class="item-search-data"><span>' + ajax_request.data[k].name + '</span></div>');
                                        $(li).append(a);
                                        $(u).append(li);
                                    }
                                    $(target).parent().find(".search-result").append(u);
                                } else {
                                    $(target).parent().find(".search-result").html("<h4 align='center'>No se encontraron art&iacute;culos</h4>");
                                }
                            }
                        });

                    }
                }
            }
            return componentObj;
        };
    })(jQuery);
