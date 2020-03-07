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
  Paragraph,
  Text
} from 'evergreen-ui'

import { NodeState, ServiceState, AttachmentModel }  from '../../store/state'
import { SystemHandler } from '../../network'
import ErrorModal           from '../modal/error'

type Props = {  
  node: NodeState
}

const RetryNetworkInterval: number = 10000

export default class SystemSettings extends React.Component<Props> {
  state = {
    networkConnected: false
  }
  cancelRequest = null
  timer = null
  
  constructor(props:any) {
    super(props)

    this.restartAncilla   = this.restartAncilla.bind(this)
    this.updateAncilla    = this.updateAncilla.bind(this)
    this.rebootSystem     = this.rebootSystem.bind(this)
    this.getSystemConfig  = this.getSystemConfig.bind(this)
    this.cancelRequest    = SystemHandler.cancelSource();
  }

  componentDidMount() {
    this.getSystemConfig()
  }

  componentWillUnmount() {
    if (this.timer) {
      clearTimeout(this.timer)
    }
  }

  getSystemConfig() {
    SystemHandler.getConfig(this.props.node, {timeout: 2000})
    .then((res) => {
      this.setState({networkConnected: true})
      // toaster.success(`System will restart`)
    })
    .catch((error) => {
      console.log("getconfig", error.message)
      this.setState({networkConnected: false})
      this.timer = setTimeout(this.getSystemConfig.bind(this), RetryNetworkInterval);
      // toaster.danger(<ErrorModal requestError={error} />)
    })
  }

  updateAncilla() {
    SystemHandler.updateAncilla(this.props.node)
    .then((res) => {
      toaster.success(`Ancilla will restart`)
      this.setState({networkConnected: false, restarting: true})
      this.timer = setTimeout(this.getSystemConfig.bind(this), RetryNetworkInterval);
    })
    .catch((error) => {
      toaster.danger(<ErrorModal requestError={error} />)
    })
  }
  
  restartAncilla() {
    SystemHandler.restart(this.props.node)
    .then((res) => {
      toaster.success(`Ancilla will restart`)
      this.setState({networkConnected: false, restarting: true})
      this.timer = setTimeout(this.getSystemConfig.bind(this), RetryNetworkInterval);
    })
    .catch((error) => {
      toaster.danger(<ErrorModal requestError={error} />)
    })
  }

  rebootSystem() {
    SystemHandler.reboot(this.props.node)
    .then((res) => {
      toaster.success(`System will reboot`)
      this.setState({networkConnected: false, restarting: true})
      this.timer = setTimeout(this.getSystemConfig.bind(this), RetryNetworkInterval);
    })
    .catch((error) => {
      toaster.danger(<ErrorModal requestError={error} />)
    })
  }

  renderNetworkStatus() {
    if (this.state.networkConnected) return;
    return (
      <Text color={"red"}> (Network Down)</Text>
    )
  }

  render() {    
    var disabled = !this.state.networkConnected
    return (
      <Pane margin={40} padding={20} background="white" elevation={1} border >
        <Heading size={600}>{"System"} {this.renderNetworkStatus()}</Heading>
        <Pane>
          <Paragraph size={300} marginTop="10px">
              This only works if you downloaded the image from ancilla or you 
              installed the ancilla.service startup script on your system.
          </Paragraph>
        </Pane>
        
        <Pane display="flex" flexDirection="column" borderTop marginTop={10} paddingTop={10}>
          <Button disabled={!this.state.networkConnected} onClick={this.updateAncilla}>Update Ancilla</Button>
        </Pane>
        <Pane display="flex" flexDirection="column" borderTop marginTop={10} paddingTop={10}>
          <Button disabled={!this.state.networkConnected} onClick={this.restartAncilla}>Restart Ancilla</Button>
        </Pane>
        <Pane display="flex" flexDirection="column" borderTop marginTop={10} paddingTop={10}>
          <Button disabled={!this.state.networkConnected} onClick={this.rebootSystem}>Reboot System</Button>
        </Pane>
      </Pane>
    )
  }
}
