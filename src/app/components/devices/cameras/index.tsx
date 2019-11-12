import {connect}  from 'react-redux'

import {
  Switch,
  Route,
  withRouter,
  matchPath
} from 'react-router-dom'

import SplitPane from 'react-split-pane'

import {
  Pane
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
      deviceState: {}
    }

    this.receiveRequest  = this.receiveRequest.bind(this)
    this.receiveEvent    = this.receiveEvent.bind(this)
    this.setupCamera    = this.setupCamera.bind(this)

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
  }

  receiveEvent(msg, data) {
    // console.log("PV Received Event here1", msg)    
    // console.log("PV Received Event here2", data)
    // console.log(typeof(data))
    var [to, kind] = msg.split("events.")
    // console.log("EVENT KIND", kind)
    switch(kind) {
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

  renderDisplay() {
      if (this.state.deviceState.open) {
        let url = this.props.node.apiUrl
        return (
          <Pane display="flex">
            <Pane display="flex" width="100%">
              <img src={`${url}/webcam/${this.props.camera.name}`} />
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