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
  Button
} from 'evergreen-ui'


import printer, {default as request} from '../../../network/printer'

export default class Form extends React.Component<{save:Function, loading:boolean}> {
  state = {
    newPrinter: {
      name:     '',
      port:     '',
      baud_rate: '',
      layerkeep_sync: false
    },
    layerkeep_sync: true,
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

  constructor(props:any) {
    super(props)

    this.save = this.save.bind(this)
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
        ports: ports,
      })
    })
    .catch((err) => {
      console.log(err)
    })

  }

  save() {
    if(this.props.save  == undefined) {
      alert("No save function given")
      return
    }

    this.props.save(this.values)
  }

  render() {
    return (
      <Pane>
        <TextInput 
          name="name" 
          value={this.props.service.model.name || ""}
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
          initialSelectedItem={this.props.service.model.model.port}
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
          initialSelectedItem={this.props.service.model.model.baud_rate}
          placeholder="Baudrate" 
          marginTop={4} 
          marginBottom={4}  
          width="100%" 
          height={48} 
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
          value={this.props.service.model.model.model || ""}
          placeholder="Model Name (optional)" 
          marginTop={4} 
          marginBottom={4}  
          width="100%" 
          height={48}
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
          value={this.props.service.model.model.description || ""}
          placeholder="Description (optional)" 
          marginTop={4} 
          marginBottom={4}  
          width="100%" 
          height={48}
          onChange={e => 
            this.setState({
              newPrinter: {
                ...this.state.newPrinter,
                description: e.target.value     
              }
            })
          }
        />

        <Pane display="flex" marginTop={20}>
          <Pane display="flex" flex={1}>
            <Checkbox
              label="Sync On LayerKeep"
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
          
          <Pane paddingTop={6}>
            <Button appearance="primary" onClick={this.save}>Save</Button>
          </Pane>
        </Pane>
      </Pane>
    )
  }
}
