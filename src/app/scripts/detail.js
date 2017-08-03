$(function() {
    (function() {
        function loadItemDetails() {
            var $detail = $('.detail'),
                $shareButtons = $('section.social').find('li'),
                share_url = '';

            $.ajax({
                url: api_base_url + '/kore/store/items',
                method: 'POST',
                data: {
                    item_id: item_id
                },
                headers: {
                    'X-STORE-ID': store_id,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                beforeSend: function() {
                    $detail.hide().before('<ins class="loader"><img src="' + s3_uri + '/images/k-loader.gif"></ins>');
                }
            }).
            always(function() {
                $('.loader').fadeOut(function() {
                    $detail.fadeIn();
                });
            }).
            done(function(data) {
                if (!$.isEmptyObject(data.data)) {
                    var item = data.data[0],
                        item_name = item.name_data[lang],
                        item_name_data = [],
                        item_title_html = '',
                        item_price = parseFloat(item.price_data[currency]),
                        item_discount_percentage = parseInt(item.discount),
                        item_discount_factor = parseFloat(item.discount_price_data[currency]),
                        item_discount_price = item_price - item_discount_factor,
                        po_label_data = [],
                        po_label = '',
                        $buybtn = $('#buy_button');

                    // Product title, prices, discount
                    item_name_data = item_name.split(', ');
                    item_title_html = (item_name_data.length > 1) ?
                        '<h1 class="item-name has-subtitle" itemprop="name">' + item_name_data[0] + '</h1><h2 class="item-subtitle">' + item_name_data[1] + '</h2>' :
                        item_title_html = '<h1 class="item-name" itemprop="name">' + item_name_data[0] + '</h1>';
                    $('.description header.title').html(item_title_html);
                    $('.price').html(
                        '<div class="price-tag"><span itemprop="priceCurrency" content="' + currency + '">$</span>' +
                        '<span itemprop="price" content="' + item_price + '">' + item_price.formatCurrency() + '</span> ' +
                        '<small>' + currency + '</small></div>'
                    );
                    if (parseInt(item.units_availible) == 0) {
                        $('#opt-size-first').attr('disabled', 'disabled');
                        $buybtn.html(ln['out_stock_btn'][lang]).attr('disabled', 'disabled');
                    }

                    // Purchase options
                    if (!$.isEmptyObject(item.purchase_options_simple)) {
                        $.each(item.purchase_options_simple, function(k, e) {
                            po_label_data = e.label.split(':');
                            po_label = (po_label_data.length > 1) ?
                                po_label_data[0] + ' (' + po_label_data[1].toTitleCase() + ')' : po_label_data[0];
                            $('#opt-size-first').append('<option value="' + e.label + '" data-units="' + e.units + '">' + po_label + '</option>');
                        });
                    } else {
                        $('section.purchase-options').remove();
                    }

                    $('#opt-size-first').on('change', function() {
                        $('#opt-size-second').empty().attr('disabled', 'disabled').append('<option value="">' + ln['combo_units'][lang] + '</option>');
                        if ($(this).val() != '') {
                            var sel_units = parseInt($(this).find(':selected').data('units')),
                                opt_qty = 0;
                            for (var i = 0; i < sel_units; i++) {
                                opt_qty = (i + 1);
                                $('#opt-size-second').removeAttr('disabled', 'disabled').append('<option value="' + opt_qty + '">' + opt_qty + '</option>');
                            }
                            $buybtn.data('purchase_option', $(this).val());
                        }
                    });

                    $('#opt-size-second').on('change', function() {
                        $buybtn.data('quantity', $(this).val());
                    });

                    // Description
                    $('.complete-description').append(item.description_data[lang]);

                    // Discount
                    if (item_discount_percentage > 0) {
                        $('.price').addClass('discount').append('<div class="price-discount">$' + item_discount_price.formatCurrency() + ' <small>(-' + item_discount_percentage + '%)</small></div>');
                    }

                    // Carousel images
                    if (item.images.length > 0) {
                        $.each(item.images, function(k, e) {
                            $('.carousel-inner').append(
                                '<div class="item"><span class="picture-id-' + e.id + '" id="' + e.object_name + '">' +
                                '<img src="' + e.bordered + '" class="img-responsive" alt="' + item_name + ' - Foto ' + k + '" itemprop="image">' +
                                '</span></div>'
                            );
                            $('.carousel-indicators').append(
                                '<li data-target="#carousel-detail" data-slide-to="' + k + '">' +
                                '<img src="' + e.bordered + '" class="img-responsive" alt="' + item_name + ' - Thumbnail ' + k + '">' +
                                '</li>'
                            );
                        });
                        $('#carousel-detail .item').first().addClass('active');
                        $('.thumbs .carousel-indicators li').first().addClass('active');
                        $('.big .carousel-indicators li').first().addClass('active');
                        $('.big .carousel-indicators li').find('img').remove();
                    } else {
                        $('.carousel-inner').append('<div class="item active"><img src="'+ resources_base_url +'images/placeholder.png" alt="Sin imagen de item"></div>');
                        $('.carousel-indicators').append('<li data-target="#carousel-detail" data-slide-to="0"><img src="'+ resources_base_url +'images/placeholder.png"></li>');
                        console.warn("This item doesn't have any images related");
                    }
                    var $carousel = $('#carousel-detail'),
                        handled = false;
                    $carousel.carousel();

                    $carousel.bind('slide.bs.carousel', function(e) {
                        var current = $(e.target).find('.item.active'),
                            indx = $(current).index();
                        if ((indx + 2) > $('.carousel-indicators li').length) {
                            indx = -1;
                        }
                        if (!handled) {
                            $('.carousel-indicators li').removeClass('active');
                            $('.carousel-indicators li:nth-child(' + (indx + 2) + ')').addClass('active');
                        } else {
                            handled = !handled;
                        }
                    });

                    $('.carousel-indicators li').on('click', function() {
                       $(this).addClass('active').siblings().removeClass('active');
                       handled = true;
                    });

                    // Related items
                    var relatedItemsData = item.related;

                    if (!$.isEmptyObject(relatedItemsData)) {
                        $.each(relatedItemsData, function(k, el) {
                            var $article = $('<article>', {
                                    'class': 'item item-related col-md-3 col-sm-4 col-ms-4 col-xs-12 col-centered',
                                    'data-id': el.id,
                                    'id': 'item-' + el.id
                                }),
                                $anchor = $('<a>', {
                                    href: '/buy/' + el.id
                                });
                            $article.append($anchor);
                            $anchor.append(
                                '<figure class="thumb"><img src="' + el.image.replace(/_thumb/, "_b") +'" class="img-responsive" alt="' + el.name_data[lang] + '" nopin="nopin" itemprop="image"></figure>' +
                                '<section class="items-data" itemprop="offers" itemscope="" itemtype="http://schema.org/Offer">' +
                                '<h2 class="items-name" itemprop="name">' + el.name_data[lang] + '</h2>' +
                                '<div class="items-price">' +
                                '<span itemprop="priceCurrency" content="' + currency + '">$</span> <span itemprop="price" content="' + el.price_data[currency] + '">' + parseFloat(el.price_data[currency]).formatCurrency() + '</span>' +
                                '</div></section>'
                            );
                            // Discount
                            if (parseInt(el.discount) > 0) {
                                $article.find('.items-data')
                                    .addClass('discount')
                                    .append('<div class="items-discount">$ ' + (parseFloat(el.price_data[currency]) - parseFloat(el.discount_price_data[currency])).formatCurrency() + ' (-' + el.discount + '%)</div>');
                            }
                            $article.appendTo('.related .grid');
                        });
                    } else {
                        $('.related').remove();
                    }

                    // Sharebuttons
                    $.each($shareButtons, function(k, e) {
                        $(e).find('a').on('click', function(ev) {
                            ev.preventDefault();
                            switch ($(e).data('share')) {
                                case 'fb':
                                    share_url = 'https://www.facebook.com/dialog/share?app_id=357987004560089&display=popup&href=' + encodeURIComponent(window.location.href);
                                    break;
                                case 'tw':
                                    share_url = 'https://twitter.com/intent/tweet?url=' + encodeURIComponent(window.location.href) + '&text=' + item_name + ' by UNMARKED&hashtags=UnmarkedMX';
                            }
                            window.open(share_url, 'Share Dialog', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,width=650,height=450,top=' + (screen.availHeight/2-450/2) + ',left=' + (screen.availWidth/2-650/2));
                        });
                    });
                } else {
                    $detail.html('<div class="text-center col-md-6 col-md-offset-3"><h1 class="text-danger">Lo sentimos, tenemos un problema</h1><p class="lead">No nos fue posible cargar este artículo. Lo más seguro es que no existe este vestido, por favor verifica esta información e inténtalo de nuevo.</p><p class="lead">Tambien puedes visitar la página principal, <a href="/">haciendo click aquí</a>, y así encuentres lo que estas buscando desde el principio.</p></div>');
                    console.warn('No existe este vestido o no esta Público. Verifica ID.');
                }
            }).
            fail(function() {
                $detail.html('<div class="text-center col-md-6 col-md-offset-3"><h1 class="text-danger">Lo sentimos, tenemos un problema</h1><p class="lead">No nos fue posible cargar este artículo. Lo más seguro es que no existe este vestido, por favor verifica esta información e inténtalo de nuevo.</p><p class="lead">Tambien puedes visitar la página principal, <a href="/">haciendo click aquí</a>, y así encuentres lo que estas buscando desde el principio.</p></div>');
                console.error('Error al intentar cargar este artículo');
            });
        }
        window.loadItemDetails = loadItemDetails;
    })();
});
