/**
 * @placeholder 兼容支持ie6-8的placeholder属性重写jquery方法，兼容val()取值
 * @author yuebin
 */

define(function(require, exports, module) {
    'use strict';
    var isSupport = 'placeholder' in document.createElement('input');
    var originVal = null;

    // isSupport = !isSupport;

    // 浏览器不支持时执行
    if (!isSupport) {
        // 修改原jquery方法，以兼容
        originVal = jQuery.fn.val;

        jQuery.fn.val = function(value) {
            if (!arguments.length) {
                if ($(this[0]).hasClass('placeholder')) {
                    return '';
                } else {
                    return originVal.call($(this[0]));
                }
            }

            return this.each(function(i) {

                if ($(this).attr('placeholder')) {
                    if (value) {
                        $(this).removeClass('placeholder');
                        originVal.call($(this), value);
                    } else {
                        $(this).addClass('placeholder');
                        originVal.call($(this), $(this).attr('placeholder'));
                    }
                } else {
                    originVal.call($(this), value);
                }

            });
        }
    }
    
    function initialize( $element ) {
        if (isSupport) {
            return false;
        }

        $element.each(function(i) {
            var placeholderText = $(this).attr('placeholder');
            
            if (placeholderText) {
                originVal.call($(this), placeholderText).addClass('placeholder');

                $(this).on('focus', function(e) {
                    if ($(this).hasClass('placeholder')) {
                         originVal.call($(this), '').removeClass('placeholder');
                    }
                });

                $(this).on('blur', function(e) {
                    var value =  originVal.call($(this));

                    if (!value) {
                        originVal.call($(this), $(this).attr('placeholder')).addClass('placeholder');
                    }
                });
            }
        });
    };

    // 由于是工具函数，因此只能被一次全局初始化
    initialize($('input[placeholder], textarea[placeholder]'));

    // 通过 exports 对外提供接口
    exports.init = function($element) {
        initialize($element);
    };
});