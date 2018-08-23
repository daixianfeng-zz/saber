import { push } from 'connected-react-router'
import store from '../index'

let defaultConfig = {
    method: 'get',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Accept': 'application/json'
    },
    body: {},
    credentials: 'same-origin',
};
let onBeforeSend = [];
const hook403 = () => {
    // store.dispatch({ type:'error/403' })
    store.dispatch(push('/error/403'))
    // throw('403');
};
const hook404 = () => {
    store.dispatch({ type:'error/404' })
};
const hookError = () => {};

function getUrl(url, params){
    if(!params){
        return url;
    }
    let query = [];
    for(let key in params){
        query.push(key+'='+params[key]);
    }
    if(query.length){
        return url+'?'+query.join('&');
    }else{
        return url;
    }
}

const request = {
    init: (config) => {
        if(config.headers){ Object.assign(defaultConfig.headers, config.headers); }
        if(config.body){ Object.assign(defaultConfig.body, config.constData); }
        if(config.onBeforeSend){ onBeforeSend = config.onBeforeSend; }
    },
    send: async (reqItem) => {
        let sendOptions = Object.assign({}, defaultConfig);
        if(reqItem.headers){ Object.assign(sendOptions.headers, reqItem.headers); }
        if(reqItem.body){ Object.assign(sendOptions.body, reqItem.body); }
        if(reqItem.credentials){ sendOptions.credentials = reqItem.credentials };
        if(sendOptions.method.toUpperCase() === 'GET' || sendOptions.method.toUpperCase() === 'HEAD'){
            reqItem.url = getUrl(reqItem.url, sendOptions.body);
            delete sendOptions.body;
        }

        let req = new Request(reqItem.url, sendOptions);

        const beforeSendFunc = onBeforeSend.concat(reqItem.onBeforeSend);
        const beforeResult = beforeSendFunc.reduce((result, cur)=>{
            if(cur instanceof Function){
                return result && cur(req);
            }else{
                return result;
            }
        }, true);

        if(!beforeResult){
            console.log('before send error!');
            return Promise.reject(req, null);
        }

        const res = await fetch(req,sendOptions);
        const resBody = checkResponse(res);

        if(resBody){
            return Promise.resolve(resBody, res);
        }else{
            return Promise.reject(req, res);
        }
    }
}

function checkResponse(res){
    if(res.status >= 200 && res.status < 300){
        return res.json();
    }else if(res.status === 403){
        hook403(res);
        return false;
    }else if(res.status === 404){
        hook404(res);
        return false;
    }else{
        hookError(res);
        return false;
    }
}

export default request
