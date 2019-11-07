//
//  state.tsx
//  ancilla
// 
//  Created by Wess Cope (me@wess.io) on 11/07/19
//  Copyright 2019 Wess Cope
//

import React from 'react'

import {
  Pane,
  Heading,
  Text,
  Strong,
} from 'evergreen-ui'

export default class State extends React.Component {
  renderRow(key:string, value:string) {
    return (
      <Pane display="flex" marginBottom={6}>
        <Heading size={500} display="flex" flex={1} marginRight={8}>{key}</Heading>
        <Text size={400}>{value}</Text>
      </Pane>
    )
  }
  render() {
    return (
      <Pane display="flex" flex={1} padding={20} margin={10} background="white" border="default" flexDirection="column">
        {this.renderRow("State", "Operational")}
        {this.renderRow("Filament", "14.41m")}
        {this.renderRow("Est Time", "12.4 hours")}
        {this.renderRow("Time left", "00:00:00")}
        {this.renderRow("Progress", "89%")}
      </Pane>
    )
  }
}
