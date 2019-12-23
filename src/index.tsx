//
//  index.ts
//  ancilla
// 
//  Created by Wess Cope (me@wess.io) on 10/30/19
//  Copyright 2019 Wess Cope
//

import React    from 'react'

import {
  BrowserRouter as Router
} from 'react-router-dom'

import {render} from 'react-dom'
import {Provider} from 'react-redux'
import App      from './app'
import store          from './app/store'

import { Request, isCancel } from './app/network/request';

Request.interceptors.response.use(function (response) {
  return response;
}, function (error) {
  //catches if the session ended!
  console.log(error);
  if (isCancel(error)) {
    console.log('Request canceled', error.message);
  } else {
    if (error.response && error.response.status == 401) {
      store.dispatch({ type: "UNAUTH_USER" });
    }
  }
  return Promise.reject(error);
  
});


render(
  <Router>
    <Provider store={store}>
      <App />
    </Provider>
  </Router>, 
  document.getElementById('app')
)
