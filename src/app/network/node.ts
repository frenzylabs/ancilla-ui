//
//  node.ts
//  ancilla
// 
//  Created by Kevin Musselman (kevin@frenzylabs.com) on 01/10/20
//  Copyright 2019 FrenzyLabs, LLC.
//


import {Request, CancelToken} from './request'

// import {QS} from 'qs'
import {default as QS } from 'qs'

export const NodeHandler = {
  cancelSource: () => {
    return CancelToken.source();
  },

  list: (node, options= {}) => {
      return Request.get(`${node.apiUrl}/nodes`, options)
  },

  get: (node, options= {}) => {
    return Request.get(`${node.apiUrl}/node`, options)
  },

  update: (node, data, options = {}) => {    
    return Request.patch(`${node.apiUrl}/node`, data, options)
  },

}

export default NodeHandler
