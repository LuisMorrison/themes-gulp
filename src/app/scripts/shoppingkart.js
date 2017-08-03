/*
* fingerprintJS 0.5.4 - Fast browser fingerprint library
* https://github.com/Valve/fingerprintjs
* Copyright (c) 2013 Valentin Vasilyev (valentin.vasilyev@outlook.com)
* Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
*
* THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
* AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
* IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
* ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
* DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
* (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
* LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
* ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
* (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
* THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

;(function (name, context, definition) {
  if (typeof module !== 'undefined' && module.exports) { module.exports = definition(); }
  else if (typeof define === 'function' && define.amd) { define(definition); }
  else { context[name] = definition(); }
})('Fingerprint', this, function () {
  'use strict';

  var Fingerprint = function (options) {
    var nativeForEach, nativeMap;
    nativeForEach = Array.prototype.forEach;
    nativeMap = Array.prototype.map;

    this.each = function (obj, iterator, context) {
      if (obj === null) {
        return;
      }
      if (nativeForEach && obj.forEach === nativeForEach) {
        obj.forEach(iterator, context);
      } else if (obj.length === +obj.length) {
        for (var i = 0, l = obj.length; i < l; i++) {
          if (iterator.call(context, obj[i], i, obj) === {}) return;
        }
      } else {
        for (var key in obj) {
          if (obj.hasOwnProperty(key)) {
            if (iterator.call(context, obj[key], key, obj) === {}) return;
          }
        }
      }
    };

    this.map = function(obj, iterator, context) {
      var results = [];
      // Not using strict equality so that this acts as a
      // shortcut to checking for `null` and `undefined`.
      if (obj == null) return results;
      if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
      this.each(obj, function(value, index, list) {
        results[results.length] = iterator.call(context, value, index, list);
      });
      return results;
    };

    if (typeof options == 'object'){
      this.hasher = options.hasher;
      this.screen_resolution = options.screen_resolution;
      this.canvas = options.canvas;
      this.ie_activex = options.ie_activex;
    } else if(typeof options == 'function'){
      this.hasher = options;
    }
  };

  Fingerprint.prototype = {
    get: function(){
      var keys = [];
      keys.push(navigator.userAgent);
      keys.push(navigator.language);
      keys.push(screen.colorDepth);
      if (this.screen_resolution) {
        var resolution = this.getScreenResolution();
        if (typeof resolution !== 'undefined'){ // headless browsers, such as phantomjs
          keys.push(this.getScreenResolution().join('x'));
        }
      }
      keys.push(new Date().getTimezoneOffset());
      keys.push(this.hasSessionStorage());
      keys.push(this.hasLocalStorage());
      keys.push(!!window.indexedDB);
      //body might not be defined at this point or removed programmatically
      if(document.body){
        keys.push(typeof(document.body.addBehavior));
      } else {
        keys.push(typeof undefined);
      }
      keys.push(typeof(window.openDatabase));
      keys.push(navigator.cpuClass);
      keys.push(navigator.platform);
      keys.push(navigator.doNotTrack);
      keys.push(this.getPluginsString());
      if(this.canvas && this.isCanvasSupported()){
        keys.push(this.getCanvasFingerprint());
      }
      if(this.hasher){
        return this.hasher(keys.join('###'), 31);
      } else {
        return this.murmurhash3_32_gc(keys.join('###'), 31);
      }
    },

    /**
     * JS Implementation of MurmurHash3 (r136) (as of May 20, 2011)
     *
     * @author <a href="mailto:gary.court@gmail.com">Gary Court</a>
     * @see http://github.com/garycourt/murmurhash-js
     * @author <a href="mailto:aappleby@gmail.com">Austin Appleby</a>
     * @see http://sites.google.com/site/murmurhash/
     *
     * @param {string} key ASCII only
     * @param {number} seed Positive integer only
     * @return {number} 32-bit positive integer hash
     */

    murmurhash3_32_gc: function(key, seed) {
      var remainder, bytes, h1, h1b, c1, c2, k1, i;

      remainder = key.length & 3; // key.length % 4
      bytes = key.length - remainder;
      h1 = seed;
      c1 = 0xcc9e2d51;
      c2 = 0x1b873593;
      i = 0;

      while (i < bytes) {
          k1 =
            ((key.charCodeAt(i) & 0xff)) |
            ((key.charCodeAt(++i) & 0xff) << 8) |
            ((key.charCodeAt(++i) & 0xff) << 16) |
            ((key.charCodeAt(++i) & 0xff) << 24);
        ++i;

        k1 = ((((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16))) & 0xffffffff;
        k1 = (k1 << 15) | (k1 >>> 17);
        k1 = ((((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16))) & 0xffffffff;

        h1 ^= k1;
            h1 = (h1 << 13) | (h1 >>> 19);
        h1b = ((((h1 & 0xffff) * 5) + ((((h1 >>> 16) * 5) & 0xffff) << 16))) & 0xffffffff;
        h1 = (((h1b & 0xffff) + 0x6b64) + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16));
      }

      k1 = 0;

      switch (remainder) {
        case 3: k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16;
        case 2: k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;
        case 1: k1 ^= (key.charCodeAt(i) & 0xff);

        k1 = (((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
        k1 = (k1 << 15) | (k1 >>> 17);
        k1 = (((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;
        h1 ^= k1;
      }

      h1 ^= key.length;

      h1 ^= h1 >>> 16;
      h1 = (((h1 & 0xffff) * 0x85ebca6b) + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff;
      h1 ^= h1 >>> 13;
      h1 = ((((h1 & 0xffff) * 0xc2b2ae35) + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16))) & 0xffffffff;
      h1 ^= h1 >>> 16;

      return h1 >>> 0;
    },

    // https://bugzilla.mozilla.org/show_bug.cgi?id=781447
    hasLocalStorage: function () {
      try{
        return !!window.localStorage;
      } catch(e) {
        return true; // SecurityError when referencing it means it exists
      }
    },

    hasSessionStorage: function () {
      try{
        return !!window.sessionStorage;
      } catch(e) {
        return true; // SecurityError when referencing it means it exists
      }
    },

    isCanvasSupported: function () {
      var elem = document.createElement('canvas');
      return !!(elem.getContext && elem.getContext('2d'));
    },

    isIE: function () {
      if(navigator.appName === 'Microsoft Internet Explorer') {
        return true;
      } else if(navigator.appName === 'Netscape' && /Trident/.test(navigator.userAgent)){// IE 11
        return true;
      }
      return false;
    },

    getPluginsString: function () {
      if(this.isIE() && this.ie_activex){
        return this.getIEPluginsString();
      } else {
        return this.getRegularPluginsString();
      }
    },

    getRegularPluginsString: function () {
      return this.map(navigator.plugins, function (p) {
        var mimeTypes = this.map(p, function(mt){
          return [mt.type, mt.suffixes].join('~');
        }).join(',');
        return [p.name, p.description, mimeTypes].join('::');
      }, this).join(';');
    },

    getIEPluginsString: function () {
      if(window.ActiveXObject){
        var names = ['ShockwaveFlash.ShockwaveFlash',//flash plugin
          'AcroPDF.PDF', // Adobe PDF reader 7+
          'PDF.PdfCtrl', // Adobe PDF reader 6 and earlier, brrr
          'QuickTime.QuickTime', // QuickTime
          // 5 versions of real players
          'rmocx.RealPlayer G2 Control',
          'rmocx.RealPlayer G2 Control.1',
          'RealPlayer.RealPlayer(tm) ActiveX Control (32-bit)',
          'RealVideo.RealVideo(tm) ActiveX Control (32-bit)',
          'RealPlayer',
          'SWCtl.SWCtl', // ShockWave player
          'WMPlayer.OCX', // Windows media player
          'AgControl.AgControl', // Silverlight
          'Skype.Detection'];

        // starting to detect plugins in IE
        return this.map(names, function(name){
          try{
            new ActiveXObject(name);
            return name;
          } catch(e){
            return null;
          }
        }).join(';');
      } else {
        return ""; // behavior prior version 0.5.0, not breaking backwards compat.
      }
    },

    getScreenResolution: function () {
      return [screen.height, screen.width];
    },

    getCanvasFingerprint: function () {
      var canvas = document.createElement('canvas');
      var ctx = canvas.getContext('2d');
      // https://www.browserleaks.com/canvas#how-does-it-work
      var txt = 'http://valve.github.io';
      ctx.textBaseline = "top";
      ctx.font = "14px 'Arial'";
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = "#f60";
      ctx.fillRect(125,1,62,20);
      ctx.fillStyle = "#069";
      ctx.fillText(txt, 2, 15);
      ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
      ctx.fillText(txt, 4, 17);
      return canvas.toDataURL();
    }
  };

  return Fingerprint;

});

/*
 /*
 * Shopping Kart v1.0
 * By Roberto Romero @ kichink
 * 9 Oct 2014
 *
 * Shopping Kart v1.5
 * Written by Luis Morrison @ kichink
 * 24 Nov 2015
 * added: max_items
 */

if (window.jQuery)
    (function($) {

        var fingerprint = 0;
        try {
            fingerprint = new Fingerprint({canvas: true}).get();
        } catch(e) {
            fingerprint = 0;
        }

        $.fn.ShoppingKart = function(options)
        {
            return this.each(function()
            {
                var element = $(this);
                // Return early if this element already has a plugin instance
                if (element.data('ShoppingKart'))
                    return;
                // pass options to plugin constructor
                var myplugin = new ShoppingKart(this, options);
                // Store plugin object in this element's data
                element.data('ShoppingKart', myplugin);
                element.data().ShoppingKart.methods.init();
            });
        };

        (function(a) {
            (jQuery.browser = jQuery.browser || {}).mobile = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))
        })(navigator.userAgent || navigator.vendor || window.opera);

       //Inicializacion
        var ShoppingKart = function(target, options) {
            var componentObj = {
                text: '', //El texto que acompaña al carrito
                currency: 'MXN', //USD si son dolares
                theme: 'badge', // badge | button , Cambia entre visualizacion badge y boton
                loadingText: 'Cargando...', //texto que aparece entre transicion del botn
                checkoutVersion: 2, // deprecao, pedir la version de checkout
                beforeText: 'Lo quiero', //texto inicial del boton
                showOnPurchase: false, //si al momento de dar clic
                placement: 'left', //donde va alineado el carrito
                max_purchase: 0, //para bloquear el carrito maximo de compra $$
                min_purchase: 0, //para bloquear el carrito minimo de compra $$
                max_items: 0, //el número máximo de items permitido por carrito
                store_id: 0, //id de la tienda
                busy: false,
                ref: '',
                checkoutURI: '/checkout',
                button: "#buy_button", //id en nomenclatura js del boton que dispara el carrito
                onClose: function() { //se dispara despues de cerrar el checkout
                    window.top.location.reload();
                },
                after: function() { //se dispara despues de darle clic al boton comprar
                },
                methods: {
                    init: function() {
                        function getQueryVariable(variable, get) {
                                var query = window.location.search.substring(1);
                                var vars = query.split("&");
                                for (var i = 0; i < vars.length; i++) {
                                    var pair = vars[i].split("=");
                                    if (pair[0] == variable) {
                                        return (get!=undefined)?pair[1]:true;
                                    }
                                }
                                return false;
                        }

                        if (navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1) {

                            if (document.cookie.indexOf("isS4F4R1") >= 0) {
                            } else {
                                if (getQueryVariable("byp455")) {
                                    // They've been here before.
                                    document.cookie = "isS4F4R1=true";
                                } else {
                                    window.location.href = ((window.location.href.indexOf(".nb9.mx") > 1) ? "http://www.kichink.nb9.mx" : "https://www.kichink.com") + "/home/issafari?uri=" + window.location.href;
                                }
                            }
                        }

                        if (getQueryVariable("ref")) {
                                componentObj.ref = getQueryVariable("ref",true);
                        }else{
                            if(options.ref!=undefined){
                                componentObj.ref = options.ref;
                            }
                        }
                        if (options.currency != undefined) {
                            componentObj.currency = options.currency;
                        }
                        if (options.max_purchase != undefined) {
                            componentObj.max_purchase = options.max_purchase;
                        }
                        if (options.min_purchase != undefined) {
                            componentObj.min_purchase = options.min_purchase;
                        }
                        if (options.max_items != undefined) {
                            componentObj.max_items = options.max_items;
                        }
                        if (options.beforeText != undefined) {
                            componentObj.beforeText = options.beforeText;
                        }
                        if (options.onClose != undefined) {
                            componentObj.onClose = options.onClose;
                        }
                        if (options.checkoutURI != undefined) {
                            componentObj.checkoutURI = options.checkoutURI;
                        }
                        if (options.checkoutVersion != undefined) {
                            componentObj.checkoutVersion = options.checkoutVersion;
                        }
                        if (options.loadingText != undefined) {
                            componentObj.loadingText = options.loadingText;
                        }
                        if (options.text != undefined) {
                            componentObj.text = options.text;
                        }
                        if (options.showOnPurchase != undefined) {
                            componentObj.showOnPurchase = options.showOnPurchase;
                        }
                        if (options.theme != undefined) {
                            componentObj.theme = options.theme;
                        }
                        if (options.store_id != undefined) {
                            componentObj.store_id = options.store_id;
                        }
                        if (options.button != undefined) {
                            componentObj.button = options.button;
                        }
                        if (options.placement != undefined) {
                            componentObj.placement = options.placement;
                        }

                        var modal = document.createElement("div");
                        $(modal).addClass("checkout-modal").addClass("v"+componentObj.checkoutVersion.toString().replace(/\./g,'_'));
                        $(modal).attr("data-version",componentObj.checkoutVersion);
                        $(modal).attr("id", "checkout-modal");

                        var close = document.createElement("a");
                        $(close).addClass("close");
                        $(close).html("&times;");
                        $(close).click(function() {
                            $("#checkout-modal").fadeOut("slow");
                            $("#checkout-modal").find("iframe").attr("src", "");
                            $("body").css("overflow", "auto");
                            componentObj.methods.update_shoppingcart(componentObj.store_id);
                            componentObj.onClose();
                        });

                        var div2 = document.createElement("div");
                        $(div2).addClass("checkout-dialog");

                        $(div2).append('<iframe src="" width="100%" height="100%" frameborder="0">');

                        $(div2).prepend(close);
                        $(modal).append(div2);

                        $(modal).append("<div class='checkout-background'></div>");

                        if ($("#checkout-modal").length < 1)
                            $("body").append(modal);

                        var a = document.createElement("a");
                        $(a).attr("href", "#");
                        if (componentObj.theme == "button") {
                            $(a).addClass("buttonknk");
                            $(a).append('<span class="counting">0</span>');
                        }
                        else {
                            $(a).append(componentObj.text + '&nbsp;<span class="badge counting">0</span>');
                        }

                        $(a).click(function(event) {
                            event.preventDefault();
                            $(".shopping-cart").hide();
                            $(this).addClass("openbtnknk");
                            $(this).next(".shopping-cart").show();
                        });

                        $(target).append(a);

                        var div = document.createElement("div");
                        $(div).addClass("shopping-cart");
                        if (componentObj.placement === "right")
                            $(div).addClass("placement-right");

                        close = document.createElement("a");
                        $(close).addClass("close");
                        $(close).append("&times;");
                        $(close).click(function() {
                            $(".shopping-cart").hide();
                            $(".buttonknk.openbtnknk").removeClass("openbtnknk");
                        });

                        $(div).append(close);
                        $(div).append('<div class="header-shopping-cart">Hay <span class="counting">0</span> productos en tu orden</div></div>');
                        $(div).append('<div class="body-shopping-cart" role="presentation"><br><center><img src="https://www.kichink.com/img/checkout/ticket_tip_cart.png"/></center><br/><br/></div>');
                        $(target).append(div);
                        $(target).css("position", "relative");
                        $(target).css("display", "inline-block");

                        componentObj.methods.update_buttons();
                        componentObj.methods.update_shoppingcart(componentObj.store_id);

                    },
                    update_buttons: function() {
                        $(componentObj.button).unbind("click");
                        $(componentObj.button).on('click', function() {

                            var e = $(this);
                            if (!componentObj.busy) {
                                $("#checkout-modal").find("iframe").attr("src", "");

                                if ((componentObj.max_items > 0) && (parseInt($('.counting').html()) == componentObj.max_items)) {
                                    $(".open-checkout").find(".message").remove();
                                    $(".open-checkout").append("<span class='message'>Has alcanzado el m&aacute;ximo de art&iacute;culos permitidos para este carrito que es de " + componentObj.max_items + " art&iacute;culos</span>");
                                    alert("No se puede agregar este item al carrito de compras porque esta limitado a " + componentObj.max_items + " artículos por carrito.");
                                } else {
                                    $(".open-checkout").find(".message").remove();
                                    $.ajax({
                                        type: "GET",
                                        dataType: "jsonp",
                                        jsonp: "callback",
                                        beforeSend: function() {
                                            e.addClass("disabled");
                                            e.html(componentObj.loadingText);
                                            if ($(".loader").length < 1) {
                                                $(".checkout-list").append('<div class="loader"><img src="' + s3_uri + '/images/loader.gif"/></div>');
                                            }
                                            componentObj.busy = true;
                                        },
                                        xhrFields: {
                                            withCredentials: true
                                        },
                                        crossDomain: true,
                                        url: componentObj.checkoutURI + "/save_to_cart/" + $(this).data().id,
                                        data: {
                                            id: $(this).data().id,
                                            qty: ($(this).data().quantity) ? $(this).data().quantity : '',
                                            purcOpt: ($(this).data().purchase_option) ? $(this).data().purchase_option : '',
                                            key_user_indent: fingerprint
                                        },
                                        success: function(data) {
                                            $(componentObj.button).removeClass("disabled");

                                            e.html(componentObj.beforeText);
                                            $(".checkout-list").find(".loader").remove();
                                            if (data === true) {
                                                componentObj.methods.update_shoppingcart(componentObj.store_id);
                                                if (componentObj.showOnPurchase) {
                                                    $($(".shopping-cart").get(0)).show();
                                                }
                                            }
                                            else {
                                                alert("No puede agregarse otro producto de este tipo al carrito.");
                                            }
                                            componentObj.busy = false;
                                        }
                                    });
                                }

                                componentObj.after($(this).data());

                            }
                        });

                        if (componentObj.theme == "button") {
                            $(".shopping-cart").css("marginTop", 0);
                        }
                    },
                    update_shoppingcart: function(store_id) {
                        $.ajax({
                            type: "GET",
                            xhrFields: {
                                withCredentials: true
                            },
                            crossDomain: true,
                            dataType: "jsonp",
                            jsonp: "callback",
                            url: componentObj.checkoutURI + "/get_cart/" + store_id,
                            data: {
                                key_user_indent: fingerprint
                            },
                            success: function(arr) {
                                $(".counting").html(Object.keys(arr).length);

                                if (arr) {
                                    $(".shopping-cart").find(".body-shopping-cart").html("");
                                    if (Object.keys(arr).length > 0) {
                                        if (jQuery.browser.mobile) {
                                            $(".shopping-cart").find(".body-shopping-cart").append('<div class="open-checkout"><a target="_blank" href="' + componentObj.checkoutURI + "/display/?item=" + arr[0].id  + "&ref="+componentObj.ref + '" class="btn btn-info form-control checkout-btn">Pagar mi orden</a></div><div class="checkout-list"></div>');
                                        } else {
                                            $(".shopping-cart").find(".body-shopping-cart").append('<div class="open-checkout"><button class="btn btn-info form-control checkout-btn">Pagar mi orden</button></div><div class="checkout-list"></div>');
                                        }

                                        $("#checkout-modal").find("iframe").attr("src", "");
                                        $("#checkout-modal").find("iframe").attr("src", componentObj.checkoutURI + "/display/?item=" + arr[0].id + "&ref="+componentObj.ref);

                                        $(".shopping-cart").find(".checkout-btn").click(function() {
                                            if (!jQuery.browser.mobile) {
                                                $(".shopping-cart").hide();
                                                $(".buttonknk.openbtnknk").removeClass("openbtnknk");
                                                $("#checkout-modal").fadeIn("slow");
                                                $("body").css("overflow", "hidden");
                                                $("#checkout-modal").find("iframe").attr("src", "");
                                                $("#checkout-modal").find("iframe").attr("src", componentObj.checkoutURI + "/display/?item=" + arr[0].id + "&ref="+componentObj.ref);
                                            }
                                        });
                                        $(".badge.counting").each(function(i, e) {
                                            if (!$(e).hasClass("urgent")) {
                                                $(e).addClass("urgent");
                                            }
                                        });
                                    } else {
                                        $(".badge.counting.urgent").removeClass("urgent");
                                    }

                                    var total = 0;
                                    var checkoutCurrency = '';

                                    for (k in arr) {
                                        var div = document.createElement("div");
                                        $(div).addClass("list-item");
                                        $(div).attr("data-id", arr[k].id);
                                        $(div).data("id", arr[k].id);

                                        var a = document.createElement("a");
                                        $(a).addClass("menuitem");

                                        var img = document.createElement("img");
                                        $(img).addClass("pull-left");
                                        $(img).attr("src", arr[k].image);
                                        $(img).attr("width", "40px");
                                        $(a).append(img);

                                        var div2 = document.createElement("div");
                                        $(div2).addClass("item-cart-data");

                                        var myownname=arr[k].name;
                                        if(arr[k].purcharse_option){
                                            myownname+=" ("+arr[k].purcharse_option+")";
                                        }

                                        $(div2).append("<b>" + myownname + "</b>");

                                        if (arr[k].price) {
                                            checkoutCurrency = arr[k].currency;
                                            $(div2).append("<span>$" + arr[k].price.toString().replace(/,/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " " + checkoutCurrency +"</span>");
                                        }
                                        $(div2).append("<div class='item-cart-q'>x " + arr[k].units + "</div>");
                                        $(a).append(div2);

                                        total += parseFloat(arr[k].price);

                                        $(a).click(function() {
                                            if (!jQuery.browser.mobile) {
                                                if (total >= parseFloat(componentObj.min_purchase)) {
                                                    $(".shopping-cart").hide();
                                                    $(".buttonknk.openbtnknk").removeClass("openbtnknk");
                                                    $("#checkout-modal").fadeIn("slow");
                                                    $("body").css("overflow", "hidden");
                                                }
                                            }
                                        });

                                        $(div).append(a);
                                        $(".shopping-cart").find(".body-shopping-cart .checkout-list").append(div);
                                    }

                                    $(".shopping-cart").find(".body-shopping-cart").append('<div class="subtotal" align="center">Subtotal $' + total.toFixed(2).toString().replace(/,/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",") +" "+ checkoutCurrency +'</div>');

                                    if (componentObj.min_purchase > 0) {
                                        if (total < parseFloat(componentObj.min_purchase)) {
                                            $(".open-checkout .checkout-btn").addClass("disabled");
                                            $(".open-checkout").append("<span class='message'>El monto m&iacute;nimo de compra es de $" + componentObj.min_purchase.toString().replace(/,/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " " + checkoutCurrency + "</span>");
                                        } else {
                                            $(".open-checkout .checkout-btn").removeClass("disabled");
                                            $(".open-checkout").find(".message").remove();
                                        }
                                    }

                                    if (componentObj.max_purchase > 0) {
                                        if (total > parseFloat(componentObj.max_purchase)) {
                                            $(".open-checkout .checkout-btn").addClass("disabled");
                                            $(".open-checkout").append("<span class='message'>El monto m&aacute;ximo de compra es de $" + componentObj.max_purchase.toString().replace(/,/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "</span>");
                                        } else {
                                            $(".open-checkout .checkout-btn").removeClass("disabled");
                                            $(".open-checkout").find(".message").remove();
                                        }
                                    }

                                    if ((componentObj.max_items > 0) && (componentObj.max_items == Object.keys(arr).length)) {
                                        $(".open-checkout").find(".message").remove();
                                        $(".open-checkout").append("<span class='message'>Has alcanzado el m&aacute;ximo de art&iacute;culos permitidos para este carrito que es de " + componentObj.max_items + " art&iacute;culos</span>");
                                    } else {
                                        $(".open-checkout").find(".message").remove();
                                    }

                                }

                            }
                        });

                    }
                }
            }
            return componentObj;
        };
    })(jQuery);
