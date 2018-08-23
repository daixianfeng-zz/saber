import { combineReducers } from 'redux'
import errorPage from './error'

function changeUser(state={}, action){
    switch(action.type){
        case 'login': return action.user;
        case 'logout': return {};
        default: return state;
    }
}
const allReducers = combineReducers({
    changeUser,
    errorPage
})

export default allReducers
