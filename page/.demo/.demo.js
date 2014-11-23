/**
 * @file 首页入口
 * @author yuebin
 */

define(function(require, exports, module) {
    'use strict';

    // var $ = require('jquery');
    var header = require('header/header');
    var footer = require('footer/footer');

    // 通过 exports 对外提供接口
    // exports.doSomething = ...

    // 或者通过 module.exports 提供整个接口
    // module.exports = ...
    header.test();
    footer.test();

});