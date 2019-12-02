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

export default class Services extends React.Component {
  state = {
    showing: false,
    loading: false,
    services: Array<string>()
  }

  toggleDialog(show:boolean) {
    this.setState({
      ...this.state,
      showing: show
    })
  }

  render() {
    let items =  this.state.services.length > 0 ? this.state.services : [{name: "No Services added."}]

    return (
      <React.Fragment key="services">
        <Dialog
          isShown={this.state.showing}
          title="Add Service"
          confirmLabel="Save"
          onCloseComplete={() => this.toggleDialog(false)}
        >
          Content
        </Dialog>

        <Tree.Node name="Services" key="services" children={items} addAction={() => this.toggleDialog(true)} />
      </React.Fragment>
    )
  }
}
