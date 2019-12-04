//
//  toolbar.tsx
//  ancilla
// 
//  Created by Wess Cope (me@wess.io) on 12/04/19
//  Copyright 2019 Wess Cope
//

import React from 'react'

import {
  Pane,
  IconButton
} from 'evergreen-ui'

export default class Toolbar extends React.Component {
  render() {
    return (
      <Pane display="flex" background="#234361" paddingTop={5} paddingBottom={4}>
        <Pane display="flex" flex={1}></Pane>
        <IconButton appearance="minimal" icon="cog" is="a" href="/settings"></IconButton>
      </Pane>
    )
  }
}
