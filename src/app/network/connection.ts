//
//  websocket.ts
//  ancilla
// 
//  Created by Kevin Musselman (kmussel@gmail.com) on 11/09/19
//  Copyright 2019 Frenzylabs, LLC
//

import Node from '../models/node'

import PubSub from 'pubsub-js'



export default class Connection {
  buffer    = []
  sent      = []
  connected = false
  socket = null
  node: Node
  retryConnect: Boolean = true
  
  constructor(props) {
    this.node = props.node
    // this.name     = props.name
    // this.host     = 'localhost'
    // this.port     = 5000
    // this.path     = props.path
    // this.baudrate = props.baudrate
    this.retryConnect = true
    this.connect      = this.connect.bind(this)
    this.send         = this.send.bind(this)
    this.onConnect    = this.onConnect.bind(this)
    this.onDisconnect = this.onDisconnect.bind(this)
    this.onError      = this.onError.bind(this)
    this.onMessage    = this.onMessage.bind(this)
    this.connect()
    
    
  }


// add the function to the list of subscribers for a particular topic
// we're keeping the returned token, in order to be able to unsubscribe
// from the topic later on




  isConnected() {
    return this.socket.readyState == this.socket.OPEN
  }
  
  connect() {
    this.retryConnect = true
    if(this.socket && this.socket.readyState === this.socket.OPEN) { return }
    console.log(`ws://${this.node.hostname}:${this.node.port}/node/`)
    this.socket = new WebSocket(`ws://${this.node.hostname}:${this.node.port}/node`)
    // this.socket.binaryType = 'arraybuffer';

    this.socket.onopen = (e) => {
      console.log("ON OPEN")
      this.onConnect(e)
    }

    this.socket.onclose = (e) => {
      console.log("ON CLOSE")
      this.onDisconnect(e)
    }


    this.socket.onerror = (err) => {
      console.log("ON Error")
      this.onError(err)
    }
    
    this.socket.onmessage = (e) => {
      // console.log("ON Message", e)

      this.onMessage(e)
    }
  }

  disconnect() {
    this.retryConnect = false
    this.socket.send(JSON.stringify({
      action: 'disconnect'
    }))

    this.socket.close()
  }

  send(message) {
    this.socket.send(message)
  }

  onConnect(event) {
    this.connected = true

    // msg = ["", "connect"]
    // let message = JSON.stringify({
    //   action:   'connect',
    //   port:     this.path,
    //   baudrate: this.baudrate
    // })

    // this.send(message)
  }

  onDisconnect(event) {
    this.connected = false
    if (this.retryConnect) {
      setTimeout(this.connect.bind(this), 5000)
    }
    console.log("Disconnect: ", event)
  }

  onError(error) {
    console.log("Error: ", error)
  }


  onMessage(event) {
    // console.log("ON MESSAG", event.data)
    try {
      let msg = JSON.parse(event.data)
      // console.log("msg parse", msg)
      let topic = msg[0]
      let payload = msg[1]
      // let payload = JSON.parse(msg[1])
      // console.log("pyalod parse = ", payload)
      PubSub.publish(this.node.name + "." + topic, payload)
    } catch (error) {
      console.log("ERROR", error)
    }
    
    if(this.onMessageHandler) {
      this.onMessageHandler(event.data)
    }
  }
}
