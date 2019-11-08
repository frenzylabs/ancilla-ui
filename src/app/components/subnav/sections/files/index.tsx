//
//  index.tsx
//  ancilla
// 
//  Created by Wess Cope (me@wess.io) on 11/08/19
//  Copyright 2019 Wess Cope
//

import React from 'react'

import Tree from '../../../tree'

export default class Files extends React.Component {
  state = {
    files: [
      "example1",
      "example2",
      "example3",
      "example4",
      "example5",
      "example6",
      "example7"
    ]
  }

  render() {
    return (
      <React.Fragment>
        <Tree.Node name="Files" key="files" children={this.state.files} />
      </React.Fragment>
    )
  }
}
