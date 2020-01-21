//
//  index.tsx
//  ancilla
// 
//  Created by Wess Cope (wess@frenzylabs.com) on 12/12/19
//  Copyright 2019 FrenzyLabs, LLC.
//

import React      from 'react'
import {connect}  from 'react-redux'
import { Link }   from 'react-router-dom'

import {
  Switch,
  Route,
} from 'react-router-dom'

import {
  Pane,
  TextInput,
  Button,
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

import Recordings from '../../recordings/index'

import { NodeState, ServiceState }  from '../../../store/state'



type Props = {
  node: NodeState, 
  service: ServiceState,
  deleteService: Function,
  cameraUpdated: Function,
  dispatch: Function,
  getState: Function,
  updateState: Function,
  match: any,
  history: any
}

type StateProps = {
  recordSettings: any
}

export class CameraIndex extends React.Component<Props, StateProps> {
  requestTopic = ''
  eventTopic = ''
  pubsubRequestToken = null
  pubsubToken        = null

  constructor(props:any) {
    super(props)

    
    this.state = {
      recordSettings: {
        videoSettings: {
          fps: 10
        },
        timelapse: 2
      }
    }

    this.receiveRequest    = this.receiveRequest.bind(this)
    this.receiveEvent      = this.receiveEvent.bind(this)
    this.setupCamera       = this.setupCamera.bind(this)
    this.toggleRecording   = this.toggleRecording.bind(this)
    this.setupSubscription = this.setupSubscription.bind(this)
    
    
  }

  componentDidMount() {
    this.setupCamera()
  }

  componentWillUnmount() {
    PubSub.publishSync(this.props.node.name + ".request", [this.props.service.name, "UNSUB", "events.camera.connection"])
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
    if (prevProps.node.name != this.props.node.name) {
      this.setupSubscription()
    }
  }

  setupCamera() {
    if (this.props.service) {
      this.props.getState(this.props.node, this.props.service)
      PubSub.make_request(this.props.node, [this.props.service.name, "SUB", "events.camera.connection"])

      this.setupSubscription()
    }
  }

  setupSubscription() {
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
    // console.log("EVENT KIND", kind)
    switch(kind) {
      case 'camera.recording.started':
          console.log("Camera Recording started", data)
          this.props.updateState(this.props.node, this.props.service, {...this.props.service.state, recording: true})
          // this.props.dispatch(ServiceActions.updateState(this.props.service, {...this.props.service.state, recording: true}))
          break
      case 'camera.recording.changed':
          // console.log("Camera Recording STate", data)
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
          // this.setState({...this.state, serviceState: {...this.state.serviceState, open: true}})
          break      
      default:
        break
    }    
  }

    


  toggleRecording() {
    if (this.props.service.state["recording"]) {
      PubSub.publishSync(this.props.node.name + ".request", [this.props.service.name, "REQUEST.stop_recording", this.state.recordSettings])
    } else {
      PubSub.publishSync(this.props.node.name + ".request", [this.props.service.name, "REQUEST.start_recording", this.state.recordSettings])
    }
  }

  cameraSaved(resp) {
    // console.log("printer saved", resp)
    this.props.cameraUpdated(this.props.node, resp.data.service_model)
    this.props.history.push(this.props.match.url)    
  }

  saveFailed(error) {
    toaster.danger(<ErrorModal requestError={error} />)
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

  settingsTitle() {
    return (
      <Pane>
        <Link to={this.props.match.url}>{this.props.service.name}</Link> &nbsp; / &nbsp;
        Settings
      </Pane>
    )
  }

  render() {
    var params = this.props.match.params;
    return (
      <div className="flex-wrapper">
        <Statusbar {...this.props} status={this.getColorState()} powerAction={this.power.bind(this)} settingsAction={() => this.props.history.push(`${this.props.match.url}/settings`) } />

        <div className="scrollable-content">
          <Switch>                 
            <Route path={`${this.props.match.path}/recordings`} render={ props => 
                <Recordings {...this.props} {...props}  /> 
              }/> 
              <Route path={`${this.props.match.path}/settings`} render={ props => 
                <Settings {...this.props} {...props} title={this.settingsTitle()} forms={[
                  <CameraForm onSave={this.cameraSaved.bind(this)} onError={this.saveFailed.bind(this)} data={this.props.service.model} {...this.props} {...props} />,
                  this.deleteComponent()
                ]}/> 
              }/>

              <Route path={`${this.props.match.path}`} render={ props => 
                <ShowView {...this.props}  {...props} />  
              }/>
            </Switch>
        </div>
      </div>
    );
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
    dispatch: dispatch
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(CameraIndex)