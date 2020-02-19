//
//  index.tsx
//  ancilla
// 
//  Created by Wess Cope (me@wess.io) on 11/05/19
//  Copyright 2019 Wess Cope
//
import React from 'react'

import {
  Pane
} from 'evergreen-ui'

import Body   from './body'
import Input  from './input'

import { NodeState, PrinterState }  from '../../../../store/state'

type Props = {
  node: NodeState, 
  service: PrinterState,
  dispatch: Function
}

export default class Terminal extends React.Component<Props> {
  // constructor(props:any) {
  //   super(props)

  //   this.renderLine   = this.renderLine.bind(this)
  //   this.renderLines  = this.renderLines.bind(this)
  // }

  render() {
    return(
      <Pane display="flex" flex={1}>
        <Pane display="flex" flexDirection="column" width="100%" background="#fff" padding={20} margin={10} border="default">
          <Body {...this.props} />
          <Input {...this.props} />
        </Pane>
      </Pane>
    )
  }
}
