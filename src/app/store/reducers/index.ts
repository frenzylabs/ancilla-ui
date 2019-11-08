import {combineReducers}  from 'redux'
import nodeReducer         from './nodes'
import appReducer         from './app'


export default combineReducers({
  node: nodeReducer,
  app: appReducer
})