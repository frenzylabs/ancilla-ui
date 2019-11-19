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
  SubNav,
  Statusbar,
  Summary,
  Terminal
} from '../../components'

import PubSub from 'pubsub-js'

import PrinterView 	from '../devices/printers/index'
import CameraView 	from '../devices/cameras/index'
import FilesView 		from '../files'


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
    // this.getPrinters()
  }

  render() {
    return (
      <Pane display="flex" flex={1} height="100%">
        <Pane display="flex" flex={0}>
          <Nav/>
          <SubNav {...this.props} />
        </Pane>

        <Pane background='#f6f6f6' width="100%" display="flex" flexDirection="column">
          <Switch>
            <Route path={`/printers/:printerId`}  exact={true} render={ props => {
                var printer = this.props.node.printers.find((item) => item.id == parseInt(props.match.params.printerId));
                if (!printer) {
                  return null
                }
                return <PrinterView {...this.props} {...props} printer={printer} /> 
              }
            } />
            <Route path={`/cameras/:cameraId`}  exact={true} render={ props => {
                var camera = this.props.node.cameras.find((item) => item.id == parseInt(props.match.params.cameraId));
                if (!camera) {
                  return null
                }
                return <CameraView {...this.props} {...props} node={this.props.node} camera={camera} /> 
              }
            } />
						<Route path="/files" exact={true} render={ props => {
							return <FilesView {...this.props} {...props}/>
						}}/>
          </Switch>
          
        </Pane>
      </Pane>
    )
  }
}

export default NodeView
