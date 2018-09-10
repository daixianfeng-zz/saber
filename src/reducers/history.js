function history(state={
    data: {
        dataList: [],
        pagination: {},
        tips: '',
    }
}, action){
    const copyState = Object.assign({}, state);
    switch(action.type){
        case 'history/save':
            if(action.dataList){
                copyState.dataList = action.dataList;
                copyState.pagination = action.pagination;
            }
            copyState.tips = action.tips;
            return {
                ...copyState,
            };
        default: return state;
    }
}

export default history
