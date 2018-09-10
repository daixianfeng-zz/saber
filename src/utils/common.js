const apiResult = apiData => {
    const info = {};
    if (apiData) {
        if (apiData.error === 0 || apiData.error === '0') {
            info.message = apiData.message;
            info.error = 0;
            return false;
        } else {
            info.message = apiData.message ? apiData.message : '系统异常，请稍后再试';
            info.error = apiData.error;
            return info;
        }
    } else {
        info.message = '系统异常，请稍后再试';
        info.msg = '系统异常，请稍后再试';
        info.error = null;
        return info;
    }
};
export function apiError(apiData) {
    const info = {};
    if (!apiData || typeof apiData.apiError === 'undefined') {
        return apiResult(apiData);
    }
    if (apiData && apiData.data) {
        if (
            apiData.apiError === 0 ||
            apiData.apiError === '0' ||
            apiData.error === 0 ||
            apiData.error === '0'
        ) {
            if (
            typeof apiData.data.error === 'undefined' ||
            apiData.data.error === '0' ||
            apiData.data.error === 0 ||
            apiData.data.result === 'success'
            ) {
                info.message = apiData.data.message;
                info.error = 0;
                return false;
            } else {
                info.message = apiData.data.message ? apiData.data.message : '系统异常，请稍后再试';
                info.redirectUrl = apiData.data.redirectUrl ? apiData.data.redirectUrl : '';
                info.error = apiData.data.error;
                return info;
            }
        } else {
            info.message = '系统异常，请稍后再试';
            info.msg = '系统异常，请稍后再试';
            info.error = null;
            return info;
        }
    } else {
        info.message = '系统异常，请稍后再试';
        info.msg = '系统异常，请稍后再试';
        info.error = null;
        return info;
    }
}