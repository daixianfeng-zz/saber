function folder(state={
    data: {
        pFolder: [],
        dataList: [],
    },
    pagination:{
        page: 1,
        perPage: 10,
    },
    oid: 0,
    errorInfo: false,
}, action){
    const copyState = Object.assign({}, state);
    switch(action.type){
        case 'folder/save':
            copyState.errorInfo = '';
            copyState.oid = action.payload.oid;
            copyState.pagination = action.payload.pagination;
            copyState.data = action.payload.data;
            return{
                ...state,
                ...copyState,
            }
        case 'folder/operation':
            copyState.errorInfo = action.payload;
            return {
                ...state,
                ...copyState,
            };
        default: return state;
    }
}

export default folder
