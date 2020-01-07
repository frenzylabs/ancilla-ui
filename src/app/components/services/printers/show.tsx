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
  Dialog,
  toaster
} from 'evergreen-ui'

import React  from 'react'

import ErrorModal from '../../modal/error'

import Connection from './summary/connection'
import State      from './summary/state'

import Terminal from './terminal'
import ServiceAttachment from '../attachments/index'

import PrinterActions from '../../../store/actions/printers'
import ServiceActions from '../../../store/actions/services'

import { PrinterHandler } from '../../../network'
import PrintForm from '../../prints/new'

import { NodeState, PrinterState }  from '../../../store/state'


import PubSub from 'pubsub-js'


type PrinterProps = {
  // listAttachments: Function,
  // attachments: Array<{}>,
  node: NodeState, 
  service: PrinterState,
  getLastPrint: Function,
  updateState: Function,
  getState: Function,
  dispatch: Function,

}

type StateProps = {
  createPrint: boolean
}

export class PrinterShow extends React.Component<PrinterProps, StateProps> {
  pubsubRequestToken = null
  pubsubToken        = null
  requestTopic       = ""
  eventTopic         = ""

  constructor(props:any) {
    super(props)

    
    this.state = {
      createPrint: false
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
    this.props.getLastPrint(this.props.node, this.props.service)
    // this.props.dispatch(PrinterActions.lastPrint(this.props.service))
  }


  setupPrinter() {
    if (this.props.service) {
      this.props.getState(this.props.node, this.props.service)
      // this.props.dispatch(ServiceActions.getState(this.props.service))
      PubSub.make_request(this.props.node, [this.props.service.name, "SUB", ""])
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
      this.props.updateState(this.props.node, this.props.service, data["resp"])
      // this.props.dispatch(PrinterActions.updateState(this.props.service, data["resp"]))

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
      case 'printer.state.changed':
          // console.log("PRINTER STATE CHANGED", data)
          this.props.updateState(this.props.node, this.props.service, {...this.props.service.state, ...data})
          // this.props.dispatch(ServiceActions.updateState(this.props.service, {...this.props.service.state, ...data}))
          // this.props.dispatch(PrinterActions.updateState(this.props.printer, {...this.props.printer.state, connected: false}))
          // this.setState({...this.state, printerState: {...this.state.printerState, open: false}})
          break
      case 'printer.connection.closed':
          this.props.updateState(this.props.node, this.props.service, {...this.props.service.state, connected: false})
          // this.props.dispatch(ServiceActions.updateState(this.props.service, {...this.props.service.state, connected: false}))
          // this.setState({...this.state, printerState: {...this.state.printerState, open: false}})
          break
      case 'printer.connection.opened':          
          this.props.updateState(this.props.node, this.props.service, {...this.props.service.state, connected: true})
          // this.props.dispatch(ServiceActions.updateState(this.props.service, {...this.props.service.state, connected: true}))
          // this.setState({...this.state, printerState: {...this.state.printerState, open: true}})
          break
      case 'printer.print.started':
          this.props.updateState(this.props.node, this.props.service, {...this.props.service.state, printing: true})
          // this.props.dispatch(ServiceActions.updateState(this.props.service, {...this.props.service.state, printing: true}))
          // this.setState({...this.state, printerState: {...this.state.printerState, printing: true}})
          break
      case 'printer.print.cancelled':
          this.props.updateState(this.props.node, this.props.service, {...this.props.service.state, printing: false})
          // this.props.dispatch(ServiceActions.updateState(this.props.service, {...this.props.service.state, printing: false}))
          // this.setState({...this.state, printerState: {...this.state.printerState, printing: false}})
          break
      case 'printer.print.failed':
          this.props.updateState(this.props.node, this.props.service, {...this.props.service.state, printing: false, status: "print_failed"})
          // this.props.dispatch(ServiceActions.updateState(this.props.service, {...this.props.service.state, printing: false, status: "print_failed"}))
          // this.setState({...this.state, printerState: {...this.state.printerState, printing: false, status: "print_failed"}})
          break
      default:
        break
    }    
  }


  startPrint(printParams) {
    
    return PrinterHandler.start_print(this.props.node, this.props.service, printParams)
    .then((response) => {
      // var attachments = this.state.attachments
      console.log("START PRINT", response.data)
      var f = response.data.print
      // attachments = attachments.concat(f)
      // this.setState({
      //   loading: false,
      //   attachments: attachments
      // })

      // toaster.success(`Print Started ${printParams.name} has been successfully added`)
      
    })
    .catch((error) => {
      console.log(error)
      // if (closeDialog)
      //   closeDialog()
      toaster.danger(<ErrorModal requestError={error} />)
    })
  }

  attachmentAdded(attachment) {
    // this.setState({reloadTime: Date.now()})
  }

  

  renderCreatePrint() {
    if (this.state.createPrint) {
      return (
        <PrintForm onComplete={() => this.setState({createPrint: false})} printerService={this.props.service} node={this.props.node} />
      )
    }
    return null
  }

  showPrintForm() {
    this.setState({createPrint: true})
  }


  render() {    
    return (
      <Pane>
        {this.renderCreatePrint()}
          <Pane display="flex">
            <Pane display="flex" width="100%">
              <Connection {...this.props} startPrint={this.startPrint.bind(this)} createPrint={this.showPrintForm.bind(this)} />
              <State {...this.props} />
            </Pane>
          </Pane>
          <ServiceAttachment {...this.props} attachments={this.props.service.model.attachments} attachmentKind="Camera" device={this.props.service && this.props.service.model}/>
          <Terminal {...this.props}  />
      </Pane>
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
    deleteService: (node, service) => dispatch(ServiceActions.listAttachments(node, service)),
    getState: (node, service) => dispatch(ServiceActions.getState(node, service)),
    updateState: (node, service, state) => dispatch(ServiceActions.updateState(node, service, state)),
    getLastPrint: (node, service) => dispatch(PrinterActions.lastPrint(node, service)),
    dispatch: dispatch
    
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(PrinterShow)
