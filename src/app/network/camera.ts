//
//  printer.ts
//  ancilla
// 
//  Created by Wess Cope (me@wess.io) on 11/05/19
//  Copyright 2019 Wess Cope
//

import {Request, CancelToken} from './request'

export const Camera = {
  cancelSource: () => {
    return CancelToken.source();
  },

  create: (camera) => {
    return Request.post('/cameras', camera)
  },

  list: (options= {}) => {
      return Request.get('/cameras', options)
  }

  // ports: () => {
  //   return Request.get('/ports')
  // }
}


export default Camera