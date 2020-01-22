//
//  wifi.ts
//  ancilla
// 
//  Created by Kevin Musselman (kevin@frenzylabs.com) on 01/15/20
//  Copyright 2019 FrenzyLabs, LLC.
//


import {Request, CancelToken} from './request'

// import {QS} from 'qs'
import {default as QS } from 'qs'

export const SystemHandler = {
  cancelSource: () => {
    return CancelToken.source();
  },

  restart: (node, data = {}, options= {}) => {
      return Request.post(`${node.apiUrl}/system/restart`, data, options)
  },

  reboot: (node, data = {}, options= {}) => {
    return Request.post(`${node.apiUrl}/system/reboot`, data, options)
  },

  

}

export default SystemHandler
