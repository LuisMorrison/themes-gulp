'use strict';

var fingerprint = 0,
    fingerprint2,
    ix = (window.location.hostname.substr(0,9) == 'www.local') ? 0 : 1, // Switch para ID de local o prod
    kchnkLS = 'kichink_locales_' + store_id,
    href = '/stores/' + url_name + '/',
    langData,
    ln,
    lang,
    currency,
    changeLang,
    changeCurency;

try {
    fingerprint = new Fingerprint({ canvas: true }).get();
} catch(e) {
    fingerprint = 0;
}

new Fingerprint2().get(function(result) {
    fingerprint2 = result;
});

if ($.isEmptyObject(localStorage[kchnkLS])) {
    localStorage[kchnkLS] = '{"store_id":' + store_id + ',"lang":"es","currency":"MXN"}';
}
langData = JSON.parse(localStorage[kchnkLS]);

lang = langData.lang;
currency = langData.currency;
ln = jsonData.languages;

$(function() {
    var loadSubcats = function(categories, level, segment) {
        var level, segment, menu, aligned;
        level = typeof level !== 'undefined' ? level : 0;
        segment = typeof segment !== 'undefined' ? segment : '';
        menu = '';
        for (i in categories) {
            aligned = (!$.isEmptyObject(categories[i].align) ? ' pull-' + categories[i].align : '');
            if (!$.isEmptyObject(categories[i].subcats)) {
                if (level === 0) {
                    menu += '<li class="category sub-category' + aligned + '" data-category="' + categories[i].slug + '">' +
                            '<a href="' + href + categories[i].slug + '/' + categories[i].id[ix] + '"' +
                            'class="dropdown-toggle"' +
                            'data-toggle="dropdown"' +
                            'role="menu"' +
                            'aria-haspopup="true"' +
                            'aria-expanded="false">' + categories[i].name[lang] + '&nbsp;<span class="caret"></span>' +
                            '</a>';
                } else if (level > 0) {
                    menu += '<li class="dropdown-submenu">' +
                            '<a href="#" tabindex="-1">' + categories[i].name[lang] + '</a>';
                }
                if (!$.isEmptyObject(categories[i].subcats)) {
                    menu += '<ul class="dropdown-menu">' +
                            loadSubcats(categories[i].subcats, level + 1, (categories[i].slug + '/' || undefined)) +
                            '</ul>';
                }
                menu += '</li>';
            } else {
                if ($.isEmptyObject(categories[i].name[lang])) {
                    menu += '<li class="category segment' + aligned + '"><a href="' + href + segment + categories[i].id[ix] + '">' + categories[i].name[lang] + '</a></li>';
                } else {
                    menu += '<li class="category' + aligned + '" data-category="' + categories[i].slug + '"><a href="' + href + ((level === 1) ? segment + categories[i].id[ix] : categories[i].slug) + '">' + categories[i].name[lang] + '</a></li>';
                }
            }
        }
        return menu;
    };

    $('ul.categories-menu').append(loadSubcats(jsonData.categories.menu))
                           .find('.category[data-category=' + this_page + ']')
                           .addClass('active');

    $.each(jsonData.categories.menu, function(i, e) {
        $('ul.categories-footer').append('<li><a href="' + href + e.slug + '">' + e.name[lang] + '</a></li>');
    });

    $('.shoppingkart').ShoppingKart({
        text: '<i class="fa fa-shopping-cart fa-lg"></i>&nbsp;&nbsp;' + ln['shoppingkart'][lang] + '&nbsp;',
        store_id: store_id,
        theme: 'badge',
        button: '.btn-addcart',
        checkoutVersion: checkout_version,
        checkoutURI: checkout_url,
        placement: 'right',
        showOnPurchase: true
    });

    $('.login-button').LoginForm({
        type: 'button',
        lang: 'es',
        username: '',
        hasSession: false,
        onceLogged: function() {
            $('.shoppingkart').data().ShoppingKart.methods.update_shoppingcart(store_id);
        }
    });

    $('#search input[type=text]').SearchBox({ store_id: store_id });

    $('.dropdown-toggle').dropdown();

    switch (this_page) {
        case 'home':
            initHomeStoreSectons();
            break;
        case 'shop':
            // Grid view
            populateGridProducts();
            break;
        case 'detail':
            // Item details
            loadItemDetails();
            break;
        case 'about':
            $('.about-content').appendJSON(jsonData.pages[this_page][lang]);
            break;
        case 'contact':
            break;
        case 'faq':
            $('.faq-content').appendJSON(jsonData.pages[this_page][lang]);
            break;
    }
});
