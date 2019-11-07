//
//  index.tsx
//  ancilla
// 
//  Created by Wess Cope (me@wess.io) on 11/05/19
//  Copyright 2019 Wess Cope
//
import React from 'react'

import {
  Pane
} from 'evergreen-ui'

import Body   from './body'
import Input  from './input'

export default class Terminal extends React.Component {
  render() {
    return(
      <Pane display="flex">
        <Pane display="flex" flexDirection="column" width="100%" background="#fff" padding={20} margin={10} border="default">
          <Body/>
          <Input/>
        </Pane>
      </Pane>
    )
  }
}
