import { stringify } from 'qs'
import { call, put, fork, all, select, takeEvery, takeLatest } from 'redux-saga/effects'
import request from '../utils/request'
import { apiError } from '../utils/common';

function queryFolder(params) {
	return request.send({
        url: `/storage/file/view/fileList.json?${stringify(params)}`
    });
}
function detailFolder(params) {
	return request.send({
        url: `/storage/file/view/detail.json?${stringify(params)}`
    });
}
function addFolder(params) {
	return request.send({
        url: '/storage/file/edit/mkdir.json', 
		method: 'POST',
		body: params,
	});
}
function removeFolder(params) {
	return request.send({
        url: '/storage/file/edit/delete.json', 
		method: 'POST',
		body: params,
	});
}
function renameFolder(params) {
	return request.send({
        url: '/storage/file/edit/rename.json',
		method: 'POST',
		body: params,
	});
}

function* fetch({ payload }) {
    const query = payload || {oid: 0};
    const responseList = yield call(queryFolder, query);
    const result = apiError(responseList);
    if(result){
        yield put({
            type: 'folder/operation',
            payload: result,
        });
        return;
    }
    let responseDetail = {};
    responseList.pFolder = [];
    if(query.oid){
        responseDetail = yield call(detailFolder, { oid: query.oid });
        if(responseDetail.data && responseDetail.data.filename){
            responseList.pFolder.unshift({breadcrumbName: responseDetail.data.filename});
        }
    }
    if(responseDetail.data && responseDetail.data.parentList){
        let poid = 0;
        let pName = '';
        if(responseDetail.data.parentList.length > 0){
            poid = responseDetail.data.parentList[0].oid;
            pName = responseDetail.data.parentList[0].filename;
        }
        responseList.dataList.unshift({
            key: poid,
            oid: poid,
            filename: pName,
            showname: '（返回上一级）',
            status: 0,
            type: 3,
            url: '',
            size: NaN,
            disabled: true,
        });
        responseDetail.data.parentList.forEach((v) => {
            responseList.pFolder.unshift({breadcrumbName: v.filename})
        });
    }
    yield put({
        type: 'folder/save',
        payload: {
            data: {
                ...responseList,
                ...responseDetail,
            },
            oid: query.oid,
            pagination: { page: query.page, perPage: query.pageSize },
        },
    });
}
function* refresh({ payload ,callback}) {
    const curFolder = yield select(state => state.folder);
    const query = payload || { oid: curFolder.oid, page: curFolder.pagination.page, pageSize: curFolder.pagination.perPage };
    yield put({
        type: 'fetch',
        payload: {
            ...query,
        },
    });
    if (callback) callback();

}
function* add({ payload, callback }) {
    const response = yield call(addFolder, payload);
    const result = apiError(response);
    yield put({
        type: 'operation',
        payload: result,
    });
    if (callback) callback();
}
function* remove({ payload, callback }) {
    const response = yield call(removeFolder, payload);
    const result = apiError(response);
    yield put({
        type: 'operation',
        payload: result,
    });
    if (callback) callback();
}
function* rename({ payload, callback }) {
    const response = yield call(renameFolder, payload);
    const result = apiError(response);
    yield put({
        type: 'operation',
        payload: result,
    });
    if (callback) callback();
}

export function* fetchReducer(){
    yield takeLatest("FOLDER_FETCH", fetch);
}
export function* refreshReducer(){
    yield takeLatest("FOLDER_REFRESH", refresh);
}
export function* addReducer(){
    yield takeEvery("FOLDER_ADD", add);
}
export function* removeReducer(){
    yield takeEvery("FOLDER_REMOVE", remove);
}
export function* renameReducer(){
    yield takeEvery("FOLDER_RENAME", rename);
}

export default function* folder(){
    yield all([
        fork(fetchReducer),
        fork(refreshReducer),
        fork(addReducer),
        fork(removeReducer),
        fork(renameReducer),
    ])
}
