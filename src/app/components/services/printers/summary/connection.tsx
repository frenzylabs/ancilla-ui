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
  createPrint: Function
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



  // onNewPrint(closeDialog) {
  //   if (!(this.form.state.newPrint && this.form.state.newPrint.file_id)) {
  //     toaster.danger("Select a File")
  //     return
  //   }

  //   var newPrint = this.form.state.newPrint
  //   this.startPrint(newPrint, closeDialog)
  // }

  // startPrint(printParams, closeDialog = null) {
  //   // if (!(this.form.state.newPrint && this.form.state.newPrint.file_id)) {
  //   //   toaster.danger("Select a File")
  //   //   return
  //   // }

  //   // var newPrint = this.form.state.newPrint
  //   return PrinterHandler.start_print(this.props.node, this.props.service, printParams)
  //   .then((response) => {
  //     // var attachments = this.state.attachments
  //     console.log("START PRINT", response.data)
  //     var f = response.data.print
  //     // attachments = attachments.concat(f)
  //     // this.setState({
  //     //   loading: false,
  //     //   attachments: attachments
  //     // })

  //     toaster.success(`Print Started ${printParams.name} has been successfully added`)
  //     if (closeDialog)
  //       closeDialog()
  //   })
  //   .catch((error) => {
  //     console.log(error)
  //     if (closeDialog)
  //       closeDialog()
  //     toaster.danger(<ErrorModal requestError={error} />)

  //     this.setState({
  //       loading: false,
  //     })
  //   })
  // }

  cancelPrint() {
    let cmd = [this.props.service.name, "cancel_print"]
    PubSub.make_request(this.props.node, cmd)

    // this.pubsubToken = PubSub.publish(this.topic, );
  }

  pausePrint() {
    let cmd = [this.props.service.name, "pause_print"]
    PubSub.make_request(this.props.node, cmd)
    // this.pubsubToken = PubSub.publish(this.topic, );
  }

  resumePrint() {
    // let cmd = [this.props.service.name, "start_print"]
    // PubSub.publish(this.props.node.name + ".request", cmd)
    if (this.props.service.currentPrint && this.props.service.currentPrint.model) {
      var printParams = { print_id: this.props.service.currentPrint.id, name: this.props.service.currentPrint.model.name}
      this.props.startPrint(printParams)
    }
    
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

  renderCreatePrint() {
    if (!this.props.service.state["printing"]) {
      return (
        <Pane display="flex" marginBottom={6}>
          <Button disabled={!this.props.service.state["connected"]} onClick={() => this.props.createPrint()} minWidth={180} iconBefore="application" >Print</Button>          
        </Pane>
      )
    }
    return null
  }

  renderCancelPrint() {
    if (this.props.service.state["printing"]) {
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
  renderPausePrint() {
    if (this.props.service.state["printing"]) {
      return (
          <Pane display="flex" marginBottom={6}>
            <Button onClick={() => this.pausePrint()} minWidth={180} iconBefore="application" >Pause Print</Button>
          </Pane>
      )
    } else if (this.props.service.currentPrint) {
      return (
        <Pane display="flex" marginBottom={6}>
          <Button onClick={() => this.resumePrint()} minWidth={180} iconBefore="application" >Resume Print</Button>
        </Pane>
    )
    }
    return null
  }

  renderPrintAction() {
    return (
      <div>
        {this.renderCreatePrint()}
        {this.renderCancelPrint()}
        {this.renderPausePrint()}
      </div>
    )
  }
  
  render() {
    return (
      <Pane display="flex" flex={1} padding={20} margin={10} background="white" border="default" flexDirection="column">
        {this.renderRow("Connection", (this.props.service.model.model && this.props.service.model.model.port))}
        {this.renderRow("Baudrate", (this.props.service.model.model && this.props.service.model.model.baud_rate))}
        {this.renderPrintAction()}
      </Pane>
    )
  }
}
