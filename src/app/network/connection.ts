//
//  websocket.ts
//  ancilla
// 
//  Created by Kevin Musselman (kmussel@gmail.com) on 11/09/19
//  Copyright 2019 Frenzylabs, LLC
//

import Node from '../models/node'

import PubSub from 'pubsub-js'

import { NodeState } from '../store/state'

export default class Connection {
  buffer    = []
  sent      = []
  connected = false
  socket = null
  node: NodeState
  retryConnect: Boolean = true
  onMessageHandler = null
  
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
    console.log(`ws://${this.node.hostname}:${this.node.port}/ws`)
    this.socket = new WebSocket(`ws://${this.node.hostname}:${this.node.port}/ws`)
    // this.socket.binaryType = 'arraybuffer';

    this.socket.onopen = (e) => {
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
    console.log("WS Connected")
    this.connected = true

    PubSub.publish(this.node.uuid + ".notifications.connected", {})
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
    try {
      let msg = JSON.parse(event.data)
      let topic = msg[0]
      // console.log("TOPIC: ", topic)
      let payload = msg[1]
      // PubSub.publish(this.node.name + "." + topic, payload)
      PubSub.publish(topic, payload)
    } catch (error) {
      console.log("ERROR", error)
    }
    
    if(this.onMessageHandler) {
      this.onMessageHandler(event.data)
    }
  }
}
