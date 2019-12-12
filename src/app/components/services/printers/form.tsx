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
  Checkbox,
  toaster
} from 'evergreen-ui'

import printer, {default as request} from '../../../network/printer'

export default class Form extends React.Component<{save:Function, data:object, loading:boolean}> {
  state = {
    newPrinter: {
      name:     '',
      port:     '',
      baud_rate: '',
      model: '',
      description: '',
      layerkeep_sync: false
    },
    layerkeep_sync: true,
    loadingPorts: true,
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
    console.log("COMPONENT DID MOUNT", this.props.data)
    if (this.props.data) {
      var data = this.props.data || {}
      this.setState({newPrinter: {...this.state.newPrinter, ...data}})
    }
    printer.ports()
    .then(res => {
      let ports = res.data['ports'] || []

      this.setState({
        ports: ports,
        loadingPorts: false
      })
    })
    .catch((err) => {
      console.log(err)
      this.setState({
        loadingPorts: false
      })
    })

    // this.setState({
    //   printers: this.props.printers.data['printers'].map((printer) => {
    //     return {name: printer.name, port: printer.port, id: printer.id}
    //   })
    // })

    // printer.list(this.props.)
    // .then(res => {
    //   this.setState({
    //     printers: res.data['printers'].map((printer) => {
    //       return {name: printer.name, port: printer.port, id: printer.id}
    //     })
    //   })
    // })
    // .catch((err) => {
    //   toaster.danger(err)
    // })
  }

  componentDidUpdate(prevProps, prevState) {
    console.log("COMPONENT DID UPdate", prevProps, prevState)
  }

  save() {
    this.props.save(this.values)
  }

  render() {
    return (
      <Pane width={"100%"}>
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
          isLoading={this.state.loadingPorts}
          selectedItem={this.state.newPrinter.port}
          initialSelectedItem={this.state.newPrinter.port}
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
          selectedItem={this.state.newPrinter.baud_rate}
          initialSelectedItem={this.state.newPrinter.baud_rate}
          onChange={selected => 
            this.setState({
              newPrinter: {
                ...this.state.newPrinter,
                baud_rate: selected
              }
            })
          }
        />
        
        <div>
        <TextInput 
          name="model" 
          placeholder="Model Name (optional)" 
          marginBottom={4}  
          width="100%" 
          height={48}
          value={this.state.newPrinter.model}
          onChange={e => 
            this.setState({
              newPrinter: {
                ...this.state.newPrinter,
                model: e.target.value     
              }
            })
          }
        />
        </div>
        

        <TextInput 
          name="description" 
          placeholder="Description (optional)" 
          marginBottom={4}  
          width="100%" 
          height={48}
          value={this.state.newPrinter.description}
          onChange={e => 
            this.setState({
              newPrinter: {
                ...this.state.newPrinter,
                description: e.target.value     
              }
            })
          }
        />

        <Checkbox
          label="Create On LayerKeep"
          checked={this.state.newPrinter.layerkeep_sync}
          onChange={e => 
            this.setState({
              newPrinter: {
                ...this.state.newPrinter,
                layerkeep_sync: e.target.checked
              }
            })
          }
        />
      </Pane>
    )
  }
}
