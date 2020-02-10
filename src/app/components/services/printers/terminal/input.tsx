//
//  input.tsx
//  ancilla
// 
//  Created by Wess Cope (me@wess.io) on 11/07/19
//  Copyright 2019 Wess Cope
//

import React, {useRef} from 'react'

import {
  Pane,
  Checkbox,
  TextInput,
  Button
} from 'evergreen-ui'

import PubSub from 'pubsub-js'

import { NodeState, PrinterState }  from '../../../../store/state'

type Props = {
  node: NodeState, 
  service: PrinterState
}

export default class Input extends React.Component<Props> {
  historyIndex:number     = 0
  trackingHistory:boolean = false

  state = {
    history:  Array<string>(),
    entry:    '',
    nowait: false,
    skipQueue: false
  }

  constructor(props:any) {
    super(props)

    this.sendAction     = this.sendAction.bind(this)
    this.enterAction    = this.enterAction.bind(this)
    this.upAction       = this.upAction.bind(this)
    this.downAction     = this.downAction.bind(this)
    this.keyAction      = this.keyAction.bind(this)
    this.setValue       = this.setValue.bind(this)
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  sendAction() {
    (this.state.entry.includes('&&') ? this.state.entry.split('&&') : [this.state.entry]).map((item) => {
      let cmd = [this.props.service.name, "send_command", { cmd: item.trim(), nowait: this.state.nowait, skip_queue: this.state.skipQueue}]
      PubSub.publish(this.props.node.name + ".request", cmd)
      return cmd
    })
    // .forEach((cmd) => { console.log("send: ", cmd)})
    this.setState({entry: ""})
  }

  enterAction() {
    if(this.state.entry.length < 1) { return }

    var history = (this.state.history || [])
    history.unshift(this.state.entry)

    this.setState({
      history: history
    })
  
    this.sendAction()

    this.historyIndex = 0
  }

  upAction() {
    if(this.historyIndex >= this.state.history.length) { 
      return 
    }

    let line = this.state.history[this.historyIndex]

    this.historyIndex += 1

    this.setValue(line)
  }

  downAction() {
    this.historyIndex -= 1

    var line = ""

    if(this.historyIndex < 0) {
      this.historyIndex = 0
    } else {
      line = this.state.history[this.historyIndex]
    }

    this.setValue(line)
  }

  keyAction(e) {
    switch(e.keyCode) {
      case 13: { // Enter
        this.enterAction()
        return
      }

      case 38: { // Up
        this.upAction()
        return
      }

      case 40: { // Down
        this.downAction()
        return
      }

      default: 
        return
    }
  }


  setValue(value) {
    this.setState({entry: value})
  }

  render() {
    return (
      <Pane display="flex" flex={1} flexDirection="column">
        <Pane display="flex" flex={1} width="100%" padding={8} border>
          <Pane display="flex" width="100%" flex={1} marginRight={8}>
            <input 
              type="text"
              disabled={!this.props.service.state["connected"]}
              placeholder="Enter command..." 
              value={this.state.entry}
              onKeyDown={this.keyAction}
              id="terminal-input-field" 
              onChange={(e) => {
                this.setValue(e.target.value)
                }
              }
            />
          </Pane>
        </Pane>
          <Pane display="flex" width="100%" flex={1} marginRight={8}>
            <Checkbox
              label="Don't Wait for Response"
              checked={this.state.nowait}
              onChange={e => 
                this.setState({
                  nowait:  e.target.checked
                })
              }
            />
          </Pane>
          <Pane display="flex" width="100%" flex={1} marginRight={8}>
            <Checkbox
              label="Skip Command Queue"
              checked={this.state.skipQueue}
              onChange={e => 
                this.setState({
                  skipQueue:  e.target.checked
                })
              }
            />
          </Pane>
      </Pane>
    )
  }
}
