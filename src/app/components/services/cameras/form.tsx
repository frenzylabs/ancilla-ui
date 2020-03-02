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
  Heading,
  Paragraph,
  Icon,
  Position,
  Tooltip,
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
    },
    video: {
      CAP_PROP_FRAME_WIDTH: "640",
      CAP_PROP_FRAME_HEIGHT: "480",
      CAP_PROP_FPS: "",
      CAP_PROP_FOURCC: "MJPG",
      
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
      var video = data.settings["video"] || {}

      this.setState({
        newCamera: {...this.state.newCamera, ...data},
        record: {...this.state.record, ...(data.settings["record"] || {})},
        video: {...this.state.video, ...video}
      })
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.data && prevProps.data != this.props.data) {
      var data = this.props.data.model || {}
      var video = data.settings["video"] || {}

      this.setState({
        newCamera: {...this.state.newCamera, ...data},
        record: {...this.state.record, ...(data.settings["record"] || {})},
        video: {...this.state.video, ...video}
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

  setVideoSize() {
    var cam = this.state.newCamera
    var vset = (cam.settings["video"] || {})
    
    
    vset["CAP_PROP_FRAME_WIDTH"] = parseInt(this.state.video.CAP_PROP_FRAME_WIDTH) || ""
    vset["CAP_PROP_FRAME_HEIGHT"] = parseInt(this.state.video.CAP_PROP_FRAME_HEIGHT) || ""
    
    vset["size"] = [parseInt(this.state.video.CAP_PROP_FRAME_WIDTH) || 640, parseInt(this.state.video.CAP_PROP_FRAME_HEIGHT) || 480]
    // var width = parseInt(e.target.value) || ""
    this.setState({ 
      newCamera: {
        ...cam,
        settings: {...cam.settings, video: vset}
      }
    })
   
  }

  renderVideoCaptureForm() {
    return (
      <React.Fragment>
        <Heading size={600}>{"Camera Capture Settings"}</Heading>
        <Pane>
          <Paragraph size={300} marginBottom="10px">
              *These camera settings are only applied on initial connection. 
              
          </Paragraph>
        </Pane>
        <Pane flex={1} display={"flex"} flexWrap="wrap">
          <Pane marginRight={15}>
          <Label htmlFor="width">Width</Label>
          <TextInput 
            name="width" 
            placeholder={`Width of Video`}
            marginBottom={10}
            width="100%" 
            height={48}
            value={this.state.video.CAP_PROP_FRAME_WIDTH}
            onChange={e => {
              var width = parseInt(e.target.value) || ""
              this.state.video.CAP_PROP_FRAME_WIDTH = `${width}`
              this.setVideoSize()            
            }}
          />
          </Pane>
          <Pane >
          <Label htmlFor="height">Height</Label>
          <TextInput 
            name="height" 
            placeholder={`Height of Video`}
            marginBottom={10}
            width="100%" 
            height={48}
            value={this.state.video.CAP_PROP_FRAME_HEIGHT}
            onChange={e => {
              var height = parseInt(e.target.value) || ""
              this.state.video.CAP_PROP_FRAME_HEIGHT = `${height}`
              this.setVideoSize()            
            }}
          />
          </Pane>
        </Pane>
        
        <Label htmlFor="fps">
          Frames Per Second 
          <Paragraph size={300} marginLeft="10px" display={"inline-block"}>
              <small>(Default depends on your camera)</small>

              <Tooltip 
                position={Position.BOTTOM}
                statelessProps={{
                  maxWidth: "60vw"
                }}
                content={
                  <Paragraph margin={10}>
                    What you set this to will depend on your system resources. 
                    For instance, if you are running multiple cameras on a Raspberry Pi 
                    you might want to set this to between 10 - 15.
                  </Paragraph>
                }
                appearance="card"
              >
                <Icon size={12} marginLeft={4} icon="info-sign" />
              </Tooltip>
          </Paragraph>
        
        </Label>
        <TextInput 
          name="fps" 
          placeholder={`Frames Per Second `}
          marginBottom={20}
          // width="100%" 
          height={48}
          value={this.state.video.CAP_PROP_FPS}
          onChange={e => {
            var fps = parseInt(e.target.value) || ""
            var cam = this.state.newCamera
            var vset = (cam.settings["video"] || {})
            vset["CAP_PROP_FPS"] = fps
            
            this.setState({
              video: {...this.state.video, CAP_PROP_FPS: fps},
              newCamera: {
                ...cam,
                settings: {...cam.settings, video: vset}
              }
            })
          }
        }
        />

        <Label htmlFor="fourcc">FOURCC Format 
          <Paragraph size={300} marginLeft="10px" display={"inline-block"}>
                <small>(Ancilla's default is MJPG)</small>

                <Tooltip 
                  position={Position.BOTTOM}
                  statelessProps={{
                    maxWidth: "60vw"
                  }}
                  content={
                    <Paragraph margin={10}>
                      It's possible your camera doesn't support MJPG.  Make this empty to use your camera's default.
                      Learn More about the different codes here <a href="http://www.fourcc.org/fourcc.php" target="_blank">http://www.fourcc.org</a>
                    </Paragraph>
                  }
                  appearance="card"
                >
                  <Icon size={12} marginLeft={4} icon="info-sign" />
                </Tooltip>
            </Paragraph>
        </Label>
        <TextInput 
          name="fourcc" 
          placeholder={`FOURCC `}
          marginBottom={20}
          // width="100%" 
          height={48}
          value={this.state.video.CAP_PROP_FOURCC}
          onChange={e => {
            var fourcc = e.target.value
            if (fourcc.length > 4)
              return
            fourcc =  fourcc.toUpperCase()

            var cam = this.state.newCamera
            var vset = (cam.settings["video"] || {})
            if (fourcc.length == 4 || fourcc.length == 0)
              vset["CAP_PROP_FOURCC"] = fourcc
            
            this.setState({
              video: {...this.state.video, CAP_PROP_FOURCC: fourcc},
              newCamera: {
                ...cam,
                settings: {...cam.settings, video: vset}
              }
            })
          }
        }
        />
 
    </React.Fragment>
    )
  }


  renderRecordingForm() {
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
      case 'capture':
        return this.renderVideoCaptureForm()
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
