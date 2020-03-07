//
//  printer.ts
//  ancilla
// 
//  Created by Wess Cope (me@wess.io) on 11/05/19
//  Copyright 2019 Wess Cope
//

import {Request, CancelToken} from './request'

// import {QS} from 'qs'
import {default as QS } from 'qs'

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

  delete: (node, service, options= {}) => {
    return Request.delete(`${node.apiUrl}/services/${service.id}`, options)
  },

  update: (node, service_id, data, options = {}) => {    
    return Request.patch(`${node.apiUrl}/services/${service_id}`, data, options)
  },

  state: (node, service, options= {}) => {
    return Request.get(`${node.apiUrl}/services/${service.kind}/${service.id}/state`, options)
  },

  recordings: (node, options = {}) => {
    // options['params'] = {printer_id: printer.id, limit: 1}
    var qs = options["qs"]
    delete options["qs"]
    var path = `${node.apiUrl}/recordings` + QS.stringify(qs, { addQueryPrefix: true }) 
    return Request.get(path, options)
  },
  
  getRecording: (node, recordingId, options= {}) => {
    return Request.get(`${node.apiUrl}/recordings/${recordingId}`, options)
  },

  deleteRecording: (node, recordingId, options = {}) => {
    return Request.delete(`${node.apiUrl}/recordings/${recordingId}`, options)
  },

  attachments: (node, service, options = {}) => {
    // options['params'] = {printer_id: printer.id, limit: 1}
    return Request.get(`${node.apiUrl}/services/${service.kind}/${service.id}/attachments`, options)
  },

  addAttachment: (node, service, data, options = {}) => {
    // var data = Object.assign(options['params'] || {}, {attachment_id: attachment_id})
    return Request.post(`${node.apiUrl}/services/${service.kind}/${service.id}/attachments`, data, options)
  },

  deleteAttachment: (node, service, attachment, options = {}) => {
    // var data = Object.assign(options['params'] || {}, {attachment_id: attachment_id})
    return Request.delete(`${node.apiUrl}/services/${service.kind}/${service.id}/attachments/${attachment.id}`, options)
  },

  updateAttachment: (node, attachment_id, data, options = {}) => {
    // var data = Object.assign(options['params'] || {}, {attachment_id: attachment_id})
    return Request.patch(`${node.apiUrl}/attachments/${attachment_id}`, data, options)
  },

  logs: (node, service, options = {}) => {
    // options['params'] = {printer_id: printer.id, limit: 1}
    var qs = options["qs"]
    delete options["qs"]
    var path = `${node.apiUrl}/services/${service.kind}/${service.id}/logs` + QS.stringify(qs, { addQueryPrefix: true }) 
    return Request.get(path, options)
  },

  deleteLog: (node, service, filename, options = {}) => {    
    return Request.delete(`${node.apiUrl}/services/${service.kind}/${service.id}/logs/${filename}`, options)
  },


}

export default ServiceHandler
