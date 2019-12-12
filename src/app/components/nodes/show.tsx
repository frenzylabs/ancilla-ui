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
  Pane
} from 'evergreen-ui'

import React  from 'react'
import {
  Nav,
  SubNav
} from '../../components'

import PubSub from 'pubsub-js'

import PrinterIndex 	from '../services/printers/index'
import CameraView 	  from '../services/cameras/index'
import FilesView 		  from '../files'
import SettingsView   from '../settings'

import { NodeAction } from '../../store/actions/node'


export class NodeView extends React.Component {
  constructor(props:any) {
    super(props)    

    // this.toggleDialog = this.toggleDialog.bind(this)
    // this.savePrinter  = this.savePrinter.bind(this)
    // this.getPrinters  = this.getPrinters.bind(this)
    console.log("NODE VIEW", this.props)
    window.nv = this
  }
  

  componentDidMount() {
    // this.getDevices()
    this.props.getServices()
  }

  render() {
    return (
      <Pane display="flex" flex={1}>
        <Pane display="flex" flex={0}>
          <Nav/>
          <SubNav {...this.props} />
        </Pane>

        <Pane background='#f6f6f6' width="100%" display="flex" flexDirection="column">
          <Switch>
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
                return <CameraView {...this.props} {...props} node={this.props.node} service={service} /> 
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
    getServices: () => dispatch(NodeAction.getServices())
  }
}


export default withRouter(connect(mapStateToProps, mapDispatchToProps)(NodeView))

// export default NodeView
