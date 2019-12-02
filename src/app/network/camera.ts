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

  create: (camera) => {
    return Request.post('/services/camera', camera)
  },

  list: (options= {}) => {
      return Request.get('/services/camera', options)
  },

  connect: (node, cameraService, options = {}) => {
    return Request.post(`${node.apiUrl}/services/camera/${cameraService.id}/connection`, options)
  },

  disconnect: (node, cameraService, options = {}) => {
    return Request.delete(`${node.apiUrl}/services/camera/${cameraService.id}/connection`, options)
  }


  // ports: () => {
  //   return Request.get('/ports')
  // }
}


export default Camera