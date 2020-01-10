


import { initialState } from '../state'
import { printerReducer } from './printers'
import { cameraReducer } from './cameras'
import { serviceReducer } from './service'

import { NodeState, serviceState, printerState, cameraState } from '../state'


// const initialState = NodeState();

export function nodeReducer(state: NodeState = initialState.activeNode, action) {
  switch(action.type) {
  case 'SERVICE_DELETED': {
      let services = state.services.filter((svc) => svc.id != action.data.id)
      return {...state, services: services} 
  }
  case 'RECEIVED_PRINTERS': {
    var printers = action.data.printers.reduce((acc, item) => {
      acc = acc.concat(printerState(item))
      return acc
    }, [])

    var newstate = {
      ...state, 
      printers: printers
    }
    return newstate
  }

  case 'RECEIVED_CAMERAS': {
    var clone = Object.assign( Object.create( Object.getPrototypeOf(state)), state)
    clone.cameras = action.data.cameras
    return clone
  }
  case 'RECEIVED_SERVICES': {
      // console.log("INSIDE RECEIVE PRINTERS", action.data)
      // console.log("CURRENT STATE = ", state)
    // var dv = state.printers
    // dv[action.data.id] = action.data
    let services = action.data.services.reduce((acc, item) => {
      var itemstate = item
      switch(item.kind) {
        case 'printer':
          itemstate = printerState(item)
          break
        case 'camera':
            itemstate = cameraState(item)
            break
        default:
          itemstate = serviceState(item)
          break
      }
      
      acc = acc.concat(itemstate)
      return acc
    }, [])
    // console.log("SERVICE REDUCERS", services)
    let newstate = {
      ...state, 
      services: services
    }
    return newstate
  }

    // var clone = Object.assign( Object.create( Object.getPrototypeOf(state)), state)
    // clone.cameras = action.data.cameras
    // return clone

  case 'SERVICE_UPDATED': {
    let services = state.services.map((item) => {
      if (item.id == action.service.id) {
        return {...item, ...action.data}
        // return serviceReducer(item, action)
      }
      return item
    })
    return {...state, services: services}
  }

  case 'ADDED_PRINTER':
    return {...state, services: [...state.services, printerState(action.data)]} 
  case 'ADDED_CAMERA':    
    return {...state, services: [...state.services, cameraState(action.data)]} 
    
  case 'CONNECT_DEVICE':
    return {
      ...state, 
      connected: action.data
    }  
  case 'PRINTER_UPDATED': {
    var services = state.services.map((item) => {
      if (item.id == action.data.id) {
        var st = printerState(action.data)
        return {...item, ...st}
      }
      return item
    })
    return {...state, services: services}
  }
  case 'CAMERA_UPDATED': {
    var services = state.services.map((item) => {
      if (item.id == action.data.id) {
        var st = cameraState(action.data)
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
        if (item.id == action.camera.id) {
          return cameraReducer(item, action)
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