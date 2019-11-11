//
//  devices.tsx
//  ancilla
// 
//  Created by Wess Cope (me@wess.io) on 11/08/19
//  Copyright 2019 Wess Cope
//

import React from 'react'
import PubSub from 'pubsub-js'

import {
  Pane,
  IconButton,
} from 'evergreen-ui'

export default class Devices extends React.Component {
  power(){
    if (this.props.printerState.open) {
      var res = PubSub.publishSync(this.props.node.name + ".request", [this.props.printer.name, "REQUEST.close"])
    } else {
      var res = PubSub.publishSync(this.props.node.name + ".request", [this.props.printer.name, "REQUEST.connect"])
    }
  }

  render() {
    return (
      <Pane alignItems="center" display="flex">
        <IconButton icon="console" iconSize={20} appearance="minimal" className="statusBarButton"/>
        <IconButton icon="power" iconSize={20} appearance="minimal" className="statusBarButton" onClick={this.power.bind(this)}/>
      </Pane>
    )
  }
}
