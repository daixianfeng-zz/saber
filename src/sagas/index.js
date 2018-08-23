import { call, put, takeEvery, takeLatest } from 'redux-saga/effects'

function getUserInfo(){
    fetch('/portal/userInfo.json')
        .then(response => response.json())
        .then(json => json.data.user)
}
function* fetchUser(action) {
    try {
       const user = yield call(getUserInfo);
       yield put({type: "USER_FETCH_SUCCEEDED", user: user});
    } catch (e) {
       yield put({type: "USER_FETCH_FAILED", message: e.message});
    }
}
function* mySaga() {
  yield takeEvery("USER_FETCH_REQUESTED", fetchUser);
}

export default mySaga
