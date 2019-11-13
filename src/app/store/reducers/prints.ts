import { Printer } from "../../models"
import PrinterAction from '../actions/printers'

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

// {'id': 55, 'created_at': 1573662775.159364, 'updated_at': 1573662812.047947, 'name': 'tada', 'status': 'failed', 'state': {'end_pos': 659, 'pos': 220}, 'request_id': 282, 'printer_snapshot': {'id': 1, 'created_at': 1573066173, 'updated_at': 1573231193, 'name': 'ender3', 'port': '/dev/cu.usbserial-14140', 'baud_rate': '115200', 'device': {'id': 1, 'created_at': 1573066173, 'updated_at': 1573066173, 'name': 'ender3', 'device_type': 'Printer'}}, 'printer': {'id': 1, 'created_at': 1573066173, 'updated_at': 1573231193, 'name': 'ender3', 'port': '/dev/cu.usbserial-14140', 'baud_rate': '115200', 'device': {'id': 1, 'created_at': 1573066173, 'updated_at': 1573066173, 'name': 'ender3', 'device_type': 'Printer'}}, 'slice_file': {'id': 1, 'created_at': 1573066533, 'updated_at': 1573066533, 'name': 'test.gcode', 'generated_name': 'tyzac2.gcode', 'path': '/Users/kmussel/.ancilla/localhost/user_files/tyzac2.gcode', 'layerkeep_id': None}, 'layerkeep_id': None}, 'device': 'ender3', 'reason': 'Could Not Execute Command: M109 S60\n'}

type PrintModel = {
  id: number,
  created_at: number,
  updated_at: number
  name: string,
  status: string,
  state: object,
  printer_snapshot: object,
  slice_file: object,
  layerkeep_id?: number
}

var defaultState = {}


export type PrintState = {
  model: PrintModel,
  status: string
}

export function printState(model: PrintModel, status: string = "") {
  if (status.length == 0)
    status = model.status
  return {
    id: model.id,
    model: model,
    status: status,
  }
}



// const initialState = PrinterState({});

export function printReducer(printerstate: PrintState, action) {
  switch(action.type) {
  case 'PRINTER_RECEIVED_PRINT':
      // console.log("PRINTER RECEIVED PRINT", action)
      return {
        ...printerstate,
        currentPrint: action.data
      }
  case 'PRINTER_RECEIVED_STATE':
    // console.log("PRINTER RECEIVED STATE", action)
    return {
      ...printerstate,
      state: action.data
    }
  case 'PRINTER_RECEIVED_DATA':
    // console.log("PRINTER RECEIVED DATA", action)
    // var logs = printerstate.logs.concat(action.data)
    return {
      ...printerstate,
      logs: [...printerstate.logs, action.data]
    }
    
  case 'PRINTER_LIST':
    return {
      ...printerstate, 
      list: action.data
    }
  case 'RECEIVED_LOGS':
    return {
      ...printerstate, 
      project: action.data
    }  
  default:
    return printerstate;
  }
}
