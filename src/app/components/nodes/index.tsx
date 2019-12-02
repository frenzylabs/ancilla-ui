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

// import Tree from '../../../tree'

export default class Nodes extends React.Component {
  state = {
    showing: false,
    loading: false,
    nodes: Array<string>()
  }

  toggleDialog(show:boolean) {
    this.setState({
      ...this.state,
      showing: show
    })
  }

  render() {
    let items =  this.state.nodes.length > 0 ? this.state.nodes : [{name: "No Nodes added."}]

    return (
      <React.Fragment key="nodes">
        <Dialog
          isShown={this.state.showing}
          title="Add Node"
          confirmLabel="Save"
          onCloseComplete={() => this.toggleDialog(false)}
        >
          Content
        </Dialog>

        <Tree.Node name="Nodes" key="nodes" children={items} addAction={() => this.toggleDialog(true)} />
      </React.Fragment>
    )
  }
}
