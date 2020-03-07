//
//  printers.ts
//  ancilla
// 
//  Created by Kevin Musselman (kevin@frenzylabs.com) on 01/08/20
//  Copyright 2019 FrenzyLabs, LLC.
//

import { printState, PrinterState } from '../state'


export function printerReducer(printerstate: PrinterState, action) {
  switch(action.type) {
  case 'PRINTER_PRINT_UPDATED':
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
    return {
      ...printerstate,
      state: action.data
    }
  case 'PRINTER_RECEIVED_DATA':
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
