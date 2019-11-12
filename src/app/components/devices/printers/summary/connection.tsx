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


// import Form from './form'
// import { NodeAction } from '../../../../store/reducers/nodes'

import PrintForm from './print_form'
import PubSub from 'pubsub-js'

export default class Connection extends React.Component {
  form = null
  state = {
    showing: false,
    loading: false
  }

  componentDidUpdate(prevProps) {
    if (prevProps.printer.state.printing != this.props.printer.state.printing) {
      this.setState({showing: false})
    }
  }

  toggleDialog(show:boolean) {
    this.setState({
      ...this.state,
      showing: show
    })
  }

  startPrint() {
    if (!(this.form.state.newPrint && this.form.state.newPrint.file_id)) {
      toaster.danger("Select a File")
      return
    }

    this.topic = `${this.props.node.name}.${this.props.printer.name}.request`
    let cmd = [this.props.printer.name, "start_print", this.form.state.newPrint]
    PubSub.publish(this.props.node.name + ".request", cmd)
  }

  cancelPrint() {
    let cmd = [this.props.printer.name, "cancel"]
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

  renderStartPrint() {
    if (!this.props.printer.state.printing) {
      return (
        <React.Fragment key="print">
        <Dialog
          isShown={this.state.showing}
          title="Start Print"
          confirmLabel="Save"
          onCloseComplete={() => this.toggleDialog(false)}
          onConfirm={this.startPrint.bind(this)}
        >
          <PrintForm ref={frm => this.form = frm} save={this.startPrint} loading={this.state.loading}/>
        </Dialog>

        <Pane display="flex" marginBottom={6}>
          <Button onClick={() => this.toggleDialog(true)} minWidth={180} iconBefore="application" >Print</Button>          
        </Pane>
        </React.Fragment>
      )
    }
    return null
  }

  renderCancelPrint() {
    if (this.props.printer.state.printing) {
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
            <Button onClick={() => this.toggleDialog(true)} minWidth={180} iconBefore="application" >Cancel Print</Button>
          </Pane>
        </React.Fragment>
      )
    }
    return null
  }

  renderPrintAction() {
    return (
      <div>
        {this.renderStartPrint()}
        {this.renderCancelPrint()}
      </div>
    )
  }
  
  render() {
    return (
      <Pane display="flex" flex={1} padding={20} margin={10} background="white" border="default" flexDirection="column">
        {this.renderRow("Connection", this.props.printer.model.port)}
        {this.renderRow("Baudrate", this.props.printer.model.baud_rate)}
        {this.renderPrintAction()}
      </Pane>
    )
  }
}