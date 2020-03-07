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


// But if you only use a few react-virtualized components,
// And you're concerned about increasing your application's bundle size,
// You can directly import only the components you need, like so:
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';
import List from 'react-virtualized/dist/commonjs/List';
// import { List } from "react-virtualized";

import PubSub from 'pubsub-js'
import ServiceActions from '../../../../store/actions/services'

import { NodeState, PrinterState }  from '../../../../store/state'

type Props = {
  node: NodeState, 
  service: PrinterState,
  dispatch: Function
}

export default class Body extends React.Component<Props> {
  lastLine?:any
  pubsubToken = null
  topic = null
  rowHeight = 35
  list = null
  _stopIndex = 0
  allowAllData = true

  constructor(props:any) {
    super(props)

    this.state = {
    }

    this.receiveData  = this.receiveData.bind(this)
    this.getRowHeight    = this.getRowHeight.bind(this)
    this.getCommand    = this.getCommand.bind(this)
    this._onRowsRendered = this._onRowsRendered.bind(this)
       
    

  }


  receiveData(msg, data) {

    if (data["resp"]) {
      if (data["resp"] != '\n' && (this.allowAllData || data["command"])) {
        this.props.dispatch(ServiceActions.updateLogs(this.props.service, data))
      }
    }
  }
  
  componentWillUnmount() {
    PubSub.make_request(this.props.node, [this.props.service.identity, "UNSUB", "data"])
    if (this.pubsubToken)
      PubSub.unsubscribe(this.pubsubToken)
  }

  componentDidMount() {
    if (this.props.service) {
      PubSub.make_request(this.props.node, [this.props.service.identity, "SUB", "data"])
      this.topic = `${this.props.node.uuid}.${this.props.service.identity}.data.printer.data_received`
      this.pubsubToken = PubSub.subscribe(this.topic, this.receiveData);
      if (this.props.service.logs.length > 0)
        this.allowAllData = false
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.service.model && (prevProps.service.model != this.props.service.model || prevProps.node.uuid != this.props.node.uuid)) {
      if (this.pubsubToken)
        PubSub.unsubscribe(this.pubsubToken)
      this.topic = `${this.props.node.uuid}.${this.props.service.identity}.data.printer.data_received`
      this.pubsubToken = PubSub.subscribe(this.topic, this.receiveData);
    }
    if (prevProps.service.logs.length != this.props.service.logs.length) {

      if (prevProps.service.logs.length == 0) {
        setTimeout(() => {
          this.allowAllData = false
        }, 5000)
      }
      if (this._stopIndex > 1 && this._stopIndex > prevProps.service.logs.length - 2){
        this.list.scrollToRow(this.props.service.logs.length - 1)
      }
    }
  }

  getCommand(index) {
    var prevItem = {}
    if (index > 0) {
      prevItem = this.props.service.logs[index-1]
    }
    var item = this.props.service.logs[index]
    var command = null
    if (item["command"] && prevItem["command"] != item["command"]) {
      command = item["command"]
    }
    return command
  }

  getRowHeight({index}) {
    var command = this.getCommand(index)
    
    if (command) {
      return this.rowHeight * 2
    } else {
      return this.rowHeight
    }
  }

  _onRowsRendered({ startIndex, stopIndex }) {
    this._stopIndex = stopIndex
  }

  renderRow({ index, key, style }) {
    var prevItem = {}
      if (index > 0) {
        prevItem = this.props.service.logs[index-1]
      }
    var command = this.getCommand(index)  
    var item = this.props.service.logs[index]
    if (command) {
      return (
        <Pane key={key} width="100%" background={"#fff" } style={style} className="row">
            <Pane width="100%" height={this.rowHeight} padding={8} background={"#f0fff0"}>
              <Pane display="flex" flex={1} width="100%">
                <Text size={300} color="black">{command}</Text> 
              </Pane>
            </Pane>     
            <Pane width="100%" padding={8} height={this.rowHeight} background={(index % 2 > 0) ? "#f0f0f0" : "#fff" }>
              <Pane display="flex" flex={1} width="100%">
                <Text size={300} color="black">{item["resp"]}</Text>
              </Pane>
            </Pane>
        </Pane>
      )
    } else {
      return (
        <Pane key={key} width="100%" padding={8} background={(index % 2 > 0) ? "#f0f0f0" : "#fff" } style={style} className="row">
          <Pane width="100%">
            <Text size={300} color="black">{item["resp"]}</Text>
          </Pane>
        </Pane>
      )
    }
  }

  render() {
    return (
      <React.Fragment>
        <Pane display="flex" width="100%" padding={8} background="#fff" borderBottom>
          <Heading size={400}>Terminal</Heading>
        </Pane>

        <Pane display="flex" flex={1} flexDirection="column" width="100%" height="100%" minHeight="200px" borderLeft borderRight>
          <Pane display="flex" flex={1} overflow="auto" >
            <div className="list" style={{"width": "100%", "height": "100%"}}>
              <AutoSizer >
                {({height, width}) => (
                <List
                ref={(ref) => this.list = ref }
                width={width}
                height={height}
                rowHeight={this.getRowHeight}
                rowRenderer={this.renderRow.bind(this)}
                rowCount={this.props.service.logs.length}
                onRowsRendered={this._onRowsRendered}
                />
                )}
              </AutoSizer>
            </div>
            
            
            <Pane id="terminal-body-last-line"></Pane>
          </Pane>
        </Pane>
      </React.Fragment>
    )
  }
}
