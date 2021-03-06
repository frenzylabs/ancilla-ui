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

export const WifiHandler = {
  cancelSource: () => {
    return CancelToken.source();
  },

  connect: (node, data, options= {}) => {
      return Request.post(`${node.apiUrl}/wifi`, data, options)
  },

  status: (node, options= {}) => {
    return Request.get(`${node.apiUrl}/wifi/status`, options)
  },

  networks: (node, options= {}) => {
    return Request.get(`${node.apiUrl}/wifi/scan`, options)
  },

  // update: (node, data, options = {}) => {    
  //   return Request.patch(`${node.apiUrl}/node`, data, options)
  // },

}

export default WifiHandler
