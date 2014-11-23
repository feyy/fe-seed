/**
 * @file 
 * @author yuebin
 */

define(function(require, exports, module) {
    'use strict';
    
    var etpl = require('etpl');

    var $body = $('body');

    // 通过 exports 对外提供接口
    exports.modal = function(options) {
        // this.destory();
        if (typeof options !== 'object' || typeof options. content !== 'string') {
            return false;
        }
        new Modal(options);
    };

    exports.alert = function(options) {

        options.content = '<div class="modal-tips"><span class="icon icon-alert"></span>'+options.content+'</div>';

        options.btns = ['<button class="btn btn-primary modal-close">确定</button>'];

        this.modal(options);
    };

    exports.succeed = function(options) {

        options.content = '<div class="modal-tips"><span class="icon icon-succeed"></span>'+options.content+'</div>';

        options.btns = ['<button class="btn btn-primary modal-close">确定</button>'];

        this.modal(options);
    };

    exports.error = function(options) {

        options.content = '<div class="modal-tips"><span class="icon icon-failed"></span>'+options.content+'</div>';

        options.btns = ['<button class="btn btn-primary modal-close">确定</button>'];

        this.modal(options);
    };

    // modal默认配置
    var defaultOptions = {
        title: '提示信息',
        btns: []
    };

    /**
     * Modal 类
     * @param {object} options 定义变量
     */
    function Modal(options) {
        var _this = this;
        this.options = options;

        var _$modal = $(etpl.compile(__inline('tpl/modal.html'))($.extend(defaultOptions, options)));

        $body.append(_$modal);

        this.$modalMask = _$modal.eq(0);
        this.$modal = _$modal.eq(_$modal.length-1);

        // 调用用户定义的modal弹出层函数
        if (typeof options.afterOpen === 'function') {
            options.afterOpen(this.$modal);
        }

        // 关闭按钮
        this.$modal.on('click', '.modal-close', function(e) {
            _this.destory();
        });

        /**
         * modal销毁
         */
        this.destory = function() {
            if (typeof this.options.beforClose === 'function') {
                this.options.beforClose(this.$modal);
            }
            this.$modal.off().remove();
            this.$modalMask.off().remove();
        }

        // 对外提供销毁接口
        this.$modal.destory = function() {
            _this.destory();
        }

        /**
         * modal定位
         */
        this.modalAdapt = function() {
            var modalHeight = this.$modal.height();
            var scrollTop = $(window).scrollTop();
            var windowHeight = $(window).height();

            var modalTop = 30;

            if (modalHeight < windowHeight) {
                modalTop = (windowHeight - modalHeight)/2;
            }

            this.$modal.css('top', modalTop + scrollTop).show();
        };

        // 调整窗口位置
        this.modalAdapt();
    }

});