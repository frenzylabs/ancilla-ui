//
//  printer.ts
//  ancilla
// 
//  Created by Wess Cope (me@wess.io) on 11/05/19
//  Copyright 2019 Wess Cope
//

import {Request, CancelToken, isCancel} from './request'



import {default as QS } from 'qs'

export const Layerkeep = {
  cancelSource: () => {
    return CancelToken.source();
  },

  sign_in: (node, creds) => {
    return Request.post(`${node.apiUrl}/layerkeep/sign_in`, creds)
  },

  get: (node, lkpath, options= {}) => {
    var qs = options["qs"]
    delete options["qs"]
    var path = `${node.apiUrl}/layerkeep/${lkpath}` + QS.stringify(qs, { addQueryPrefix: true }) 
    return Request.get(path, options)
  },

  
  listSlices: (node, options= {}) => {
    var qs = options["qs"]
    delete options["qs"]
    var path = `${node.apiUrl}/layerkeep/sliced_files` + QS.stringify(qs, { addQueryPrefix: true }) 
    return Request.get(path, options)
  },

  listProjects: (node, options= {}) => {
    var qs = options["qs"]
    delete options["qs"]
    var path = `${node.apiUrl}/layerkeep/projects` + QS.stringify(qs, { addQueryPrefix: true }) 
    return Request.get(path, options)
  },

  listProfiles: (node, options= {}) => {
    var qs = options["qs"]
    delete options["qs"]
    var path = `${node.apiUrl}/layerkeep/profiles` + QS.stringify(qs, { addQueryPrefix: true }) 
    return Request.get(path, options)
  }

}


export default Layerkeep
