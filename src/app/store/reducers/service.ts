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

export type ServiceModel = {
  id: number,
  name: string,
  kind: string,
  settings: object,
  configuration: object,
  created_at: number,
  updated_at: number
}

var defaultState = {}

export type ServiceState = {
  id: number,
  name: string,
  kind: string,
  model: ServiceModel,
  state: object,
  logs: [],
  attachments: []
}

export function ServiceState(model: ServiceModel, state: {} = {}, logs: [] = [], attachments = {}) {
  return {
    id: model.id,
    name: model.name,
    kind: model.kind,
    model: model,
    state: state,
    logs: logs,
    attachments: attachments
  }
}



// const initialState = PrinterState({});

export function serviceReducer(state: ServiceState, action) {
  switch(action.type) {
    case 'SERVICE_RECEIVED_STATE':
        return {
          ...state,
          state: action.data
        }
    case 'SERVICE_RECEIVED_DATA':
        // console.log("PRINTER RECEIVED DATA", action)
        // var logs = printerstate.logs.concat(action.data)
        return {
          ...state,
          logs: [...state.logs, action.data]
        }
    default:
      return state
  }
}
//   case 'PRINTER_PRINT_UPDATED':
//     // console.log("PRINTER RECEIVED PRINT", action)
//     return {
//       ...serviceState,
//       currentPrint: action.data
//     }
//   case 'PRINTER_RECEIVED_PRINTS':
//       console.log("PRINTER RECEIVED PRINTS", action)
//       var prints = action.data.prints.reduce((acc, item) => {
//         acc = acc.concat(printState(item))
//         return acc
//       }, [])
  
//       var newstate = {
//         ...serviceState, 
//         prints: prints
//       }
//       return newstate
//   case 'PRINTER_RECEIVED_LAST_PRINT':
//       console.log("PRINTER RECEIVED PRINT", action)
//       return {
//         ...serviceState,
//         currentPrint: printState(action.data)
//       }
//   case 'PRINTER_RECEIVED_STATE':
//     // console.log("PRINTER RECEIVED STATE", action)
//     return {
//       ...serviceState,
//       state: action.data
//     }
//   case 'PRINTER_RECEIVED_DATA':
//     // console.log("PRINTER RECEIVED DATA", action)
//     // var logs = printerstate.logs.concat(action.data)
//     return {
//       ...serviceState,
//       logs: [...serviceState.logs, action.data]
//     }
    
//   case 'PRINTER_LIST':
//     return {
//       ...serviceState, 
//       list: action.data
//     }
//   case 'RECEIVED_LOGS':
//     return {
//       ...serviceState, 
//       project: action.data
//     }  
//   default:
//     return serviceState;
//   }
// }
