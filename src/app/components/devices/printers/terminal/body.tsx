//
//  body.tsx
//  ancilla
// 
//  Created by Wess Cope (me@wess.io) on 11/07/19
//  Copyright 2019 Wess Cope
//

import React, {useEffect, useRef} from 'react'

import {
  Pane,
  Heading,
  Text
} from 'evergreen-ui'

import PubSub from 'pubsub-js'
import PrinterActions from '../../../../store/actions/printers'

export default class Body extends React.Component {
  lastLine?:any
  pubsubToken = null
  topic = null

  constructor(props:any) {
    super(props)

    this.state = {
      buffer: []
    }

    this.renderLine   = this.renderLine.bind(this)
    this.renderLines  = this.renderLines.bind(this)
    this.receiveData  = this.receiveData.bind(this)
       
    
    if (this.props.printer) {
      this.topic = `${this.props.node.name}.${this.props.printer.name}.events.printer.data_received`
      this.pubsubToken = PubSub.subscribe(this.topic, this.receiveData);
    }
  }


  receiveData(msg, data) {
    // console.log("Received Data here1", msg)
    // console.log("Received Data here2", data)
    if (data["resp"]) {
      if (data["resp"] != '\n') {
        // var evt = {
        //   type: 'PRINTER_RECEIVED_DATA',
        //   printer: this.props.printer,
        //   data: data["resp"]
        // }
        this.props.dispatch(PrinterActions.updateLogs(this.props.printer, data))
        // this.props.dispatch(evt)

        // this.setState(prevState => ({        
        //   buffer: [...prevState.buffer, data["resp"]]
        // }))
      }
    }
  }
  
  componentWillUnmount() {
    if (this.pubsubToken)
      PubSub.unsubscribe(this.pubsubToken)
  }

  componentDidMount() {
    this.scrollToBottom()
  }

  componentDidUpdate(prevProps) {
    if (this.props.printer.model && prevProps.printer.model != this.props.printer.model) {
      if (this.pubsubToken)
        PubSub.unsubscribe(this.pubsubToken)
      this.topic = `${this.props.node.name}.${this.props.printer.name}.events.printer.data_received`
      this.pubsubToken = PubSub.subscribe(this.topic, this.receiveData);
    }
    this.scrollToBottom()
  }

  scrollToBottom() {
    document.getElementById('terminal-body-last-line').scrollIntoView({behavior: 'smooth'})
  }

  renderCommand(prevItem:object, item:object, index:number) {
    var command = null
    if (item.command && prevItem.command != item.command) {
      command = item.command
    }
    // console.log(`CMD: ${command}, INDEX ${index}`)
    if (command) {      
      return (
        <Pane key={`${index}`} display="flex" width="100%" background={"#fff" } style={{flexDirection: "column"}}>
            <Pane display="flex" width="100%" padding={8} background={"#f0fff0"}>
              <Pane display="flex" flex={1} width="100%">
                <Text size={300} color="black">{command}</Text> 
              </Pane>
            </Pane>     
            <Pane display="flex" width="100%" padding={8} background={(index % 2 > 0) ? "#f0f0f0" : "#fff" }>
              <Pane display="flex" flex={1} width="100%">
                <Text size={300} color="black">{item.resp}</Text>
              </Pane>
            </Pane>
        </Pane>
      )
    }else {      
        return this.renderLine(item.resp, index)
    }
  }

  renderLine(item:string, index:number) {
    return (
      <Pane key={index} display="flex" width="100%" padding={8} background={(index % 2 > 0) ? "#f0f0f0" : "#fff" }>
        <Pane display="flex" flex={1} width="100%">
          <Text size={300} color="black">{item}</Text>
        </Pane>
      </Pane>
    )
  }

  renderLines() {
    return this.props.printer.logs.map((item, index) => {
      var prevItem = {}
      if (index > 0) {
        prevItem = this.props.printer.logs[index-1]
      }
      if (item.command) {
        return this.renderCommand(prevItem, item, index)
      }
      return this.renderLine(item.resp, index)
    })
  }

  render() {
    return (
      <React.Fragment>
        <Pane display="flex" width="100%" padding={8} background="#fff" borderBottom>
          <Heading size={300}>Terminal</Heading>
        </Pane>

        <Pane display="flex" flexDirection="column" width="100%" borderLeft borderRight>
          <Pane height={200} overflow="auto">
            {this.renderLines()}
            
            <Pane id="terminal-body-last-line"></Pane>
          </Pane>
        </Pane>
      </React.Fragment>
    )
  }
}
