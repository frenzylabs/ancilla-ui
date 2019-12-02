


import { initialState } from './state'
import { PrinterState, printerReducer } from './printers'
import { CameraState, cameraReducer } from './cameras'

// export function NodeState(initialState, state = {}) {
//   return {
//     activeNode: initialState.activeNode,
//     state: state
//   }
// }


// const initialState = NodeState();

export function nodeReducer(state = initialState.activeNode, action) {
  switch(action.type) {
  case 'RECEIVED_PRINTERS':
    console.log("INSIDE RECEIVE PRINTERS", action.data)
    // console.log("CURRENT STATE = ", state)    
    // var clone = Object.assign( Object.create( Object.getPrototypeOf(state)), state)
    var printers = action.data.printers.reduce((acc, item) => {
      acc = acc.concat(PrinterState(item))
      return acc
    }, [])

    var newstate = {
      ...state, 
      printers: printers
    }
    return newstate

  case 'RECEIVED_CAMERAS':
      // console.log("INSIDE RECEIVE PRINTERS", action.data)
      // console.log("CURRENT STATE = ", state)
    var clone = Object.assign( Object.create( Object.getPrototypeOf(state)), state)
    clone.cameras = action.data.cameras
    return clone

  case 'RECEIVED_SERVICES':
      // console.log("INSIDE RECEIVE PRINTERS", action.data)
      // console.log("CURRENT STATE = ", state)
    // var dv = state.printers
    // dv[action.data.id] = action.data
    return {...state, services: action.data.services}   
    // var clone = Object.assign( Object.create( Object.getPrototypeOf(state)), state)
    // clone.cameras = action.data.cameras
    // return clone

  case 'ADD_PRINTER':
    var dv = state.printers
    dv[action.data.id] = action.data
    return {...state, printers: dv} 
    
  case 'CONNECT_DEVICE':
    return {
      ...state, 
      connected: action.data
    }  
  default:
    if (action.type.startsWith("PRINTER")) {
      var printers = state.printers.map((item) => {
        if (item.id == action.printer.id) {
          return printerReducer(item, action)
        }
        return item
      })
      return {...state, printers: printers}
    } else {
      return state
    }
      // note: since state doesn't have "user",
      // so it will return undefined when you access it.
      // this will allow you to use default value from actually reducer.
    // return {...state, activeNode: nodeReducer(state.activeNode, action)}
  // default:
  //   return state;
  }
}


export default nodeReducer