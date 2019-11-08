//
//  index.tsx
//  ancilla
// 
//  Created by Wess Cope (me@wess.io) on 11/08/19
//  Copyright 2019 Wess Cope
//

import React from 'react'

import {
  Dialog
} from 'evergreen-ui'

import Tree from '../../../tree'

export default class Devices extends React.Component {
  state = {
    showing: false,
    loading: false,
    devices: Array<string>()
  }

  toggleDialog(show:boolean) {
    this.setState({
      ...this.state,
      showing: show
    })
  }

  render() {
    let items =  this.state.devices.length > 0 ? this.state.devices : [{name: "No Devices added."}]

    return (
      <React.Fragment key="devices">
        <Dialog
          isShown={this.state.showing}
          title="Add Device"
          confirmLabel="Save"
          onCloseComplete={() => this.toggleDialog(false)}
        >
          Content
        </Dialog>

        <Tree.Node name="Devices" key="devices" children={items} addAction={() => this.toggleDialog(true)} />
      </React.Fragment>
    )
  }
}
