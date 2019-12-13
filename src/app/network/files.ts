//
//  printer.ts
//  ancilla
// 
//  Created by Wess Cope (me@wess.io) on 11/05/19
//  Copyright 2019 Wess Cope
//

import Request from './request'

export default {
  create: (node, params = {}) => {
    // console.log(file)
    var data = new FormData();
    // data.append(`file`, file);

    for ( var key in params ) {
      if (params[key]) {
        data.append(`${key}`, params[key]);
      }
    }

    return Request.post(`${node.apiUrl}/files`, data, {headers: {'Content-Type' : 'multipart/form-data'}})
  },

  delete: (id, options={}) => {
    return Request.delete(`/files/${id}`, options)
  },

  listLocal: (options= {}) => {
      return Request.get('/files', options)
  }
}
