
import React from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import PageLayout from './components/layout/PageLayout'
import Deny from './pages/Error/403'
import NotFound from './pages/Error/404'
import App from './App'
import Manage from './pages/Manage'
import ManageList from './pages/Manage/list'
const Routes = () => (
    // <Router>
        <Switch>
            <Route exact path="/" component={ App }></Route>
            <PageLayout exact path="/manage" component={ Manage }></PageLayout>
            <PageLayout exact path="/manage/list" component={ ManageList }></PageLayout>
            <Route exact path="/error/403" component={ Deny }></Route>
            <Route component={ NotFound }></Route>
        </Switch>
    // </Router>
)
export default Routes
    