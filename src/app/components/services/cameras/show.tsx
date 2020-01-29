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
  Button,
  Paragraph,
  Icon,
  IconButton,
  Heading,
  Text,
  Strong,
  toaster,
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

import { HtmlPreview } from '../../utils/iframe'

import { NodeState, ServiceState }  from '../../../store/state'


type Props = {
  node: NodeState, 
  service: ServiceState,
  deleteService: Function,
  cameraUpdated: Function,
  dispatch: Function,
  getState: Function,
  updateState: Function
}

type StateProps = {
  recordSettings: object,
  videoUrl: any
}

export class CameraView extends React.Component<Props, StateProps> {
  videoRef = null
  requestTopic = ''
  eventTopic = ''
  pubsubRequestToken = null
  pubsubToken        = null


  constructor(props:any) {
    super(props)

    
    this.state = {
      videoUrl: null,
      recordSettings: {
        videoSettings: {
          fps: 10
        },
        timelapse: 2
      }
    }

    this.receiveRequest       = this.receiveRequest.bind(this)
    this.receiveEvent         = this.receiveEvent.bind(this)
    this.setupCamera          = this.setupCamera.bind(this)
    this.toggleRecording      = this.toggleRecording.bind(this)
    this.setVideoUrl          = this.setVideoUrl.bind(this)
    this.renderConnectButton  = this.renderConnectButton.bind(this)
    this.renderRecordButton   = this.renderRecordButton.bind(this)
    this.renderSubStatusbar   = this.renderSubStatusbar.bind(this)
    this.renderRecordSection  = this.renderRecordSection.bind(this)
  }

  componentDidMount() {
    // this.setupCamera()
    this.setVideoUrl()
    this.setupCamera()
  }

  componentWillUnmount() {
    // setTimeout(function() {
    //   console.log("video src", vidsrc.src)
    //   vidsrc.src = ""
    // }), 0);
    // setTimeout(function() {
    //       React.unmountAtNode(this.videoRef)
    // }), 0);
    this.setState({videoUrl: ''})
    // PubSub.publishSync(this.props.node.name + ".request", [this.props.service.name, "UNSUB", "events.camera.connection"])
    // PubSub.publishSync(this.props.node.name + ".request", [this.props.service.name, "UNSUB", "events.camera.recording"])
    if (this.pubsubToken) 
      PubSub.unsubscribe(this.pubsubToken)
    if (this.pubsubRequestToken)
      PubSub.unsubscribe(this.pubsubRequestToken)
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.service.state != this.props.service.state) {
      this.setVideoUrl()
    }
    if (prevProps.service.model != this.props.service.model) {
      console.log("Camera MODEL HAS BEEN UPDATED")
      this.setupCamera()
      this.setVideoUrl()
    }
    if (prevProps.node.name != this.props.node.name) {
      this.setupSubscription()
    }
  }

  setVideoUrl() {
    var videoUrl = ''
    console.log(this.props.service)
    if (this.props.service && this.props.service.state["connected"]) {
      let url = this.props.node.apiUrl
      videoUrl = `${url}/webcam/${this.props.service.name}`
    }
    console.log("Video URL", videoUrl)
    if (this.state.videoUrl != videoUrl)
      this.setState({videoUrl: videoUrl})
  }

  setupCamera() {
    if (this.props.service) {
      this.props.getState(this.props.node, this.props.service)
      PubSub.make_request(this.props.node, [this.props.service.name, "SUB", "events.camera.connection"])
      PubSub.make_request(this.props.node, [this.props.service.name, "SUB", "events.camera.recording"])

      this.setupSubscription()
      this.setVideoUrl()
    }
  }

  setupSubscription() {
    this.requestTopic = `${this.props.node.name}.${this.props.service.name}.request`
    this.eventTopic = `${this.props.node.name}.${this.props.service.name}.events`
    // console.log("Cam SHOW EVENT TOPIC = ", this.eventTopic)
    if (this.pubsubRequestToken) {
      PubSub.unsubscribe(this.pubsubRequestToken)
    }
    if (this.pubsubToken) {
      PubSub.unsubscribe(this.pubsubToken)
    }
    this.pubsubRequestToken = PubSub.subscribe(this.requestTopic, this.receiveRequest);
    this.pubsubToken = PubSub.subscribe(this.eventTopic, this.receiveEvent);
  }

  receiveRequest(msg, data) {
    // console.log("PV Received Data here1", msg)    
    // console.log("PV Received Data here2", data)
    // console.log(typeof(data))
    // if(!data)
    //   return
    // if (data["action"] == "get_state") {
    //   // console.log("get STATE", data)
    //   this.setState({serviceState: data["resp"]})
    // }
    // if (data["action"] == "start_recording") {
    //   // console.log("get STATE", data)
    //   this.setState({...this.state, serviceState: {...this.state.serviceState, recording: true}})
    // } else if (data["action"] == "stop_recording") {
    //   // console.log("get STATE", data)
    //   this.setState({...this.state, serviceState: {...this.state.serviceState, recording: false}})
    // }
  }

  receiveEvent(msg, data) {
    // console.log("PV Received Event here1", msg)    
    // console.log("PV Received Event here2", data)
    // console.log(typeof(data))
    var [to, kind] = msg.split("events.")
    // console.log("EVENT KIND", kind, data)
    switch(kind) {
      case 'camera.recording.state.changed':
          // console.log("Camera Recording state changed", data)
          // if (data.status != "recording")
          this.props.updateState(this.props.node, this.props.service, {...this.props.service.state, recording: data.status == "recording"})
          // this.props.dispatch(ServiceActions.updateState(this.props.service, {...this.props.service.state, recording: data.status == "recording"}))
          break
      case 'camera.recording.started':
          this.props.updateState(this.props.node, this.props.service, {...this.props.service.state, recording: true})
          // this.props.dispatch(ServiceActions.updateState(this.props.service, {...this.props.service.state, recording: true}))
          break
      case 'camera.recording.changed':
          // this.props.updateState(this.props.node, this.props.service, {...this.props.service.state, recording: true})
          // this.props.dispatch(ServiceActions.updateState(this.props.service, {...this.props.service.state, recording: true}))
          break
      case 'camera.connection.closed':
          this.props.updateState(this.props.node, this.props.service, {...this.props.service.state, connected: false})
          // this.props.dispatch(ServiceActions.updateState(this.props.service, {...this.props.service.state, connected: false}))
          // this.setState({...this.state, serviceState: {...this.state.serviceState, open: false}})
          break
      case 'camera.connection.opened':
          this.props.updateState(this.props.node, this.props.service, {...this.props.service.state, connected: true})
          // this.props.dispatch(ServiceActions.updateState(this.props.service, {...this.props.service.state, connected: true}))          
          break      
      default:
        break
    }    
  }

    

  toggleRecording() {
    if (this.props.service.state["recording"]) {
      PubSub.make_request(this.props.node, [this.props.service.name, "REQUEST.stop_recording", {"settings": this.state.recordSettings}])
    } else {
      PubSub.make_request(this.props.node, [this.props.service.name, "REQUEST.start_recording", {"settings": this.state.recordSettings}])
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
    if (this.props.service.state["connected"]) {
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
    if (this.props.service.state["connected"]) {
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

  renderConnectButton() {
    return (
      <IconButton 
        marginLeft={10}
        icon="power"
        appearance="minimal"
        intent={this.props.service.state["connected"] ?  'success' : 'danger'}
        onClick={() => { this.power() }}
      />
    )
  }

  renderRecordButton() {
    return (
      <IconButton 
        icon="mobile-video" 
        // disabled={!this.props.service.state["connected"]}
        intent={this.props.service.state["recording"] ? "danger" : "success"}
        onClick={this.toggleRecording}
      />
    )
  }


  renderState() {
    return (
      <Pane>
        <div className="card-header">
          hi
        </div>

        <div className="card-content">
          <Pane display="flex" flex={1} alignItems="center">
            <Pane display="flex" flex={1} flexDirection="row">
              <Pane>
                Recording
               </Pane>
            </Pane>

            <Pane display="flex">

            </Pane>
          </Pane>
          
          <br/>
          <Paragraph>{JSON.stringify(this.props.service.state)}</Paragraph>
        </div>
      </Pane>
    )
  }

  renderRecordSection() {
    return (
      <Pane display="flex" flexDirection="column" background="white" border>
        <Pane display="flex" padding={10} background="#f7f7f7" borderBottom>
          <Pane display="flex" flex={1} alignItems="center">
            <Pane display="flex" flex={1}>
              <Heading>
                {this.props.service.state["recording"] ? "Recording" : "Record"}
              </Heading>
            </Pane>
            <Pane display="flex">
              {this.renderRecordButton()}
            </Pane>
          </Pane>
        </Pane>

        <Pane padding={20}>
          {this.renderTimeLapse()}
        </Pane>
      </Pane>
    )
  }

  renderVideo() {
    if (this.props.service.state["connected"]) {
      // let url = this.props.node.apiUrl
      // let url = this.props.node.apiUrl
      // var videoUrl = `${url}/webcam/${this.props.service.name}`
      return (
        // <HtmlPreview src={`${this.state.videoUrl}`} body={`<body><img width="640" src="${this.state.videoUrl}" /></body>`}></HtmlPreview>
        // <img width={640} ref={fp => this.videoRef = fp} src={`${videoUrl}`} />
        <iframe key={this.state.videoUrl} id="image" width={640} style={{minHeight: "480px", border: '1px solid #c0c0c0'}} height={"100%"} ref={fp => this.videoRef = fp} src={`${this.state.videoUrl}`}  seamless={false} >
          <p>Your browser does not support iframes.</p>          
        </iframe>
      )
    }
    return ( 
        <Pane display="flex" width={640} height={480}  padding={20} justifyContent="center" alignItems="center"> 
            <Icon icon="mobile-video" size={40} color="#c0c0c0" />
        </Pane>
    )
  }

  renderTimeLapse() {
    return (
        <React.Fragment>
          <TextInput 
            name="timelapse" 
            placeholder={`Timelapse in seconds (default: ${this.state.recordSettings.timelapse})`}
            marginBottom={10}
            width="100%" 
            height={48}
            disabled={this.props.service.state["recording"]}
            onChange={e => 
              this.setState({
                recordSettings: {...this.state.recordSettings, timelapse: e.target.value}
              })
            }
          />

          <TextInput 
            name="fps" 
            placeholder={`Frames Per Second (default: ${this.state.recordSettings.videoSettings.fps}) `}
            marginBottom={20}
            width="100%" 
            height={48}
            disabled={this.props.service.state["recording"]}
            onChange={e => 
              this.setState({recordSettings: {...this.state.recordSettings, 
                videoSettings: {...this.state.recordSettings["videoSettings"], fps: e.target.value}
              }})
          }
          />

          <Pane display="flex" flex={1} flexDirection="row" alignItems="center">
            <Pane display="flex" flex={1}>
              <Button 
                iconBefore="mobile-video" 
                marginRight={12}
                intent={this.props.service.state["recording"] ? "danger" : "success"}
                disabled={!this.props.service.state["connected"]}
                onClick={this.toggleRecording}    
                >
                {this.props.service.state["recording"] ? "Stop" : "Start"} Recording
              </Button>
            </Pane>

            <Pane display="flex">
              <Link to={`/cameras/${this.props.service.id}/recordings`} style={{textDecoration: 'none'}}>
                <Text>View recording history</Text>
              </Link>
            </Pane>
          </Pane>
      </React.Fragment>
    )
  }

  renderRecording() {
    return (
      <React.Fragment>
        <Button onClick={this.toggleRecording}>{this.props.service.state["recording"] ? "Stop Recording" : "Record"}</Button>
        <Pane>
          <Link to={`/cameras/${this.props.service.id}/recordings`}>List Recordings</Link>
        </Pane>
      </React.Fragment>
    )
  }

  renderSubStatusbar() {
    return (
      <Pane display="flex" background="white" padding={10} border>
        <Pane display="flex" alignItems="center">
          <Icon icon="dot" color={this.props.service.state["connected"] ? "green" : "red"} />
        </Pane>
        <Pane display="flex" flex={1} alignItems="center">
          <Text color="#b0b0b0" marginRight={6}>Camera:</Text> <Strong color="#080808" weight="bold">{this.props.service.name}</Strong>
        </Pane>
        <Pane>
          {this.renderConnectButton()}
        </Pane>
      </Pane>
    )
  }

  render() {
    
      // if (this.props.service.state.connected) {
        
        return (
          <Pane display="flex" flex={1} width="100%" padding={10}>
            <Pane display="flex" padding={20} background="white" border justifyContent="center">
              {this.renderVideo()}
            </Pane>
            <Pane display="flex" flex={1} padding={20} paddingTop={0} paddingRight={0} flexDirection="column" width="100%">
              {this.renderSubStatusbar()}

              <br/>

              {this.renderRecordSection()}
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
    getState: (node, service) => dispatch(ServiceActions.getState(node, service)),
    updateState: (node, service, state) => dispatch(ServiceActions.updateState(node, service, state))
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(CameraView)
