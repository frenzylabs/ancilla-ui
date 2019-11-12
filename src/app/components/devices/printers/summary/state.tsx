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
    if (prevProps.printer.model != this.props.printer.model) {
      this.setupPrint()
    }
  }

  setupPrint() {
    // console.log("SETUP PRINT")
    if (this.props.printer) {
      this.eventTopic = `${this.props.node.name}.${this.props.printer.name}.events.print`

      if (this.pubsubToken) {
        PubSub.unsubscribe(this.pubsubToken)
      }
      this.pubsubToken = PubSub.subscribe(this.eventTopic, this.receiveEvent);
    }
  }

  receiveEvent(msg, data) {
    var [to, kind] = msg.split("events.")
    switch(kind) {
      case 'print.state':
          this.setState({...this.state, printState: data})
          break
      case 'print.started':
          this.setState({...this.state, printState: data})
          break
      case 'print.cancelled':
          this.setState({...this.state, printState: data})
          break
      case 'print.failed':
          this.setState({...this.state, printState: data})
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
    if (this.state.printState.print.state) {
      let pg = (this.state.printState.print.state.pos / this.state.printState.print.state.end_pos * 100).toFixed(2)
      return `${pg}%` 
    }
    return ``
  }

  renderLastPrint() {
    var curprnt = this.props.printer.currentPrint
    if (curprnt.name && curprnt.status != "running") {
      return (
        <div>
          {this.renderRow("Last Print", curprnt.name)}
          {this.renderRow("Status", curprnt.status)}
          {this.renderRow("Started On", curprnt.created_at)}
          {this.renderRow("Duration", String(curprnt.updated_at - curprnt.created_at))}
          {this.renderRow("SliceFile", curprnt.slice_file.name)}
        </div>
      )
    }
  }

  renderCurrentPrint() {
    var curprnt = this.props.printer.currentPrint
    if (curprnt.status == "running") {
      return (
        <div>
          {this.renderRow("State", this.state.printState.status)}
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
