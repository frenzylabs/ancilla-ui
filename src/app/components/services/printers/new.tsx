//
//  printers.tsx
//  ancilla
// 
//  Created by Wess Cope (me@wess.io) on 11/08/19
//  Copyright 2019 Wess Cope
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
import Form from './form'
import { NodeAction } from '../../../store/actions/node'
import {Form as AuthForm } from '../../services/layerkeep/form'
import printer, {default as request} from '../../../network/printer'
import { PrinterState }  from '../../../store/reducers/printers'


type Props = {
  node: object,
  printer: PrinterState,
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
    this.savePrinter  = this.savePrinter.bind(this)
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

  savePrinter(closeDialog) {

    this.setState({
      ...this.state,
      loading: true
    })


    request.create(this.props.node, this.form.state.newPrinter)
    .then((response) => {
      console.log(response)

      this.setState({
        loading: false
      })
      this.props.addPrinter(this.props.node, response.data.printer)
      closeDialog()
      toaster.success(`Printer ${name} has been successfully added`)
    })
    .catch((error) => {
      console.log(error)

      
      if (error.response.status == 401) {
        console.log("Unauthorized")
        this.setState({showing: true, loading: false})
      }
      else {
        var errors = [""]
        if (error.response.data && error.response.data.errors) {
            errors = Object.keys(error.response.data.errors).map((key, index) => {
              return  `${key} : ${error.response.data.errors[key]}\n`
            })
        }

        toaster.danger(
          `Unable to save printer ${name}`, 
          {description: errors}
        )
        this.setState({
          loading: false
        })
      }
    })
  }

  authenticated(res) {
    console.log("Authenticated", res)
    this.setState({showing: false})
    
  }

  selectPrinter(item) {
    let url = `/printers/${item.id}`
    this.props.history.push(`${url}`);    
  }

  // renderDialog() {
  //   if (this.state.showing) {
  //     return (<Dialog
  //         isShown={this.state.showing}
  //         title="Login to Layerkeep"
  //         confirmLabel="Login"
  //         onCloseComplete={() => this.setState({showing: false})}
  //         hasFooter={false}
          
  //       >
  //         {({ close }) => (
  //           <AuthForm onSave={(res) => this.authenticated(res, close) } loading={this.state.loading}/>
  //       )}

          
  //       </Dialog>)
  //   }
  // }

  render() {
    let printers = this.props.node.services.filter((item) => item.kind == "printer") //Object.values(this.props.printers)
    let items =  printers.length > 0 ? printers : [{name: "No printers found."}]
    
    return ( 
      <div>
      <Pane display="flex" is="section" flexDirection="column" padding={16} background="tint2" borderRadius={3}>
        <Pane flex={1} alignItems="center" display="flex">
          <Heading >Add Printer</Heading>
        </Pane>
        <Pane flex={1} alignItems="center" display="flex">
          <Form ref={frm => this.form = frm} save={this.savePrinter} loading={this.state.loading}/>        
        </Pane>
        <Pane>
          {/* Below you can see the marginRight property on a Button. */}
          {/* <Button marginRight={16} >Button</Button> */}
          <Button appearance="primary" onClick={() => this.savePrinter()}>Save</Button>
        </Pane>
      </Pane>
        
      <Modal
          component={AuthForm}
          node={this.props.node}
          // requestError={this.state.requestError}
          isActive={this.state.showing}
          dismissAction={this.authenticated.bind(this)}
          onAuthenticated={this.authenticated.bind(this)}
        />



        </div>
    )
  }
}


// const mapStateToProps = (state) => {
//   // return state
//   return {
//     printers: state.activeNode.printers
//   }
// }

// const mapDispatchToProps = (dispatch) => {
//   return {
//     listPrinters: () => dispatch(NodeAction.listPrinters()),
//     addPrinter: (node, printer) => dispatch(NodeAction.addPrinter(node, printer)),
//   }
// }


// export default connect(mapStateToProps, mapDispatchToProps)(PrinterNew)

export default PrinterNew
