import { Printer } from "../../models"
import PrinterAction from '../actions/printers'

import { PrintModel, PrintState } from '../state'



// const initialState = PrinterState({});

export function printReducer(printstate: PrintState, action) {
  switch(action.type) {
  case 'PRINTER_RECEIVED_PRINT':
      // console.log("PRINTER RECEIVED PRINT", action)
      return {
        ...printstate,
        currentPrint: action.data
      }
  case 'PRINTER_RECEIVED_STATE':
    // console.log("PRINTER RECEIVED STATE", action)
    return {
      ...printstate,
      state: action.data
    }
    
  case 'PRINTER_LIST':
    return {
      ...printstate, 
      list: action.data
    }
  case 'RECEIVED_LOGS':
    return {
      ...printstate, 
      project: action.data
    }  
  default:
    return printstate;
  }
}
