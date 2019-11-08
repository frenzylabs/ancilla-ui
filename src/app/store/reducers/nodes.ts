
export function NodeState(list = {"printers": {}, "cameras": {}}, state = {}) {
  return {
    devices: list,
    state: state
  }
}

export const NodeAction = {
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