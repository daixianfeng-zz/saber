function user(state={}, action){
    switch(action.type){
        case 'user/login': 
            localStorage.setItem('USER', JSON.stringify(action.user));
            return action.user;
        case 'user/update':
            localStorage.setItem('USER', JSON.stringify(action.user));
            return action.user;
        case 'user/logout':
            localStorage.setItem('USER', '');
            return '';
        default: return state;
    }
}

export default user
