//
//  index.ts
//  ancilla
// 
//  Created by Wess Cope (me@wess.io) on 10/31/19
//  Copyright 2019 Wess Cope
//

import React from 'react'

import {
  Pane,
  Dialog,
  TextInput,
  Combobox,
  toaster
} from 'evergreen-ui'

import Tree from '../tree'

import {
  Printer
} from '../../models'

import printer, {default as request} from '../../network/printer'

export default class SubNav extends React.Component {
  baudrates = [
    '2000000',
    '1500000',
    '1382400',
    '1000000',
    '921600',
    '500000',
    '460800',
    '256000',
    '250000',
    '230400',
    '128000',
    '115200',
    '111112',
    '76800',
    '57000',
    '56000',
    '38400',
    '28800',
    '19200',
    '14400',
    '9600' 
  ]
  state = {
    ports:    Array<string>(),
    printers: Array<Printer>(),
    errors:   Array<string>(),
    devices:  [],
    dialog: {
      printer: {
        showing: false,
        loading: false
      },
      device: {
        showing: false,
        loading: false
      },
      ports: {
        loading: false
      }
    },
    newPrinter: {
      name:     '',
      port:     '',
      baudrate: ''
    }
  }

  constructor(props:any) {
    super(props)

    this.togglePrinter      = this.togglePrinter.bind(this)
    this.toggleDevice       = this.toggleDevice.bind(this)
    this.renderPrinters     = this.renderPrinters.bind(this)
    this.renderDevices      = this.renderDevices.bind(this)
    this.renderNodes        = this.renderNodes.bind(this)
    
    this.savePrinter        = this.savePrinter.bind(this)
    this.renderPrinterForm  = this.renderPrinterForm.bind(this)
  }


  componentDidMount() {
    printer.ports()
    .then(res => {
      let ports = res.data['ports'] || []

      this.setState({
        ports: ports
      })
    })
    .catch((err) => {
      console.log(err)
    })

    printer.list()
    .then(res => {
      let printers = res.data['printers'].map((printer) => {return {name: printer.name, port: printer.port, id: printer.id}})

      this.setState({
        printers: printers
      })
    })
    .catch((err) => {
      toaster.danger(err)
    })
  }

  togglePrinter(showing:boolean = false, loading:boolean = false) {
    this.setState({
      dialog: {
        ...this.state.dialog,
        printer: {
          showing: showing,
          loading: loading
        }
      }
    })
  }

  toggleDevice(showing:boolean = false, loading:boolean = false) {
    this.setState({
      dialog: {
        ...this.state.dialog,
        device: {
          showing: showing,
          loading: loading
        }
      }
    })
  }

  savePrinter() {
    console.log("Here we go")

    let name = this.state.newPrinter.name || this.state.newPrinter.port

    this.setState({
      dialog: {
        ...this.state.dialog,
        printer: {
          ...this.state.dialog.printer,
          loading: true
        }
      }
    })


    request.create({
      name:       name,
      port:       this.state.newPrinter.port,
      baud_rate:  this.state.newPrinter.baudrate
    })
    .then((response) => {
      console.log(response)

      this.setState({
        dialog: {
          ...this.state.dialog,
          printer: {
            loading: false,
            showing: true
          }
        }
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

  renderPrinterForm() {
    return (
      <Pane>
        <TextInput 
          name="name" 
          placeholder="Printer name" 
          marginBottom={4}  
          width="100%" 
          height={48}
          value={this.state.newPrinter.name}
          onChange={e => 
            this.setState({
              newPrinter: {
                ...this.state.newPrinter,
                name: e.target.value     
              }
            })
          }
        />

        <Combobox 
          openOnFocus 
          items={this.state.ports} 
          placeholder={this.state.ports.length > 0? "Ports" : "No ports found"} 
          marginTop={4} 
          marginBottom={4}  
          width="100%" 
          height={48}
          isLoading={this.state.dialog.ports.loading}
          disabled={this.state.ports.length < 1}
          onChange={selected => 
            this.setState({
              newPrinter: {
                ...this.state.newPrinter,
                port: selected
              }
            })
          }
        />

        <Combobox 
          openOnFocus 
          items={this.baudrates} 
          placeholder="Baudrate" 
          marginTop={4}  
          width="100%" 
          height={48} 
          initialSelectedItem={this.state.newPrinter.baudrate}
          onChange={selected => 
            this.setState({
              newPrinter: {
                ...this.state.newPrinter,
                baudrate: selected
              }
            })
          }
        />
      </Pane>
    )
  }

  renderPrinters() {
    

    let names =  this.state.printers.length > 0 ? 
      this.state.printers.map((printer) =>  printer.name) :
      ["No printers found."]

    console.log("render printers: ", names)
    return ( 
      <React.Fragment key="printers">
        <Dialog
          isShown={this.state.dialog.printer.showing}
          title="Add Printer"
          confirmLabel="Save"
          onCloseComplete={() => this.togglePrinter(false, false)}
          onConfirm={this.savePrinter}
        >
          {this.renderPrinterForm}
        </Dialog>

        <Tree.Node name="Printers" key="printers" children={names} addAction={() => this.togglePrinter(true, false)} />
      </React.Fragment>
    )
  }

  renderDevices() {
    let names =  this.state.printers.length > 0 ? 
      this.state.printers.map((printer) =>  printer.name) :
      ["No Devices added."]

      return (
        <React.Fragment key="devices">
          <Dialog
            isShown={this.state.dialog.device.showing}
            title="Add Device"
            confirmLabel="Save"
            onCloseComplete={() => this.toggleDevice(false, false)}
          >
            Content
          </Dialog>
  
          <Tree.Node name="Devices" key="devices" children={names} addAction={() => this.toggleDevice(true, false)} />
        </React.Fragment>
      )
    }
  
  renderNodes() {
    return [
       this.renderPrinters(),
       this.renderDevices()
    ]
  }

  render() {
    return (
      <Pane margin={0} padding={0} height="100%" display="flex" flexDirection="column" background="#425A70">
        <Pane width={180} padding={0} margin={0}>
          <br/>
          {this.renderNodes()}
        </Pane>

      </Pane>
    )
  }
}

