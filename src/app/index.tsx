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

  sendQueue = []
  constructor(props:any) {
    super(props)    

    // this.state = {
    //   connection: null
    // }
    this.state = {
      connection: new Connection({node: this.props.activeNode})
    }
    this.sendData  = this.sendData.bind(this)

    this.receivedNotification = this.receivedNotification.bind(this)
    this.pubsubToken          = PubSub.subscribe(this.props.activeNode.uuid + ".request", this.sendData);
  }

    

  componentDidMount() {
    document.title = this.props.activeNode.name
    this.props.getNode(this.props.activeNode)
    this.props.listNodes()
    
    this.setupNotification()
    // setTimeout(this.setupConn.bind(this), 1000)
  }

  // setupConn() {
  //   this.setState({
  //     connection: new Connection({node: this.props.activeNode})
  //   })
  // }

  componentDidUpdate(prevProps, prevState) {
    let prevNode = prevProps.activeNode
    document.title = this.props.activeNode.name
    if (this.props.activeNode && (!prevNode || prevNode.apiUrl != this.props.activeNode.apiUrl)) {
      PubSub.unsubscribe(this.pubsubToken)
      this.pubsubToken = PubSub.subscribe(this.props.activeNode.uuid + ".request", this.sendData);
      this.setState({connection: new Connection({node: this.props.activeNode})})
      this.setupNotification()
    }
    else if (prevNode.uuid != this.props.activeNode.uuid) {
      
      // this.setState({connection: new Connection({node: this.props.activeNode})})
      this.state.connection.node = this.props.activeNode
      // PubSub.unsubscribe(this.pubsubToken)
      this.pubsubToken = PubSub.subscribe(this.props.activeNode.uuid + ".request", this.sendData);
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
    
    this.notificationToken = PubSub.subscribe(this.props.activeNode.uuid + ".notifications", this.receivedNotification)
  }

  sendData(msg, data) {
    if (this.state.connection && this.state.connection.connected) {
      this.state.connection.send(JSON.stringify(data))
    } else {
      // Websocket Not connected yet
      this.sendQueue.push(data)
    }
  }

  receivedNotification(topic, data) {
    var [to, kind] = topic.split("notifications.")
    if (kind == "nodes_changed") {
      this.props.listNodes()
    } else if (kind == "connected") {
      while(this.sendQueue.length > 0) {
        var data = this.sendQueue.shift()
        this.sendData("request", data)
      }
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
