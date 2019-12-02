//
//  printer.ts
//  ancilla
// 
//  Created by Wess Cope (me@wess.io) on 11/05/19
//  Copyright 2019 Wess Cope
//

import {Request, CancelToken} from './request'

export const ServiceHandler = {
  cancelSource: () => {
    return CancelToken.source();
  },

  create: (service) => {
    return Request.post('/services', service)
  },

  list: (node, options= {}) => {
      return Request.get(`${node.apiUrl}/services`, options)
  },

  state: (node, service, options= {}) => {
    return Request.get(`${node.apiUrl}/services/${service.kind}/${service.id}/state`, options)
  },

  attachments: (node, service, options = {}) => {
    // options['params'] = {printer_id: printer.id, limit: 1}
    return Request.get(`${node.apiUrl}/services/${service.kind}/${service.id}/attachments`, options)
  },

  addAttachment: (node, service, data, options = {}) => {
    // var data = Object.assign(options['params'] || {}, {attachment_id: attachment_id})
    console.log("ADD OPTIONS", options)
    return Request.post(`${node.apiUrl}/services/${service.kind}/${service.id}/attachments`, data, options)
  }
}


export default ServiceHandler