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

import { NodeAction } from './store/actions/node'

import { NodeState, ServiceState }  from './store/state'

type AppProps = { 
  activeNode: NodeState,
  printerService?: ServiceState,
  listNodes: Function,
  getNode: Function
}

type stateProps = {
  connection: Connection
}
export class App extends React.Component<AppProps, stateProps> {
  pubsubToken = null
  notificationToken = null

  constructor(props:any) {
    super(props)    

    // this.toggleDialog = this.toggleDialog.bind(this)
    // this.savePrinter  = this.savePrinter.bind(this)
    // this.getPrinters  = this.getPrinters.bind(this)
    // console.log("APP CONSTUCTOR", this.props.activeNode)
    // this.props.activeNode
    this.state = {
      connection: new Connection({node: this.props.activeNode})
    }
    this.sendData  = this.sendData.bind(this)
    this.receivedNotification = this.receivedNotification.bind(this)
    // window.app = this
    this.pubsubToken = PubSub.subscribe(this.props.activeNode.name + ".request", this.sendData);
  }

    

  componentDidMount() {
    // this.getPrinters()
    this.props.getNode(this.props.activeNode)
    this.props.listNodes()
    
    this.setupNotification()
  }

  componentDidUpdate(prevProps, prevState) {
    let prevNode = prevProps.activeNode
    
    if (this.props.activeNode && (!prevNode || prevNode.apiUrl != this.props.activeNode.apiUrl)) {
      PubSub.unsubscribe(this.pubsubToken)
      this.pubsubToken = PubSub.subscribe(this.props.activeNode.name + ".request", this.sendData);
      this.setState({connection: new Connection({node: this.props.activeNode})})
      this.setupNotification()
    }
    else if (prevNode.name != this.props.activeNode.name) {
      // this.setState({connection: new Connection({node: this.props.activeNode})})
      this.state.connection.node = this.props.activeNode
      PubSub.unsubscribe(this.pubsubToken)
      this.pubsubToken = PubSub.subscribe(this.props.activeNode.name + ".request", this.sendData);
      this.setupNotification()
    }
  }

  componentWillUnmount() {
    if (this.pubsubToken)
      PubSub.unsubscribe(this.pubsubToken)
    if (this.notificationToken)
      PubSub.unsubscribe(this.notificationToken)
  }

  setupNotification() {
    if (this.notificationToken)
      PubSub.unsubscribe(this.notificationToken)
    this.notificationToken = PubSub.subscribe(this.props.activeNode.name + ".notifications", this.receivedNotification)
  }

  sendData(msg, data) {
    if (this.state.connection.connected) {
      this.state.connection.send(JSON.stringify(data))
    } else {
      console.log("Not connected yet", data)
    }
  }

  receivedNotification(topic, data) {
    // console.log("Received Notification", topic, data)
    var [to, kind] = topic.split("notifications.")
    if (kind == "nodes_changed") {
      this.props.listNodes()
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

const mapDispatchToProps = (dispatch) => {
  return {
    listNodes: () => dispatch(NodeAction.listNodes()),
    getNode: (node) => dispatch(NodeAction.getNode(node))
  }
}



export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App))
