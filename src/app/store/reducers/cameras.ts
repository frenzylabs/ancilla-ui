import { CameraModel, CameraState, ServiceState } from '../state'





// const initialState = PrinterState({});

export function cameraReducer(camState: CameraState, action) {
  switch(action.type) {
  case 'CAMERA_RECEIVED_RECORDING':    
    return {
      ...camState, currentRecording: action.data
    }
  case 'CAMERA_UPDATED':
    return {
      ...camState, ...action.data
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
