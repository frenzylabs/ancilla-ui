//
//  printers.tsx
//  ancilla
// 
//  Created by Wess Cope (me@wess.io) on 11/08/19
//  Copyright 2019 Wess Cope
//

import React from 'react'

import {
  Dialog,
  toaster
} from 'evergreen-ui'

import {
  Printer
} from '../../../../models'

import Tree from '../../../tree'
import Form from './form'

import printer, {default as request} from '../../../../network/printer'

export default class Printers extends React.Component {  
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
  }

  componentDidMount() {
    this.getPrinters()
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
      console.log(response)
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

  render() {
    let names =  this.state.printers.length > 0 ? this.state.printers.map((printer) =>  printer.name) : ["No printers found."]

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

        <Tree.Node name="Printers" key="printers" children={names} addAction={() => this.toggleDialog(true)} />
      </React.Fragment>
    )
  }
}
