/**
 * @file 
 * @author yuebin
 */

define(function(require, exports, module) {
    'use strict';

    var hoverTimer = null;

    var $topbar = $('#topbar');
    var $login = $topbar.find('.login');
    
    if ($login.length) {
        $login.attr('href', 'https://passport.58.com/login/?path=' + encodeURIComponent(location.href));
    }
    
    // 是否是IE6
    if (!!window.ActiveXObject && !window.XMLHttpRequest) {
        $topbar.find('.social-weixin').hover(function(e) {
            $(e.target).find('.two-dimension-code').show();
        }, function(e) {
            $(e.target).find('.two-dimension-code').hide();
        });
    }
});
