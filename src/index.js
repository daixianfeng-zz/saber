import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, applyMiddleware, compose } from 'redux'
import { Provider } from 'react-redux'
import { connectRouter, routerMiddleware, ConnectedRouter } from 'connected-react-router'
import { createBrowserHistory } from 'history'
import reducer from './reducers'
import createSagaMiddleware from 'redux-saga'
import mySaga from './sagas'
import PropTypes from 'prop-types'
import Routes from './routes'
import 'antd/dist/antd.css'
import './style/index.less'
import registerServiceWorker from './registerServiceWorker'

const history = createBrowserHistory()
const sagaMiddleware = createSagaMiddleware()
const store = createStore(
    connectRouter(history)(reducer),
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
    compose(
        applyMiddleware(routerMiddleware(history)),
        applyMiddleware(sagaMiddleware),
    ),
)
sagaMiddleware.run(mySaga)
const Root = ({ store, history }) => (
    <Provider store={ store }>
        <ConnectedRouter history={history}>
            <Routes />
        </ConnectedRouter>
    </Provider>
)
Root.propTypes = {
    store: PropTypes.object.isRequired
}
ReactDOM.render(<Root store={store} history={history} />, document.getElementById('root'));
registerServiceWorker();

export default store