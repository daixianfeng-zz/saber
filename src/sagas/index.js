import { all, call } from 'redux-saga/effects'
import user from './user'
import folder from './folder'
import search from './search'

export default function* root(){
    yield all([
        call(user),
        call(folder),
        call(search),
    ])
}
