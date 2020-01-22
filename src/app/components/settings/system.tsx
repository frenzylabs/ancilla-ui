//
//  index.tsx
//  ancilla
// 
//  Created by Wess Cope (me@wess.io) on 12/04/19
//  Copyright 2019 Wess Cope
//

import React from 'react'

import {
  Pane,
  Heading,
  Button,
  toaster,
  Tablist,
  SidebarTab
} from 'evergreen-ui'

import { NodeState, ServiceState, AttachmentModel }  from '../../store/state'
import { SystemHandler } from '../../network'
import ErrorModal           from '../modal/error'

type Props = {  
  node: NodeState
}

export default class SystemSettings extends React.Component<Props> {
  state = {
  }
  cancelRequest = null
  constructor(props:any) {
    super(props)

    this.restartSystem = this.restartSystem.bind(this)
    this.rebootSystem    = this.rebootSystem.bind(this)

    this.cancelRequest = SystemHandler.cancelSource();
  }



  restartSystem() {
    SystemHandler.restart(this.props.node)
    .then((res) => {
      toaster.success(`System will restart`)
    })
    .catch((error) => {
      toaster.danger(<ErrorModal requestError={error} />)
    })
  }

  rebootSystem() {
    SystemHandler.reboot(this.props.node)
    .then((res) => {
      toaster.success(`System will restart`)
    })
    .catch((error) => {
      toaster.danger(<ErrorModal requestError={error} />)
    })
  }

  render() {    
    return (
      <Pane margin={40} padding={20} background="white" elevation={1} border >
        <Heading size={600}>{"System"}</Heading>

        
        <Pane display="flex" flexDirection="column" borderTop marginTop={10} paddingTop={10}>
          <Button onClick={this.restartSystem}>Restart Ancilla</Button>
        </Pane>
        <Pane display="flex" flexDirection="column" borderTop marginTop={10} paddingTop={10}>
          <Button onClick={this.rebootSystem}>Reboot System</Button>
        </Pane>
      </Pane>
    )
  }
}
