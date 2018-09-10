import { message, Modal } from 'antd';

function dialog(state={}, action){
    switch(action.type){
        case 'toast/error': 
            message.error(action.message);
            return action.message;
        case 'modal/error': 
            Modal.error(action.message);
            return action.message;
        default: return state;
    }
}

export default dialog
