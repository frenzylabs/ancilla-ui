//
//  printer.ts
//  ancilla
// 
//  Created by Wess Cope (me@wess.io) on 11/05/19
//  Copyright 2019 Wess Cope
//

import {Request, CancelToken} from './request'
import Connection from '../components/services/printers/summary/connection';

export const Camera = {
  cancelSource: () => {
    return CancelToken.source();
  },

  create: (node, camera) => {
    return Request.post(`${node.apiUrl}/services/camera`, camera)
  },

  update: (node, id, camera) => {
    return Request.patch(`${node.apiUrl}/services/camera/${id}/`, camera)
  },

  list: (options= {}) => {
      return Request.get('/services/camera', options)
  },

  connect: (node, cameraService, options = {}) => {
    return Request.post(`${node.apiUrl}/services/camera/${cameraService.id}/connection`, options)
  },

  disconnect: (node, cameraService, options = {}) => {
    return Request.delete(`${node.apiUrl}/services/camera/${cameraService.id}/connection`, options)
  },

  recordings: (node, cameraService, options= {}) => {
    return Request.get(`${node.apiUrl}/services/camera/${cameraService.id}/recordings`, options)
  },

  getRecording: (node, cameraService, recordingId, options= {}) => {
    return Request.get(`${node.apiUrl}/services/camera/${cameraService.id}/recordings/${recordingId}`, options)
  },

  record: (node, cameraService, params = {}, options = {}) => {
    return Request.post(`${node.apiUrl}/services/camera/${cameraService.id}/record`, params, options)
  },

  stopRecording: (node, cameraService, params = {}, options = {}) => {
    return Request.post(`${node.apiUrl}/services/camera/${cameraService.id}/record`, params, options)
  },

  // ports: () => {
  //   return Request.get('/ports')
  // }
}


export default Camera