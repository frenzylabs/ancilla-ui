import { PrintState, printState } from './prints'

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

type PrinterModel = {
  baud_rate: string,
  created_at: number,
  service: object,
  id: number,
  name: string,
  port: string,
  updated_at: number
}

var defaultState = {}

export type PrinterState = {
  id: number,
  name: string,
  model: PrinterModel,
  state: object,
  logs: [],
  currentPrint?: PrintState,
  attachments: []
}

export function PrinterState(model: PrinterModel, state: {} = {}, logs: [] = [], currentPrint = {}) {
  return {
    id: model.id,
    name: model.name,
    model: model,
    state: state,
    logs: logs,
    currentPrint: currentPrint
  }
}



// const initialState = PrinterState({});

export function printerReducer(printerstate: PrinterState, action) {
  switch(action.type) {
  case 'PRINTER_PRINT_UPDATED':
    // console.log("PRINTER RECEIVED PRINT", action)
    return {
      ...printerstate,
      currentPrint: action.data
    }
  case 'PRINTER_RECEIVED_PRINTS':
      console.log("PRINTER RECEIVED PRINTS", action)
      var prints = action.data.prints.reduce((acc, item) => {
        acc = acc.concat(printState(item))
        return acc
      }, [])
  
      var newstate = {
        ...printerstate, 
        prints: prints
      }
      return newstate
  case 'PRINTER_RECEIVED_LAST_PRINT':
      console.log("PRINTER RECEIVED PRINT", action)
      return {
        ...printerstate,
        currentPrint: printState(action.data)
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
