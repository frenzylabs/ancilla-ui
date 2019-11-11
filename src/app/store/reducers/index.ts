import {combineReducers}  from 'redux'
import nodeReducer         from './nodes'
import appReducer         from './app'


export default appReducer

// combineReducers({
//   node: nodeReducer,
//   app: appReducer
// })