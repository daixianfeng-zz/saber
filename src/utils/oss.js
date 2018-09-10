import OSS from 'ali-oss'
import { message } from 'antd';
import request from './request'

import { apiError } from './common'
import { appServer, bucket, region }  from '../config/oss'

const applyTokenDo = (dispatch, file, signData, func) => {
    const url = appServer;
    let curDispatch = dispatch;
    if(curDispatch){
        oss.dispatch = curDispatch;
    }else{
        curDispatch = oss.dispatch;
    }
    if(!curDispatch || !file || !signData){
        return;
    }
    request.send({
        url,
        method: 'GET',
    }).then((result) => {
        if(apiError(result)){
            message.error(result.message);
            return;
        }
        const creds = result.data;
        const client = new OSS({
            region,
            accessKeyId: creds.accessKeyId,
            accessKeySecret: creds.accessKeySecret,
            stsToken: creds.securityToken,
            bucket,
        });
        return func(curDispatch, file, signData, client);
    }).catch((e)=>{
        console.log(OSS.Wrapper);
        message.error('上传失败');
    });
};
const multiUpload = (dispatch, efile, signData, client) => {
    return client.multipartUpload(`${signData.dir}/${signData.realName}`, efile, {
        partSize: 1024 * 1024,
        callback: {
            url: signData.callbackUrl,
            body: signData.callbackBody,
        },
        headers: {
            'Content-Disposition': `attachment;filename=${window.encodeURIComponent(efile.name)}`,
        },
        checkpoint: efile.checkpoint,
        progress: (percent, checkpoint) => {
            let minPercent = percent;
            if(checkpoint && checkpoint.doneParts && checkpoint.doneParts.length > 0){
                const lastPart = checkpoint.doneParts[checkpoint.doneParts.length-1];
                minPercent = Math.min(percent, lastPart.number*checkpoint.partSize/checkpoint.fileSize, 0.9999);
            }
            return (resolve) => {
                dispatch({
                    type: 'uploading/progress',
                    payload: {
                        uid: efile.uid,
                        efile,
                        ing: {
                            percent: minPercent,
                            status: '上传中',
                            checkpoint,
                        },
                    },
                });
                resolve();
            }
        },
    })
    .then((result) => {
        if(+result.res.status < 300){
            dispatch({
                type: 'uploading/success',
                payload: {
                    uid: efile.uid,
                    efile,
                    ing: {
                        percent: 1,
                        status: '成功',
                    },
                },
            });
            dispatch({
                type: 'folder/refresh',
                payload: null,
            });
        }else{
            dispatch({
                type: 'uploading/fail',
                payload: {
                    uid: efile.uid,
                    efile,
                    ing: {
                        status: '失败',
                    },
                },
            });
        }
    })
    .catch(()=>{
        dispatch({
            type: 'uploading/pause',
            payload: {
                uid: efile.uid,
                efile,
                ing: {
                    status: '暂停',
                },
            },
        });
        window.console.log('链接断开');
    });
};
const uploadFile = (dispatch, efile, signData, client) => {
    if(!efile.checkpoint){
        dispatch({
            type: 'uploading/add',
            payload: {
                efile,
                signData,
                poidName: signData.poidName || '',
                poid: signData.poid || '',
                client,
            },
        });
    }else{
        dispatch({
            type: 'uploading/progress',
            payload: {
                uid: efile.uid,
                efile,
                ing: {
                    status: '上传中',
                },
                client,
            },
        });
    }
    return multiUpload(dispatch, efile, signData, client);
};
const reUploadFile = (dispatch, efile, signData, client) => {
    dispatch({
        type: 'uploading/progress',
        payload: {
            uid: efile.uid,
            efile,
            ing: {
                status: '上传中',
            },
            client,
        },
    });
    return multiUpload(dispatch, efile, signData, client);
};
const oss = {
    dispatch: {},
    upload: (dispatch, file, signData) => {
        applyTokenDo(dispatch, file, signData, uploadFile)
    },
    reUpload: (dispatch, file, signData) => {
        applyTokenDo(dispatch, file, signData, reUploadFile)
    },
    pause: (dispatch, file) => {
        dispatch({
            type: 'uploading/pause',
            payload: {
                file,
            },
        })
    },
    start: (dispatch, file) => {
        dispatch({
            type: 'uploading/start',
            payload: {
                file,
            },
        })
    },
}
export default oss;