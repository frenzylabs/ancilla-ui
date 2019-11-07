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
import App      from './app'

render(
  <Router>
    <App />
  </Router>, 
  document.getElementById('app')
)
