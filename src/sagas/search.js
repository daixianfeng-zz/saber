import { stringify } from 'qs'
import { call, put, fork, all, select, takeLatest } from 'redux-saga/effects'
import request from '../utils/request'
import { apiError } from '../utils/common';

function searchFile(params) {
	return request.send({
        url: `/storage/file/view/search.json?${stringify(params)}`
    });
}

function* fetch({ payload }) {
    const query = payload || {oid: 0};
    const response = yield call(searchFile, query);
    const result = apiError(response);
    const searchData = {};
    if(result){
        searchData.tips = result.message;
    }else{
        searchData.tips = '';
        searchData.dataList = response.dataList;
        searchData.page = response.page;
        searchData.perPage = response.perPage;
        searchData.totalSum = response.totalSum;
        searchData.filename = query.filename||'';
        searchData.startTime = query.startTime||'';
        searchData.endTime = query.endTime||'';
    }
    yield put({
        type: 'search/save',
        payload: {
            ...searchData,
        },
    });
}
function* refresh({ payload ,callback}) {
    const curSearch = yield select(state => state.search.data);
    const query = payload || { filename: curSearch.filename,startTime: curSearch.startTime,endTime: curSearch.endTime, page: curSearch.page };
    yield put({
        type: 'SEARCH_FETCH',
        payload: {
            ...query,
        },
    });
    if (callback) callback();

}
export function* fetchReducer(){
    yield takeLatest("SEARCH_FETCH", fetch);
}
export function* refreshReducer(){
    yield takeLatest("SEARCH_REFRESH", refresh);
}
export default function* folder(){
    yield all([
        fork(fetchReducer),
        fork(refreshReducer),
    ])
}