//
//  printer.ts
//  ancilla
// 
//  Created by Wess Cope (me@wess.io) on 11/05/19
//  Copyright 2019 Wess Cope
//

import Request from './request'

export default {
  create: (printer) => {
    return Request.post('/printers', printer)
  },

  list: () => {
      return Request.get('/printers')
  },

  ports: () => {
    return Request.get('/ports')
  }
}
