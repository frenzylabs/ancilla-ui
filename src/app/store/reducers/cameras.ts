import { CameraModel, CameraState, ServiceState } from '../state'





// const initialState = PrinterState({});

export function cameraReducer(camState: CameraState, action) {
  switch(action.type) {
  case 'CAMERA_UPDATED':
    // console.log("PRINTER RECEIVED PRINT", action)
    return {
      ...camState,
      currentPrint: action.data
    }  
  case 'PRINTER_RECEIVED_LAST_PRINT':
      return camState
      return {
        ...camState,
        // currentPrint: printState(action.data)
      }
  case 'PRINTER_RECEIVED_STATE':
    // console.log("PRINTER RECEIVED STATE", action)
    return {
      ...camState,
      state: action.data
    }
  case 'PRINTER_RECEIVED_DATA':
    // console.log("PRINTER RECEIVED DATA", action)
    // var logs = printerstate.logs.concat(action.data)
    return {
      ...camState,
      logs: [...camState.logs, action.data]
    }
    
  case 'PRINTER_LIST':
    return {
      ...camState, 
      list: action.data
    }
  case 'RECEIVED_LOGS':
    return {
      ...camState, 
      project: action.data
    }  
  default:
    return camState;
  }
}
