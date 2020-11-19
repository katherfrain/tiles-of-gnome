import {combineReducers} from 'redux';
import {TAKE_DAMAGE, TAKE_HEAL} from './actions'

function healthChangeReducer(state=this.health, action) {
    switch(action.type) {
        case TAKE_HEAL:
            return {
                ...state,
                [action.payload.health]: state[action.payload.health] + action.payload.healthUp 
            }

        
        case TAKE_DAMAGE:
            return {
                ...state,
                [action.payload.health]: state[action.payload.health] - action.payload.healthDown
            }

        default:
            return state
    }
}

export const rootReducer = combineReducers({
    health: healthChangeReducer
})