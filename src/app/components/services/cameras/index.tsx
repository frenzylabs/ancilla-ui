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
  recordSettings: any,
  togglingPower: boolean
}

export class CameraIndex extends React.Component<Props, StateProps> {
  requestTopic = ''
  eventTopic = ''
  pubsubRequestToken = null
  pubsubToken        = null

  constructor(props:any) {
    super(props)

    
    this.state = {
      togglingPower: false,
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
    this.setupSubscription = this.setupSubscription.bind(this)
    
    
  }

  componentDidMount() {
    this.setupCamera()
  }

  componentWillUnmount() {
    PubSub.publishSync(this.props.node.uuid + ".request", [this.props.service.identity, "UNSUB", "events.camera.connection"])
    if (this.pubsubToken)
      PubSub.unsubscribe(this.pubsubToken)
    if (this.pubsubRequestToken)
      PubSub.unsubscribe(this.pubsubRequestToken)
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.service.model != this.props.service.model) {
      this.setupCamera()      
    }
    if (prevProps.node.uuid != this.props.node.uuid) {
      // this.setupSubscription()
      this.setupCamera()      
    }
  }

  setupCamera() {
    if (this.props.service) {
      this.props.getState(this.props.node, this.props.service)
      PubSub.make_request(this.props.node, [this.props.service.identity, "SUB", "events.camera.connection"])
      // PubSub.make_request(this.props.node, [this.props.service.id, "test", "tada"])

      this.setupSubscription()
    }
  }

  setupSubscription() {
    this.requestTopic = `${this.props.node.uuid}.${this.props.service.identity}.request`
    this.eventTopic = `${this.props.node.uuid}.${this.props.service.identity}.events`

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
    
  }

  receiveEvent(msg, data) {
    var [to, kind] = msg.split("events.")
    switch(kind) {
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

  cameraSaved(resp) {
    this.props.cameraUpdated(this.props.node, resp.data.service_model)
    this.props.history.push(this.props.match.url)    
  }

  saveFailed(error) {
    toaster.danger(<ErrorModal requestError={error} />)
  }

  power(){
    this.props.updateState(this.props.node, this.props.service, {...this.props.service.state, togglingPower: true})
    if (this.props.service.state["connected"]) {
      CameraHandler.disconnect(this.props.node, this.props.service)
      .then((response) => {
        this.props.updateState(this.props.node, this.props.service, {...this.props.service.state, connected: false, togglingPower: false})
      }).catch((error) => {
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
        this.props.updateState(this.props.node, this.props.service, {...this.props.service.state, togglingPower: false})
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
      <Pane key="delete" display="flex" borderTop paddingTop={20}>
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

  statusBarTitle() {
    var endpoint = this.props.service.model.model ? this.props.service.model.model.endpoint : ""
    return `${this.props.service.name}: ${endpoint}`
  }

  render() {
    var powerOption = {
      state: (this.props.service.state["togglingPower"] == true ? "waiting" : "active"),
      action: this.power.bind(this)
    }
    var params = this.props.match.params;
    return (
      <div className="flex-wrapper">
        <Statusbar {...this.props} renderTitle={this.statusBarTitle.bind(this)} status={this.getColorState()} powerOption={powerOption} settingsAction={() => this.props.history.push(`${this.props.match.url}/settings`) } />

        <div className="scrollable-content">
          <Switch>                 
            <Route path={`${this.props.match.path}/recordings`} render={ props => 
                <Recordings {...this.props} {...props}  /> 
              }/> 
              <Route path={`${this.props.match.path}/settings`} render={ props => 
                <Settings {...this.props} {...props} title={this.settingsTitle()} forms={[
                {"key": "General", "component": 
                  [<CameraForm key="record" onSave={this.cameraSaved.bind(this)} onError={this.saveFailed.bind(this)} data={this.props.service.model} {...this.props} {...props} />,
                    this.deleteComponent()
                  ]},
                  {
                    "key": "Record", "component": 
                    <CameraForm kind="record" onSave={this.cameraSaved.bind(this)} onError={this.saveFailed.bind(this)} data={this.props.service.model} {...this.props} {...props} />
                  },
                  {
                    "key": "Video Capture", "component": 
                    <CameraForm kind="capture" onSave={this.cameraSaved.bind(this)} onError={this.saveFailed.bind(this)} data={this.props.service.model} {...this.props} {...props} />
                  }

                  
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