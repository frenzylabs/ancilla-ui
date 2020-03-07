//
//  connection.tsx
//  ancilla
// 
//  Created by Wess Cope (me@wess.io) on 11/07/19
//  Copyright 2019 Wess Cope
//

import React from 'react'

import {
  Pane,
  Heading,
  Button,
  Text,
  Strong,
  Dialog,
  toaster
} from 'evergreen-ui'

import PubSub from 'pubsub-js'


import ErrorModal           from '../../../modal/error'

import { NodeState, PrinterState }  from '../../../../store/state'

type Props = {
  node: NodeState, 
  service: PrinterState,
  startPrint: Function,
  createPrint: Function,
  cancelPrint: Function
}

export default class Connection extends React.Component<Props> {
  form = null
  state = {
    showing: false,
    loading: false
  }

  constructor(props:any) {
    super(props)
    // this.startPrint = this.startPrint.bind(this)
    this.renderCreatePrint = this.renderCreatePrint.bind(this)
  }

  componentDidUpdate(prevProps) {
    if (prevProps.service.state.printing != this.props.service.state["printing"]) {
      this.setState({showing: false})
    }
  }

  toggleDialog(show:boolean) {
    // if (show && this.props.createPrint)
    //   this.props.createPrint()
    this.setState({
      ...this.state,
      showing: show
    })
  }


  cancelPrint() {

    if (this.props.service.currentPrint && this.props.service.currentPrint.model) {      
      this.props.cancelPrint(this.props.service.currentPrint.id).then((res) => {
        this.setState({showing: false})
      }).catch((err) => { 
        this.setState({showing: false})
      })
    }

  }

  pausePrint() {
    let cmd = [this.props.service.name, "pause_print"]
    PubSub.make_request(this.props.node, cmd)
  }

  resumePrint() {
    if (this.props.service.currentPrint && this.props.service.currentPrint.model) {
      var printParams = { print_id: this.props.service.currentPrint.id, name: this.props.service.currentPrint.model.name}
      this.props.startPrint(printParams)
    }
  }


  renderRow(key:string, value:string) {
    return (
      <Pane display="flex" marginBottom={6}>
        <Heading size={400} display="flex" flex={1} marginRight={8}>{key}</Heading>
        <Text size={400}>{value}</Text>
      </Pane>
    )
  }

  renderCreatePrint() {
    if (!this.props.service.state["printing"]) {
      return (
        <Pane display="flex" marginBottom={6}>
          <Button disabled={!this.props.service.state["connected"]} onClick={() => this.props.createPrint()} minWidth={180} iconBefore="print" >Print</Button>          
        </Pane>
      )
    }
    return null
  }

  renderCancelPrint() {
    var disabled = true
    if (this.props.service.state["connected"]) {
      disabled = false
    }
    if (this.props.service.state["printing"] || (this.props.service.currentPrint && this.props.service.currentPrint.status == "paused")) {
      
      
      return (
        <React.Fragment key="print">
          <Dialog
            isShown={this.state.showing}
            title="Cancel Print"          
            confirmLabel="Yes"
            onCloseComplete={() => this.toggleDialog(false)}
            onConfirm={this.cancelPrint.bind(this)}
          >        
            <p>Are you sure you want to cancel this Print?</p>  
          </Dialog>

          <Pane display="flex" marginBottom={6}>
            <Button disabled={disabled} onClick={() => this.toggleDialog(true)} minWidth={180} iconBefore="application" >Cancel Print</Button>
          </Pane>
        </React.Fragment>
      )
    }
    return null
  }

  renderPausePrint() {
    var disabled = true
    if (this.props.service.state["printing"]) {
      disabled = false
    } else if (this.props.service.currentPrint && this.props.service.currentPrint.id) {
      
      if (this.props.service.currentPrint.status == "paused") {
        if (this.props.service.state["connected"]) {
          disabled = false
        }
        return (
          <Pane display="flex" marginBottom={6}>
            <Button disabled={disabled} onClick={() => this.resumePrint()} minWidth={180} iconBefore="play" >Resume Print</Button>
          </Pane>
        )
      }
    }

    return (
      <Pane display="flex" marginBottom={6}>
        <Button disabled={disabled} onClick={() => this.pausePrint()} minWidth={180} iconBefore="pause" >Pause Print</Button>
      </Pane>
    )    
  }

  renderPrintAction() {
    return (
      <div style={{marginTop: '20px'}}>
        {this.renderCreatePrint()}
        {this.renderCancelPrint()}
        {this.renderPausePrint()}
      </div>
    )
  }
  
  render() {
    return (
      <Pane display="flex" flex={1} padding={20} margin={10} background="white" border="default" flexDirection="column">
        <div style={{marginBottom: '10px'}}>{this.renderRow("Connection", (this.props.service.model.model && this.props.service.model.model.port))}</div>
        <div style={{marginBottom: '10px'}}>{this.renderRow("Baudrate", (this.props.service.model.model && this.props.service.model.model.baud_rate))}</div>
        {this.renderPrintAction()}
      </Pane>
    )
  }
}
