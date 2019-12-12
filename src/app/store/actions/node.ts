//
//  printer.js
//  ancilla
// 
//  Created by Kevin Musselman (kmussel@gmail.com) on 11/12/19
//  Copyright 2019 Frenzylabs, LLC
//

import types from './types'
import { PrinterHandler, CameraHandler, ServiceHandler } from '../../network'




export const NodeAction = {
  listPrinters() {
    return (dispatch, getState) => {
      // console.log("NODE ACTION state", getState())
      let activeNode = getState().activeNode
      var cancelRequest    = PrinterHandler.cancelSource();  
      // dispatch(requestFeatures(username, cancelRequest))
      return PrinterHandler.list(activeNode, {cancelToken: cancelRequest.token})
            .then(response => dispatch(NodeAction.receivedPrinters(activeNode, response.data)))
    }
  },

  getServices() {
    return (dispatch, getState) => {
      // console.log("NODE ACTION state", getState())
      let activeNode = getState().activeNode
      var cancelRequest    = ServiceHandler.cancelSource();  
      // dispatch(requestFeatures(username, cancelRequest))
      return ServiceHandler.list(activeNode, {cancelToken: cancelRequest.token})
            .then(response => dispatch(NodeAction.receivedServices(activeNode, response.data)))
    }
  },

  receivedServices: (node, services) => ({
    type: 'RECEIVED_SERVICES',
    node: node,
    data: services
  }),

  receivedPrinters: (node, printers) => ({
    type: 'RECEIVED_PRINTERS',
    node: node,
    data: printers
  }),

  listCameras() {
    return (dispatch, getState) => {
      // console.log("NODE ACTION state", getState())
      let activeNode = getState().activeNode
      var cancelRequest    = CameraHandler.cancelSource();  
      // dispatch(requestFeatures(username, cancelRequest))
      return CameraHandler.list({cancelToken: cancelRequest.token})
            .then(response => dispatch(NodeAction.receivedCameras(activeNode, response.data)))
    }
  },

  receivedCameras: (node, cameras) => ({
    type: 'RECEIVED_CAMERAS',
    node: node,
    data: cameras
  }),
  
  printerUpdated: (node, service) => ({
    type: 'PRINTER_UPDATED',
    node: node,
    data: service
  }),

  
  get_printers: () => {
    return {
      type: 'LIST_PRINTERS'
    }
  },

  addPrinter: (node, printer_service = {}) => {
    return {
      type: 'ADDED_PRINTER',
      node: node,
      data: printer_service
    }
  },

  connect: (device = {}) => {
    return {
      type: 'CONNECT_DEVICE',
      data: device
    }
  }
}


export default NodeAction