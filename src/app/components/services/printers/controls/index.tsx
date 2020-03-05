//
//  index.tsx
//  ancilla
// 
//  Created by Wess Cope (me@wess.io) on 02/19/20
//  Copyright 2019 Wess Cope
//

import React from 'react'

import {
  Pane
} from 'evergreen-ui'

import Body from './body'

export default class Controls extends React.Component {

  render() {
    return(
      <Pane display="flex" flexDirection="column" background="#fff" padding={20} margin={10} border="default">
        <Body {...this.props} />
      </Pane>
    )
  }
}
