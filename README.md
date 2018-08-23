# react 开发手册

###### author: daixianfeng

### 1. 前言
- 本文档用于指导前端开发者进行react前端开发，统一react开发组件使用规范
- 任何问题或建议，请联系 dai_xianfeng@hotmail.com

### 2. 基础脚手架
- create-react-app
- facebook提供的官方脚手架
- 安装： npx create-react-app my-app / npm init react-app my-app / yarn create react-app my-app
- git： https://github.com/facebook/create-react-app

### 3. 手动配置
- 手动配置 webpack： 

	npm run eject
	yarn eject

- 该命令将默认的 webpack 配置暴露出来， 是一个不可逆的操作， 暴露出的配置修改后即可生效

### 4. 扩展内容

#### 4.1 less
- npm install --save-dev less
- npm install --save-dev less-loader
- 添加 rules 规则， 注意执行顺序（从后往前执行）

```
	{
		test: /\.less$/,
		use: [
			require.resolve('style-loader'),
			{
				loader: require.resolve('css-loader'),
				options: {
					importLoaders: 1,
				},
			},
			{
				loader: require.resolve('postcss-loader'),
				options: {
					// Necessary for external CSS imports to work
					// https://github.com/facebookincubator/create-react-app/issues/2677
					ident: 'postcss',
					plugins: () => [
						require('postcss-flexbugs-fixes'),
						autoprefixer({
							browsers: [
							'>1%',
							'last 4 versions',
							'Firefox ESR',
							'not ie < 9', // React doesn't support IE8 anyway
							],
							flexbox: 'no-2009',
						}),
					],
				},
			},
			{
				loader: require.resolve('less-loader') // compiles Less to CSS
			},
		],
	},
```

#### 4.2 react-router
- npm install --save-dev react-router-dom (使用4.0版本， 变动还比较大)
- npm install --save connected-react-router

```
	import { BrowserRouter as Router, Route } from 'react-router-dom'
	import createHistory from "history/createBrowserHistory";
	import { connectRouter, routerMiddleware } from 'connected-react-router'
```

#### 4.3 redux
- npm install --save-dev redux
- npm install --save-dev react-redux
- npm install --save-dev redux-devtools

```
	import {createStore, combineReducers, applyMiddleware} from 'redux';
	import {Provider, connect} from 'react-redux';

	
```

```
	import React from 'react'
	import ReactDOM from 'react-dom'
	import { createStore } from 'redux'
	import { Provider } from 'react-redux'
	import reducer from './reducers'
	import PropTypes from 'prop-types'
	import Routes from './routes'
	const store = createStore(reducer)

	const Root = ({ store }) => (
		<Provider store={ store }>
			<Routes />
		</Provider>
	)
	Root.propTypes = {
		store: PropTypes.object.isRequired
	}
	ReactDOM.render(<Root store={store} />, document.getElementById('root'));
```

#### 4.4 redux-saga
- npm install --save-dev redux-saga

```
	import { createStore, applyMiddleware } from 'redux'
	import createSagaMiddleware from 'redux-saga'

	import reducer from './reducers'
	import mySaga from './sagas'

	// create the saga middleware
	const sagaMiddleware = createSagaMiddleware()
	// mount it on the Store
	const store = createStore(
	  reducer,
	  applyMiddleware(sagaMiddleware)
	)

	// then run the saga
	sagaMiddleware.run(mySaga)

	// render the application
```

#### 4.5 antd
- npm install --save-dev babel-plugin-import
- npm install --save-dev antd
- npm install --save-dev antd-mobile

```
	// webpack.config.js
	// .babelrc or babel-loader option
	{
		"plugins": [
			["import", { "libraryName": "antd", "libraryDirectory": "es", "style": "css" }],
			["import", { "libraryName": "ant-mobile", "libraryDirectory": "lib", "style": "css" }, "ant-mobile"], 
			// `style: true` 会加载 less 文件（*不知道为啥不管用*）
		]
	}
```

#### 4.6 axios or fetch
- npm install --save-dev axios
- 根据请求特性， 封装一个自有的请求对象， 供全局引用
- 配置 babel 支持 es7
- npm install --save-dev babel-preset-es2016

```
	loader: require.resolve('babel-loader'),
    options: {
		"presets": ["es2016"],
	}
```

#### 4.x 其他资源
- next.js 服务端渲染
- react-motion 动画处理


### 5. 文件结构

```
	src
		| style
			| main
			| widget
		| config
			index.js //-项目内容配置文件
			hash.js //-定义枚举
		| actions
		| reducers
		| stores
		| models
		| utils
			| request.js
			| format.js
			| common.js
		| components
		| pages
		App.js //-最顶端组件
		index.js //-入口文件
		routes.js //-路由文件
		index.html //-入口文件
		registerServiceWorker.js //-离线缓存
	public
		| [libName]
```

### 6. 文件内容 - 关系
- index.html 引用 app.js
- index.html 引用 public 下的第三方资源
- app.js 使用 store,reducers,routes 完成初始化
- routes 中一条路由，对应 pages 中一个文件
- pages 中文件可继承 pages， 包含多个 components

### 7. react 组件生命周期
- 组件在初始化时会触发5个钩子函数：
+ 1、getDefaultProps()
	设置默认的props，也可以用dufaultProps设置组件的默认属性。
+ 2、getInitialState()
	在使用es6的class语法时是没有这个钩子函数的，可以直接在constructor中定义this.state。此时可以访问this.props。
+ 3、componentWillMount()
	组件初始化时只调用，以后组件更新不调用，整个生命周期只调用一次，此时可以修改state。
+ 4、 render()
	react最重要的步骤，创建虚拟dom，进行diff算法，更新dom树都在此进行。此时就不能更改state了。
+ 5、componentDidMount()
	组件渲染之后调用，可以通过this.getDOMNode()获取和操作dom节点，只调用一次。
- 在更新时也会触发5个钩子函数：
+ 6、componentWillReceivePorps(nextProps)
	组件初始化时不调用，组件接受新的props时调用。
+ 7、shouldComponentUpdate(nextProps, nextState)
	react性能优化非常重要的一环。组件接受新的state或者props时调用，我们可以设置在此对比前后两个props和state是否相同，如果相同则返回false阻止更新，因为相同的属性状态一定会生成相同的dom树，这样就不需要创造新的dom树和旧的dom树进行diff算法对比，节省大量性能，尤其是在dom结构复杂的时候。不过调用this.forceUpdate会跳过此步骤。
+ 8、componentWillUpdate(nextProps, nextState)
	组件初始化时不调用，只有在组件将要更新时才调用，此时可以修改state
+ 9、render()
	根据 state 渲染组件
+ 10、componentDidUpdate()
	组件初始化时不调用，组件更新完成后调用，此时可以获取dom节点。
- 卸载钩子函数
+ 11、componentWillUnmount()
	组件将要卸载时调用，一些事件监听和定时器需要在此时清除。

### 8. react-router 按需加载（应对超多页面）
- Route的component改为getComponent
- 组件用require.ensure的方式获取
- 并在webpack中配置chunkFilename

### 9. redux 的使用
- react-redux提供了connect和Provider，它们一个将组件与redux关联起来，一个将store传给组件。组件通过dispatch发出action，store根据action的type属性调用对应的reducer并传入state和这个action，reducer对state进行处理并返回一个新的state放入store，connect监听到store发生变化，调用setState更新组件，此时组件的props也就跟着变化。
- 首先调用store.dispatch将action作为参数传入，同时用getState获取当前的状态树state并注册subscribe的listener监听state变化，再调用combineReducers并将获取的state和action传入。combineReducers会将传入的state和action传给所有reducer，并根据action的type返回新的state，触发state树的更新，我们调用subscribe监听到state发生变化后用getState获取新的state数据。

### 10. mock 数据
- 代理：

```
	// package.json
	"proxy": {
		"json$": {
			"target": "http://127.0.0.1:8000",
			"changeOrigin": true
		}
	}
```

- mockjs：

### 11. csrf AND rsa-public
- 后端写入内容至 cookie 中
- 初始化时， 前端读取 cookie 中内容，以 meta 形式写入到 html-head 中
- 通过封装 request 对象， 简化附加提交项
- 并在提交表单时， 写入 request-header 中

### 12. token OR session
+ token 方式
- 第一次加载页面， 从 localStorage 中取出 token，获取用户信息， 保存至 sessionStorage
- 保存新 token 到 localStorage 中， 并同时保存至 sessionStorage 中
- 后续请求从 sessionStorage 中取 token 维持用户登录状态
- 后续用户信息从 sessionStorage 中获取， 映射到 store 中
- 退出登录后， 清除 store 用户信息， 清除 sessionStorage， 跳转至登录页
+ session 方式
- 第一次加载页面，获取用户信息， 保存至 localStorage
- 后续用户信息从 localStorage 中获取， 映射到 store 中
- 退出登录后， 清除 store 用户信息， 清除 localStorage， 跳转至登录页

### 13. mobile OR web
+ mobile
- 通过 mainfest 写入网页信息 与 配置
- 利用 Service Worker 实现离线存储

### 14. layout AND menu AND nav
- 使用 react-router 中 Route 组件的 render 属性为基础， 创建一个 Layout 路由， 通过传递中间内容组件渲染

```
	// components/layout/PageLayout.js
	import React from 'react'
	import { Route } from 'react-router-dom'
	const PageLayout = ({component: Component, ...rest}) => (
		<Route {...rest} render={matchProps => (
			<div className="page-layout">
				<header className="top"> top side</header>
				<div className="main-container"><Component {...matchProps} /></div>
				<footer className="bottmo"> top side</footer>
			</div>
		)} />
	)
	export default PageLayout

	// routes.js
	<Router>
        <Switch>
            <PageLayout exact path="/a" component={ A }></PageLayout>
            <PageLayout exact path="/a/b" component={ AB }></PageLayout>
        </Switch>
    </Router>
```

### 15. user AND role AND auth

### 16. 注意事项

#### 16.1 组件初渲染异步请求 （官方做法）
- 组件初始化时候就渲染，并且需要异步请求的情况
- 在 componentWillMount, componentDidMount 中执行异步请求， 设置 _isMounted 属性为 true
- 在 回调中 根据 _isMounted 属性判断是否完成初始化，并且没有被卸载， 完成后使用 setState 渲染
- 在 componentWillUnmount 中将 _isMounted 属性置为 false
- 可避免异步请求没有加载成功，页面就做了跳转，导致组件被卸载， 而在回调中又继续执行 setState 方法报错