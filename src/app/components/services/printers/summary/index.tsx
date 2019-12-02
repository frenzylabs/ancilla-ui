//
//  index.ts
//  ancilla
// 
//  Created by Wess Cope (me@wess.io) on 11/07/19
//  Copyright 2019 Wess Cope
//

import React from 'react'

import {
  Pane
} from 'evergreen-ui'

import Connection from './connection'
import State      from './state'

export default class Summary extends React.Component {
  render() {
    return (
      <Pane display="flex">
        <Pane display="flex" width="100%">
          <Connection {...this.props} />
          <State {...this.props} />
        </Pane>
      </Pane>
    )
  }
}
