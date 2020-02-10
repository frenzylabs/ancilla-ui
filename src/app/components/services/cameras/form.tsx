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
  Button,
  Text,
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

import { NodeState, CameraState }  from '../../../store/state'

type Props = {
  node: NodeState,
  save?:Function, 
  data?: any, 
  kind?: string,
  onSave?: Function, 
  onError?: Function,
  onUpdate?: Function
}

export default class Form extends React.Component<Props> {
  state = {
    newCamera: {
      name:     '',
      endpoint:     '',
      settings: {}
    },
    record: {
      timelapse: 2,
      frames_per_second: 10
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
      this.setState({
        newCamera: {...this.state.newCamera, ...data},
        record: {...this.state.record, ...(data.settings["record"] || {})}
      })
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.data && prevProps.data != this.props.data) {
      var data = this.props.data.model || {}
      this.setState({
        newCamera: {...this.state.newCamera, ...data},
        record: {...this.state.record, ...(data.settings["record"] || {})}
      })
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
      this.setState({
        loading: false
      })
      if (this.props.onSave) {
        this.props.onSave(response)
      }
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
      this.saveCamera()
    } else {
      this.props.save(this.state.newCamera)
    }
  }

  renderRecordingForm() {
    var rset = (this.state.newCamera.settings["record"] || {"timelapse": 2, "frames_per_second": 10})
    return (
      <React.Fragment>
        <Label htmlFor="timelapse">Timelapse</Label>
        <TextInput 
          name="timelapse" 
          placeholder={`Timelapse in seconds (default: 2)`}
          marginBottom={10}
          width="100%" 
          height={48}
          value={this.state.record.timelapse}
          onChange={e => {
            var cam = this.state.newCamera
            var rset = (cam.settings["record"] || {})
            rset["timelapse"] = parseInt(e.target.value) || 2
            var timelapse = parseInt(e.target.value) || ""
            this.setState({   
              record: {...this.state.record, timelapse: timelapse},
              newCamera: {
                ...cam,
                settings: {...cam.settings, record: rset}
              }
            })
           }
          }
        />

        <Label htmlFor="fps">Frames Per Second</Label>
        <TextInput 
          name="fps" 
          placeholder={`Frames Per Second (default: 10) `}
          marginBottom={20}
          width="100%" 
          height={48}
          value={this.state.record.frames_per_second}
          onChange={e => {
            var cam = this.state.newCamera
            var rset = (cam.settings["record"] || {})
            rset["frames_per_second"] = parseInt(e.target.value) || 10
            var frames_per_second = parseInt(e.target.value) || ""
            this.setState({
              record: {...this.state.record, frames_per_second: frames_per_second},
              newCamera: {
                ...cam,
                settings: {...cam.settings, record: rset}
              }
            })
          }
        }
        />

 
    </React.Fragment>
    )
  }


  renderGeneral() {
    return (
      <React.Fragment>
        <Pane display="flex" flexDirection="column" marginBottom={20}>
          <Label htmlFor="url">Camera name</Label>
          <TextInput 
            name="name" 
            placeholder="Camera name" 
            value={this.state.newCamera.name}
            height={48}
            onChange={e => {
                this.setState({
                  newCamera: {
                    ...this.state.newCamera,
                    name: e.target.value     
                  }
                })

                if(this.props.onUpdate) {
                  this.props.onUpdate(this.state.newCamera)
                }
              }
            }
          />
        </Pane>

        <Pane display="flex" flexDirection="column" marginBottom={20}>
          <Label htmlFor="url">Camera Endpoint</Label>
          
          <TextInput 
            name="url" 
            placeholder="Camera endpoint" 
            value={this.state.newCamera.endpoint}
            height={48}
            onChange={e => {
                this.setState({
                  newCamera: {
                    ...this.state.newCamera,
                    endpoint: e.target.value
                  }
                })

                if(this.props.onUpdate) {
                  this.props.onUpdate(this.state.newCamera)
                }
              }
            }
            />
        </Pane>
        
        <Pane marginBottom={20} alignItems="center" justifyContent="center">
          <Text color="muted">
            Built-in and USB connected cameras will have a numerical <br/>
            endpoint. Depending on the order the USB cameras were <br/>
            plugged in, it could be 0, 1, 2, etc. <br />
            It can also be a url to an IP based camera.
          </Text>
        </Pane>
      </React.Fragment>
    )
  }

  renderForm() {
    switch (this.props.kind) {
      case 'record':
        return this.renderRecordingForm()
        break;
      default:
        return this.renderGeneral()
    }
  }
  render() {
    return (
      <Pane display="flex" flex={1} flexDirection="column" paddingBottom={40}>
        {this.renderForm()}

        <Pane marginBottom={20}>
          <Button appearance="primary" onClick={this.save}>Save</Button>
        </Pane>
      </Pane>
    )
  }
}
