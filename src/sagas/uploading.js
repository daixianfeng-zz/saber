import { put, fork, all, takeEvery, takeLatest } from 'redux-saga/effects'

function* remove({ payload, callback }) {
    yield put({ type: 'uploading/removeItem', payload });
    if (callback) callback();
}
function* fetch({ payload,callback }) {
    yield put({ type: 'uploading/list', payload });
    if (callback) callback();
}
function* add({ payload,callback }) {
    yield put({ type: 'uploading/addItem', payload });
    if (callback) callback();
}
function* progress({ payload,callback }) {
    yield put({ type: 'uploading/updateItem', payload });
    if (callback) callback();
}
function* pause({ payload,callback }) {
    yield put({ type: 'uploading/stopUpload', payload });
    if (callback) callback();
}
function* restart({ payload,callback }) {
    yield put({ type: 'uploading/reUpload', payload });
    if (callback) callback();
}
function* success({ payload,callback }) {
    yield put({ type: 'uploading/updateItem', payload });
    if (callback) callback();
}
function* fail({ payload,callback }) {
    yield put({ type: 'uploading/updateItem', payload });
    if (callback) callback();
}

export function* removeReducer(){
    yield takeEvery('UPLOADING_REMOVE', remove);
}
export function* fetchReducer(){
    yield takeLatest('UPLOADING_FETCH', fetch);
}
export function* addReducer(){
    yield takeEvery('UPLOADING_ADD', add);
}
export function* progressReducer(){
    yield takeEvery('UPLOADING_PROGRESS', progress);
}
export function* pauseReducer(){
    yield takeEvery('UPLOADING_PAUSE', pause);
}
export function* restartReducer(){
    yield takeEvery('UPLOADING_RESTART', restart);
}
export function* successReducer(){
    yield takeEvery('UPLOADING_SUCCESS', success);
}
export function* failReducer(){
    yield takeEvery('UPLOADING_FAIL', fail);
}

export default function* uploading(){
    yield all([
        fork(removeReducer),
        fork(fetchReducer),
        fork(addReducer),
        fork(progressReducer),
        fork(pauseReducer),
        fork(restartReducer),
        fork(successReducer),
        fork(failReducer),
    ])
}
