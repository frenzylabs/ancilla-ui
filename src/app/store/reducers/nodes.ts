


import { initialState } from './state'
import { PrinterState, printerReducer } from './printers'
import { CameraState, cameraReducer } from './cameras'
import { ServiceState, serviceReducer } from './service'

// export function NodeState(initialState, state = {}) {
//   return {
//     activeNode: initialState.activeNode,
//     state: state
//   }
// }


function getServiceReducer(item) {
  switch(item.kind) {
    case 'printer':
      return PrinterState(item)
    default:
      return ServiceState(item)
      break
  }
}
// const initialState = NodeState();

export function nodeReducer(state = initialState.activeNode, action) {
  switch(action.type) {
  case 'SERVICE_DELETED':
      // console.log("INSIDE RECEIVE PRINTERS", action.data)
      // console.log("CURRENT STATE = ", state)    
      // var clone = Object.assign( Object.create( Object.getPrototypeOf(state)), state)
      var services = state.services.filter((svc) => svc.id != action.data.id)
      return {...state, services: services} 
      // var printers = action.data.printers.reduce((acc, item) => {
      //   acc = acc.concat(PrinterState(item))
      //   return acc
      // }, [])
  
      // var newstate = {
      //   ...state, 
      //   printers: printers
      // }
      // return newstate
  case 'RECEIVED_PRINTERS':
    // console.log("INSIDE RECEIVE PRINTERS", action.data)
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

  case 'RECEIVED_SERVICES': {
      // console.log("INSIDE RECEIVE PRINTERS", action.data)
      // console.log("CURRENT STATE = ", state)
    // var dv = state.printers
    // dv[action.data.id] = action.data
    var services = action.data.services.reduce((acc, item) => {
      var itemstate = item
      switch(item.kind) {
        case 'printer':
          itemstate = PrinterState(item)
          break
        default:
          itemstate = ServiceState(item)
          break
      }
      
      acc = acc.concat(itemstate)
      return acc
    }, [])

    var newstate = {
      ...state, 
      services: services
    }
    return newstate
  }

    // var clone = Object.assign( Object.create( Object.getPrototypeOf(state)), state)
    // clone.cameras = action.data.cameras
    // return clone

  case 'ADDED_PRINTER':
    // var dv = state.printers
    // dv[action.data.id] = PrinterState(action.data)
    return {...state, services: [...state.services, PrinterState(action.data)]} 
  case 'ADDED_CAMERA':
    console.log("ADDED CAMERA", action.data)
      // var dv = state.printers
      // dv[action.data.id] = PrinterState(action.data)
      return {...state, services: [...state.services, CameraState(action.data)]} 
    
  case 'CONNECT_DEVICE':
    return {
      ...state, 
      connected: action.data
    }  
  case 'PRINTER_UPDATED': {
    var services = state.services.map((item) => {
      if (item.id == action.data.id) {
        var st = PrinterState(action.data)
        return {...item, ...st}
        // return serviceReducer(item, action)
      }
      return item
    })
    return {...state, services: services}
  }
  case 'CAMERA_UPDATED': {
    var services = state.services.map((item) => {
      if (item.id == action.data.id) {
        var st = CameraState(action.data)
        return {...item, ...st}
      }
      return item
    })
    return {...state, services: services}
  }
  default: {
    if (action.type.startsWith("SERVICE")) {
      var services = state.services.map((item) => {
        if (item.id == action.service.id) {
          return serviceReducer(item, action)
        }
        return item
      })
      return {...state, services: services}

    } else if (action.type.startsWith("PRINTER")) {
      var services = state.services.map((item) => {
        if (item.id == action.printer.id) {
          return printerReducer(item, action)
        }
        return item
      })
      return {...state, services: services}
    } else if (action.type.startsWith("CAMERA")) {
      var services = state.services.map((item) => {
        if (item.id == action.printer.id) {
          return printerReducer(item, action)
        }
        return item
      })
      return {...state, services: services}
    }
    else {
      return state
    }
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