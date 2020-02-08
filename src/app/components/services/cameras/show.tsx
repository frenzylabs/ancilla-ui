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
  Spinner,
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
import CameraHandler, { Camera }  from '../../../network/camera'
import { ServiceHandler } from '../../../network'
import ErrorModal     from '../../modal/error'
import NodeAction  from '../../../store/actions/node'
import ServiceAction  from '../../../store/actions/services'
import { CameraAction } from '../../../store/actions/cameras'

import { HtmlPreview } from '../../utils/iframe'

import { NodeState, ServiceState, CameraState }  from '../../../store/state'


type Props = {
  node: NodeState, 
  service: CameraState,
  deleteService: Function,
  cameraUpdated: Function,
  dispatch: Function,
  getState: Function,
  updateState: Function,
  updateCurrentRecording: Function
}

type StateProps = {
  recordSettings: any,
  videoUrl: any,
  togglingPower: boolean,
  togglingRecording: boolean
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
      togglingPower: false,
      togglingRecording: false,
      recordSettings: {
        // videoSettings: {
        //   fps: 10
        // },
        frames_per_second: 5,
        timelapse: 1
      }
    }

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
    this.getCameraRecordings()
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
      // console.log("Camera MODEL HAS BEEN UPDATED")
      this.setupCamera()
      this.setVideoUrl()
    }
    if (prevProps.node.name != this.props.node.name) {
      this.setupSubscription()
    }
  }

  getCameraRecordings() {
    var search = {'q': {
      'camera_id': this.props.service.model["model"]["id"],
      'status': 'recording'
    }}
    return CameraHandler.recordings(this.props.node, this.props.service, {qs: search})
    .then((res) => {
      this.props.updateCurrentRecording(this.props.node, this.props.service, res.data.data[0] || {})
    })
    .catch((error) => {
      console.log("error recordings", error)
    })
  }

  setVideoUrl() {
    var videoUrl = ''
    if (this.props.service && this.props.service.state["connected"]) {
      let url = this.props.node.apiUrl
      videoUrl = `${url}/webcam/${this.props.service.name}`
    }
    // console.log("Video URL", videoUrl)
    if (this.state.videoUrl != videoUrl)
      this.setState({videoUrl: videoUrl})
  }

  setupCamera() {
    if (this.props.service) {
      this.props.getState(this.props.node, this.props.service)
      PubSub.make_request(this.props.node, [this.props.service.name, "SUB", "events.camera.state.changed"])
      PubSub.make_request(this.props.node, [this.props.service.name, "SUB", "events.camera.connection"])
      PubSub.make_request(this.props.node, [this.props.service.name, "SUB", "events.camera.recording"])
      
      if (this.props.service.model.model)
        this.setState({recordSettings: {...(this.props.service.model.model.settings["record"] || {})}})
      this.setupSubscription()
      this.setVideoUrl()
    }
  }

  setupSubscription() {
    // this.requestTopic = `${this.props.node.name}.${this.props.service.name}.request`
    this.eventTopic = `${this.props.node.name}.${this.props.service.name}.events`
    // console.log("Cam SHOW EVENT TOPIC = ", this.eventTopic)
    // if (this.pubsubRequestToken) {
    //   PubSub.unsubscribe(this.pubsubRequestToken)
    // }
    if (this.pubsubToken) {
      PubSub.unsubscribe(this.pubsubToken)
    }
    this.pubsubToken = PubSub.subscribe(this.eventTopic, this.receiveEvent);
  }

  

  receiveEvent(msg, data) {
    // console.log("PV Received Event here1", msg)    
    // console.log("PV Received Event here2", data)
    var [to, kind] = msg.split("events.")
    // console.log("CAM SHOW EVENT KIND", kind)
    switch(kind) {
      case 'camera.state.changed':
        this.props.updateState(this.props.node, this.props.service, {...this.props.service.state, ...data})
        // this.props.dispatch(ServiceActions.updateState(this.props.service, {...this.props.service.state, connected: false}))
        // this.setState({...this.state, serviceState: {...this.state.serviceState, open: false}})
        break
      case 'camera.recording.state.changed':
          // console.log("Camera Recording state changed", data)
          // if (data.status != "recording")
          this.props.updateState(this.props.node, this.props.service, {...this.props.service.state, recording: data.status == "recording"})
          // this.props.dispatch(ServiceActions.updateState(this.props.service, {...this.props.service.state, recording: data.status == "recording"}))
          break
      case 'camera.recording.started':
          var rec = data["model"]
          this.props.service.state["recording"] = true
          this.props.updateCurrentRecording(this.props.node, this.props.service, rec)
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
    this.setState({togglingRecording: true})
    
    
    if (this.props.service.state["recording"]) {
      if (this.props.service.currentRecording && this.props.service.currentRecording.id) {
        CameraHandler.stopRecording(this.props.node, this.props.service, this.props.service.currentRecording.id)
        .then((res) => {
          // console.log("StopRecoding Resp", res)
          this.setState({togglingRecording: false})
        })
        .catch((error) => {
          this.setState({togglingRecording: false})
          // console.log("StopRecoding Error", error)
        })
      }
    } else {
      CameraHandler.startRecording(this.props.node, this.props.service, {"settings": this.state.recordSettings})
      .then((res) => {
        this.setState({togglingRecording: false})
        // console.log("StartRecoding Resp", res)
      })
      .catch((error) => {
        this.setState({togglingRecording: false})
        // console.log("StartRecoding Error", error)
      })
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
    this.props.updateState(this.props.node, this.props.service, {...this.props.service.state, togglingPower: true})
    if (this.props.service.state["connected"]) {
      CameraHandler.disconnect(this.props.node, this.props.service)
      .then((response) => {
        this.props.updateState(this.props.node, this.props.service, {...this.props.service.state, connected: false, togglingPower: false})
      }).catch((error) => {
        console.log(error)
        this.props.updateState(this.props.node, this.props.service, {...this.props.service.state, togglingPower: false})
        toaster.danger(<ErrorModal requestError={error} />)
      })
    } else {
      CameraHandler.connect(this.props.node, this.props.service)
      .then((response) => {
        this.props.updateState(this.props.node, this.props.service, {...this.props.service.state, connected: true, togglingPower: false})
        toaster.success(`Connected to ${this.props.service.name}`)
      })
      .catch((error) => {
        console.log(error)
        this.props.updateState(this.props.node, this.props.service, {...this.props.service.state, togglingPower: false})
        toaster.danger(<ErrorModal requestError={error} />)
      })
    }
  }


  renderConnectButton() {
    if (this.props.service.state["togglingPower"]) {
      return (<Button appearance="minimal" intent="none"><Spinner size={16}/></Button>)
    }
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
    if (this.state.togglingRecording) {
      return (<Button appearance="minimal" intent="none"><Spinner size={16}/></Button>)
    }
    return (
      <IconButton 
        icon="mobile-video" 
        disabled={!this.props.service.state["connected"]}
        intent={this.props.service.state["recording"] ? "danger" : "success"}
        onClick={this.toggleRecording}
      />
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
    var recbtn
    if (this.state.togglingRecording) {
       recbtn = (<Button appearance="minimal" intent="none"><Spinner size={16}/></Button>)
    } else {
      recbtn = (
              <Button 
                iconBefore="mobile-video" 
                marginRight={12}
                intent={this.props.service.state["recording"] ? "danger" : "success"}
                disabled={!this.props.service.state["connected"]}
                onClick={this.toggleRecording}    
                >
                {this.props.service.state["recording"] ? "Stop" : "Start"} Recording
              </Button>
      )
    }

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
            placeholder={`Frames Per Second (default: ${this.state.recordSettings.frames_per_second}) `}
            marginBottom={20}
            width="100%" 
            height={48}
            disabled={this.props.service.state["recording"]}
            onChange={e => 
              this.setState({
                recordSettings: {...this.state.recordSettings, frames_per_second: e.target.value}
              })
              // this.setState({recordSettings: {...this.state.recordSettings, 
              //   videoSettings: {...this.state.recordSettings["videoSettings"], fps: e.target.value}
              // }})
          }
          />

          <Pane display="flex" flex={1} flexDirection="row" alignItems="center">
            <Pane display="flex" flex={1}>
              {recbtn}
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

  renderSubStatusbar() {
    var endpoint = this.props.service.model.model ? this.props.service.model.model.endpoint : ""
    return (
      <Pane display="flex" background="white" padding={10} border>
        <Pane display="flex" alignItems="center">
          <Icon icon="dot" color={this.props.service.state["connected"] ? "green" : "red"} />
        </Pane>
        <Pane display="flex" flex={1} alignItems="center">
          <Text color="#b0b0b0" marginRight={6}>Camera:</Text> 
          <Strong color="#080808" weight="bold" marginRight={6}>{this.props.service.name}: </Strong>
          <Text color="#b0b0b0" >{endpoint}</Text> 
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
    updateState: (node, service, state) => dispatch(ServiceActions.updateState(node, service, state)),
    updateCurrentRecording: (node, service, recording) => dispatch(CameraAction.updateCurrentRecording(node, service, recording)),
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(CameraView)
