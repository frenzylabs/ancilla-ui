
import {Printer} from '../../network/printer'

import { initialState } from './state'
import { node } from 'prop-types'

// export function NodeState(initialState, state = {}) {
//   return {
//     activeNode: initialState.activeNode,
//     state: state
//   }
// }



export const NodeAction = {
  listPrinters() {
    return (dispatch, getState) => {
      console.log("NODE ACTION state", getState())
      let activeNode = getState().activeNode
      var cancelRequest    = Printer.cancelSource();  
      // dispatch(requestFeatures(username, cancelRequest))
      return Printer.list({cancelToken: cancelRequest.token})
            .then(response => dispatch(NodeAction.receivedPrinters(activeNode, response.data)))
    }
  },

  receivedPrinters: (node, printers) => ({
    type: 'RECEIVED_PRINTERS',
    node: node,
    data: printers
  }),
  

  
  get_printers: () => {
    return {
      type: 'LIST_PRINTERS'
    }
  },

  add_printer: (printer = {}) => {
    return {
      type: 'ADD_PRINTER',
      data: printer
    }
  },

  connect: (device = {}) => {
    return {
      type: 'CONNECT_DEVICE',
      data: device
    }
  }
}

// const initialState = NodeState();

export function nodeReducer(state = initialState.activeNode, action) {
  switch(action.type) {
  case 'RECEIVED_PRINTERS':
    // console.log("INSIDE RECEIVE PRINTERS", action.data)
    // console.log("CURRENT STATE = ", state)
    
    let clone = Object.assign( Object.create( Object.getPrototypeOf(state)), state)
    clone.printers = action.data.printers
    // var newstate = Object.assign({}, state, {
    //   printers: action.data.printers
    // })
    // console.log("HOSTName= ", clone.hostname)    
    // console.log("NEWSTATE ", clone)
    // state.printers = action.data.printers
    return clone
    // var newstate = {
    //   ...state, 
    //   printers: action.data.printers
    // }
    // console.log("NEWSTATE ", newstate)
    // return newstate

    var printers = action.data.printers.reduce((acc, item) => {
        acc[item.id] = item
        return acc
    }, {})
    
    // return {
    //   ...state, 
    //   printers: {...state.printers, printers: printers} 
    // }

  case 'ADD_PRINTER':
    var dv = state.devices.printers
    dv[action.data.id] = action.data
    return {
      ...state, 
      devices: {...state.devices, printers: dv} 
    }
  case 'CONNECT_DEVICE':
    return {
      ...state, 
      connected: action.data
    }  
  default:
    return state;
  }
}


export default nodeReducer