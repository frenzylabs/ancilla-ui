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

export default class Body extends React.Component {
  lastLine?:any

  constructor(props:any) {
    super(props)

    this.renderLine   = this.renderLine.bind(this)
    this.renderLines  = this.renderLines.bind(this)
  }

  componentDidMount() {
    this.scrollToBottom()
  }

  componentDidUpdate() {
    this.scrollToBottom()
  }

  scrollToBottom() {
    document.getElementById('terminal-body-last-line').scrollIntoView({behavior: 'smooth'})
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
    return [
      "one", "two", "three", "four", "five",
      "one", "two", "three", "four", "five",
      "one", "two", "three", "four", "five",
      "one", "two", "three", "four", "five",
      "one", "two", "three", "four", "five",
    ].map((item, index) => {
      return this.renderLine(item, index)
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
