//
//  printer.js
//  ancilla
// 
//  Created by Kevin Musselman (kmussel@gmail.com) on 11/12/19
//  Copyright 2019 Frenzylabs, LLC
//

import types from './types'
import Printer from '../../network/printer'

export const PrintAction = {
  
  updatePrint: (printer, prnt) => ({
    type: 'PRINTER_PRINT_UPDATED',
    printer: printer,
    data: prnt
  }),

  updateState: (printer, printer_state) => ({
    type: 'PRINTER_RECEIVED_STATE',
    printer: printer,
    data: printer_state
  }),

  updateLogs: (printer, log) => ({
    type: 'PRINTER_RECEIVED_DATA',
    printer: printer,
    data: log
  })
}

export default PrintAction