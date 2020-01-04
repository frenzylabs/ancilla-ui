// import { PrintState, printState } from './prints'

// import { ServiceModel, ServiceState } from './service'
import { printState, PrinterState } from '../state'
// type PrinterModel = {
//   baud_rate: string,
//   created_at: number,
//   service: object,
//   id: number,
//   name: string,
//   port: string,
//   updated_at: number
// }

// type PrinterServiceModel = ServiceModel & { model: PrinterModel}

// export type PrinterState = ServiceState & {
//   model: PrinterServiceModel,
//   currentPrint?: PrintState
// }

// export type PrinterState = ServiceState & {
//   id: number,
//   name: string,
//   model: PrinterModel,
//   state: object,
//   logs: [],
//   currentPrint?: PrintState,
//   attachments: []
// }


// export function PrinterState(model: PrinterServiceModel, state: {} = {}, logs: [] = [], currentPrint = {}) {
//   var res = ServiceState.call(this, ...arguments)  
//   res["currentPrint"] = currentPrint
//   return res
//   // return {
//   //   id: model.id,
//   //   name: model.name,
//   //   model: model,
//   //   state: state,
//   //   logs: logs,
//   //   currentPrint: currentPrint
//   // }
// }



// const initialState = PrinterState({});

export function printerReducer(printerstate: PrinterState, action) {
  switch(action.type) {
  case 'PRINTER_PRINT_UPDATED':
    console.log("Print Updated", action.data)
    console.log("PrintState", printState(action.data))
    return {
      ...printerstate,
      currentPrint: action.data
    }
  case 'PRINTER_RECEIVED_PRINTS':
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
    var logs = [...printerstate.logs, action.data]
    if (logs.length > 100) {
      logs.shift()
    }

    return {
      ...printerstate,
      logs: logs
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
