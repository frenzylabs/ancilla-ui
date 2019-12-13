//
//  printer.ts
//  ancilla
// 
//  Created by Wess Cope (me@wess.io) on 11/05/19
//  Copyright 2019 Wess Cope
//

import {Request, CancelToken} from './request'

const QS = require('qs');

export const Layerkeep = {
  cancelSource: () => {
    return CancelToken.source();
  },

  sign_in: (node, creds) => {
    return Request.post(`${node.apiUrl}/layerkeep/sign_in`, creds)
  },
  
  listSlices: (node, options= {}) => {
    var qs = options["qs"]
    delete options["qs"]
    var path = `${node.apiUrl}/layerkeep/sliced_files` + QS.stringify(qs, { addQueryPrefix: true }) 
    return Request.get(path, options)
  }

  // list: (node, options= {}) => {
  //     return Request.get(`${node.apiUrl}/services/printer`, options)
  // },

  // state: (node, printerService, options= {}) => {
  //   return Request.get(`${node.apiUrl}/services/printer/${printerService.id}/state`, options)
  // },

  // ports: () => {
  //   return Request.get('/ports')
  // },

  // prints: (node, printerService, options = {}) => { 
  //   return Request.get(`${node.apiUrl}/services/printer/${printerService.id}/prints`, options)
  // },

  // lastPrint: (node, printerService, options = {}) => {
  //   options['params'] = {limit: 1}
  //   return Request.get(`${node.apiUrl}/services/printer/${printerService.id}/prints`, options)
  // },

  // connect: (node, printer, options = {}) => {
  //   console.log(node)
  //   return Request.post(`${node.apiUrl}/services/printer/${printer.id}/connection`, options)
  // },

  // disconnect: (node, printerService, options = {}) => {
  //   return Request.delete(`${node.apiUrl}/services/printer/${printerService.id}/connection`, options)
  // },

  // start_print: (node, printerService, options = {}) => {
  //   return Request.post(`${node.apiUrl}/services/printer/${printerService.id}/print`, options)
  // },

}


export default Layerkeep