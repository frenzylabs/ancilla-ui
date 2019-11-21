//
//  printer.ts
//  ancilla
// 
//  Created by Wess Cope (me@wess.io) on 11/05/19
//  Copyright 2019 Wess Cope
//

import Request from './request'

export default {
  create: (file) => {
    // console.log(file)
    var data = new FormData();
    data.append(`file`, file);

    return Request.post('/files', data, {headers: {'Content-Type' : 'multipart/form-data'}})
  },

  delete: (id) => {
    return Request.delete('/files', {file_id: id})
  },

  listLocal: (options= {}) => {
      return Request.get('/files', options)
  }
}
