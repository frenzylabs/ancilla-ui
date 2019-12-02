//
//  printer.js
//  ancilla
// 
//  Created by Kevin Musselman (kmussel@gmail.com) on 11/12/19
//  Copyright 2019 Frenzylabs, LLC
//

import types from './types'
import Service from '../../network/service'

export const ServiceAction = {
  listAttachments(serviceState) {
    return (dispatch, getState) => {
      console.log("LIST PRINTS NODE ACTION state", getState())
      let activeNode = getState().activeNode
      var cancelRequest    = Service.cancelSource();  
      // dispatch(requestFeatures(username, cancelRequest))
      if (serviceState.model) {
        return Service.attachments(activeNode, serviceState.model, {cancelToken: cancelRequest.token})
            .then((response) => {
              dispatch(ServiceAction.updateAttachments(serviceState, response.data.attachments || []))
            })
      }
    }
  },
  // lastPrint(printerState) {
  //   return (dispatch, getState) => {
  //     console.log("LAST PRINT NODE ACTION state", getState())
  //     let activeNode = getState().activeNode
  //     var cancelRequest    = Printer.cancelSource();  
  //     // dispatch(requestFeatures(username, cancelRequest))
  //     console.log("PRINTER STATE =", printerState)
  //     if (printerState.model) {
  //       return Printer.lastPrint(activeNode, printerState.model, {cancelToken: cancelRequest.token})
  //             .then((response) => {
  //               console.log("LAST PRINT = ", response.data.prints)
  //               dispatch(PrinterAction.updateLastPrint(printerState, response.data.prints[0] || {}))
  //             })
  //     }
  //   }
  // },

  updateAttachments: (service, attachments) => ({
    type: 'SERVICE_RECEIVED_ATTACHMENTS',
    service: service,
    data: attachments
  }),

  // updatePrints: (printer, prnts) => ({
  //   type: 'PRINTER_RECEIVED_PRINTS',
  //   printer: printer,
  //   data: prnts
  // }),

  // updateLastPrint: (printer, prnt) => ({
  //   type: 'PRINTER_RECEIVED_LAST_PRINT',
  //   printer: printer,
  //   data: prnt
  // }),

  getState(serviceState) {
    return (dispatch, getState) => {
      // console.log("NODE ACTION state", getState())
      let activeNode = getState().activeNode
      var cancelRequest    = Service.cancelSource();  
      // dispatch(requestFeatures(username, cancelRequest))
      // console.log(printerState)
      if (serviceState.model) {
        return Service.state(activeNode, serviceState.model, {cancelToken: cancelRequest.token})
              .then((response) => {
                // dispatch(PrinterAction.updateState(printer, {...printer.state, connected: false}))
                dispatch(ServiceAction.updateState(serviceState, response.data || {}))
              })
      }
    }
  },

  updateState: (service, service_state) => ({
    type: 'SERVICE_RECEIVED_STATE',
    service: service,
    data: service_state
  }),

  updateLogs: (service, log) => ({
    type: 'SERVICE_RECEIVED_DATA',
    service: service,
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

export default ServiceAction