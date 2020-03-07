
import { PrintState } from '../state'



export function printReducer(printstate: PrintState, action) {
  switch(action.type) {
  case 'PRINTER_RECEIVED_PRINT':
      return {
        ...printstate,
        currentPrint: action.data
      }
  case 'PRINTER_RECEIVED_STATE':
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
