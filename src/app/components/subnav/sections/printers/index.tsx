//
//  printers.tsx
//  ancilla
// 
//  Created by Wess Cope (me@wess.io) on 11/08/19
//  Copyright 2019 Wess Cope
//

import React from 'react'
import {connect}  from 'react-redux'

import {
  Dialog,
  toaster
} from 'evergreen-ui'

import {
  Printer
} from '../../../../models'

import Tree from '../../../tree'
import { NodeAction } from '../../../../store/actions/node'

import {Form as AuthForm } from '../../../services/layerkeep/form'
import printer, {default as request} from '../../../../network/printer'
import { PrinterState }  from '../../../../store/reducers/printers'

type Props = {
  node: object,
  printer: PrinterState,
  listPrinters: Function
}

export class Printers extends React.Component<Props> {  
  state = {
    printers: Array<Printer>(),
    showing: false,
    loading: false,
    auth_showing: false,
    printerParams: {}
  }
  form: Form = null

  constructor(props:any) {
    super(props)    

    // this.savePrinter  = this.savePrinter.bind(this)
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

  // savePrinter(closeDialog) {

  //   this.setState({
  //     ...this.state,
  //     loading: true
  //   })

  //   var printerParams = this.form.state.newPrinter
  //   request.create(this.props.node, this.form.state.newPrinter)
  //   .then((response) => {
  //     console.log(response)

  //     this.setState({
  //       loading: false
  //     })
  //     this.props.addPrinter(this.props.node, response.data.printer)
  //     closeDialog()
  //     toaster.success(`Printer ${name} has been successfully added`)
  //   })
  //   .catch((error) => {
  //     console.log(error)

  //     if (error.response.status == 401) {
  //       console.log("Unauthorized")
  //       this.setState({auth_showing: true, showing: false, printerParams: printerParams})
  //     }
  //     let errors = Object.keys(error.response.data.errors).map((key, index) => {
  //       return  `${key} : ${error.response.data.errors[key]}\n`
  //     })

  //     this.setState({
  //       loading: false
  //     })

  //     toaster.danger(
  //       `Unable to save printer ${name}`, 
  //       {description: errors}
  //     )
  //   })
  // }

  addPrinter() {
    let url = `/printers/new`
    this.props.history.push(`${url}`);    
  }

  selectPrinter(item) {
    let url = `/printers/${item.id}`
    this.props.history.push(`${url}`);    
  }
  authenticated(res, closeDialog) {
    console.log("Authenticated", res)
    this.setState({auth_showing: false, showing: true})
    
  }


  render() {
    let printers = this.props.node.services.filter((item) => item.kind == "printer") //Object.values(this.props.printers)
    let items =  printers.length > 0 ? printers : [{name: "No printers found."}]
    
    return ( 
      <React.Fragment key="printers">
        

        <Tree.Node name="Printers" key="printers" children={items} addAction={() => this.addPrinter()} selectItem={this.selectPrinter.bind(this)} />
      </React.Fragment>
    )
  }
}


const mapStateToProps = (state) => {
  // return state
  return {
    printers: state.activeNode.printers
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    listPrinters: () => dispatch(NodeAction.listPrinters())
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(Printers)