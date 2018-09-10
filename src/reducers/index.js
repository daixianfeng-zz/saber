import { combineReducers } from 'redux'
import errorPage from './error'
import dialog from './dialog'
import user from './user'
import folder from './folder'
import search from './search'
import uploading from './uploading'
import history from './history'

const allReducers = combineReducers({
    user,
    folder,
    search,
    uploading,
    history,
    dialog,
    errorPage
})

export default allReducers
