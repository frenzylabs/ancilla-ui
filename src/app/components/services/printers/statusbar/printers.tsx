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

import { PrinterState } from '../../../../store/reducers/printers'

export default class Printers extends React.Component<{status?: string, printer?: PrinterState, service: object}> {
  getColorState() {
    if (this.props.service && this.props.service.state.connected) {
      return 'success'
    } else {
      return 'danger'
    }
  }
  render() {
    return (
      <Pane flex={1} alignItems="center" display="flex">
        <Icon icon="dot" size={22} color={this.getColorState()}/>
        <Text color="muted">Printer: <Strong color="rgba(255.0, 255.0, 255.0, 0.8)">{this.props.service && this.props.service.name}</Strong></Text>
      </Pane>
    )
  }
}
