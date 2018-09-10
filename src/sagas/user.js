import { call, put, fork, all, takeEvery, takeLatest } from 'redux-saga/effects'
import { push } from 'connected-react-router'

import { apiError } from '../utils/common'

function getUserInfo(){
    return fetch('/portal/userInfo.json')
        .then(response => response.json())
        .then((result)=>{
            const info = apiError(result);
            if(!info){
                return result.data;
            }else{
                throw(info);
            }
        })
}
function login(){
    return fetch('/portal/login.json')
        .then(response => response.json())
        .then((result)=>{
            const info = apiError(result);
            if(!info){
                return result.data;
            }else{
                throw(info);
            }
        })
}
function* loginUser(action) {
    try {
        yield call(login, action.payload);
        yield put({type: "user/login", user: 'login'});
        yield put(push('/manage/list'));
    } catch (e) {
        yield put({type: "dialog/error", message: e.message});
    }
}
function* fetchUser(action) {
    try {
        const user = yield call(getUserInfo);
        yield put({type: "user/update", user: user});
    } catch (e) {
        yield put({type: "USER_LOGOUT", message: '用户信息获取失败，请重新登录' });
    }
}
function* removeUser(action) {
    yield put({type: "toast/error", message: action.message});
    yield put({type: "user/logout", user: ''});
    yield put(push('/passport/login'));
}
export function* userInfo() {
    yield takeLatest("USER_INFO", fetchUser);
}

export function* userLogin() {
    yield takeEvery("USER_LOGIN", loginUser);
}

export function* userLogout() {
    yield takeLatest("USER_LOGOUT", removeUser);
}

export default function* user(){
    yield all([
        fork(userInfo),
        fork(userLogin),
        fork(userLogout),
    ])
}