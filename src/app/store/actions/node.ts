//
//  printer.js
//  ancilla
// 
//  Created by Kevin Musselman (kmussel@gmail.com) on 11/12/19
//  Copyright 2019 Frenzylabs, LLC
//

import types from './types'
import { NodeHandler, PrinterHandler, CameraHandler, ServiceHandler } from '../../network'




export const NodeAction = {
  listNodes() {
    return (dispatch, getState) => {
      // console.log("NODE ACTION state", getState())
      let activeNode = getState().activeNode
      var cancelRequest    = NodeHandler.cancelSource();  
      // dispatch(requestFeatures(username, cancelRequest))
      return NodeHandler.list(activeNode, {cancelToken: cancelRequest.token})
            .then(response => dispatch(NodeAction.receivedNodes(activeNode, response.data)))
    }
  },

  getNode(node) {
    return (dispatch, getState) => {
      // console.log("NODE ACTION state", getState())
      // let activeNode = getState().activeNode
      var cancelRequest    = NodeHandler.cancelSource();  
      // dispatch(requestFeatures(username, cancelRequest))
      return NodeHandler.get(node, {cancelToken: cancelRequest.token})
            .then(response => dispatch(NodeAction.receivedNodeModel(node, response.data)))
    }
  },

  updateNode: (node, params) => {
    return (dispatch, getState) => {
      var cancelRequest    = NodeHandler.cancelSource();
      return NodeHandler.update(node, params, {cancelToken: cancelRequest.token})
          .then((response) => {
            dispatch(NodeAction.receivedNodeModel(node, response.data))
            return response
          })
    }
  },

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

  receivedNodes: (node, nodes) => ({
    type: 'RECEIVED_NODES',
    node: node,
    data: nodes
  }),

  receivedNodeModel: (node, model) => ({
    type: 'RECEIVED_NODE_MODEL',
    node: node,
    data: model
  }),

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

  cameraUpdated: (node, service) => ({
    type: 'CAMERA_UPDATED',
    node: node,
    service: service
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

  addCamera: (node, camera_service = {}) => {
    return {
      type: 'ADDED_CAMERA',
      node: node,
      data: camera_service
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