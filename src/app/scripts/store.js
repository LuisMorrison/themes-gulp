$(function() {
    (function() {
        function initHomeStoreSectons() {
            var arrivalsCatId = jsonData.home.arrivals[ix];

            createHomeCarousel();

            $('.new-arrivals').find('.products').GridProdukts({
                store_id: store_id,
                pagination: 'normal',
                page: 1,
                limit: 4,
                catsand: arrivalsCatId,
                loadingHTML: '<ins class="loader"><img src="' + s3_uri + '/images/k-loader.gif"></ins>',
            });

            var instafeed = new Instafeed({
                clientId: 'b7644751f30643d1827aba9bfa2c9b4a',
                accessToken: '14447756.1677ed0.60ae875c5a9a40549b5c7331ee0354cc', // http://instagram.pixelunion.net
                target: 'feed',
                get: 'user',
                userId: '14447756', // @luismorrison – https://smashballoon.com/instagram-feed/find-instagram-user-id/
                limit: 6,
                resolution: 'low_resolution',
                template: '<div class="col-md-2 col-sm-4 col-xs-4"><a href="{{link}}" target="_blank"><img src="{{image}}" class="img-responsive" alt="{{caption}}"></a></div>'
            });
            instafeed.run();
        }
        window.initHomeStoreSectons = initHomeStoreSectons;
    })();
});
