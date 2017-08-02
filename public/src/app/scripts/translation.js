$(function() {
    var changeLang = function(lang) {
            if (lang == 'es') {
                currency =  'MXN';
            } else {
                currency =  'USD';
            }
            localStorage[kchnkLS] = '{"store_id":' + store_id + ',"lang":"' + lang + '","currency":"' + currency + '"}';
            location.reload();
        },
        changeLangSelector = (lang == 'es') ? 'en' : 'es';

    // Translations
    $('#shopping-cart-top').after('<li><a href="#" class="currency-selector" data-lang="' + changeLangSelector + '"><i class="fa fa-globe fa-lg"></i>&nbsp;&nbsp;' + ln['currency_label'][lang] + '</a></li>');
    $('#search').find('input[type=text]').prop('placeholder', ln['search'][lang]);
    $('.login-button').html(ln['signin'][lang]);
    $('.secure-shopping').find('span').html(ln['kichink_guarantee_prefix'][lang]).parent().find('a').html(ln['kichink_guarantee'][lang]);
    $('.footer-terms').find('a').html(ln['footer_terms'][lang]);
    $('.footer-privacy').find('a').html(ln['footer_privacy'][lang]);
    $('.footer-guarantee').find('a').html(ln['kichink_guarantee'][lang]);
    $('.footer-faqs').find('a').html(ln['footer_faqs'][lang]);
    $('.footer-learn-more').find('a').html(ln['footer_learn_more'][lang]);
    $('.footer-help').find('a').html(ln['help'][lang]);
    $('.footer-operated').html(ln['footer_operated'][lang]);
    $('.footer-protected').html(ln['footer_protected'][lang]);
    $('.btn-addcart').html(ln['add_cart'][lang]);
    $('#opt-size-first').find('option:first').html(ln['combo_sizes'][lang]);
    $('#opt-size-second').find('option:first').html(ln['combo_units'][lang]);
    $('.detail .complete-description').find('header h3').html(ln['details_title'][lang]);
    $('.detail .related').find('header h3').html(ln['related_items'][lang]);

    $('.currency-selector').on('click', function(ev) {
        ev.preventDefault();
        $(this).html(ln['changing_lang'][lang]);
        changeLang($(this).data('lang'));
    });
});
