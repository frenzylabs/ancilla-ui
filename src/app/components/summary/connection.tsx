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


import {
  Printer
} from '../../../../models'

import Tree from '../../../tree'
import Form from './form'
import { NodeAction } from '../../../../store/reducers/nodes'

import PrintForm from '../nodes/devices/print_form'
import PubSub from 'pubsub-js'

export default class Connection extends React.Component {
  form = null
  state = {
    showing: false,
    loading: false
  }

  toggleDialog(show:boolean) {
    this.setState({
      ...this.state,
      showing: show
    })
  }

  startPrint() {
    console.log("START PRINT")
    console.log(this.form)
    if (!(this.form.state.newPrint && this.form.state.newPrint.file_id)) {
      toaster.danger("Select a File")
      return
    }

    this.topic = `${this.props.node.name}.${this.props.printer.name}.request`
    let cmd = [this.props.printer.name, "start_print", this.form.state.newPrint]
    PubSub.publish(this.props.node.name + ".request", cmd)

    // this.pubsubToken = PubSub.publish(this.topic, );
  }


  renderRow(key:string, value:string) {
    return (
      <Pane display="flex" marginBottom={6}>
        <Heading size={500} display="flex" flex={1} marginRight={8}>{key}</Heading>
        <Text size={400}>{value}</Text>
      </Pane>
    )
  }

  renderPrintAction() {
    return (
      <React.Fragment key="printers">
        <Dialog
          isShown={this.state.showing}
          title="Add Printer"
          confirmLabel="Save"
          onCloseComplete={() => this.toggleDialog(false)}
          onConfirm={this.startPrint.bind(this)}
        >
          <PrintForm ref={frm => this.form = frm} save={this.startPrint} loading={this.state.loading}/>
        </Dialog>

        <Pane display="flex" marginBottom={6}>
          <Button onClick={() => this.toggleDialog(true)} minWidth={180} iconBefore="application" appearance="minimal" color="#f0f0f0">Print</Button>          
        </Pane>
        
      </React.Fragment>
    )
  }
  
  render() {
    return (
      <Pane display="flex" flex={1} padding={20} margin={10} background="white" border="default" flexDirection="column">
        {this.renderRow("Connection", this.props.printer.port)}
        {this.renderRow("Baudrate", this.props.printer.baud_rate)}
        {this.renderPrintAction()}
      </Pane>
    )
  }
}
