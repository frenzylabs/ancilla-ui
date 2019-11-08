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

render(
  <Router>
    <Provider store={store}>
      <App />
    </Provider>
  </Router>, 
  document.getElementById('app')
)
