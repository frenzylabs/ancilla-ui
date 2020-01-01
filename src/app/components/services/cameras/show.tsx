//
//  index.tsx
//  ancilla
// 
//  Created by Wess Cope (wess@frenzylabs.com) on 12/12/19
//  Copyright 2019 FrenzyLabs, LLC.
//

import React      from 'react'
import {connect}  from 'react-redux'
import { Link } from 'react-router-dom'

import {
  Switch,
  Route,
} from 'react-router-dom'

import {
  Pane,
  TextInput,
  Label,
  Button,
  Paragraph,
  toaster
} from 'evergreen-ui'

import PubSub from 'pubsub-js'

import Statusbar      from '../statusbar'
import ShowView       from './show'
import CameraForm     from './form'
import Settings       from '../../settings'
import ServiceActions from '../../../store/actions/services'
import CameraHandler  from '../../../network/camera'
import ErrorModal     from '../../modal/error'
import NodeAction  from '../../../store/actions/node'
import ServiceAction  from '../../../store/actions/services'

import { NodeState }  from '../../../store/reducers/state'
import { ServiceState }  from '../../../store/reducers/service'

type Props = {
  node: NodeState, 
  service: ServiceState,
  deleteService: Function,
  cameraUpdated: Function,
  dispatch: Function
}

export class CameraView extends React.Component<Props> {
  videoRef = null
  constructor(props:any) {
    super(props)

    
    this.state = {
      connected: false,
      videoUrl: null,
      serviceState: {},
      recordSettings: {
        videoSettings: {
          fps: 10
        },
        timelapse: 2
      }
    }

    this.receiveRequest   = this.receiveRequest.bind(this)
    this.receiveEvent     = this.receiveEvent.bind(this)
    this.setupCamera      = this.setupCamera.bind(this)
    this.toggleRecording  = this.toggleRecording.bind(this)
    this.setVideoUrl      = this.setVideoUrl.bind(this)

    this.setupCamera()
    
    window.React = React
    window.c = this
  }

  componentDidMount() {
    // this.setupCamera()
    // this.setVideoUrl()
  }

  componentWillUnmount() {
    console.log("COMPONENT WILL UNMOUNT")
    var vidsrc = this.videoRef
    
    console.log("video src before", vidsrc)
    // setTimeout(function() {
    //   console.log("video src", vidsrc.src)
    //   vidsrc.src = ""
    // }), 0);
    // setTimeout(function() {
    //       React.unmountAtNode(this.videoRef)
    // }), 0);
    // this.setState({videoUrl: ''})
    // PubSub.publishSync(this.props.node.name + ".request", [this.props.service.name, "UNSUB", "events.camera.connection"])
    PubSub.publishSync(this.props.node.name + ".request", [this.props.service.name, "UNSUB", "events.camera.recording"])
    if (this.pubsubToken) 
      PubSub.unsubscribe(this.pubsubToken)
    if (this.pubsubRequestToken)
      PubSub.unsubscribe(this.pubsubRequestToken)
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.service.model != this.props.service.model) {
      console.log("PRINTER MODEL HAS BEEN UPDATED")
      this.setupCamera()      
    }
    // if (this.props.service && this.props.service.state)
    // this.setVideoUrl()
    
  }

  setVideoUrl() {
    var videoUrl = ''
    if (this.props.service && this.props.service.state.connected) {
      let url = this.props.node.apiUrl
      videoUrl = `${url}/webcam/${this.props.service.name}`
    }
    console.log("Video URL", videoUrl)
    // if (this.state.videoUrl != videoUrl)
    //   this.setState({videoUrl: videoUrl})
  }

  setupCamera() {
    if (this.props.service) {
      console.log("SETUP CAMERA")
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
      case 'camera.recording.state.changed':
          // console.log("Camera Recording state changed", data)
          // if (data.status != "recording")
          this.props.dispatch(ServiceActions.updateState(this.props.service, {...this.props.service.state, recording: data.status == "recording"}))
          break
      case 'camera.recording.started':
          console.log("Camera Recording started", data)
          this.props.dispatch(ServiceActions.updateState(this.props.service, {...this.props.service.state, recording: true}))
          break
      case 'camera.recording.changed':
          console.log("Camera Recording STate", data)
          this.props.dispatch(ServiceActions.updateState(this.props.service, {...this.props.service.state, recording: true}))
          break
      case 'camera.connection.closed':
          this.props.dispatch(ServiceActions.updateState(this.props.service, {...this.props.service.state, connected: false}))
          // this.setState({...this.state, serviceState: {...this.state.serviceState, open: false}})
          break
      case 'camera.connection.opened':
          this.props.dispatch(ServiceActions.updateState(this.props.service, {...this.props.service.state, connected: true}))
          // this.setState({...this.state, serviceState: {...this.state.serviceState, open: true}})
          break      
      default:
        break
    }    
  }

    

  toggleRecording() {
    if (this.props.service.state.recording) {
      PubSub.publishSync(this.props.node.name + ".request", [this.props.service.name, "REQUEST.stop_recording", {"settings": this.state.recordSettings}])
    } else {
      PubSub.publishSync(this.props.node.name + ".request", [this.props.service.name, "REQUEST.start_recording", {"settings": this.state.recordSettings}])
    }
  }

  cameraSaved(resp) {
    // console.log("printer saved", resp)
    this.props.cameraUpdated(this.props.node, resp.data.service_model)
  }

  saveFailed(error) {
    toaster.danger(<ErrorModal requestError={error} />)
  }

  getColorState() {
    if (this.props.service.state.connected) {
      return 'success'
    } else {
      return 'danger'
    }
  }

  deleteCamera() {
    this.props.deleteService(this.props.node, this.props.service)
    .catch((error) => {
      toaster.danger(<ErrorModal requestError={error} />)
    })
  }

  deleteComponent() {
    return (
      <Pane display="flex" borderTop paddingTop={20}>
        <Pane display="flex" flex={1} padding={20} marginBottom={20} className="danger-zone" alignItems="center" flexDirection="row">
          <Pane>
            <Button appearance="primary" intent="danger" height={40} onClick={() => this.deleteCamera()}> Delete </Button>
          </Pane>
        </Pane>
      </Pane>
    )
  }

  power(){
    if (this.props.service.state.connected) {
      CameraHandler.disconnect(this.props.node, this.props.service)
      .then((response) => {
        console.log("disconnected", response)
      }).catch((error) => {
        console.log(error)
        toaster.danger(<ErrorModal requestError={error} />)
      })
    } else {
      CameraHandler.connect(this.props.node, this.props.service)
      .then((response) => {
        toaster.success(`Connected to ${this.props.service.name}`)
      })
      .catch((error) => {
        console.log(error)
        toaster.danger(<ErrorModal requestError={error} />)
      })
    }
  }

  renderState() {
    return (
      <Pane className={`card package`}>
        <div className="card-header">
          <p className="card-header-title">
            State
          </p>
        </div>

        <div className="card-content">
          <Button onClick={() => { this.power() }}>{this.props.service.state.connected ?  'Disconnect' : 'Connect Camera'}</Button>
          <br/>
          <Paragraph>{JSON.stringify(this.props.service.state)}</Paragraph>
        </div>
      </Pane>
    )
  }

  renderVideo() {
    if (this.props.service.state.connected) {
      // let url = this.props.node.apiUrl
      let url = this.props.node.apiUrl
      var videoUrl = `${url}/webcam/${this.props.service.name}`
      return (
        // <img width={640} ref={fp => this.videoRef = fp} src={`${this.state.videoUrl}`} />
        <iframe id="image" width={640} style={{minHeight: "480px", border: 0, marginBottom: '20px'}} height={"100%"} ref={fp => this.videoRef = fp} src={`${videoUrl}`}  seamless={false} >
          <p>Your browser does not support iframes.</p>          
        </iframe>
        
      )
      // <img width={640} ref={fp => this.videoRef = fp} src={`${videoUrl}`} />
    }
    return ( 
        <Pane display="flex" width={640}  padding={20}> 
            <Button onClick={() => { this.power() }}>Turn On Camera</Button>              
        </Pane>
    )
  }

  render() {
    
      // if (this.props.service.state.connected) {
        
        return (
          <Pane display="flex" flex={1} width="100%" padding={10}>
            <Pane display="flex" >   
              {this.renderVideo()}                         
            </Pane>
            <Pane display="flex" flex={1} padding={10} flexDirection="column" width="100%">
              {this.renderState()}
              <Label
                htmlFor="timelapse"
                marginBottom={4}
                display="block"
              >
                Timelapse
              </Label>
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
              <Label
                htmlFor="fps"
                marginBottom={4}
                display="block"
              >
                Frames Per Second
              </Label>
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
              <Button onClick={this.toggleRecording}>{this.props.service.state.recording ? "Stop Recording" : "Record"}</Button>
              <Pane>
                <Link to={`/cameras/${this.props.service.id}/recordings`}>List Recordings</Link>
              </Pane>
            </Pane>
          </Pane>
        )
      
      // return null

  }

}




const mapStateToProps = (state) => {
  // return state
  return {
    // printers: state.activeNode.printers
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    deleteService: (node, service) => dispatch(ServiceAction.deleteService(node, service)),
    cameraUpdated: (node, service) => dispatch(NodeAction.cameraUpdated(node, service)),
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(CameraView)