
import {Printer} from '../../network/printer'

export function NodeState(list = {"printers": {}, "cameras": {}}, state = {}) {
  return {
    devices: list,
    state: state
  }
}



export const NodeAction = {
  listPrinters() {
    return dispatch => {
      var cancelRequest    = Printer.cancelSource();  
      // dispatch(requestFeatures(username, cancelRequest))
      return Printer.list({cancelToken: cancelRequest.token})
            .then(response => dispatch(NodeAction.receivedPrinters(response.data)))
    }
  },

  receivedPrinters: (printers) => ({
    type: 'RECEIVED_PRINTERS',
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

const initialState = NodeState();

export function nodeReducer(state = initialState, action) {
  switch(action.type) {
  case 'RECEIVED_PRINTERS':
    console.log("INSIDE RECEIVE PRINTERS", action.data)
    var printers = action.data.printers.reduce((acc, item) => {
        acc[item.id] = item
        return acc
    }, {})
    
    return {
      ...state, 
      devices: {...state.devices, printers: printers} 
    }

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