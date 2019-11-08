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

  constructor(props:any) {
    super(props)

    this.toggleDialog = this.toggleDialog.bind(this)
    this.savePrinter  = this.savePrinter.bind(this)
  }

  toggleDialog(show:boolean) {
    this.setState({
      ...this.state,
      showing: show
    })
  }

  savePrinter(printer:{name:string, port:string, baudrate:string}) {

    this.setState({
      ...this.state,
      loading: true
    })


    request.create({
      name:       printer.name,
      port:       printer.port,
      baud_rate:  printer.baudrate
    })
    .then((response) => {
      console.log(response)

      this.setState({
        loading: false
      })

      toaster.success(`Printer ${name} has been successfully added`)
    })
    .catch((error) => {
      console.log(error)

      let errors = Object.keys(error.response.data.errors).map((key, index) => {
        return  `${key} : ${error.response.data.errors[key]}<br/>`
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
          <Form save={this.savePrinter} loading={this.state.loading}/>
        </Dialog>

        <Tree.Node name="Printers" key="printers" children={names} addAction={() => this.toggleDialog(true)} />
      </React.Fragment>
    )
  }
}
