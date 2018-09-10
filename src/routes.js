
import React from 'react'
import { Route, Switch } from 'react-router-dom'
import PageLayout from './components/layout/PageLayout'
import Deny from './pages/Error/403'
import NotFound from './pages/Error/404'
import App from './App'
import FolderSearch from './pages/Folder/Search'
import FolderList from './pages/Folder/List'
import UploadingList from './pages/Transmission/Uploading'
import UploadedList from './pages/Transmission/Uploaded'
import Login from './pages/Passport/Login'
const Routes = () => (
    // <Router>
        <Switch>
            <Route exact path="/" component={ Login }></Route>
            <Route exact path="/passport/login"  component={ Login }></Route>
            <PageLayout exact path="/folder/list" child={ FolderList } needAuth={ true }></PageLayout>
            <PageLayout exact path="/folder/search" child={ FolderSearch } needAuth={ true }></PageLayout>
            <PageLayout exact path="/transmission/uploading" child={ UploadingList } needAuth={ true }></PageLayout>
            <PageLayout exact path="/transmission/uploaded" child={ UploadedList } needAuth={ true }></PageLayout>
            <Route exact path="/error/403" component={ Deny }></Route>
            <Route component={ NotFound }></Route>
        </Switch>
    // </Router>
)
export default Routes
    