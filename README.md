# TinyFront - 后台管理前端框架

该项目是 Tiny 项目的前端部分, 使用 Vue/IView/TypeScript 进行编写, 并且依赖 RetrofitJS/Jcdt 两个自己编写的项目. 主要是解决前端的数据展示和提供部分通用的UI组件.

由于用了 RetrofitJS, 因此该项目仅能运行在支持 ES6 环境的浏览器上, 需要注意的问题如下:

 1. ES5 的类无法继承 ES6 的新式类
 2. RetrofitJS 使用了 ES6 的 Proxy 对象, 貌似谷歌的 Github 有一个 polyfill -> [proxy-polyfill](https://github.com/GoogleChrome/proxy-polyfill)

该项目尽量使用 chrome/firefox/safari/360浏览器并开启极速模式 等浏览器运行.

项目暂时还没有做分模块处理, 所有代码都放在 src/tiny 内, 使用该项目开发时是直接下载该项目源码然后在 src 目录内开发. 目前整个项目的层次结构如下:

```yml
src                 // 根目录
  tiny              // 这是框架的代码包
    components      // 组件
      basis         // 抽象组件和抽象页
    configuration   // 配置文件
    resources       // 资源文件
    support         // 常量
    view            // 页面文件
      authenication // 权限相关的功能页
      main          // 入口
    web             // 网络访问
      basic         // 登陆, 拦截器 等组件
      client        // 网络接口
      entity        // 实体类定义
```

## 使用说明

这个框架其实是不需要配置的, 因为是专门为 Tiny 这个项目设计, 基本后台服务跑起来后, 前端即可使用.



