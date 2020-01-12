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
