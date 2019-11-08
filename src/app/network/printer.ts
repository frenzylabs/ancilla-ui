//
//  printer.ts
//  ancilla
// 
//  Created by Wess Cope (me@wess.io) on 11/05/19
//  Copyright 2019 Wess Cope
//

import {Request, CancelToken} from './request'

export const Printer = {
  cancelSource: () => {
    return CancelToken.source();
  },

  create: (printer) => {
    return Request.post('/printers', printer)
  },

  list: (options= {}) => {
      return Request.get('/printers', options)
  },

  ports: () => {
    return Request.get('/ports')
  }
}


export default Printer