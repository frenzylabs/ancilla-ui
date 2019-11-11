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

export default class Printers extends React.Component<{status?: string}> {
  getColorState() {
    if (this.props.printerState.open) {
      return 'success'
    } else {
      return 'danger'
    }
  }
  render() {
    console.log(this.props)
    return (
      <Pane flex={1} alignItems="center" display="flex">
        <Icon icon="dot" size={22} color={this.getColorState()}/>
        <Text color="muted">Printer: <Strong color="rgba(255.0, 255.0, 255.0, 0.8)">{this.props.printer && this.props.printer.name}</Strong></Text>
      </Pane>
    )
  }
}
