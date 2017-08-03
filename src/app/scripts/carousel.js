$(function() {
    (function() {
        function createHomeCarousel() {
            var carousel = jsonData.home.carousel,
                featured = jsonData.home.featured,
                $homeCarousel = $('#carousel-home'),
                $featured = $('.featured'),
                d = new Date(),
                today = d.getFullYear() + ('0' + (d.getMonth() + 1)).slice(-2) + '' + ('0' + d.getDate()).slice(-2),
                itemContent, itemTarget,
                since, until;

            if (!$.isEmptyObject(carousel)) {
                $.each(carousel, function(k, item) {
                    itemContent = '<img src="' + item.image + '" width="100%">';
                    since = !$.isEmptyObject(item.since) ? item.since.replace(/-/g,'') : today;
                    until = !$.isEmptyObject(item.until) ? item.until.replace(/-/g,'') : '';
                    if ((since <= today) && (until >= today || until == '')) {
                        var $itemDiv = $('<div>', {
                                'class': 'item',
                                'html': itemContent
                            });
                        $homeCarousel.find('.carousel-inner').append($itemDiv);
                        if (!$.isEmptyObject(item.caption)) {
                            var $caption = $('<div>', {
                                    'class': 'carousel-caption',
                                    'html': '<h3>' + item.caption.header + '</h3>' +
                                            '<p>' + item.caption.tagline + '</p>' +
                                            (!$.isEmptyObject(item.caption.button) ? '<a href="' + item.caption.link + '" class="btn btn-default">' + item.caption.button + '</a>' : '')
                                });
                            $caption.appendTo($itemDiv.append('<div class="overlay"></div>'));
                        }
                        if (!$.isEmptyObject(item.link)) {
                            itemTarget = !$.isEmptyObject(item.target) ? ' target="' + item.target + '"' : '';
                            $itemDiv.wrapInner('<a href="' + item.link + '"' + itemTarget + '></a>');
                        }
                    }
                });
                $homeCarousel.find('.item').first().addClass('active');
                if ($homeCarousel.find('.item').length < 2) {
                    $homeCarousel.find('.carousel-control').remove();
                }
            } else {
                $homeCarousel.remove();
            }

            if (!$.isEmptyObject(featured)) {
                $.each(featured, function(k, item) {
                    itemContent = '<div class="item-caption">' +
                                  '<h3>' + item.title[lang] + '</h3>' +
                                  '<small>Shop</small></div>' +
                                  '<img src="' + item.image + '" width="100%">';
                    var $itemDiv = $('<div>', {
                        'class': 'col-md-4 col-sm-4 col-xs-4',
                        'html': itemContent
                    });
                    $featured.append($itemDiv);
                    if (!$.isEmptyObject(item.link)) {
                        itemTarget = !$.isEmptyObject(item.target) ? ' target="' + item.target + '"' : '';
                        $itemDiv.wrapInner('<a href="' + item.link + '"' + itemTarget + '></a>');
                    }
                });
                $featured.wrapInner('<div class="row"></div>');
            } else {
                $featured.remove();
            }
        }
        window.createHomeCarousel = createHomeCarousel;
    })();
});
