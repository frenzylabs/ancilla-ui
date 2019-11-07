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
  TextInput,
  Button
} from 'evergreen-ui'

export default class Input extends React.Component {
  historyIndex:number     = 0
  trackingHistory:boolean = false

  state = {
    history:  Array<string>(),
    entry:    ''
  }

  constructor(props:any) {
    super(props)

    this.sendAction     = this.sendAction.bind(this)
    this.enterAction    = this.enterAction.bind(this)
    this.upAction       = this.upAction.bind(this)
    this.downAction     = this.downAction.bind(this)
    this.inputAction    = this.inputAction.bind(this)
    this.keyAction      = this.keyAction.bind(this)
    this.setValue       = this.setValue.bind(this)
  }

  componentDidMount() {
    document.addEventListener("keydown", this.keyAction, false)
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.keyAction, false)
  }

  sendAction() {
    (this.state.entry.includes('&&') ? this.state.entry.split('&&') : [this.state.entry]).map((item) => {
      return JSON.stringify({
        action: 'command',
        code: item.trim()
      })
    }).forEach((cmd) => { console.log("send: ", cmd)})
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

    let input   = (document.getElementById('terminal-input-field') as HTMLInputElement)
    input.value = ""
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

  inputAction(e) {
    let input = (e.target as HTMLInputElement)
    let value = input.value

    this.setState({
      entry: value
    })

    input.value = value
  }

  setValue(value) {
    let input = (document.getElementById('terminal-input-field') as HTMLInputElement)

    input.focus()
    input.value = ""

    setTimeout(() => {
      input.value = value
    }, 1)
  }

  render() {
    return (
      <Pane display="flex" flex={1} width="100%" padding={8} border>
        <Pane display="flex" width="100%" flex={1} marginRight={8}>
          <input 
            type="text" 
            placeholder="Enter command..." 
            name="cmd"
            id="terminal-input-field" 
            onChange={this.inputAction}
          />
        </Pane>
      </Pane>
    )
  }
}
