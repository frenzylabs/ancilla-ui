import { PrintState, printState } from './prints'
import { ServiceModel, ServiceState } from './service'

// baud_rate: "115200"
// created_at: 1573066173
// device: {id: 1, created_at: 1573066173, updated_at: 1573066173, name: "ender3", device_type: "Printer"}
// id: 1
// name: "ender3"
// port: "/dev/cu.usbserial-14140"
// updated_at: 1573231193

// type PrinterModel = {
//   baud_rate: "115200",
//   created_at: 0,
//   device: {},
//   id: 0,
//   name: "",
//   port: "",
//   updated_at: 0
// }

type CameraModel = {  
  id: number,
  name: string,
  endpoint: string,
  created_at: number,
  updated_at: number,
  service: object
}

var defaultState = {}


type CameraServiceModel = ServiceModel & { model: CameraModel}

export type CameraState = ServiceState & {
  model: CameraServiceModel,
  currentRecording?: object
}

// export type PrinterState = ServiceState & {
//   model: PrinterServiceModel,
//   currentRecordings?: [PrintState
// }


export function CameraState(model: CameraModel, state: {} = {}, logs: [] = [], currentRecording = {}, config = {}, settings = {}) {
  var res = ServiceState.call(this, ...arguments)  
  res["currentRecording"] = currentRecording
  return res
}

// const initialState = PrinterState({});

export function cameraReducer(camState: CameraState, action) {
  switch(action.type) {
  case 'CAMERA_UPDATED':
    // console.log("PRINTER RECEIVED PRINT", action)
    return {
      ...camState,
      currentPrint: action.data
    }
  case 'PRINTER_RECEIVED_PRINTS':
      // console.log("PRINTER RECEIVED PRINTS", action)
      var prints = action.data.prints.reduce((acc, item) => {
        acc = acc.concat(printState(item))
        return acc
      }, [])
  
      var newstate = {
        ...camState, 
        prints: prints
      }
      return newstate
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
