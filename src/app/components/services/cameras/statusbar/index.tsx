//
//  index.tsx
//  ancilla
// 
//  Created by Wess Cope (me@wess.io) on 11/05/19
//  Copyright 2019 Wess Cope
//

import React from 'react'

import {
  Pane,
  Text,
  Strong,
  IconButton,
  Icon
} from 'evergreen-ui'

import Cameras from './cameras'
import Service  from './services'

export default class Statusbar extends React.Component {
  state = {
    status: 'danger'
  }

  render() {
    return (
      <Pane background="#122330" height={42} width="100%" display="flex" paddingLeft={20} paddingRight={20}>
        <Cameras {...this.props} />
        <Service {...this.props} />
      </Pane>
    )
  }
}
