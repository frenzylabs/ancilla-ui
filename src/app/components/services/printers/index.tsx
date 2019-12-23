//
//  index.tsx
//  ancilla
// 
//  Created by Wess Cope (wess@frenzylabs.com) on 12/06/19
//  Copyright 2019 FrenzyLabs, LLC.
//

import React      from 'react'
import {connect}  from 'react-redux'

import {
  Switch,
  Route,
} from 'react-router-dom'

import {
  Pane,
  Button,
  toaster
} from 'evergreen-ui'



import Statusbar            from '../statusbar'
import PrinterShow          from './show'
import Settings             from '../../settings'
import PrinterActions       from '../../../store/actions/printers'
import PrinterForm          from './form'
import {Form as AuthForm }  from '../layerkeep/form'
import Modal                from '../../modal/index'
import ErrorModal           from '../../modal/error'
import NodeAction           from '../../../store/actions/node'
import ServiceAction        from '../../../store/actions/services'
import PrinterHandler       from '../../../network/printer'

import { NodeState }  from '../../../store/reducers/state'
import { ServiceState }  from '../../../store/reducers/service'

import Prints from '../../prints'

import PubSub from 'pubsub-js'

type Props = {
  node: NodeState, 
  service: ServiceState,
  deleteService: Function,
  printerUpdated: Function,
  dispatch: Function
}

export class PrinterIndex extends React.Component<Props> {
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
    // this.setupPrinter()
    // this.getPrint()
  }

  componentWillUnmount() {
    // if (this.pubsubToken)
    //   PubSub.unsubscribe(this.pubsubToken)
    // if (this.pubsubRequestToken)
    //   PubSub.unsubscribe(this.pubsubRequestToken)
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

    // if (prevProps.service.model != this.props.service.model) {
    //   // console.log("PRINTER MODEL HAS BEEN UPDATED")
    //   this.setupPrinter()
    //   this.getPrint()
    // }
  }

  getPrint() {
    this.props.dispatch(PrinterActions.lastPrint(this.props.service))
  }


  setupPrinter() {
    if (this.props.service) {
      this.props.dispatch(PrinterActions.getState(this.props.service))
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
  }

  receiveEvent(msg, data) {
    // console.log("PV Received Event here1", msg)    
    // console.log("PV Received Event here2", data)
    // console.log(typeof(data))
    var [to, kind] = msg.split("events.")
    switch(kind) {
      case 'printer.state.changed':
          // console.log(data)
          this.props.dispatch(PrinterActions.updateState(this.props.service, data))
          // this.props.dispatch(PrinterActions.updateState(this.props.printer, {...this.props.printer.state, connected: false}))
          // this.setState({...this.state, printerState: {...this.state.printerState, open: false}})
          break
      case 'printer.connection.closed':
          this.props.dispatch(PrinterActions.updateState(this.props.service, {...this.props.service.state, connected: false}))
          // this.setState({...this.state, printerState: {...this.state.printerState, open: false}})
          break
      case 'printer.connection.opened':          
          this.props.dispatch(PrinterActions.updateState(this.props.service, {...this.props.service.state, connected: true}))
          // this.setState({...this.state, printerState: {...this.state.printerState, open: true}})
          break
      case 'printer.print.started':
          this.props.dispatch(PrinterActions.updateState(this.props.service, {...this.props.service.state, printing: true}))
          // this.setState({...this.state, printerState: {...this.state.printerState, printing: true}})
          break
      case 'printer.print.cancelled':
          this.props.dispatch(PrinterActions.updateState(this.props.service, {...this.props.service.state, printing: false}))
          // this.setState({...this.state, printerState: {...this.state.printerState, printing: false}})
          break
      case 'printer.print.failed':
          this.props.dispatch(PrinterActions.updateState(this.props.service, {...this.props.service.state, printing: false, status: "print_failed"}))
          // this.setState({...this.state, printerState: {...this.state.printerState, printing: false, status: "print_failed"}})
          break
      default:
        break
    }    
  }

  power(){
    if (this.props.service.state.connected) {
      PrinterHandler.disconnect(this.props.node, this.props.service)
      .then((response) => {
        this.props.dispatch(PrinterActions.updateState(this.props.service, {...this.props.service.state, connected: false}))
      })
    } else {
      PrinterHandler.connect(this.props.node, this.props.service)
      .then((response) => {
        console.log("CONNECT resp ", response)
        this.props.dispatch(PrinterActions.updateState(this.props.service, {...this.props.service.state, connected: true}))
        toaster.success(`Connected to ${this.props.service.name}`)
      })
      .catch((error) => {
        console.log(error)
        toaster.danger(<ErrorModal requestError={error} />)
      })
    }
  }

  getColorState() {
    if (this.props.service.state.connected) {
      return 'success'
    } else {
      return 'danger'
    }
  }

  printerSaved(resp) {
    // console.log("printer saved", resp)
    this.props.printerUpdated(this.props.node, resp.data.service_model)
  }

  saveFailed(error) {
    // console.log("save failed", error)
    if (error.response.status == 401) {
      console.log("Unauthorized")
      this.setState({showing: true, loading: false})
    } else {
    // this.setState({requestError: error})
      toaster.danger(<ErrorModal requestError={error} />)
    }
  }

  authenticated(res) {
    this.setState({showing: false})
  }

  deletePrinter() {
    console.log("DELETE PRINTER")
    this.props.deleteService(this.props.node, this.props.service)
    .catch((error) => {
      console.log(error)
      toaster.danger(<ErrorModal requestError={error} />)
    })
  }

  deleteComponent() {
    return (
      <Pane display="flex" borderTop paddingTop={20}>
        <Pane display="flex" flex={1} padding={20} marginBottom={20} className="danger-zone" alignItems="center" flexDirection="row">
          <Pane display="flex" flex={1} marginRight={50}>
            <p>
              Delete the current printer and if "Sync On LayerKeep" is checked, 
              this printer will also be deleted on Layerkeep.com; to prevent this
              uncheck "Sync On LayerKeep" and save before deleting.
            </p>
          </Pane>

          <Pane>
            <Button appearance="primary" intent="danger" height={40} onClick={() => this.deletePrinter()}> Delete </Button>
          </Pane>
        </Pane>
      </Pane>
    )
  }

  render() {
    var params = this.props.match.params;
    return (
      <div className="flex-wrapper">
        <Statusbar {...this.props} status={this.getColorState()} powerAction={this.power.bind(this)} settingsAction={() => this.props.history.push(`${this.props.match.url}/settings`) } />

        <div className="scrollable-content">
          <Switch>
              {/* <Route path={`${this.props.match.path}/new`} render={ props =>
                <PrinterNew {...this.props}  {...props}/> 
              }/> 
              <Route path={`${this.props.match.path}/:printerId/edit`} exact={true} render={ props =>
                <PrinterEdit {...this.props}  {...props} /> 
              }/>
              <Route path={`${this.props.match.path}/:printerId`} render={ props =>
                <PrinterDetails  {...this.props} {...props} /> 
              }/> */}
              <Route path={`${this.props.match.path}/prints`} render={ props => 
                <Prints {...this.props} {...props}  /> 
              }/>
              <Route path={`${this.props.match.path}/settings`} render={ props => 
                <Settings {...this.props} {...props} forms={[
                  <PrinterForm onSave={this.printerSaved.bind(this)} onError={this.saveFailed.bind(this)} data={this.props.service.model} {...this.props} {...props}/>, 
                  this.deleteComponent()
                ]} /> 
              }/>

              <Route path={`${this.props.match.path}`} render={ props => 
                <PrinterShow {...this.props}  {...props} />  
              }/>
            </Switch>
        </div>
        <Modal
          component={AuthForm}
          node={this.props.node}
          // requestError={this.state.requestError}
          isActive={this.state.showing}
          dismissAction={this.authenticated.bind(this)}
          onAuthenticated={this.authenticated.bind(this)}
        />
      </div>
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
    deleteService: (node, service) => dispatch(ServiceAction.deleteService(node, service)),
    printerUpdated: (node, service) => dispatch(NodeAction.printerUpdated(node, service)),
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(PrinterIndex)
