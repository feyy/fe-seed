/
//Step 1. 取消下面的注释开启simple插件，注意需要先进行插件安装 npm install -g fis-postpackager-simple
fis.config.set('modules.postpackager', 'simple');

//通过pack设置干预自动合并结果，将公用资源合并成一个文件，更加利于页面间的共用
//Step 2. 取消下面的注释开启pack人工干预
var pack_config = {};
fis.config.set('pack', pack_config);

var staticsPath = '/static';
var staticsPrefix = '';
var templatesPath = '/WEB-INF/views';
var templatesSuffix = 'vm';

// 8位时间戳，精确到2分钟的发布区分
var timestamp = '_=' + new Date().getTime().toString().substr(0,8);

// 发布时候采用不同的roadmap ——即使用fis release -cod publish时候
var isPublish = process.title.split(/\s/)[3].indexOf('publish') != -1;
if (isPublish) {
    staticsPrefix = '/resources';
    templatesPath = '/views';
    templatesSuffix = 'html';
}
// 判断fis relase时候是否带-p参数
var isPackage = process.title.split(/\s/)[2].indexOf('p') != -1;

// fis 配置文件覆盖
var merger_config = {
    statics: staticsPath,
    staticsPrefix: staticsPrefix,
    templates: templatesPath,

    project: {
        exclude: /^\/doc\/|\/dep\/est|\/output\/|.*\/\.demo\//i
    },

    modules: {

        parser: {
            less: 'less'
        },

        lint: {
            js: 'jshint',
            css: 'csslint'
        },

        preprocessor: {
            vm: filePreprocessor,
            html: filePreprocessor
        },

        postprocessor: {
            js: filePostprocessor
        }
    },

    settings: {
        spriter: {
            csssprites: {
                margin: '10',
                layout: 'matrix'
            }
        },
        optimizer: {
            'uglify-js': {
                mangle: {
                    except: 'require, define'
                },
                compress: {
                    drop_console: true,
                    drop_debugger: true
                }
            },
            'png-compressor' : {
                type : 'pngquant' //default is pngcrush, pngquant可以自动将所有png24的图片转为png8
            }
        },
        lint: {
            csslint: {
                // 若ie值为false，则忽略所有与IE兼容性相关的校验规则
                ie: false,
                // 要忽略的规则ID列表
                ignore: ['font-sizes', 'outline-none', 'compatible-vendor-prefixes', 'star-property-hack']
            }
        }
    },

    deploy: {
        local: {
            exclude : /\/widget\/.*.css|\/static\/common\/less-config.css|\/static\/common\/component\/.*.css|\/doc\/|\/dep\/est|map.json/i,
            to: 'C:/Users/yuebin58/AppData/Local/.jello-tmp/www'
        },
        publish : {
            exclude : /\/widget\/.*.css|\/static\/common\/less-config.css|\/static\/common\/component\/.*.css|\/doc\/|\/dep\/est|\/test\/|map.json|server.conf/i,
            //from参数省略，表示从发布后的根目录开始上传
            //发布到当前项目的上一级的output目录中
            to : '../'
        },
    }
}

var roadmap = {
    ext: {
        less: 'css',
        vm: templatesSuffix
    },

    path: [
        {
            reg: /^\/page\/.+\/(.+)\.vm$/i,
            isMod: true,
            url: '/page/$1',
            isHtmlLike: true,
            release: '/${templates}/page/$1',
            extras: {
                isPage: true
            }
        },
        {
            reg: /^\/page\/(.+)$/i,
            url: '${statics}/$1',
            release: '${staticsPrefix}${statics}/$1',
            useSprite: true,
            query: '?' + timestamp
        },
        {
            reg: /^\/widget\/(.+)\.vm$/i,
            isMod: true,
            url: '/widget/$1',
            release: '${templates}/widget/$1'
        },
        {
            reg: /^\/widget\/(.*)$/i,
            isMod: false,
            url: '${statics}/widget/$1',
            release: '${staticsPrefix}${statics}/widget/$1'
        },
        {
            reg: /^\/(static)\/(.*)/i,
            url: '${statics}/$2',
            release: '${staticsPrefix}${statics}/$2',
            useSprite: true,
            query: '?' + timestamp,
        },
        {
            reg: /^\/dep\/(.*)/i,
            url: '${statics}/dep/$1',
            release: '${staticsPrefix}${statics}/dep/$1',
            useCompile: false
        },
        {
            reg: /^\/(config|test)\/(.*)/i,
            isMod: false,
            release: '/$1/$2'
        },
        {
            reg: 'server.conf',
            release: '/WEB-INF/server.conf'
        }
    ]
}

// 覆盖jello默认的roadmap
fis.config.set('roadmap', roadmap);

// 合并属性
fis.config.merge(merger_config);



// 预处理器插件扩展，对vm文件替换版本戳
function filePreprocessor(content, file) {
    var contentStr;
    contentStr = content.replace(/\${__version__}/g, timestamp);
    // 发布的时候修改parse解析方式
    if(isPublish) {
        contentStr = contentStr.replace(/#(parse|include)\(\s*('|")([^\(\)]+)\.vm('|")\s*\)/g, "#$1('views/$3." + templatesSuffix + "')");
    }

    return contentStr;
};

// 后处理器插件扩展,根据fis对js文件标准处理产生的requires字段生成pack_config
function filePostprocessor(content, file) {
    // 只有打包时候才调用
    if (isPackage) {
        if(file.id.match(/^page\/.*\.js$/) &&  file.requires.length) {
            // 页面入口js文件处理，提取依赖信息后写入pack_config
            
            var _key = file.id.replace(/^page/, 'static');
            pack_config[_key] = ['/' + file.id];
            for (var i in file.requires) {
                if (file.requires[i].match(/^[^\/]+\/[^\/\.]+$/)) {
                    pack_config[_key].push('/widget/' + file.requires[i] + '.js');
                }
            }
        } else if (file.id.match(/^widget/)) {
            // 组件js文件处理，添加模块定义id
            
            return content.replace(/define\s*\(function/, 'define(\''+file.id.replace(/^widget\/|\.js/g, '')+'\', function');
        } else if (file.id.match(/^static\/common\//)) {
            // 组件js文件处理，添加模块定义id

            return content.replace(/define\s*\(function/, 'define(\''+file.id.replace(/^static\/common\/|\.js/g, '')+'\', function');
        }
    }
    

    return content;
};