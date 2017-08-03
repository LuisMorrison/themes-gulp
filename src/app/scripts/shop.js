$(function() {
    (function() {
        function populateGridProducts() {
            $grid = $('.grid');
            $grid.GridProdukts({
                store_id: store_id,
                page: 1,
                limit: 12,
                catsand: cat_id,
                onSuccess: function() {
                    $('article.item').removeClass().addClass('item col-md-4 col-sm-6 col-ms-6 col-xs-12');
                    $grid.find('.btn-ribbon').remove();
                    $grid.append('<a href="/stores/' + url_name + '/shop" class="btn btn-ribbon shop-all">' + ln['shop_all_btn'][lang] + '</a>');
                },
                loadingHTML: '<ins class="loader"><img src="' + s3_uri + '/images/k-loader.gif"></ins>'
            });
            var $aside = $('.categories');
            $aside.append('<ul></ul>');
            $.each(jsonData.categories.subcats, function(k, subcat) {
                $aside.find('ul').append('<li><a href="/stores/' + url_name + '/shop/' + subcat.id[ix] + '">' + subcat.name[lang] + '</a></li>');
            });
        }
        window.populateGridProducts = populateGridProducts;
    })();
});
