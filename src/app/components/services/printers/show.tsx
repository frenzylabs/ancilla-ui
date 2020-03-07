//
//  show.tsx
//  ancilla
// 
//  Created by Kevin Musselman (kevin@frenzylabs.com) on 01/08/20
//  Copyright 2019 FrenzyLabs, LLC.
//

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

import Controls from './controls'

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
  match: any

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
    this.cancelPrint     = this.cancelPrint.bind(this)

    
    
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

    if (prevProps.service.model != this.props.service.model) {
      this.setupPrinter()
      this.getPrint()
    }
  }

  getPrint() {
    this.props.getLastPrint(this.props.node, this.props.service)
  }


  setupPrinter() {
    if (this.props.service) {
      this.props.getState(this.props.node, this.props.service)
      PubSub.make_request(this.props.node, [this.props.service.identity, "SUB", "events"])      

      this.requestTopic = `${this.props.node.uuid}.${this.props.service.identity}.request`
      this.eventTopic = `${this.props.node.uuid}.${this.props.service.identity}.events`

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

    if(!data)
      return
    if (data["action"] == "get_state") {
      this.props.updateState(this.props.node, this.props.service, data["resp"])
    }
  }

  receiveEvent(msg, data) {
    var [to, kind] = msg.split("events.")
    switch(kind) {
      case 'printer.state.changed':
          this.props.updateState(this.props.node, this.props.service, {...this.props.service.state, ...data})

          break
      case 'printer.connection.closed':
          this.props.updateState(this.props.node, this.props.service, {...this.props.service.state, connected: false})
          break
      case 'printer.connection.opened':          
          this.props.updateState(this.props.node, this.props.service, {...this.props.service.state, connected: true})
          break
      case 'printer.print.started':
          this.props.updateState(this.props.node, this.props.service, {...this.props.service.state, printing: true})
          break
      case 'printer.print.cancelled':
          this.props.updateState(this.props.node, this.props.service, {...this.props.service.state, printing: false})
          break
      case 'printer.print.failed':
          this.props.updateState(this.props.node, this.props.service, {...this.props.service.state, printing: false, status: "print_failed"})
          break
      default:
        break
    }    
  }


  startPrint(printParams) {
    
    return PrinterHandler.start_print(this.props.node, this.props.service, printParams)
    .then((response) => {
      // var f = response.data.print
      // toaster.success(`Print Started ${printParams.name} has been successfully added`)
      
    })
    .catch((error) => {
      toaster.danger(<ErrorModal requestError={error} />)
    })
  }

  cancelPrint(printId) {
    
    return PrinterHandler.cancel_print(this.props.node, this.props.service, printId)
    .then((response) => {
      this.props.dispatch(PrinterActions.updateLastPrint(this.props.node, this.props.service, response.data.data))
      // toaster.success(`Print Started ${printParams.name} has been successfully added`)
      
    })
    .catch((error) => {
      toaster.danger(<ErrorModal requestError={error} />)
    })
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
              <Connection {...this.props} startPrint={this.startPrint.bind(this)} createPrint={this.showPrintForm.bind(this)} cancelPrint={this.cancelPrint} />
              <State {...this.props} />
            </Pane>
          </Pane>

          <ServiceAttachment {...this.props} attachments={this.props.service.model.attachments} attachmentKind="Camera" device={this.props.service && this.props.service.model}/>

          <Pane display="flex" flex={1} flexDirection="row" flexWrap="wrap" justifyContent="space-evenly" alignItems="space-evenly">
            <Controls {...this.props} />
            <Terminal {...this.props}  />
          </Pane>
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
