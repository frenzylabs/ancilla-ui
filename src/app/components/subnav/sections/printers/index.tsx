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
import Form from './form'
import { NodeAction } from '../../../../store/reducers/nodes'

import printer, {default as request} from '../../../../network/printer'

export class Printers extends React.Component {  
  state = {
    printers: Array<Printer>(),
    showing: false,
    loading: false
  }
  form: Form = {}

  constructor(props:any) {
    super(props)    

    this.toggleDialog = this.toggleDialog.bind(this)
    this.savePrinter  = this.savePrinter.bind(this)
    this.getPrinters  = this.getPrinters.bind(this)
    window.prn = this
  }

  componentDidMount() {
    this.props.listPrinters()
    // this.getPrinters()

  }

  componentDidUpdate(op, os) {
    console.log("did update porps", op)
    console.log("did update stae", os)
  }

  toggleDialog(show:boolean) {
    this.setState({
      ...this.state,
      showing: show
    })
  }

  getPrinters() {
    request.list()
    .then((response) => {
      if (response.data && response.data.printers) {
        this.setState({printers: response.data.printers})
      }
    })
  }

  savePrinter(closeDialog) {

    this.setState({
      ...this.state,
      loading: true
    })


    request.create(this.form.state.newPrinter)
    .then((response) => {
      console.log(response)

      this.setState({
        loading: false
      })
      closeDialog()
      toaster.success(`Printer ${name} has been successfully added`)
    })
    .catch((error) => {
      console.log(error)

      let errors = Object.keys(error.response.data.errors).map((key, index) => {
        return  `${key} : ${error.response.data.errors[key]}\n`
      })

      this.setState({
        loading: false
      })

      toaster.danger(
        `Unable to save printer ${name}`, 
        {description: errors}
      )
    })
  }

  selectPrinter(item) {
    console.log("Selected Printer", item)
    let url = `/printers/${item.id}`
    console.log(this.props)
    this.props.history.push(`${url}`);
    
  }

  render() {
    let printers = this.props.printers //Object.values(this.props.printers)
    let items =  printers.length > 0 ? printers : [{name: "No printers found."}]
    
    return ( 
      <React.Fragment key="printers">
        <Dialog
          isShown={this.state.showing}
          title="Add Printer"
          confirmLabel="Save"
          onCloseComplete={() => this.toggleDialog(false)}
          onConfirm={this.savePrinter}
        >
          <Form ref={frm => this.form = frm} save={this.savePrinter} loading={this.state.loading}/>
        </Dialog>

        <Tree.Node name="Printers" key="printers" children={items} addAction={() => this.toggleDialog(true)} selectItem={this.selectPrinter.bind(this)} />
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