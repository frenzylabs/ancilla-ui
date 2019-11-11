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

class PrinterView extends React.Component {
  constructor(props:any) {
    super(props)

    
    this.state = {
      printerState: {
        open: false
      },
      connected: false
    }

    this.receiveRequest  = this.receiveRequest.bind(this)
    this.receiveEvent    = this.receiveEvent.bind(this)
    this.setupPrinter    = this.setupPrinter.bind(this)

    this.setupPrinter()
    
  }

  setupPrinter() {
    if (this.props.printer) {
      PubSub.publishSync(this.props.node.name + ".request", [this.props.printer.name, "SUB", ""])
      PubSub.publishSync(this.props.node.name + ".request", [this.props.printer.name, "REQUEST.get_state"])
      // console.log("Has printer")
      this.requestTopic = `${this.props.node.name}.${this.props.printer.name}.request`
      this.eventTopic = `${this.props.node.name}.${this.props.printer.name}.events`
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

  receiveRequest(msg, data) {
    // console.log("PV Received Data here1", msg)    
    // console.log("PV Received Data here2", data)
    // console.log(typeof(data))
    if(!data)
      return
    if (data["action"] == "get_state") {
      // console.log("get STATE", data)
      this.setState({printerState: data["resp"]})
    }
    // else if (data["action"] == "connect") {
    //   if (data["resp"]["status"] == "error") {
    //     this.setState({...this.state, printerState: {...this.state.printerState, open: false}})
    //   } else {
    //     this.setState({...this.state, printerState: {...this.state.printerState, open: true}})
    //     // this.setState({connected: true})
    //   }
    // }
  }

  receiveEvent(msg, data) {
    // console.log("PV Received Event here1", msg)    
    // console.log("PV Received Event here2", data)
    // console.log(typeof(data))
    var [to, kind] = msg.split("events.")
    // console.log("EVENT KIND", kind)
    switch(kind) {
      case 'connection.closed':
          this.setState({...this.state, printerState: {...this.state.printerState, open: false}})
          break
      case 'connection.opened':
          this.setState({...this.state, printerState: {...this.state.printerState, open: true}})
          break
      case 'print.started':
          this.setState({...this.state, printerState: {...this.state.printerState, printing: true}})
          break
      case 'print.cancelled':
          this.setState({...this.state, printerState: {...this.state.printerState, printing: false}})
          break
      case 'print.failed':
          this.setState({...this.state, printerState: {...this.state.printerState, printing: false, status: "print_failed"}})
          break
      default:
        break
    }    
  }

    
  componentWillUnmount() {
    if (this.pubsubToken)
      PubSub.unsubscribe(this.pubsubToken)
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.printer != this.props.printer) {
      this.setupPrinter()
    }
  }


  render() {
    // const Component = this.props.component;    
    return (
      <div id="" className="has-navbar-fixed-top" style={{height: '100vh', flex: '1'}}>
          <Statusbar {...this.props} printerState={this.state.printerState}/>
          <Summary {...this.props} printerState={this.state.printerState} />
          <Terminal {...this.props} printerState={this.state.printerState} />
      </div>
    );
 }
}


export class NodeView extends React.Component {
  constructor(props:any) {
    super(props)    

    // this.toggleDialog = this.toggleDialog.bind(this)
    // this.savePrinter  = this.savePrinter.bind(this)
    // this.getPrinters  = this.getPrinters.bind(this)
    // console.log("NODE VIEW", this.props)
    // window.nv = this
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
              return <PrinterView {...props} node={this.props.node} printer={printer} /> 
            }
            }/>
          </Switch>
          
        </Pane>
      </Pane>
    )
  }
}

export default NodeView

// const mapStateToProps = (state) => {
//   return {
//     node: state.activeNode,
//     // printers: state.activeNode
//   }
// }

// export default withRouter(connect(mapStateToProps)(NodeView))