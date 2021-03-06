//
//  camera.ts
//  ancilla
// 
//  Created by Kevin Musselman (kevin@frenzylabs.com) on 01/08/20
//  Copyright 2019 FrenzyLabs, LLC.
//


import {Request, CancelToken} from './request'
import Connection from '../components/services/printers/summary/connection';

import {default as QS } from 'qs'
// const QS = require('qs');

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
    var qs = options["qs"]
    delete options["qs"]
    var path = `${node.apiUrl}/services/camera/${cameraService.id}/recordings` + QS.stringify(qs, { addQueryPrefix: true }) 
    return Request.get(path, options)
  },

  getRecording: (node, cameraService, recordingId, options= {}) => {
    return Request.get(`${node.apiUrl}/services/camera/${cameraService.id}/recordings/${recordingId}`, options)
  },

  startRecording: (node, cameraService, params = {}, options = {}) => {
    return Request.post(`${node.apiUrl}/services/camera/${cameraService.id}/record`, params, options)
  },

  stopRecording: (node, cameraService, recordingId, params = {}, options = {}) => {
    return Request.post(`${node.apiUrl}/services/camera/${cameraService.id}/recordings/${recordingId}/stop`, params, options)
  },

  deleteRecording: (node, cameraService, recordingId, options = {}) => {
    return Request.delete(`${node.apiUrl}/services/camera/${cameraService.id}/recordings/${recordingId}`, options)
  },

  // ports: () => {
  //   return Request.get('/ports')
  // }
}


export default Camera