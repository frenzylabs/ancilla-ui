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
  Button,
  toaster
} from 'evergreen-ui'


// import {
//   Pane,
//   TextInput,
//   Combobox,
//   Checkbox,
//   Button,
//   toaster
// } from 'evergreen-ui'

import {default as request} from '../../../network/camera'


type Props = {
  save:Function, 
  data: Object, 
  onSave: Function, 
  onError: Function
}

export default class Form extends React.Component<{Props}> {
  state = {
    newCamera: {
      name:     '',
      endpoint:     ''
    }    
  }

  constructor(props:any) {
    super(props)

    this.save = this.save.bind(this)
    this.saveCamera = this.saveCamera.bind(this)
  }

  componentDidMount() {
    if (this.props.data) {
      var data = this.props.data.model || {}      
      this.setState({newCamera: {...this.state.newCamera, ...data}})
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.data && prevProps.data != this.props.data) {
      var data = this.props.data.model || {}
      this.setState({newCamera: {...this.state.newCamera, ...data}})
    }
  }

  saveCamera() {

    this.setState({
      ...this.state,
      loading: true
    })

    var req;
    if (this.props.data && this.props.data.id) {
      req = request.update(this.props.node, this.props.data.id, this.state.newCamera)
    } else {
      req = request.create(this.props.node, this.state.newCamera)
    }

    req.then((response) => {
      console.log(response)

      this.setState({
        loading: false
      })
      if (this.props.onSave) {
        this.props.onSave(response)
      }
      // this.props.addPrinter(this.props.node, response.data.printer)
      toaster.success(`Camera ${name} has been successfully saved`)
    })
    .catch((error) => {
      console.log(error)
      if (this.props.onError) {
        this.props.onError(error)
      }
      
      // if (error.response.status == 401) {
      //   console.log("Unauthorized")
      //   this.setState({showing: true, loading: false})
      // }
      else {
        var errors = [""]
        if (error.response.data && error.response.data.errors) {
            errors = Object.keys(error.response.data.errors).map((key, index) => {
              return  `${key} : ${error.response.data.errors[key]}\n`
            })
        }

        toaster.danger(
          `Unable to save camera ${name}`, 
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
      this.saveCamera()
      // return
    } else {
      this.props.save(this.values)
    }
  }

  render() {
    return (
      <Pane>
        <TextInput 
          name="name" 
          placeholder="Camera name" 
          value={this.state.newCamera.name}
          marginBottom={4}  
          width="100%" 
          height={48}
          onChange={e => 
            this.setState({
              newCamera: {
                ...this.state.newCamera,
                name: e.target.value     
              }
            })
          }
        />
        <TextInput 
          name="url" 
          placeholder="Camera endpoint" 
          value={this.state.newCamera.endpoint}
          marginBottom={4}  
          width="100%" 
          height={48}
          onChange={e => 
            this.setState({
              newCamera: {
                ...this.state.newCamera,
                endpoint: e.target.value     
              }
            })
          }
        />

        <Pane display="flex" marginTop={20}>

          <Pane paddingTop={6}>
            <Button appearance="primary" onClick={this.save}>Save</Button>
          </Pane>
        </Pane>
      </Pane>
    )
  }
}