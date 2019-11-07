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

export default class Statusbar extends React.Component {
  state = {
    status: 'danger'
  }

  render() {
    return (
      <Pane background="#122330" height={42} width="100%" display="flex" paddingLeft={20} paddingRight={20}>
        <Pane flex={1} alignItems="center" display="flex">
          <Icon icon="dot" size={22} color={this.state.status}/>
          <Text color="muted">Printer: <Strong color="rgba(255.0, 255.0, 255.0, 0.8)">Ender 5</Strong></Text>
        </Pane>
        <Pane alignItems="center" display="flex">
          <IconButton icon="console" iconSize={20} appearance="minimal" className="statusBarButton"/>
          <IconButton icon="power" iconSize={20} appearance="minimal" className="statusBarButton"/>
        </Pane>
      </Pane>
    )
  }
}
