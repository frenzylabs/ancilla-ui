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
  Button,
  toaster
} from 'evergreen-ui'

import printer, {default as request} from '../../../network/printer'

type Props = {
  save:Function, 
  data: Object, 
  onSave: Function, 
  onError: Function
}

export default class Form extends React.Component<Props> {
  state = {
    newPrinter: {
      name:     '',
      port:     '',
      baud_rate: '',
      model: '',
      description: '',
      layerkeep_sync: false
    },
    loadingPorts: true,
    loading: false,
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
    this.savePrinter = this.savePrinter.bind(this)
  }

  get values():{name?:string, port:string, baudrate:string} {
    return {
      name:     this.state.name.length > 0 ? this.state.name : this.state.port,
      port:     this.state.port,
      baudrate: this.state.baudrate
    }
  }

  componentDidMount() {
    if (this.props.data) {
      var data = this.props.data.model || {}
      
      if (data.layerkeep_id) {
        data.layerkeep_sync = true
      }
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

  }

  // componentDidUpdate(prevProps, prevState) {
  //   console.log("COMPONENT DID UPdate", prevProps, prevState)
  // }
  savePrinter() {

    this.setState({
      ...this.state,
      loading: true
    })

    var req;
    if (this.props.data && this.props.data.id) {
      req = request.update(this.props.node, this.props.data.id, this.state.newPrinter)
    } else {
      req = request.create(this.props.node, this.state.newPrinter)
    }

    req.then((response) => {
      this.setState({
        loading: false
      })
      if (this.props.onSave) {
        this.props.onSave(response)
      }
      toaster.success(`Printer ${name} has been successfully saved`)
    })
    .catch((error) => {
      console.log(error)
      if (this.props.onError) {
        this.props.onError(error)
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
      }
      this.setState({
        loading: false
      })
    })
  }

  save() {
    if(this.props.save  == undefined) {
      // alert("No save function given")
      this.savePrinter()
      // return
    } else {
      this.props.save(this.values)
    }
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
          marginBottom={4}  
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
          marginTop={4} 
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
          marginTop={4} 
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
        </Pane>
        <Pane paddingTop={6}>
            <Button isLoading={this.state.loading} appearance="primary" onClick={this.save}>Save</Button>
          </Pane>
      </Pane>
    )
  }
}
