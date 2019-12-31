//
//  printer.ts
//  ancilla
// 
//  Created by Wess Cope (me@wess.io) on 11/05/19
//  Copyright 2019 Wess Cope
//

import {Request, CancelToken} from './request'

const QS = require('qs');

export const Printer = {
  cancelSource: () => {
    return CancelToken.source();
  },

  create: (node, printer) => {
    return Request.post(`${node.apiUrl}/services/printer`, printer)
  },

  update: (node, id, printer) => {
    return Request.patch(`${node.apiUrl}/services/printer/${id}/`, printer)
  },

  list: (node, options= {}) => {
      return Request.get(`${node.apiUrl}/services/printer`, options)
  },

  state: (node, printerService, options= {}) => {
    return Request.get(`${node.apiUrl}/services/printer/${printerService.id}/state`, options)
  },

  ports: () => {
    return Request.get('/ports')
  },

  prints: (node, printerService, options = {}) => { 
    return Request.get(`${node.apiUrl}/services/printer/${printerService.id}/prints`, options)
  },

  getPrint: (node, printerService, printId, options = {}) => { 
    return Request.get(`${node.apiUrl}/services/printer/${printerService.id}/prints/${printId}`, options)
  },

  deletePrint: (node, printerService, printId, options = {}) => { 
    return Request.delete(`${node.apiUrl}/services/printer/${printerService.id}/prints/${printId}`, options)
  },

  getPrinterCommands: (node, printerService, options = {}) => {
    // options["params"] = {print_id: x, per_page, page}
    // QS.stringify(qs, { addQueryPrefix: true }
    var qs = options["qs"]
    delete options["qs"]
    var path = `${node.apiUrl}/services/printer/${printerService.id}/commands` + QS.stringify(qs, { addQueryPrefix: true }) 
    return Request.get(path, options)
  },

  lastPrint: (node, printerService, options = {}) => {
    options['params'] = {limit: 1}
    return Request.get(`${node.apiUrl}/services/printer/${printerService.id}/prints`, options)
  },

  syncPrintToLayerkeep: (node, printerService, printId, options = {}) => {
    return Request.post(`${node.apiUrl}/services/printer/${printerService.id}/prints/${printId}/sync_layerkeep`, options)
  },

  unsyncFromLayerkeep: (node, printerService, printId, options = {}) => {
    return Request.post(`${node.apiUrl}/services/printer/${printerService.id}/prints/${printId}/unsync_layerkeep`, options)
  },

  connect: (node, printer, options = {}) => {
    console.log(node)
    return Request.post(`${node.apiUrl}/services/printer/${printer.id}/connection`, options)
  },

  disconnect: (node, printerService, options = {}) => {
    return Request.delete(`${node.apiUrl}/services/printer/${printerService.id}/connection`, options)
  },

  start_print: (node, printerService, options = {}) => {
    return Request.post(`${node.apiUrl}/services/printer/${printerService.id}/print`, options)
  },

}


export default Printer