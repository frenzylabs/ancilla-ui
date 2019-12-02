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
  Dialog
} from 'evergreen-ui'

import React  from 'react'
// import {
//   Nav,
//   SubNav
// } from '../../'

import Statusbar from './statusbar'
import Summary from './summary/index'
import Terminal from './terminal'
import SettingsForm from './settings'

import ServiceAttachment from '../attachments/index'

import PrinterActions from '../../../store/actions/printers'
import ServiceActions from '../../../store/actions/services'


import PubSub from 'pubsub-js'

export default class PrinterShow extends React.Component {
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

    if (prevProps.service.model != this.props.service.model) {
      // console.log("PRINTER MODEL HAS BEEN UPDATED")
      this.setupPrinter()
      this.getPrint()
    }
  }

  getPrint() {
    this.props.dispatch(PrinterActions.lastPrint(this.props.service))
  }


  setupPrinter() {
    if (this.props.service) {
      this.props.dispatch(ServiceActions.getState(this.props.service))
      PubSub.publishSync(this.props.node.name + ".request", [this.props.service.name, "SUB", ""])
      // PubSub.publishSync(this.props.node.name + ".request", [this.props.printer.name, "REQUEST.get_state"])
      // console.log("Has printer")
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
  }

  receiveRequest(msg, data) {
    // console.log("PV Received Data here1", msg)    
    // console.log("PV Received Data here2", data)
    if(!data)
      return
    if (data["action"] == "get_state") {
      console.log("get STATE", data)
      this.props.dispatch(PrinterActions.updateState(this.props.service, data["resp"]))

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
    switch(kind) {
      case 'printer.state':
          console.log(data)
          this.props.dispatch(ServiceActions.updateState(this.props.service, data))
          // this.props.dispatch(PrinterActions.updateState(this.props.printer, {...this.props.printer.state, connected: false}))
          // this.setState({...this.state, printerState: {...this.state.printerState, open: false}})
          break
      case 'printer.connection.closed':
          this.props.dispatch(ServiceActions.updateState(this.props.service, {...this.props.service.state, connected: false}))
          // this.setState({...this.state, printerState: {...this.state.printerState, open: false}})
          break
      case 'printer.connection.opened':          
          this.props.dispatch(ServiceActions.updateState(this.props.service, {...this.props.service.state, connected: true}))
          // this.setState({...this.state, printerState: {...this.state.printerState, open: true}})
          break
      case 'printer.print.started':
          this.props.dispatch(ServiceActions.updateState(this.props.service, {...this.props.service.state, printing: true}))
          // this.setState({...this.state, printerState: {...this.state.printerState, printing: true}})
          break
      case 'printer.print.cancelled':
          this.props.dispatch(ServiceActions.updateState(this.props.service, {...this.props.service.state, printing: false}))
          // this.setState({...this.state, printerState: {...this.state.printerState, printing: false}})
          break
      case 'printer.print.failed':
          this.props.dispatch(ServiceActions.updateState(this.props.service, {...this.props.service.state, printing: false, status: "print_failed"}))
          // this.setState({...this.state, printerState: {...this.state.printerState, printing: false, status: "print_failed"}})
          break
      default:
        break
    }    
  }


  renderSettings() {
    return (
			<React.Fragment>
				<Dialog
          isShown={this.state.showing}
          title="Attach Service"
          confirmLabel="Save"
          onCloseComplete={() => this.toggleDialog(false)}
          onConfirm={this.saveAttachment}
        >              
          <SettingsForm ref={frm => this.form = frm} {...this.props} />
        </Dialog>

				<IconButton appearance='minimal' icon="add" onClick={(e) => this.setState({showing: true})}/>
			</React.Fragment>
		)
  }

    


  render() {
    // const Component = this.props.component;    
    return (
      <div id="" className="has-navbar-fixed-top" style={{height: '100vh', flex: "1 auto", overflow: 'scroll'}}>
          <Statusbar {...this.props} />
          <Summary {...this.props}  />
          <ServiceAttachment {...this.props} device={this.props.service && this.props.service.model}/>
          <Terminal {...this.props}  />
      </div>
    );
 }
}