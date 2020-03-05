//
//  new.tsx
//  ancilla
// 
//  Created by Kevin Musselman (kevin@frenzylabs.com) on 01/15/20
//  Copyright 2019 FrenzyLabs, LLC.
//


import React from 'react'
import { Link, Redirect }       from 'react-router-dom';
import {connect}  from 'react-redux'

import {
  Pane,
  Dialog,
  Heading,
  Button,
  toaster
} from 'evergreen-ui'

import {
  Printer
} from '../../../models'

import Modal from '../../modal/index'
import ErrorModal from '../../modal/error'
import Form from './form'
import { NodeAction } from '../../../store/actions/node'
import {Form as AuthForm } from '../../services/layerkeep/form'
import printer, {default as request} from '../../../network/printer'

import { NodeState, PrinterState }  from '../../../store/state'


type Props = {
  node: NodeState,
  printer: PrinterState,
  history: any,
  listPrinters: Function,
  addPrinter: Function
}

export class PrinterNew extends React.Component<Props> {  
  state = {
    printers: Array<Printer>(),
    showing: false,
    loading: false
  }
  form: Form = null

  constructor(props:any) {
    super(props)    

    this.toggleDialog = this.toggleDialog.bind(this)
    this.onSave       = this.onSave.bind(this)
    this.onError      = this.onError.bind(this)
    // this.getPrinters  = this.getPrinters.bind(this)
  }

  componentDidMount() {
    // this.props.listPrinters()
    // this.getPrinters()
  }

  // componentDidUpdate(op, os) {
  //   console.log("did update porps", op)
  //   console.log("did update stae", os)
  // }

  toggleDialog(show:boolean) {
    this.setState({
      ...this.state,
      showing: show
    })
  }

  onSave(response) {
    this.props.addPrinter(this.props.node, response.data.printer) 
    console.dir(response.data)

    if(response.data['printer']) {
      this.selectPrinter(response.data['printer'])
    }
  }

  onError(error) {
    if (error.response.status == 401) {
      console.log("Unauthorized")
      this.setState({showing: true, loading: false})
    } else {
      // this.setState({requestError: error})
      toaster.danger(<ErrorModal requestError={error} />)
    }
  }

  authenticated(res) {
    console.log("Authenticated", res)
    this.setState({showing: false})
    
  }

  selectPrinter(item) {
    let url = `/printers/${item.id}`
    this.props.history.push(`${url}`);    
  }

  // renderError() {
  //   if (this.state.requestError) {
  //     return (<Pane background="redTint" border marginBottom={10} padding={10}>
  //       <ErrorModal requestError={this.state.requestError} />
  //     </Pane>)
  //   }
  // }

  render() {
    let printers = this.props.node.services.filter((item) => item.kind == "printer") //Object.values(this.props.printers)
    let items =  printers.length > 0 ? printers : [{name: "No printers found."}]
    
    return ( 
      <Pane padding={40}>
        <Pane display="flex" is="section" flexDirection="column" padding={30} background="white" borderRadius={3} border>
          <Pane flex={1} alignItems="center" display="flex" marginBottom={20}>
            <Heading size={700}>Add Printer</Heading>
          </Pane>
          <Pane flex={1} alignItems="center" display="flex">
            <Form ref={frm => this.form = frm} node={this.props.node} onSave={this.onSave} onError={this.onError}/>        
          </Pane>
        </Pane>
          
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
      </Pane>
    )
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
    addPrinter: (node, printer) => dispatch(NodeAction.addPrinter(node, printer)),
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(PrinterNew)

// export default PrinterNew
