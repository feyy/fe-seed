/**
 * @form 表单js,兼容到ie6
 * @author yuebin
 */

/* ------------------- example ------------------------
$form.data('verifier', {        //验证器配置
    name: function(value) {
        return '错误提示';
    }
}).on('doSubmit', function(e) {      //通过验证器验证后触发自定义提交事件
    // TODO
});
*/


define(function(require, exports, module) {
    'use strict';
    
    var $select = null;
    var $selectText = null;
    var $selectValue = null;
    var $optilnList = null;

    // 模拟下拉菜单点击事件
    $(document).on('click', '.select', function(e) {
        var _$select = $(this).closest('.select');

        if (_$select.children('.option-list:visible').length) {
            return true;
        }

        $optilnList && $optilnList.off().hide();
        $select = _$select;
        $optilnList = $select.children('.option-list');
        $selectText = $select.children('.select-text');
        $selectValue = $select.children('.select-value');

        // 增加focus状态
        $select.addClass('select-focus');
        
        // 重置选择状态
        var _selectText = $selectText.text();
        $optilnList.children().removeClass('selected').each(function(i, v) {
            if ($(this).text() === _selectText) {
                $(this).addClass('selected');
                return false;
            }
        });

        // 待选项事件绑定
        $optilnList.show().on('mouseenter', 'li', function(e) {
            if (!$(this).hasClass('selected')) {
                $(this).addClass('selected').siblings('.selected').removeClass('selected');
            }
        }).on('click', 'li', function(e) {
            $selectValue.val($(this).data('value') || $(this).text());
            $selectText.text($(this).text()).removeClass('placeholder');
            $select.removeClass('select-focus');
        });

        // 若刚展开，阻止事件冒泡
        return false;
    });
    
    // 模拟radio button点击事件
    $(document).on('click', '.radio-user', function(e) {
        if (!$(e.target).hasClass('radio-user-checked')) {
            $(e.target).addClass('radio-user-checked')
                .find('input:radio').prop('checked', true)
                .end().siblings('.radio-user-checked').removeClass('radio-user-checked')
                .find('input:radio').prop('checked', false);
        }
    });

    // 点击任何位置关闭选项列表
    $(document).on('click', function() {
        $optilnList && $optilnList.hide();
        $select && $select.removeClass('select-focus');
    });

    // 通用验证写法
    $(document).on('submit', function(e) {
        var verifier = $(e.target).data('verifier');
        var invalidate = false;
        var postData = $(e.target).serializeArray();

        if (typeof verifier === 'object') {

            $(e.target).find('.error').removeClass('error').end().find('.error-info, .form-error-info').hide();

            for (var i = 0; i < postData.length; i++) {
                if (verifier[postData[i].name]) {
                    var verifyTips = verifier[postData[i].name](postData[i].value);
                    if (verifyTips) {
                        var $target = $(e.target).find('input[name=' + postData[i].name + ']');
                        
                        // 若为模拟select元素则目标元素为.select
                        if ($target.hasClass('select-value')) {
                            $target = $target.closest('.select');
                        }

                        // 目标元素增加error样式，并填写和展示错误提示
                        $target.addClass('error')
                            .nextAll('.error-info').show().text(verifyTips);
                            
                        invalidate = true;
                    }
                }
            }

            // 验证未通过，阻止默认事件
            if (invalidate) {
                return false;
            } else {
                // 触发自定义事件
                $(e.target).trigger('doSubmit');
            }
        } else {
            $(e.target).trigger('doSubmit');
        }

        // 若未定义action属性，则阻止form表单的提交
        if(!$(e.target).attr('action')) {
            e.preventDefault();
        }
    });
});