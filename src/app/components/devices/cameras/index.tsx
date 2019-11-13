import {connect}  from 'react-redux'

import {
  Switch,
  Route,
  withRouter,
  matchPath
} from 'react-router-dom'

import SplitPane from 'react-split-pane'

import {
  Pane,
  TextInput
} from 'evergreen-ui'

import React  from 'react'
// import {
//   Nav,
//   SubNav,
//   Statusbar,
//   Summary
// } from '../../'
import Statusbar from './statusbar/index'

import PubSub from 'pubsub-js'

export default class CameraView extends React.Component {
  constructor(props:any) {
    super(props)

    
    this.state = {
      connected: false,
      deviceState: {},
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
    if (this.props.camera) {
      PubSub.publishSync(this.props.node.name + ".request", [this.props.camera.name, "SUB", "events.connection"])
      PubSub.publishSync(this.props.node.name + ".request", [this.props.camera.name, "REQUEST.get_state"])
      // console.log("Has printer")
      this.requestTopic = `${this.props.node.name}.${this.props.camera.name}.request`
      this.eventTopic = `${this.props.node.name}.${this.props.camera.name}.events`
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
      this.setState({deviceState: data["resp"]})
    }
    if (data["action"] == "start_recording") {
      // console.log("get STATE", data)
      this.setState({...this.state, deviceState: {...this.state.deviceState, recording: true}})
    } else if (data["action"] == "stop_recording") {
      // console.log("get STATE", data)
      this.setState({...this.state, deviceState: {...this.state.deviceState, recording: false}})
    }
  }

  receiveEvent(msg, data) {
    // console.log("PV Received Event here1", msg)    
    // console.log("PV Received Event here2", data)
    // console.log(typeof(data))
    var [to, kind] = msg.split("events.")
    // console.log("EVENT KIND", kind)
    switch(kind) {
      case 'camera_recording.state':
          console.log("Camera Recording STate", data)
          // this.setState({...this.state, deviceState: {...this.state.deviceState, open: false}})
          break
      case 'connection.closed':
          this.setState({...this.state, deviceState: {...this.state.deviceState, open: false}})
          break
      case 'connection.opened':
          this.setState({...this.state, deviceState: {...this.state.deviceState, open: true}})
          break
      case 'print.started':
          this.setState({...this.state, deviceState: {...this.state.deviceState, printing: true}})
          break
      case 'print.cancelled':
          this.setState({...this.state, deviceState: {...this.state.deviceState, printing: false}})
          break
      case 'print.failed':
          this.setState({...this.state, deviceState: {...this.state.deviceState, printing: false, status: "print_failed"}})
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

  // componentDidUpdate(prevProps, prevState) {
  //   if (prevProps.printer != this.props.printer) {
  //     this.setupPrinter()
  //   }
  // }
  toggleRecording() {
    if (this.state.deviceState.recording) {
      PubSub.publishSync(this.props.node.name + ".request", [this.props.camera.name, "REQUEST.stop_recording", this.state.recordSettings])
    } else {
      PubSub.publishSync(this.props.node.name + ".request", [this.props.camera.name, "REQUEST.start_recording", this.state.recordSettings])
    }
  }

  renderDisplay() {
      if (this.state.deviceState.open) {
        let url = this.props.node.apiUrl
        return (
          <Pane display="flex">
            <Pane display="flex" width="100%">              
              <img src={`${url}/webcam/${this.props.camera.name}`} />
            </Pane>
            <Pane display="flex" width="100%">
              <button onClick={this.toggleRecording}>{this.state.deviceState.recording ? "Stop Recording" : "Record"}</button>
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
          <Statusbar {...this.props} deviceState={this.state.deviceState}/>
          {this.renderDisplay()}
      </div>
    );
 }
}