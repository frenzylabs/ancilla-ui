//
//  printer.js
//  ancilla
// 
//  Created by Kevin Musselman (kmussel@gmail.com) on 11/12/19
//  Copyright 2019 Frenzylabs, LLC
//

import types from './types'
import Printer from '../../network/printer'

export const PrinterAction = {
  listPrints(printerState) {
    return (dispatch, getState) => {
      console.log("LIST PRINTS NODE ACTION state", getState())
      let activeNode = getState().activeNode
      var cancelRequest    = Printer.cancelSource();  
      // dispatch(requestFeatures(username, cancelRequest))
      if (printerState.model && printerState.model.service) {
        return Printer.prints(activeNode, printerState.model.service, {cancelToken: cancelRequest.token})
            .then((response) => {
              dispatch(PrinterAction.updateLastPrint(printerState, response.data.prints || []))
            })
      }
    }
  },
  lastPrint(printerState) {
    return (dispatch, getState) => {
      console.log("LAST PRINT NODE ACTION state", getState())
      let activeNode = getState().activeNode
      var cancelRequest    = Printer.cancelSource();  
      // dispatch(requestFeatures(username, cancelRequest))
      if (printerState.model && printerState.model.service) {
        return Printer.lastPrint(activeNode, printerState.model.service, {cancelToken: cancelRequest.token})
              .then((response) => {
                console.log("LAST PRINT = ", response.data.prints)
                dispatch(PrinterAction.updateLastPrint(printerState, response.data.prints[0] || {}))
              })
      }
    }
  },

  updatePrint: (printer, prnt) => ({
    type: 'PRINTER_PRINT_UPDATED',
    printer: printer,
    data: prnt
  }),

  updatePrints: (printer, prnts) => ({
    type: 'PRINTER_RECEIVED_PRINTS',
    printer: printer,
    data: prnts
  }),

  updateLastPrint: (printer, prnt) => ({
    type: 'PRINTER_RECEIVED_LAST_PRINT',
    printer: printer,
    data: prnt
  }),

  getState(printerState) {
    return (dispatch, getState) => {
      // console.log("NODE ACTION state", getState())
      let activeNode = getState().activeNode
      var cancelRequest    = Printer.cancelSource();  
      // dispatch(requestFeatures(username, cancelRequest))
      // console.log(printerState)
      if (printerState.model && printerState.model.service) {
        return Printer.state(activeNode, printerState.model.service, {cancelToken: cancelRequest.token})
              .then((response) => {
                // dispatch(PrinterAction.updateState(printer, {...printer.state, connected: false}))
                dispatch(PrinterAction.updateState(printerState, response.data || {}))
              })
      }
    }
  },

  updateState: (printer, printer_state) => ({
    type: 'PRINTER_RECEIVED_STATE',
    printer: printer,
    data: printer_state
  }),

  updateLogs: (printer, log) => ({
    type: 'PRINTER_RECEIVED_DATA',
    printer: printer,
    data: log
  }),
  

  list: (list = {data: [], meta: {}}) => {
    return {
      type: 'PROJECT_LIST',
      data: list
    }
  },

  view: (project = {}) => {
    return {
      type: 'PROJECT_VIEW',
      data: project
    }
  }
}

export default PrinterAction