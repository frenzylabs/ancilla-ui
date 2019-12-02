//
//  state.tsx
//  ancilla
// 
//  Created by Wess Cope (me@wess.io) on 11/07/19
//  Copyright 2019 Wess Cope
//

import React from 'react'

import {
  Pane,
  Heading,
  Text,
  Strong,
} from 'evergreen-ui'

import PubSub from 'pubsub-js'

import PrinterAction from '../../../../store/actions/printers'

export default class State extends React.Component {
  constructor(props:any) {
    super(props)

    
    this.state = {
      printState: {
        status: "idle",
        print: {}
      },
      connected: false
    }
    

    // this.receiveRequest  = this.receiveRequest.bind(this)
    this.receiveEvent    = this.receiveEvent.bind(this)
    this.setupPrint    = this.setupPrint.bind(this)

    this.setupPrint()    
  }

  componentDidUpdate(prevProps, prevState) {
    var prevPrint = prevProps.service.currentPrint
    var curPrint = this.props.service.currentPrint
    if (prevPrint.model && curPrint.model && prevPrint.model.id != curPrint.model.id) {


    } else {
      if (prevPrint.model != curPrint.model) {
        this.setupPrint()
      }
    }

    // if (prevProps.printer.model != this.props.printer.model) {
    //   this.setupPrint()
    // }
  }

  setupPrint() {
    // console.log("SETUP PRINT")
    if (this.props.service) {
      this.eventTopic = `${this.props.node.name}.${this.props.service.name}.events.printer.print`

      if (this.pubsubToken) {
        PubSub.unsubscribe(this.pubsubToken)
      }
      this.pubsubToken = PubSub.subscribe(this.eventTopic, this.receiveEvent);
    }
  }

  receiveEvent(msg, data) {
    var [to, kind] = msg.split("events.")
    switch(kind) {
      case 'printer.print.state':          
          this.props.dispatch(PrinterAction.updatePrint(this.props.service, data))
          // this.setState({...this.state, printState: data})
          break
      case 'printer.print.started':
          this.props.dispatch(PrinterAction.updatePrint(this.props.service, {...this.props.service.currentPrint, status: "running"}))
          // this.setState({...this.state, printState: data})
          break
      case 'printer.print.cancelled':
          this.props.dispatch(PrinterAction.updatePrint(this.props.service, {...this.props.service.currentPrint, status: "cancelled"}))
          // this.setState({...this.state, printState: data})
          break
      case 'printer.print.failed':
          this.props.dispatch(PrinterAction.updatePrint(this.props.service, {...this.props.service.currentPrint, status: "failed"}))
          // this.setState({...this.state, printState: data})
          break
      default:
        break
    }    
  }

  renderRow(key:string, value:string) {
    return (
      <Pane display="flex" marginBottom={6}>
        <Heading size={500} display="flex" flex={1} marginRight={8}>{key}</Heading>
        <Text size={400}>{value}</Text>
      </Pane>
    )
  }
  getProgress() {
    var curprnt = (this.props.service.currentPrint.id ? this.props.service.currentPrint.model : {})
    if (curprnt.state) {
      let pg = (curprnt.state.pos / curprnt.state.end_pos * 100).toFixed(2)
      return `${pg}%` 
    }
    return ``
  }

  renderLastPrint() {
    var curprnt = (this.props.service.currentPrint.id ? this.props.service.currentPrint.model : {})
    if (curprnt && curprnt.name && curprnt.status != "running") {
      return (
        <div>
          {this.renderRow("Last Print", curprnt.name)}
          {this.renderRow("Status", curprnt.status)}
          {this.renderRow("Started On", curprnt.created_at)}
          {this.renderRow("Duration", String(curprnt.updated_at - curprnt.created_at))}
          {this.renderRow("Slice File", curprnt.slice_file.name)}
        </div>
      )
    }
  }

  renderCurrentPrint() {
    var curprnt = (this.props.service.currentPrint.id ? this.props.service.currentPrint.model : {})
    if (curprnt && curprnt.status == "running") {
      return (
        <div>
          {this.renderRow("Current Print", curprnt.name)}
          {this.renderRow("Slice File", curprnt.slice_file.name)}
          {this.renderRow("State", curprnt.status)}
          {this.renderRow("Started On", curprnt.created_at)}
          {/* {this.renderRow("Filament", "14.41m")}
          {this.renderRow("Est Time", "12.4 hours")}
          {this.renderRow("Time left", "00:00:00")} */}
          {this.renderRow("Progress", this.getProgress())}
        </div>
      )
    }
  }

  render() {
    return (
      <Pane display="flex" flex={1} padding={20} margin={10} background="white" border="default" flexDirection="column">
        {this.renderLastPrint()}
        {this.renderCurrentPrint()}
        
      </Pane>
    )
  }
}
