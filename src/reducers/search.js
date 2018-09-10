function search(state={
    data: {
        dataList: [],
        page: 1,
        perPage: 10,
        totalSum: 0,
        filename: '',
        startTime: '',
        endTime: '',
    },
    tips: '',
}, action){
    const copyState = Object.assign({}, state);
    switch(action.type){
        case 'search/save':
            if(action.payload && action.payload.dataList){
                copyState.data.dataList = action.payload.dataList;
                copyState.data.page = action.payload.page;
                copyState.data.perPage = action.payload.perPage;
                copyState.data.totalSum = action.payload.totalSum;
                copyState.data.filename = action.payload.filename;
                copyState.data.startTime = action.payload.startTime;
                copyState.data.endTime = action.payload.endTime;
            }else if(action.payload && action.payload.tips){
                copyState.tips = action.payload.tips;
            }
            return {
                ...state,
                ...copyState,
            };
        default: return state;
    }
}

export default search
