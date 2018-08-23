function error(state={}, action){
    switch(action.type){
        case 'error/404': return { page: 404 };
        case 'error/403': return { page: 403 };
        default: return state;
    }
}

export default error
