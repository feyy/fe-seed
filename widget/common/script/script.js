require.config({
    baseUrl: '/static/widget',
    paths: {
        page: '/static',
        dep: '/static/dep',
        tool: '/static/common/tool',
        commonjs: '/static/common/commonjs',
        etpl: '/static/dep/etpl_3.0.0/etpl.min'
    }
});

// 页面入口加载
require(['page/${pageName}/${pageName}']);
