import { stringify } from 'qs'
import { call, put, fork, all, takeLatest } from 'redux-saga/effects'
import request from '../utils/request'
import { apiError } from '../utils/common';

function historyFile(params) {
	return request.send({
        url: `/storage/file/view/history.json?${stringify(params)}`
    });
}

function* fetch({ payload }) {
    const response = yield call(historyFile, payload);
    const responseData = {};
    if(apiError(response)){
        responseData.tips = response.message;
    }else{
        responseData.dataList = response.dataList;
        responseData.tips = response.message;
        responseData.pagination = {
            page: response.page,
            pageSize: response.perPage,
            totalSum:response.totalSum,
        }
    }
    yield put({
        type: 'history/save',
        ...responseData,
    });

}
export function* fetchReducer(){
    yield takeLatest("HISTORY_FETCH", fetch);
}
export default function* history(){
    yield all([
        fork(fetchReducer),
    ])
}
