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
  Label,
  Combobox,
  Checkbox,
  Button,
  toaster
} from 'evergreen-ui'

import printer, {default as request} from '../../../network/printer'
import { NodeState, PrinterState }  from '../../../store/state'

type Props = {
  node: NodeState,
  save?:Function, 
  data?: any, 
  onSave?: Function, 
  onError: Function
}

export default class Form extends React.Component<Props> {
  state = {
    nodeAttrs: {
      name:     '',
      description: '',
      settings: {}
    },
    loading: false,
    name:     '',
    port:     '',
    baudrate: ''    
  }

  constructor(props:any) {
    super(props)

    this.save = this.save.bind(this)
    // this.saveNode = this.savePrinter.bind(this)
  }

  // get values():{name?:string, port:string, baudrate:string} {
  //   return {
  //     name:     this.state.name.length > 0 ? this.state.name : this.state.port,
  //     description:   this.state.description,
  //     settings: this.state.settings
  //   }
  // }

  componentDidMount() {
    if (this.props.data) {
      var data = this.props.data || {}
      if (!data.description)
        data.description = ""
      
      this.setState({nodeAttrs: {...this.state.nodeAttrs, ...data}})
    }
  }

  componentDidUpdate(prevProps, prevState) {    
    if (!prevProps.data && this.props.data) {
      var data = this.props.data || {}
      if (!data.description)
        data.description = ""
      this.setState({nodeAttrs: {...this.state.nodeAttrs, ...data}})
    }
  }

  // savePrinter() {

  //   this.setState({
  //     ...this.state,
  //     loading: true
  //   })

  //   var req;
  //   if (this.props.data && this.props.data.id) {
  //     req = request.update(this.props.node, this.props.data.id, this.state.newPrinter)
  //   } else {
  //     req = request.create(this.props.node, this.state.newPrinter)
  //   }

  //   req.then((response) => {
  //     this.setState({
  //       loading: false
  //     })
  //     if (this.props.onSave) {
  //       this.props.onSave(response)
  //     }
  //     toaster.success(`Printer ${name} has been successfully saved`)
  //   })
  //   .catch((error) => {
  //     console.log(error)
  //     if (this.props.onError) {
  //       this.props.onError(error)
  //     }
  //     else {
  //       var errors = [""]
  //       if (error.response.data && error.response.data.errors) {
  //           errors = Object.keys(error.response.data.errors).map((key, index) => {
  //             return  `${key} : ${error.response.data.errors[key]}\n`
  //           })
  //       }

  //       toaster.danger(
  //         `Unable to save printer ${name}`, 
  //         {description: errors}
  //       )
  //     }
  //     this.setState({
  //       loading: false
  //     })
  //   })
  // }

  save() {
    // if(this.props.save  == undefined) {
    //   // alert("No save function given")
    //   this.savePrinter()
    //   // return
    // } else {
      this.setState({
        loading: true
      })
    this.props.save(this.props.node, this.state.nodeAttrs)
    .then((response) => {
      toaster.success(`Node ${response.data.node.name} has been successfully saved`)
      this.setState({
        loading: false
      })
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
          `Unable to save node ${name}`, 
          {description: errors}
        )
      }
      this.setState({
        loading: false
      })
    })
    // }
  }

  updateSettings(key, val) {
    this.setState({
      nodeAttrs: {...this.state.nodeAttrs, settings:
        {...this.state.nodeAttrs.settings, [key]: val}
      }
    })
  }

  renderDiscoverable() {
    if (!this.state.nodeAttrs.settings["discovery"]) return null
    return (
        <Pane display="flex" marginLeft={10} marginTop={5}>
          <Pane display="flex" flex={1}>
            <Checkbox
                label="Make Node Discoverable"
                checked={this.state.nodeAttrs.settings["discoverable"]}
                onChange={e => 
                  this.updateSettings("discoverable", e.target.checked)                
                }
              />
          </Pane>
        </Pane>
    )
  }

  render() {
    return (
      <Pane width={"100%"}>
        <Label
            htmlFor="name"
            marginBottom={4}
            display="block"
          >
            Node Name
          </Label>
        <TextInput 
          name="name" 
          placeholder="Node Name" 
          marginBottom={4}  
          width="100%" 
          height={48}
          value={this.state.nodeAttrs.name}
          onChange={e => 
            this.setState({
              nodeAttrs: {
                ...this.state.nodeAttrs,
                name: e.target.value     
              }
            })
          }
        />


        <Label
            htmlFor="description"
            marginBottom={4}
            display="block"
          >
            Description
          </Label>
        <TextInput 
          name="description" 
          placeholder="Description (optional)" 
          marginTop={4} 
          marginBottom={4}  
          width="100%" 
          height={48}
          value={this.state.nodeAttrs.description}
          onChange={e => 
            this.setState({
              nodeAttrs: {
                ...this.state.nodeAttrs,
                description: e.target.value     
              }
            })
          }
        />

        <Pane display="flex" marginTop={20} flexDirection="column">
          <Pane display="flex" flex={1}>
            <Checkbox
              label="Turn on Network Discovery"
              checked={this.state.nodeAttrs.settings["discovery"]}
              onChange={e => 
                this.updateSettings("discovery", e.target.checked)                
              }
            />
          </Pane>
          {this.renderDiscoverable()}
        </Pane>
        
        
        <Pane paddingTop={6}>
            <Button isLoading={this.state.loading} appearance="primary" onClick={this.save}>Save</Button>
          </Pane>
      </Pane>
    )
  }
}
