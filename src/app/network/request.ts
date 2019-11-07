//
//  request.ts
//  ancilla
// 
//  Created by Wess Cope (me@wess.io) on 11/05/19
//  Copyright 2019 Wess Cope
//

import axios from 'axios'

export default axios.create({
  baseURL: 'http://localhost:5000',
  responseType: 'json',
  headers: {
    'Content-Type'      : 'application/json',
    'Accept'            : 'application/json',
    'X-Requested-With'  : 'XMLHttpRequest',
    'Access-Control-Allow-Origin' : '*',
  }
})
