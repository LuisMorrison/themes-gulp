if (window.jQuery)
    (function($) {

        $.fn.GridProdukts = function(options)
        {
            return this.each(function()
            {
                var element = $(this);
                // Return early if this element already has a plugin instance
                if (element.data('GridProdukts'))
                    return;
                // pass options to plugin constructor
                var myplugin = new GridProdukts(this, options);
                // Store plugin object in this element's data
                element.data('GridProdukts', myplugin);
                element.data().GridProdukts.methods.init();
            });
        };

        $.support.cors = true;

        var GridProdukts = function(target, options) {
            var component = {
                qname: 'loadmore',
                store_id: 0, //id de la tienda
                s3images: null, // consulta img.kichink.com
                pagination: 'scroll', // scroll | noscroll paginado
                nPagination: 5,
                limit: 25, // Limite de articulos por pagina en el grid
                cat_id: '', // para filtrar por categoria unica
                page: 0,
                currentPage: 1, // La pagina actual en el grid
                async: true, // Si la llamada al API es asyncrona o syncrona
                bottom_reached: 0,
                search: '', //Filtrado por palabra
                requests: 0, //Numero de peticiones hechas al api
                catsor: '', //Filtra por multiples categorias bajo condiciones or
                catsand: '', //Filtra por multiples categorias bajo condiciones and
                catsandor: '', //Filtra por multiples categorias bajo condiciones and y or
                crits_cats: 'or',
                showDiscounts: true, //Muestra los descuentos, si es false los oculta
                loadingHTML: '<img src="' + s3_uri + '/images/k-loader.gif"/><p>Cargando productos</p>', //icono en espera o cargando
                remoteURI: api_base_url,
                onUnique: undefined,
                onItemClick: undefined,
                onRequest: undefined, //metodo que se dispara al hacer la peticion del grid
                onSuccess: undefined, //metodo que se dispara despues de cargar el grid
                trim_title: true,
                conjuntos: true,
                buttons: null,
                methods: {
                    init: function() {
                        if (options.pagination !== undefined) {
                            component.pagination = options.pagination;
                        }
                        if (options.nPagination !== undefined) {
                            component.nPagination = options.nPagination;
                        }
                        if (options.currentPage !== undefined) {
                            component.currentPage = options.currentPage;
                        }
                        if (options.showDiscounts !== undefined) {
                            component.showDiscounts = options.showDiscounts;
                        }
                        if (options.buttons !== undefined) {
                            component.buttons = options.buttons;
                        }
                        if (options.remoteURI !== undefined) {
                            component.remoteURI = options.remoteURI;
                        }
                        if (options.store_id !== undefined) {
                            component.store_id = options.store_id;
                        }
                        if (options.limit !== undefined) {
                            component.limit = options.limit;
                        }
                        if (options.loadingHTML !== undefined) {
                            component.loadingHTML = options.loadingHTML;
                        }
                        if (options.cat_id !== undefined) {
                            component.cat_id = options.cat_id;
                        }
                        if (options.onUnique !== undefined) {
                            component.onUnique = options.onUnique;
                        }
                        if (options.onItemClick !== undefined) {
                            component.onItemClick = options.onItemClick;
                        }
                        if (options.search !== undefined) {
                            component.search = options.search;
                        }
                        if (options.catsand !== undefined) {
                            component.catsand = options.catsand;
                        }
                        if (options.catsandor !== undefined) {
                            component.catsandor = options.catsandor;
                        }
                        if (options.crits_cats !== undefined) {
                            component.crits_cats = options.crits_cats;
                        }
                        if (options.catsor !== undefined) {
                            component.catsor = options.catsor;
                        }
                        if (options.search !== undefined) {
                            component.search_price = options.search_price;
                        }
                        if (options.onRequest !== undefined) {
                            component.onRequest = options.onRequest;
                        }
                        if (options.onSuccess !== undefined) {
                            component.onSuccess = options.onSuccess;
                        }
                        if (options.s3images !== undefined) {
                            component.s3images = options.s3images;
                        }
                        var div = document.createElement('div');
                        $(div).attr('id', 'loading-items');
                        $(div).attr('align', 'center');
                        $(div).addClass('active');
                        $(div).css('display', 'none');
                        $(div).html(component.loadingHTML);
                        $(target).after(div);

                        component.methods.load_more();

                        if (component.pagination == 'scroll') {
                            $(window).scroll(function() {
                                if (component.page > 1) {
                                    if (($(window).scrollTop()) >= ($(target).height() + $(target).offset().top - $(window).height())) {
                                        if (component.bottom_reached == 0) {
                                            component.bottom_reached = 1;
                                            component.methods.load_more(false);
                                        }
                                    }
                                }
                            });
                        }
                    },
                    search: function(opt) {
                        component.bottom_reached = 0;
                        component.page = 1;
                        if (opt.cat_id !== undefined) {
                            component.cat_id = opt.cat_id;
                        }
                        if (opt.catsor !== undefined) {
                            component.catsor = opt.catsor;
                        }
                        if (opt.catsand !== undefined) {
                            component.catsand = opt.catsand;
                        }
                        if (opt.catsandor !== undefined) {
                            component.catsandor = opt.catsandor;
                        }
                        if (opt.search !== undefined) {
                            component.search = opt.search;
                        }
                        if (opt.trim_title !== undefined) {
                            component.trim_title = opt.trim_title;
                        }
                        if (opt.search_price !== undefined) {
                            component.search_price = opt.search_price;
                        }
                        component.methods.load_more(true);
                    },
                    search_by_cat: function(cat) {
                        component.methods.search({
                            cat_id: cat,
                            search: '',
                            search_price: ''
                        });
                    },
                    search_by_term: function(term) {
                        component.methods.search({
                            cat_id: '',
                            search: term,
                            search_price: ''
                        });
                    },
                    search_by_price: function(price) {
                        component.methods.search({
                            cat_id: '',
                            search: '',
                            search_price: price
                        });
                    },
                    load_more: function(force) {
                        force = (force == undefined) ? false : force;
                        component.page = (component.page == 0) ? 1 : component.page;

                        if (component.page == 1) {
                            $(target).html('');
                        }

                        if (force) {
                            $.ajaxq.clear(component.qname);
                        }

                        if (!$.ajaxq.isRunning(component.qname)) {
                            $.ajaxq(component.name, {
                                type: 'POST',
                                data: {
                                    store_id: component.store_id,
                                    limit: component.limit,
                                    page: component.page,
                                    cat_id: component.cat_id,
                                    offset: (component.limit * (component.page - 1)),
                                    search: component.search,
                                    search_price: component.search_price,
                                    catsor: component.catsor,
                                    catsand: component.catsand,
                                    catsandor: component.catsandor,
                                    crit_cats: component.crit_cats
                                },
                                beforeSend: function() {
                                    $(target).find('#no-items').remove();
                                    $(target).next('#loading-items').show();

                                    $('.search input[type=text]').attr('disabled', true);
                                    $('.search button').attr('disabled', true);
                                    if (component.onRequest) {
                                        component.onRequest();
                                    }
                                },
                                error: function(request, status, error) {
                                    console.log('err ' + status);
                                    console.log(error);
                                    console.log(request.responseText);
                                },
                                xhrFields: {
                                    withCredentials: false
                                },
                                crossDomain: true,
                                url: component.remoteURI + '/kore/store/items',
                                success: function(ajaxData) {
                                    $(target).parent().find('.pagination').remove();

                                    $('.search input[type=text]').attr('disabled', false);
                                    $('.search button').attr('disabled', false);
                                    $(target).next('#loading-items').hide();

                                    component.requests++;
                                    var item = ajaxData.data;
                                    if (item.length > 0) {

                                        if (component.pagination == 'scroll') {
                                            $(target).data('page', component.page + 1);
                                            component.page = component.page + 1;
                                        }

                                        for (var k in item) {
                                            var li_id = 'item-' + item[k].id;
                                            if ($('li.item[data-id=' + item[k].id + ']').length < 1) {
                                                var article = document.createElement('article');
                                                $(article).addClass('item col-md-3 col-sm-4 col-xs-6');
                                                $(article).attr('data-id', (item[k].id));
                                                var html = '';

                                                var img_default = 'http://placehold.it/200x150';

                                                if (component.s3images)
                                                    img_default = 'http://placehold.it/' + component.s3images.width + 'x' + component.s3images.height;

                                                if (item[k].images[0]) {
                                                    if (!component.s3images) {
                                                        if (item[k].images[0].bordered != undefined) {
                                                            img_default = item[k].images[0].bordered;
                                                        }
                                                    } else {
                                                        //refresh
                                                        if (component.s3images.width && component.s3images.height) {
                                                            img_default = 'https://img.kichink.com/item_id/' + item[k].id;
                                                            if (component.s3images.refresh && component.s3images.refresh == true) {
                                                                img_default += '/refresh/';
                                                            }
                                                            img_default += '?width=' + component.s3images.width + '&height=' + component.s3images.height + '&rs_mode=' + component.s3images.rs_mode;
                                                        }
                                                    }
                                                }

                                                var item_name_data = item[k].name_data[lang].split(', '),
                                                    item_title = '';
                                                if (item_name_data.length > 1) {
                                                    item_title = '<header class="col-md-7 col-sm-6 col-xs-6"><h2 class="items-name has-subtitle" itemprop="name">' + item_name_data[0] + '</h2><h3 class="items-subtitle">' + item_name_data[1] + '</h3></header>';
                                                } else {
                                                    item_title = '<header class="col-md-7 col-sm-6 col-xs-6"><h2 class="items-name" itemprop="name">' + item_name_data[0] + '</h2></header>';
                                                }

                                                html += '<figure class="thumb">';
                                                if (item[k].ribbon) {
                                                    if (item[k].ribbon == 'ultimos articulos') {
                                                        if (parseInt(item[k].units_availible) <= parseInt(item[k].ultimos_inventarios)) {
                                                            html += '<ins class="ribbon"><p>' + item[k].ribbon + '</p></ins>';
                                                        } else {
                                                            if (parseInt(item[k].new_item) == 1) {
                                                                html += '<ins class="ribbon"><p>Nuevo</p></ins>';
                                                            }
                                                        }
                                                    } else {
                                                        html += '<ins class="ribbon"><p>' + item[k].ribbon + '</p></ins>';
                                                    }
                                                }
                                                html += '<img src="' + img_default + '" class="img-responsive" alt="' + item[k].name_data[lang] + '" nopin="nopin" itemprop="image"></figure>';

                                                //Info del producto
                                                html += '<section class="items-data row' + ((component.showDiscounts && parseInt(item[k].discount)) ? ' discount' : '') + '" itemprop="offers" itemscope itemtype="http://schema.org/Offer">';
                                                html += item_title;
                                                html += '<div class="items-price col-md-5 col-sm-6 col-xs-6"><span itemprop="priceCurrency" content="' + currency + '">$</span> <span itemprop="price" content="' + item[k].price_data[currency] + '">' + parseFloat(item[k].price_data[currency]).formatCurrency() + '</span></div>';
                                                html += (((component.showDiscounts) && (parseInt(item[k].discount) > 0)) ? ('<div class="items-discount">$ ' + (parseFloat(item[k].price_data[currency]) - parseFloat(item[k].discount_price_data[currency])).formatCurrency() + ' (-' + item[k].discount + '%)</div>') : '');

                                                html += '</section>';

                                                if (item[k].conjuntosItems) {
                                                    if (item[k].conjuntosItems.length > 0) {
                                                        var ids = new Array();
                                                        ids.push(item[k].id);
                                                        for (var n in  item[k].conjuntosItems) {
                                                            var conjunto = item[k].conjuntosItems[n];
                                                            ids.push(conjunto.id);
                                                            html += '<section class="items-data row' + ((component.showDiscounts && parseInt(conjunto.discount)) ? ' discount' : '') + '" itemprop="offers" itemscope itemtype="http://schema.org/Offer">';
                                                            html += '<h2 class="items-name" itemprop="name">' + conjunto.name_data[lang] + '</h2>';
                                                            html += '<div class="items-price col-md-6" itemprop="price">$ ' + parseFloat(conjunto.price_data[currency]).formatCurrency() + '</div>';
                                                            html += (((component.showDiscounts) && (parseInt(conjunto.discount) > 0)) ? ('<div class="items-discount">$ ' + (parseFloat(conjunto.price_data[currency]) - parseFloat(conjunto.discount_price_data[currency])).formatCurrency() + ' (-' + conjunto.discount + '%)</div>') : '');
                                                            if (item[k].ribbon) {
                                                                if (item[k].ribbon == 'ultimos articulos') {
                                                                    if (parseInt(item[k].units_availible) <= parseInt(item[k].ultimos_inventarios)) {
                                                                        html += '<ins class="ribbon"><p>' + item[k].ribbon + '</p></ins>';
                                                                    } else {
                                                                        if (parseInt(item[k].new_item) == 1) {
                                                                            html += '<ins class="ribbon"><p>Nuevo</p></ins>';
                                                                        }
                                                                    }
                                                                } else {
                                                                    html += '<ins class="ribbon"><p>' + item[k].ribbon + '</p></ins>';
                                                                }
                                                            }
                                                            html += '</section>';
                                                        }
                                                        if (component.conjuntos) {
                                                            ids.sort();
                                                        }
                                                        li_id = 'item-' + ids.join('-');
                                                    }
                                                }
                                                $(article).attr('id', li_id);
                                                $(article).data(item[k]);

                                                if (component.onItemClick) {
                                                    $(article).on('click', function(event) {
                                                        event.stopPropagation();
                                                        component.onItemClick($(this).data());
                                                    });
                                                } else {
                                                    html = '<a href="/buy/' + item[k].id + window.location.search + '">' + html + '</a>';
                                                }

                                                $(article).html(html);

                                                if (component.buttons) {
                                                    $(article).append('<button class="' + component.buttons.class + '" data-id="' + item[k].id + '">' + component.buttons.text + '</button>');
                                                }

                                                if ($('#' + li_id).length < 1) {
                                                    $(target).append(article);
                                                }
                                            }
                                        }

                                        var unique_item = ($(target).find('.item').length > 1) ? false : true;

                                        if (!unique_item) {
                                        } else if (component.onUnique) {
                                            var temp_data = $($(target).find('.item').get(0)).data();
                                            $(target).hide();
                                            if ($(target).find('.item').length > 0) {
                                                component.onUnique(temp_data);
                                            }
                                        }

                                        if (!$(target).next('#loading-items').hasClass('active')) {
                                            $(target).next('#loading-items').removeClass('active');
                                        }
                                        $(target).find('#no-items').remove();
                                    } else {
                                        if (component.page == 1) {
                                            if ($(target).find('#no-items').length < 1) {
                                                $(target).append('<ins id="no-items">No se encontraron art&iacute;culos</ins>');
                                            }
                                        }
                                        $(target).next('#loading-items').removeClass('active');
                                        component.page = -1;
                                    }
                                    component.bottom_reached = 0;
                                    if (component.onSuccess) {
                                        component.onSuccess();
                                    }

                                    if (component.pagination != 'scroll') {
                                        if (item.length > 0) {
                                            if (item[0].result_total_items) {
                                                var result_count = item[0].result_total_items;
                                                var pagination = document.createElement('ul');
                                                $(pagination).addClass('pagination');

                                                var npages = Math.ceil(result_count / component.limit);
                                                if (npages > 1) {
                                                    var p = 1;
                                                    var lpage = npages;
                                                    if (npages > component.nPagination) {
                                                        lpage = component.nPagination;
                                                        var l = document.createElement('li');
                                                        var a = document.createElement('a');
                                                        $(a).attr('href', '#');
                                                        $(a).data('page', 1);
                                                        $(a).html('&larr;');
                                                        $(l).append(a);
                                                        $(pagination).append(l);

                                                        if (component.page > 3) {
                                                            p = component.page - 2;
                                                            lpage = p + component.nPagination - 1;
                                                        }

                                                        if ((component.page + 2) >= npages) {
                                                            lpage = npages;
                                                            p = lpage - (component.nPagination - 1);
                                                        }

                                                        if (lpage > npages) {
                                                            lpage = npages;
                                                        }
                                                    }

                                                    for (; p <= lpage; p++) {
                                                        var l = document.createElement('li');
                                                        if (p == component.page) {
                                                            $(l).addClass('active');
                                                        }
                                                        var a = document.createElement('a');
                                                        $(a).attr('href', '#');
                                                        $(a).data('page', p);
                                                        $(a).html(p);
                                                        $(l).append(a);
                                                        $(pagination).append(l);
                                                    }
                                                    if (npages > component.nPagination) {
                                                        var l = document.createElement('li');
                                                        var a = document.createElement('a');
                                                        $(a).attr('href', '#');
                                                        $(a).data('page', npages);
                                                        $(a).html('&rarr;');
                                                        $(l).append(a);
                                                        $(pagination).append(l);
                                                    }
                                                }

                                                $(pagination).find('li>a').each(function(i, e) {
                                                    if (!$(e).parent('li').hasClass('active')) {
                                                        $(e).click(function() {
                                                            $(target).html('');
                                                            component.page = $(this).data().page;
                                                            component.methods.load_more(true);
                                                            $(target).parent().find('.pagination').remove();
                                                        });
                                                    }
                                                });

                                                $(target).after(pagination);
                                            }
                                        }
                                    }
                                }
                            });
                        }
                    }
                }
            }
            return component;
        };
    })(jQuery);
