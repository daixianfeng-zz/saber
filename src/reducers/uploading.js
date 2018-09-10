import oss from '../utils/oss';

const calcTips = (ingList) => {
    let successNum = 0;
    let failNum = 0;
    let ingNum = 0;
    if(ingList && ingList.length > 0){
        ingList.forEach((v) => {
            switch(v.status){
                case '失败': failNum += 1;break;
                case '暂停': failNum += 1;break;
                case '成功': successNum += 1;break;
                default: ingNum += 1;break;
            }
        });
    }
    const successTips = successNum > 0 ? `有${successNum}个文件上传成功`: '';
    const failTips = failNum > 0 ? `有${failNum}个文件上传失败`: '';
    const ingTips = ingNum > 0 ? `正在上传（${successNum}\\${ingList.length}）`: '';
    return ingTips || `${successTips||''} ${failTips||''}`;
}

function uploading(state={
    data: {
        tips: ' ',
        list: [],
        totalList: [],
    },
}, action){
    const copyState = Object.assign({}, state);
    switch(action.type){
        case 'uploading/removeItem ':
            if(action.payload.uid){
                const uid = action.payload.uid.split(',');
                for(let i = copyState.list.length -1; i >= 0; i-=1){
                    if(uid.indexOf(copyState.list[i].uid) !== -1){
                        copyState.list.splice(i,1);
                    }
                }
                for(let i = copyState.totalList.length -1; i >= 0; i-=1){
                    if(uid.indexOf(copyState.totalList[i].uid) !== -1){
                        if(copyState.totalList[i].client){
                            copyState.totalList[i].client.cancel();
                        }
                        copyState.totalList.splice(i,1);
                    }
                }
            }
            copyState.tips = calcTips(copyState.totalList);
            return {
                ...state,
                ...copyState,
            };
        case 'uploading/list':
            if(action.payload){
                const {payload: {filename}} = action; 
                if(filename){
                    copyState.list = copyState.list.filter(item => item.filename.indexOf(filename) !== -1)
                }else{
                    copyState.list = copyState.totalList;
                }
            }
            return {
                ...state,
                ...copyState,
            };
        case 'uploading/stopUpload':
            if(action.payload && action.payload.uid){
                copyState.totalList.forEach((item, index)=>{
                    if(action.payload.uid === item.uid){
                        if(item.client){
                            item.client.cancel();
                        }
                        copyState.totalList[index].status = '暂停';
                    }
                });
                copyState.list.forEach((item, index)=>{
                    if(action.payload.uid === item.uid){
                        copyState.list[index].status = '暂停';
                    }
                });
            }
            return {
                ...state,
                ...copyState,
            };
        case 'uploading/reUpload':
            if(action.payload && action.payload.uid){
                copyState.totalList.forEach((item)=>{
                    if(action.payload.uid === item.uid){
                        oss.reUpload(null, item.file, item.signData);
                    }
                })
            }
            return {
                ...state,
                ...copyState,
            };
        case 'uploading/addItem':
            if(action.payload && action.payload.efile){
                const newFile = {
                    uid: action.payload.efile.uid,
                    key: action.payload.efile.uid,
                    filename: action.payload.efile.name,
                    size: action.payload.efile.size,
                    createTime: new Date(),
                    url: action.payload.poidName,
                    poid: action.payload.poid,
                    percent: 0,
                    file: action.payload.efile,
                    signData: action.payload.signData,
                    client: action.payload.client,
                };
                copyState.list.push(newFile);
                copyState.totalList.push(newFile);
            }
            copyState.tips = calcTips(copyState.totalList);
            return {
                ...state,
                ...copyState,
            };
        case 'uploading/updateItem':
            if(action.payload && action.payload.efile && action.payload.ing){
                copyState.totalList.forEach((v, i) => {
                    if(v.uid === action.payload.efile.uid){
                        if(action.payload.ing.percent){
                            copyState.totalList[i].percent = Math.max(action.payload.ing.percent, v.percent);
                        }
                        if(action.payload.ing.status){
                            copyState.totalList[i].status = action.payload.ing.status;
                        }
                        if(action.payload.ing.checkpoint){
                            copyState.totalList[i].file.checkpoint = action.payload.ing.checkpoint;
                        }
                        if(action.payload.client){
                            copyState.totalList[i].client = action.payload.client;
                        }
                    }
                });
                copyState.list.forEach((v, i) => {
                    if(v.uid === action.payload.efile.uid){
                        if(action.payload.ing.percent){
                            copyState.list[i].percent = Math.max(action.payload.ing.percent, v.percent);
                        }
                        if(action.payload.ing.status){
                            copyState.list[i].status = action.payload.ing.status;
                        }
                    }
                });
            }
            copyState.tips = calcTips(copyState.totalList);
            return {
                ...state,
                ...copyState,
            };
        default: return state;
    }
}

export default uploading
