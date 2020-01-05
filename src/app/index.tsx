//
//  index.tsx
//  ancilla
// 
//  Created by Wess Cope (me@wess.io) on 10/30/19
//  Copyright 2019 Wess Cope
//

import "./styles/app.scss"
import "./extensions"

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
} from './components'

import NodeView from './components/nodes/show'

import Connection from './network/connection'

import PubSub from 'pubsub-js'

// class MainView extends React.Component {
//   render() {
//     // const Component = this.props.component;
//     return (
//       <div id="" className="has-navbar-fixed-top" style={{height: '100vh', flex: '1'}}>
//           <Statusbar printer={this.props.printer} />
//           <Summary printer={this.props.printer} />
//           <Terminal printer={this.props.printer} />
//       </div>
//     );
//  }
// }

import { NodeState, ServiceState }  from './store/state'

type AppProps = { 
  activeNode: NodeState,
  printerService?: ServiceState 
}

type stateProps = {
  connection: Connection
}
export class App extends React.Component<AppProps, stateProps> {
  pubsubToken = null

  constructor(props:any) {
    super(props)    

    // this.toggleDialog = this.toggleDialog.bind(this)
    // this.savePrinter  = this.savePrinter.bind(this)
    // this.getPrinters  = this.getPrinters.bind(this)
    console.log("APP CONSTUCTOR", this.props.activeNode)
    // this.props.activeNode
    this.state = {
      connection: new Connection({node: this.props.activeNode})
    }
    this.sendData  = this.sendData.bind(this)
    window.app = this
    this.pubsubToken = PubSub.subscribe(this.props.activeNode.name + ".request", this.sendData);
  }


  sendData(msg, data) {
    if (this.state.connection.connected) {
      this.state.connection.send(JSON.stringify(data))
    } else {
      
    }
  }

  

  componentDidMount() {
    // this.getPrinters()
  }

  componentDidUpdate(prevProps, prevState) {
    let prevNode = prevProps.activeNode
    if (this.props.activeNode && (!prevNode || prevNode.apiUrl != this.props.activeNode.apiUrl)) {
      PubSub.unsubscribe(this.pubsubToken)
      this.pubsubToken = PubSub.subscribe(this.props.activeNode.name, this.sendData);
      this.setState({connection: new Connection({node: this.props.activeNode})})
    }
  }

  render() {
    return (
      <NodeView {...this.props} node={this.props.activeNode} ></NodeView>
    )
  }
}

const mapStateToProps = (state) => {
  return state
}

export default withRouter(connect(mapStateToProps)(App))
