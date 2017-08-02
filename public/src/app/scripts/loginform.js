(function($) {

    $.fn.LoginForm = function(options)
    {
        return this.each(function()
        {
            var element = $(this);
            // Return early if this element already has a plugin instance
            if (element.data('LoginForm'))
                return;
            // pass options to plugin constructor
            var myplugin = new LoginForm(this, options);
            // Store plugin object in this element's data
            element.data('LoginForm', myplugin);
            element.data().LoginForm.methods.init();
        });
    };
    var LoginForm = function(target, options) {
        var componentObj = {
            lang: 'es', // es | en idioma por default
            username: '', //usuario
            reload: false, // recargar despues de login
            icons: { //iconos a mostrar SOLO en vista tipo menu
                profile: '<img height="25px" src="https://kichink-static.s3.amazonaws.com/home/iconos_loginForm/login.svg"/>',
                language: '<img height="25px" src="https://kichink-static.s3.amazonaws.com/home/iconos_loginForm/idioma.svg"/>',
                help: '<img height="25px" src="https://kichink-static.s3.amazonaws.com/home/iconos_loginForm/ayuda.svg"/>'
            },
            placement: "right",
            hasSession: false, //php Identifica si tiene o no sesion
            onceLogged: function() {//metodo que se va a ejecutar despues del login
            },
            whenError: function() { //ejecuta si hay error
            },
            type: 'menu', // menu | button define la vista como tipo menu o simple
            methods: {
                init: function() {

                    if (options.icons != undefined) {
                        componentObj.icons = options.icons;
                    }
                    if (options.username != undefined) {
                        componentObj.username = options.username;
                    }
                    if (options.hasSession != undefined) {
                        componentObj.hasSession = options.hasSession;
                    }
                    if (options.reload != undefined) {
                        componentObj.reload = options.reload;
                    }
                    if (options.onceLogged != undefined) {
                        componentObj.onceLogged = options.onceLogged;
                    }
                    if (options.type != undefined) {
                        componentObj.type = options.type;
                    }
                    if (options.lang != undefined) {
                        componentObj.lang = options.lang;
                    }
                    if (options.placement != undefined) {
                        componentObj.placement = options.placement;
                    }
                    var div = document.createElement("div");
                    $(div).addClass("dropdown-menu");
                    if(componentObj.placement=="right")
                        $(div).addClass("pull-right");

                    $(div).attr("role", "menu");

                    var div2 = document.createElement("div");
                    $(div2).addClass("card");
                    $(div2).addClass("login");
                    $(div2).attr("align", "center");
                    if (!componentObj.hasSession) {
                        $(div2).append("<h3>Login</h3>");
                        //$(div2).append('<div class="person img-circle"></div>');

                        var form = document.createElement("form");
                        $(form).attr("method", "post");
                        $(form).addClass("form-stack");
                        $(form).addClass("login-form");
                        $(form).append('<input type="text" class="form-control" name="username" placeholder="E-mail"/>');
                        $(form).append('<input type="password" class="form-control" name="password" placeholder="Password"/>');
                        $(form).append('<input type="hidden" class="form-control" name="str" value="hdr"/>');
                        $(form).append('<a href="https://login.kichink.com/forgot" class="recover-password" target="_blank"><small>' + ((componentObj.lang == "es") ? "&iquest;Olvidaste tu contrase&ntilde;a?" : "Forgot your password?") + '</small></a><br/>');
                        $(form).append('<button type="submit" class="btn btn-primary form-control">' + ((componentObj.lang == 'en') ? "Enter" : "Entrar") + '</button>');
                        $(form).append('<a href="https://login.kichink.com/signup" target="_blank" class="btn btn-success form-control btn-register">' + ((componentObj.lang == "es") ? "Registrarse" : "Register") + '</a>');

                        $(form).find("input").each(function(i, e) {
                            $(e).click(function(event) {
                                event.stopPropagation();
                            });
                        });

                        $(form).submit(function(event) {
                            event.preventDefault();
                            event.stopPropagation();
                            $.ajax({
                                type: "POST",
                                data: $(this).serialize(),
                                url: "/login/remoteLogin",

                                success: function(data) {
                                    if ((data == "") || (data == "error")) {
                                        //componentObj.onceLogged(data);
                                        if (componentObj.lang == "es") {
                                            alert("El usuario o password es incorrecto. Por favor verifique sus datos.");
                                        } else {
                                            alert("Your username and password are incorrect. Please, check your information");
                                        }
                                    }
                                    else {
                                        var obj = jQuery.parseJSON(data);

                                        //Set google tag manager user id
                                        activitiesGTMCheckout.userIdTracking(obj.id);

                                        $(".login-form").each(function(i, e) {
                                            $(e).closest(".login.card").fadeOut(function() {
                                                // $(e).closest(".login.card").after('<div align="left" class="card logout"><b>' + ((componentObj.lang == "es") ? "&iexcl;Hola" : "Hello") + ', ' + obj.name + '!</b><a href="' + ((window.location.host == "www.kichink.nb9.mx") ? "http://www.kichink.nb9.mx" : "https://www.kichink.com") + '/login/doLogout" class="pull-right"><i class="fa fa-power-off"></i></a><div class="clearfix"></div><a target="_blank" class="myaccount" href="https://www.kichink.com/micuenta"><i class="fa fa-user"></i>&nbsp;' + ((componentObj.lang == "es") ? "Mi cuenta" : "My account") + '</a></div>');
                                                $(e).closest(".login.card").after('<div align="left" class="card logout"><b>' + ((componentObj.lang == "es") ? "&iexcl;Hola" : "Hello") + ', ' + obj.name + '!</b><a href="' + '/login/doLogout" class="pull-right"><i class="fa fa-power-off"></i></a><div class="clearfix"></div><a target="_blank" class="myaccount" href="https://micuenta.kichink.com"><i class="fa fa-user"></i>&nbsp;' + ((componentObj.lang == "es") ? "Mi cuenta" : "My account") + '</a></div>');
                                                $(e).closest(".login.card").remove();
                                            });
                                        });
                                        if (componentObj.reload)
                                            location.reload();
                                        else
                                            componentObj.onceLogged(data);
                                    }
                                }

                            });
                            return false;
                        });

                        $(div2).append(form);
                        $(div).append(div2);
                    }
                    else {
                        var card = document.createElement("div");
                        $(card).addClass("card");
                        $(card).addClass("logout");
                        $(card).attr("align", "left");
                        //$(card).append('<b>' + ((componentObj.lang == "es") ? "&iexcl;Hola" : "Hello") + ', ' + componentObj.username + '!</b><a href="' + ((window.location.host == "www.kichink.nb9.mx") ? "http://www.kichink.nb9.mx" : "https://www.kichink.com") + '/login/doLogout" class="pull-right"><i class="fa fa-power-off"></i></a><div class="clearfix"></div><a target="_blank" class="myaccount" href="https://www.kichink.com/micuenta"><i class="fa fa-user"></i>&nbsp;' + ((componentObj.lang == "es") ? "Mi cuenta" : "My account") + '</a>');
                        $(card).append('<b>' + ((componentObj.lang == "es") ? "&iexcl;Hola" : "Hello") + ', ' + componentObj.username + '!</b><a href="' + '/login/doLogout" class="pull-right"><i class="fa fa-power-off"></i></a><div class="clearfix"></div><a target="_blank" class="myaccount" href="https://micuenta.kichink.com"><i class="fa fa-user"></i>&nbsp;' + ((componentObj.lang == "es") ? "Mi cuenta" : "My account") + '</a>');
                        $(div).append(card);
                        $(div).append("<div class='col-lg-12 col-md-12 col-sm-12 col-xs-12 extra'></div>");
                        componentObj.onceLogged();
                    }


                    if (componentObj.type !== "menu") {
                        if ($(target).hasClass("dropdown-toggle"))
                            $(target).after(div);
                    } else {
                        var menu_settings = document.createElement("div");
                        $(menu_settings).attr("id", "menu-settings");
                        var ul = document.createElement("ul");
                        $(ul).addClass("nav");
                        $(ul).addClass("nav-right");
                        $(ul).addClass("nav-pills");
                        $(ul).addClass("pull-right");
                        var li = document.createElement("li");
                        //Tooltip
                        $(li).attr("data-toggle", "tooltip");
                        $(li).attr("data-placement", "bottom");
                        $(li).attr("data-original-title", "Mi cuenta");

                        $(li).append('<a class="dropdown-toggle login-button" data-toggle="dropdown" href="#">' + componentObj.icons.profile + '&nbsp;</a>');
                        $(li).append(div);
                        $(ul).append(li);

                        li = document.createElement("li");
                        //Tooltip
                        $(li).attr("data-toggle", "tooltip");
                        $(li).attr("data-placement", "bottom");
                        if (componentObj.lang == "es") {
                            $(li).attr("data-original-title", "Idioma / Moneda");
                        } else {
                            $(li).attr("data-original-title", "Language / Currency");
                        }

                        $(li).append('<a class="dropdown-toggle" data-toggle="dropdown" href="#">' + componentObj.icons.language + '&nbsp;</a>');
                        //Dropdown
                        var ul2 = document.createElement("ul");
                        $(ul2).addClass("dropdown-menu");
                        $(ul2).addClass("pull-right");
                        $(ul2).attr("role", "menu");

                        $(ul2).append('<li role="presentation" class="dropdown-header" data-original-title="" title="">' + ((componentObj.lang == "es") ? "Idioma / Moneda" : "Language / Currency") + '</li>');

                        $(ul2).append("<li><a href='#' data-lang='en'>" + ((componentObj.lang == 'en') ? "English" : "Ingl&eacute;s") + " / USD " + ((componentObj.lang == 'en') ? "<i class='fa fa-check'></i>" : "") + "</a></li>");
                        $(ul2).append("<li><a href='#' data-lang='es'>" + ((componentObj.lang == 'en') ? "Spanish" : "Espa&ntilde;ol") + " / MXN " + ((componentObj.lang == 'es') ? "<i class='fa fa-check'></i>" : "") + "</a>");
                        $(ul2).find("a").each(function() {
                            $(this).click(function() {
                                componentObj.methods.changeLang($(this).data().lang);
                            });
                        });

                        //$(li).click(componentObj.methods.changeLang('es'));
                        //$(li).click(componentObj.methods.changeLang('es'));

                        $(li).append(ul2);
                        $(ul).append(li);

                        li = document.createElement("li");
                        $(li).attr("data-toggle", "tooltip");
                        $(li).attr("data-placement", "bottom");
                        $(li).attr("data-title", "Ayuda");
                        $(li).attr("title", "Ayuda");

                        var link = document.createElement("a");
                        //if (SnapABug != undefined) {
                        //    $(link).attr("onclick", "SnapABug.startLink();");
                        //    $(link).attr("href", "#");
                        //} else {
                            $(link).attr("href", "mailto:support@kichink.com");
                        //    $(link).attr("target", "_blank");
                        //}
                        $(link).append(componentObj.icons.help);
                        $(li).append(link);
                        $(ul).append(li);

                        $(menu_settings).append(ul);
                        $(target).html(menu_settings);
                    }


                },
                changeLang: function(lang) {
                    var currency = (lang == "es") ? "MXN" : "USD";

                    $.ajaxq('sessioncurrency', {
                        url: "/home/change_lang?currency=" + currency,
                        type: "get",
                        success: function() {
                            $.ajaxq('sessionlang', {
                                url: "/home/change_lang?lang=" + lang,
                                type: "get",
                                success: function() {
                                    location.reload();
                                }
                            });
                        }
                    });
                }
            }
        }
        return componentObj;
    };
})(jQuery);
