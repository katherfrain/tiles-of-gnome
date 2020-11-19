import { applyMiddleware, createStore } from "redux";
import { load, save } from "redux-localstorage-simple";
import {rootReducer} from './reducers'

const createStorewithMiddleWare = applyMiddleware( 
    save()
)(createStore);
    
const store = createStorewithMiddleWare(
    rootReducer, 
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
    );

export default store;