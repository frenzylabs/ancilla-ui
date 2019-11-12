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
// import {
//   Nav,
//   SubNav
// } from '../../'

import Statusbar from './statusbar'
import Summary from './summary/index'
import Terminal from './terminal'

import PrinterActions from '../../../store/actions/printers'

import PubSub from 'pubsub-js'

export default class PrinterView extends React.Component {
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
    this.getPrint        = this.getPrint.bind(this)

    
    
  }

  componentDidMount() {
    this.setupPrinter()
    this.getPrint()
  }

  componentWillUnmount() {
    if (this.pubsubToken)
      PubSub.unsubscribe(this.pubsubToken)
    if (this.pubsubRequestToken)
      PubSub.unsubscribe(this.pubsubRequestToken)
  }  

  componentDidUpdate(prevProps, prevState) {
    // console.log("component Will update", prevProps, this.props)
    // if (prevProps.node != this.props.node) {
    //   // console.log("NODE HAD BEEN UPDATED")
    // }

    // if (prevProps.printer.state != this.props.printer.state) {
    //   console.log("PRINTER HAS BEEN UPDATED")
    //   // this.setupPrinter()
    // }

    // if (prevProps.printer.currentPrint != this.props.printer.currentPrint) {
    //   console.log("PRINTER PRINT HAS BEEN UPDATED")
    //   // this.setupPrinter()
    // }

    if (prevProps.printer.model != this.props.printer.model) {
      // console.log("PRINTER MODEL HAS BEEN UPDATED")
      this.setupPrinter()
    }
  }

  getPrint() {
    this.props.dispatch(PrinterActions.lastPrint(this.props.printer))
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
    if(!data)
      return
    if (data["action"] == "get_state") {
      // console.log("get STATE", data)
      this.props.dispatch(PrinterActions.updateState(this.props.printer, data["resp"]))

      // this.setState({printerState: data["resp"]})
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
          this.props.dispatch(PrinterActions.updateState(this.props.printer, {...this.props.printer.state, connected: false}))
          // this.setState({...this.state, printerState: {...this.state.printerState, open: false}})
          break
      case 'connection.opened':          
          this.props.dispatch(PrinterActions.updateState(this.props.printer, {...this.props.printer.state, connected: true}))
          // this.setState({...this.state, printerState: {...this.state.printerState, open: true}})
          break
      case 'print.started':
          this.props.dispatch(PrinterActions.updateState(this.props.printer, {...this.props.printer.state, printing: true}))
          // this.setState({...this.state, printerState: {...this.state.printerState, printing: true}})
          break
      case 'print.cancelled':
          this.props.dispatch(PrinterActions.updateState(this.props.printer, {...this.props.printer.state, printing: false}))
          // this.setState({...this.state, printerState: {...this.state.printerState, printing: false}})
          break
      case 'print.failed':
          this.props.dispatch(PrinterActions.updateState(this.props.printer, {...this.props.printer.state, printing: false, status: "print_failed"}))
          // this.setState({...this.state, printerState: {...this.state.printerState, printing: false, status: "print_failed"}})
          break
      default:
        break
    }    
  }

    


  render() {
    // const Component = this.props.component;    
    return (
      <div id="" className="has-navbar-fixed-top" style={{height: '100vh', flex: '1'}}>
          <Statusbar {...this.props} />
          <Summary {...this.props}  />
          <Terminal {...this.props}  />
      </div>
    );
 }
}