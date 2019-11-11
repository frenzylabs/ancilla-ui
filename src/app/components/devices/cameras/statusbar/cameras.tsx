//
//  printers.tsx
//  ancilla
// 
//  Created by Wess Cope (me@wess.io) on 11/08/19
//  Copyright 2019 Wess Cope
//

import React from 'react'

import {
  Pane,
  Text,
  Strong,
  Icon
} from 'evergreen-ui'

export default class Cameras extends React.Component<{status?: string}> {
  getColorState() {
    if (this.props.deviceState.open) {
      return 'success'
    } else {
      return 'danger'
    }
  }
  render() {
    return (
      <Pane flex={1} alignItems="center" display="flex">
        <Icon icon="dot" size={22} color={this.getColorState()}/>
        <Text color="muted">Camera: <Strong color="rgba(255.0, 255.0, 255.0, 0.8)">{this.props.camera && this.props.camera.name}</Strong></Text>
      </Pane>
    )
  }
}
