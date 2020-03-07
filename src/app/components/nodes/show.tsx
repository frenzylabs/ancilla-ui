// import "../styles/app.scss"
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
  toaster
} from 'evergreen-ui'

import React  from 'react'
import {
  Nav,
  SubNav
} from '../../components'

import PrinterIndex 	from '../services/printers/index'
import PrinterNew 	  from '../services/printers/new'
import CameraIndex 	  from '../services/cameras/index'
import CameraNew 	  from '../services/cameras/new'
import FilesView 		  from '../files'
import RecordingShow 	  from '../recordings/show'
import ErrorModal           from '../modal/error'

import NodeForm             from './form'
import Settings             from '../settings'

import { NodeAction } from '../../store/actions/node'
import { NodeState } from '../../store/state'

type Props = {
  node: NodeState,
  nodes: Array<NodeState>,
  match: any,
  location: any,
  history: any,
  getServices: Function,
  updateNode: Function
}
export class NodeView extends React.Component<Props> {
  constructor(props:any) {
    super(props)    

    this.saveFailed  = this.saveFailed.bind(this)
  }
  

  componentDidMount() {
    // this.getDevices()
    this.props.getServices()
  }

  saveFailed(error) {
    if (error.response.status == 401) {
      this.setState({showing: true})
    } else {
    // this.setState({requestError: error})
      toaster.danger(<ErrorModal requestError={error} />)
    }
  }

  render() {
    return (
      <Pane display="flex" flex={1}>
        <Pane display="flex" flex={0}>
          <Nav {...this.props} />
          <SubNav {...this.props} />
        </Pane>

        <Pane background='#f6f6f6' width="100%" display="flex" flexDirection="column">
          <Switch>
            <Route path={`/node/settings`} render={ props => {
                if (!this.props.node.model) {
                  return null
                }
                return (
                  <Pane className="scrollable-content" >
                    <Settings {...this.props} {...props} title="Edit Node" service={this.props.node} forms={[
                      <NodeForm save={this.props.updateNode.bind(this)} onError={this.saveFailed.bind(this)} data={this.props.node.model} {...this.props} {...props}/>, 
                  
                    ]} /> 
                  </Pane>
                )
              }
            }/>
            <Route path={`/recordings/:recordingId`} render={ props => <RecordingShow {...this.props} {...props} /> }/>
            <Route path={`/:service(cameras)/new`} render={ props => <CameraNew {...this.props} {...props} /> }/>
            <Route path={`/:service(cameras)/new`} render={ props => <CameraNew {...this.props} {...props} /> }/>
            <Route path={`/:service(printers)/new`} render={ props => <PrinterNew {...this.props} {...props} /> }/>
            <Route path={`/:service(printers)/:serviceId`}  render={ props => {
                var service = this.props.node.services.find((item) => item.id == parseInt(props.match.params.serviceId));
                if (!service) {
                  return null
                }
                return <PrinterIndex {...this.props} {...props} service={service} /> 
              }
            } />
            <Route path={`/:service(cameras)/:serviceId`} render={ props => {
                var service = this.props.node.services.find((item) => item.id == parseInt(props.match.params.serviceId));
                if (!service) {
                  return null
                }
                return <CameraIndex {...this.props} {...props} node={this.props.node} service={service} /> 
              }
            } />
						<Route path="/files" render={ props => {
							return <FilesView {...this.props} {...props}/>
						}}/>
          </Switch>
          
        </Pane>
      </Pane>
    )
  }
}

const mapStateToProps = (state) => {
  return state
}

const mapDispatchToProps = (dispatch) => {
  return {
    getServices: () => dispatch(NodeAction.getServices()),
    updateNode: (node, params) => dispatch(NodeAction.updateNode(node, params))
  }
}


export default withRouter(connect(mapStateToProps, mapDispatchToProps)(NodeView))

// export default NodeView
