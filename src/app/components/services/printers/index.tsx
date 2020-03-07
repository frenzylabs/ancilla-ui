//
//  index.tsx
//  ancilla
// 
//  Created by Kevin Musselman (kevin@frenzylabs.com) on 01/08/20
//  Copyright 2019 FrenzyLabs, LLC.
//


import React      from 'react'
import {connect}  from 'react-redux'
import { Link }   from 'react-router-dom'

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
import SettingsForm         from './settings_form'
import {Form as AuthForm }  from '../layerkeep/form'

import Modal                from '../../modal/index'
import ErrorModal           from '../../modal/error'
import NodeAction           from '../../../store/actions/node'
import ServiceAction        from '../../../store/actions/services'
import PrinterHandler       from '../../../network/printer'

import { NodeState, PrinterState }  from '../../../store/state'

import Prints from '../../prints'
import Logs from '../../logs'

import PubSub from 'pubsub-js'

type Props = {
  node: NodeState, 
  service: PrinterState,
  match: any,
  history: any,
  deleteService: Function,
  printerUpdated: Function,
  dispatch: Function
}

type StateProps = {
  showing: boolean
}

export class PrinterIndex extends React.Component<Props, StateProps> {
  requestTopic = ''
  eventTopic = ''
  pubsubRequestToken = null
  pubsubToken        = null

  constructor(props:any) {
    super(props)

    
    this.state = {
      showing: false
    }

  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }  

  componentDidUpdate(prevProps, prevState) {
  }

  power(){
    this.props.dispatch(PrinterActions.updateState(this.props.service, {...this.props.service.state, togglingPower: true}))
    if (this.props.service.state["connected"]) {      
      PrinterHandler.disconnect(this.props.node, this.props.service)
      .then((response) => {
        this.props.dispatch(PrinterActions.updateState(this.props.service, {...this.props.service.state, connected: false, togglingPower: false}))
      })
      .catch((error) => {
        this.props.dispatch(PrinterActions.updateState(this.props.service, {...this.props.service.state, togglingPower: false}))
        toaster.danger(<ErrorModal requestError={error} />)
      })
    } else {
      PrinterHandler.connect(this.props.node, this.props.service)
      .then((response) => {
        this.props.dispatch(PrinterActions.updateState(this.props.service, {...this.props.service.state, connected: true, togglingPower: false}))
        toaster.success(`Connected to ${this.props.service.name}`)
      })
      .catch((error) => {
        this.props.dispatch(PrinterActions.updateState(this.props.service, {...this.props.service.state, togglingPower: false}))
        toaster.danger(<ErrorModal requestError={error} />)
      })
    }
  }

  getColorState() {
    if (this.props.service.state["connected"]) {
      return 'success'
    } else {
      return 'danger'
    }
  }

  printerSaved(resp) {
    this.props.printerUpdated(this.props.node, resp.data.service_model)
  }

  saveFailed(error) {
    if (error.response.status == 401) {
      this.setState({showing: true})
    } else {
      toaster.danger(<ErrorModal requestError={error} />)
    }
  }

  authenticated(res) {
    this.setState({showing: false})
  }

  deletePrinter() {
    this.props.deleteService(this.props.node, this.props.service)
    .catch((error) => {
      toaster.danger(<ErrorModal requestError={error} />)
    })
  }

  deleteComponent() {
    return (
      <Pane key="delete" display="flex" borderTop paddingTop={20}>
        <Pane display="flex" flex={1} padding={20} marginBottom={20} className="danger-zone" alignItems="center" flexDirection="row">
          <Pane display="flex" flex={1} marginRight={50}>
            <p>
              Delete the current printer and prints.  If "Sync On LayerKeep" is checked, 
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

  settingsTitle() {
    return (
      <Pane>
        <Link to={this.props.match.url}>{this.props.service.name}</Link> &nbsp; / &nbsp;
        Settings
      </Pane>
    )
  }

  render() {
    var powerOption = {
      state: (this.props.service.state["togglingPower"] == true ? "waiting" : "active"),
      action: this.power.bind(this)
    }
    var params = this.props.match["params"];
    return (
      <div className="flex-wrapper">
        <Statusbar {...this.props} status={this.getColorState()} powerOption={powerOption} settingsAction={() => this.props.history.push(`${this.props.match.url}/settings`) } />

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
              <Route path={`${this.props.match.path}/logs`} render={ props => 
                <Logs {...this.props} {...props}  /> 
              }/>
              <Route path={`${this.props.match.path}/prints`} render={ props => 
                <Prints {...this.props} {...props}  /> 
              }/>
              <Route path={`${this.props.match.path}/settings`} render={ props => 
                <Settings {...this.props} {...props} title={this.settingsTitle()} forms={[
                  {"key": "General", "component": 
                    [<PrinterForm key="general" onSave={this.printerSaved.bind(this)} onError={this.saveFailed.bind(this)} data={this.props.service.model} {...this.props} {...props} />,
                      this.deleteComponent()
                    ]},
                    {
                      "key": "Logging", "component": 
                      <SettingsForm key="logging" kind="logging" onSave={this.printerSaved.bind(this)} onError={this.saveFailed.bind(this)} data={this.props.service.model} {...this.props} {...props} />
                    },
                    {
                      "key": "Advanced", "component": 
                      <SettingsForm key="advanced" kind="advanced" onSave={this.printerSaved.bind(this)} onError={this.saveFailed.bind(this)} data={this.props.service.model} {...this.props} {...props} />
                    }
                  
                ]}/> 
     
              }/>

              <Route path={`${this.props.match.path}`} render={ props => 
                <PrinterShow {...this.props}  {...props} />  
              }/>
            </Switch>
        </div>
        <Modal
          component={AuthForm}
          componentProps={{
            node: this.props.node,
            onAuthenticated: this.authenticated.bind(this)
          }}
          
          // requestError={this.state.requestError}
          isActive={this.state.showing}
          dismissAction={this.authenticated.bind(this)}
          
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
    dispatch: dispatch
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(PrinterIndex)
