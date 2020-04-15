//
//  printer.ts
//  ancilla
// 
//  Created by Wess Cope (me@wess.io) on 11/05/19
//  Copyright 2019 Wess Cope
//

import { Request, CancelToken } from './request'
import {default as QS } from 'qs'

export default {
  cancelSource: () => {
    return CancelToken.source();
  },

  create: (node, params = {}, options = {}) => {
    var data = new FormData();
    // data.append(`file`, file);

    for ( var key in params ) {
      if (params[key]) {
        data.append(`${key}`, params[key]);
      }
    }

    return Request.post(`${node.apiUrl}/files`, data, {headers: {'Content-Type' : 'multipart/form-data'}})
  },

  update: (node, id, params = {}, options = {}) => {

    var data = new FormData();

    for ( var key in params ) {
      if (params[key]) {
        data.append(`${key}`, params[key]);
      }
    }

    return Request.patch(`${node.apiUrl}/files/${id}`, data, {headers: {'Content-Type' : 'multipart/form-data'}})
  },

  delete: (node, id, params = {}, options={}) => {
    var path = `${node.apiUrl}/files/${id}` + QS.stringify(params, { addQueryPrefix: true }) 
    return Request.delete(path, options)
  },

  listLocal: (node, options= {}) => {
    var qs = options["qs"]
    delete options["qs"]
    var path = `${node.apiUrl}/files` + QS.stringify(qs, { addQueryPrefix: true }) 
    
    return Request.get(path, options)
  },

  syncFromLayerkeep: (node, lkslice, opts = {}) => {
    return Request.post(`${node.apiUrl}/files/sync_layerkeep`, lkslice, opts)
  },

  syncToLayerkeep: (node, localslice, opts = {}) => {
    return Request.post(`${node.apiUrl}/files/${localslice.id}/sync_layerkeep`, localslice, opts)
  },

  unsyncFromLayerkeep: (node, localslice, opts = {}) => {
    return Request.patch(`${node.apiUrl}/files/${localslice.id}/unsync`, localslice, opts)
  }

}
