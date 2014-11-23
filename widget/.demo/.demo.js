/**
 * @file 
 * @author yuebin
 */

define(function(require, exports, module) {
    'use strict';

    var $demo = $('.demo');

    // 通过 exports 对外提供接口
    exports.init = function () {
        // 防止没有依赖DOM时候模块的初始化,用于模块加载的AB test
        if (!$demo.length) {
            return false;
        }
    };
});