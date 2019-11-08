//
//  form.tsx
//  ancilla
// 
//  Created by Wess Cope (me@wess.io) on 11/08/19
//  Copyright 2019 Wess Cope
//

import React from 'react'

import {
  Pane,
  TextInput,
  Combobox,
  toaster
} from 'evergreen-ui'

import printer, {default as request} from '../../../../network/printer'

export default class Form extends React.Component<{save:Function, loading:boolean}> {
  state = {
    newPrinter: {
      name:     '',
      port:     '',
      baud_rate: ''
    },
    name:     '',
    port:     '',
    baudrate: '',
    ports: Array<string>(),
    baudrates: [
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
  }

  get values():{name?:string, port:string, baudrate:string} {
    return {
      name:     this.state.name.length > 0 ? this.state.name : this.state.port,
      port:     this.state.port,
      baudrate: this.state.baudrate
    }
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
      this.setState({
        printers: res.data['printers'].map((printer) => {
          return {name: printer.name, port: printer.port, id: printer.id}
        })
      })
    })
    .catch((err) => {
      toaster.danger(err)
    })
  }

  save() {
    this.props.save(this.values)
  }

  render() {
    return (
      <Pane>
        <TextInput 
          name="name" 
          placeholder="Printer name" 
          marginBottom={4}  
          width="100%" 
          height={48}
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
          isLoading={this.props.loading}
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
          items={this.state.baudrates} 
          placeholder="Baudrate" 
          marginTop={4}  
          width="100%" 
          height={48} 
          initialSelectedItem={this.state.baudrate}
          onChange={selected => 
            this.setState({
              newPrinter: {
                ...this.state.newPrinter,
                baud_rate: selected
              }
            })
          }
        />
      </Pane>
    )
  }
}
