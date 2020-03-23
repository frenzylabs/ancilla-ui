//
//  request.ts
//  ancilla
// 
//  Created by Wess Cope (me@wess.io) on 11/05/19
//  Copyright 2019 Wess Cope
//

import axios from 'axios'

export const Request = axios.create({
  baseURL: document.location.protocol+ "//" + document.location.hostname,
  responseType: 'json',
  headers: {
    'Content-Type'      : 'application/json',
    'Accept'            : 'application/json',
    'X-Requested-With'  : 'XMLHttpRequest',
		'Access-Control-Allow-Origin' : '*',
		'Access-Control-Allow-Methods': '*',
  }
})

export const isCancel 		= axios.isCancel;
export const CancelToken 	= axios.CancelToken;

export default Request;
