//
//  show.tsx
//  ancilla
// 
//  Created by Wess Cope (wess@frenzylabs.com) on 12/12/19
//  Copyright 2019 FrenzyLabs, LLC.
//

import React      from 'react'
import {connect}  from 'react-redux'

import {
  Pane,
  TextInput
} from 'evergreen-ui'

import PubSub from 'pubsub-js'

import Statusbar      from '../statusbar'
import ServiceActions from '../../../store/actions/services'
import CameraHandler  from '../../../network/camera'

export default class ShowView extends React.Component<{node: object, service: object}> {
  constructor(props:any) {
    super(props)

    
    this.state = {
      connected: false,
      serviceState: {},
      recordSettings: {
        videoSettings: {
          fps: 10
        },
        timelapse: 2
      }
    }

    this.receiveRequest  = this.receiveRequest.bind(this)
    this.receiveEvent    = this.receiveEvent.bind(this)
    this.setupCamera    = this.setupCamera.bind(this)
    this.toggleRecording = this.toggleRecording.bind(this)

    this.setupCamera()
    
  }

  setupCamera() {
    if (this.props.service) {
      this.props.dispatch(ServiceActions.getState(this.props.service))
      PubSub.publishSync(this.props.node.name + ".request", [this.props.service.name, "SUB", "events.camera.connection"])
      PubSub.publishSync(this.props.node.name + ".request", [this.props.service.name, "SUB", "events.camera.recording"])

      // PubSub.publishSync(this.props.node.name + ".request", [this.props.camera.name, "REQUEST.get_state"])
      // console.log("Has printer")
      this.requestTopic = `${this.props.node.name}.${this.props.service.name}.request`
      this.eventTopic = `${this.props.node.name}.${this.props.service.name}.events`
      if (this.pubsubRequestToken) {
        PubSub.unsubscribe(this.pubsubRequestToken)
      }
      if (this.pubsubToken) {
        PubSub.unsubscribe(this.pubsubToken)
      }
      this.pubsubRequestToken = PubSub.subscribe(this.requestTopic, this.receiveRequest);
      this.pubsubToken = PubSub.subscribe(this.eventTopic, this.receiveEvent);
    }
  }

  receiveRequest(msg, data) {
    // console.log("PV Received Data here1", msg)    
    // console.log("PV Received Data here2", data)
    // console.log(typeof(data))
    if(!data)
      return
    if (data["action"] == "get_state") {
      // console.log("get STATE", data)
      this.setState({serviceState: data["resp"]})
    }
    if (data["action"] == "start_recording") {
      // console.log("get STATE", data)
      this.setState({...this.state, serviceState: {...this.state.serviceState, recording: true}})
    } else if (data["action"] == "stop_recording") {
      // console.log("get STATE", data)
      this.setState({...this.state, serviceState: {...this.state.serviceState, recording: false}})
    }
  }

  receiveEvent(msg, data) {
    // console.log("PV Received Event here1", msg)    
    // console.log("PV Received Event here2", data)
    // console.log(typeof(data))
    var [to, kind] = msg.split("events.")
    // console.log("EVENT KIND", kind)
    switch(kind) {
      case 'camera.recording.started':
          console.log("Camera Recording started", data)
          this.props.dispatch(ServiceActions.updateState(this.props.service, {...this.props.service.state, recording: true}))
          break
      case 'camera.recording.changed':
          console.log("Camera Recording STate", data)
          this.props.dispatch(ServiceActions.updateState(this.props.service, {...this.props.service.state, recording: true}))
          break
      case 'camera.connection.closed':
          this.props.dispatch(ServiceActions.updateState(this.props.service, {...this.props.service.state, open: false}))
          // this.setState({...this.state, serviceState: {...this.state.serviceState, open: false}})
          break
      case 'camera.connection.opened':
          this.props.dispatch(ServiceActions.updateState(this.props.service, {...this.props.service.state, open: true}))
          // this.setState({...this.state, serviceState: {...this.state.serviceState, open: true}})
          break      
      default:
        break
    }    
  }

    
  componentWillUnmount() {
    if (this.pubsubToken)
      PubSub.unsubscribe(this.pubsubToken)
    if (this.pubsubRequestToken)
      PubSub.unsubscribe(this.pubsubRequestToken)
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.service.model != this.props.service.model) {
      // console.log("PRINTER MODEL HAS BEEN UPDATED")
      this.setupCamera()      
    }
  }

  // componentDidUpdate(prevProps, prevState) {
  //   if (prevProps.printer != this.props.printer) {
  //     this.setupPrinter()
  //   }
  // }
  toggleRecording() {
    if (this.props.service.state.recording) {
      PubSub.publishSync(this.props.node.name + ".request", [this.props.service.name, "REQUEST.stop_recording", this.state.recordSettings])
    } else {
      PubSub.publishSync(this.props.node.name + ".request", [this.props.service.name, "REQUEST.start_recording", this.state.recordSettings])
    }
  }

  renderDisplay() {
      if (this.props.service.state.open) {
        let url = this.props.node.apiUrl
        return (
          <Pane display="flex">
            <Pane display="flex" width="100%">              
              <img src={`${url}/webcam/${this.props.service.name}`} />
            </Pane>
            <Pane display="flex" width="100%">
              <button onClick={this.toggleRecording}>{this.props.service.state.recording ? "Stop Recording" : "Record"}</button>
              <TextInput 
                name="timelapse" 
                placeholder="Timelapse in seconds" 
                marginBottom={4}
                width="100%" 
                height={48}
                onChange={e => 
                  this.setState({
                    recordSettings: {...this.state.recordSettings, timelapse: e.target.value}
                  })
                }
              />
              <TextInput 
                name="fps" 
                placeholder="Frames Per Second" 
                marginBottom={4}
                width="100%" 
                height={48}
                onChange={e => 
                  this.setState({recordSettings: {...this.state.recordSettings, 
                    videoSettings: {...this.state.recordSettings.videoSettings, fps: e.target.value}
                  }})
                }
              />
            </Pane>
          </Pane>
        )
      }

  }

  render() {
    // const Component = this.props.component;    
    return (
      <div id="" className="has-navbar-fixed-top" style={{height: '100vh', flex: '1'}}>
          {this.renderDisplay()}
      </div>
    );
 }
}
