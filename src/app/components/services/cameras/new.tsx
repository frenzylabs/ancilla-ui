//
//  printers.tsx
//  ancilla
// 
//  Created by Wess Cope (me@wess.io) on 11/08/19
//  Copyright 2019 Wess Cope
//

import React from 'react'
import { Link, Redirect }       from 'react-router-dom';
import {connect}  from 'react-redux'
import PubSub from 'pubsub-js'

import {
  Pane,
  Heading,
  Button,
  toaster
} from 'evergreen-ui'

import ServiceActions from '../../../store/actions/services'
import ServiceAction  from '../../../store/actions/services'
import CameraHandler  from '../../../network/camera'
import ErrorModal     from '../../modal/error'
import Form           from './form'
import { NodeAction } from '../../../store/actions/node'

import { 
  NodeState, 
  CameraState,
  ServiceState
}  from '../../../store/state'


type Props = {
  node: NodeState,
  camera: CameraState,
  addCamera: Function,
  history: any,
  service: ServiceState,
}

export class CameraNew extends React.Component<Props> {  
  state = {
    showing: false,
    loading: false,
    newCamera: null,
    previewConnected: false,
    videoUrl: null,
  }

  form: Form = null
  videoRef = null
  requestTopic = ''
  eventTopic = ''
  pubsubRequestToken = null
  pubsubToken        = null

  constructor(props:any) {
    super(props)    

    this.toggleDialog = this.toggleDialog.bind(this)
    this.onSave       = this.onSave.bind(this)
    this.onError      = this.onError.bind(this)
    this.onUpdate     = this.onUpdate.bind(this)
    this.renderVideo  = this.renderVideo.bind(this)
    this.power        = this.power.bind(this)
    this.setVideoUrl  = this.setVideoUrl.bind(this)
  }

  componentDidMount() {
    console.log("this: ", this.props)
  }

  toggleDialog(show:boolean) {
    this.setState({
      ...this.state,
      showing: show
    })
  }

  onSave(response) {
    console.log("response on save", response)
    this.props.addCamera(this.props.node, response.data.camera) 
  
  }

  onError(error) {
    toaster.danger(<ErrorModal requestError={error} />)
  }


  authenticated(res) {
    console.log("Authenticated", res)
    this.setState({showing: false})
    
  }

  setVideoUrl() {
    var videoUrl = ''
    if (this.props.service && this.props.service.state["connected"]) {
      let url = this.props.node.apiUrl
      videoUrl = `${url}/webcam/${this.props.service.name}`
    } 
  }

  power() {
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

  selectCamera(item) {
    let url = `/cameras/${item.id}`
    this.props.history.push(`${url}`);    
  }

  setupCamera() {
    if (this.props.service) {
      // console.log("SETUP CAMERA")
      this.props.getState(this.props.node, this.props.service)

      PubSub.make_request(this.props.node, [this.props.service.name, "SUB", "events.camera.connection"])
      PubSub.make_request(this.props.node, [this.props.service.name, "SUB", "events.camera.recording"])

      
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
  }

  onUpdate(camera) {
    this.setState({
      ...this.state,
      newCamera: camera
    })
  }

  renderVideo() {
    if (this.state.previewConnected) {
      let url       = this.props.node.apiUrl
      var videoUrl  = `${url}/webcam/${this.props.service.name}`

      return (
        <React.Fragment>
          <Pane padding={20} height={200} border>
            <iframe id="image" width={640} style={{minHeight: "480px", border: 0, marginBottom: '20px'}} height={"100%"} ref={fp => this.videoRef = fp} src={`${videoUrl}`}  seamless={false} >
              <p>Your browser does not support iframes.</p>          
            </iframe>
          </Pane>

          <Pane marginTop={20}>
            <Button>Disconnect</Button>
          </Pane>
        </React.Fragment>        
      )
    }

    return ( 
      <React.Fragment>
        <Pane padding={20} height={200} border>
        </Pane>

        <Pane marginTop={20}>
          <Button onClick={e => {
            this.setupCamera()
            this.power()
          }}>Connect to Camera</Button>
        </Pane>
      </React.Fragment>
    )
  }

  render() {
    let cameras = this.props.node.services.filter((item) => item.kind == "camera")
    let items   =  cameras.length > 0 ? cameras : [{name: "No cameras found."}]
    
    return ( 
      <Pane padding={40}>
        <Pane display="flex" is="section" justifyContent="center" background="white" borderRadius={3} border>
          <Pane  padding={30} paddingBottom={0}>
            <Pane alignItems="center" display="flex" marginBottom={20}>
              <Heading size={700}>Add Camera</Heading>
            </Pane>
          
            <Pane alignItems="center" display="flex">
              <Form ref={frm => this.form = frm} node={this.props.node} onSave={this.onSave} onError={this.onError} onUpdate={this.onUpdate}/>        
            </Pane>
          </Pane>

          {/*
          <Pane flex={1} padding={30}>
            <Pane flex={1} alignItems="center" display="flex" marginBottom={20}>
              <Heading size={700}>Camera Preview</Heading>
            </Pane>

            <Pane justifyContent="center" display="flex" flex={1} padding={10} border>
              {this.state.newCamera && (
                <Pane display="flex" flex={1} flexDirection="column">
                  {this.renderVideo()}
                </Pane>
              )}

              {!this.state.newCamera && (
                <p>No endpoint for the new Camera given.</p>
              )}
            </Pane>
          </Pane>
              */}
        </Pane>

      </Pane>
    )
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
    addCamera: (node, camera) => dispatch(NodeAction.addCamera(node, camera)),
    deleteService: (node, service) => dispatch(ServiceAction.deleteService(node, service)),
    cameraUpdated: (node, service) => dispatch(NodeAction.cameraUpdated(node, service)),
    getState: (node, service) => dispatch(ServiceActions.getState(node, service)),
    updateState: (node, service, state) => dispatch(ServiceActions.updateState(node, service, state))
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(CameraNew)
