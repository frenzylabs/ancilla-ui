//
//  form.tsx
//  ancilla
// 
//  Created by Wess Cope (wess@frenzylabs.com) on 01/02/20
//  Copyright 2019 FrenzyLabs, LLC.
//

import React from 'react'

import {
  Pane,
  Label,
  Textarea,
  TextInput,
  Checkbox,
  FilePicker,
  Spinner,
  toaster
} from 'evergreen-ui'

// import FileDrop from 'react-file-drop'

import FileDrop from '../../../utils/filedrop'

import {
  LayerKeepHandler,
} from '../../../../network'

import {
  FileHandler
} from '../../../../network'

import { NodeState }  from '../../../../store/state'

type Props = {
  node: NodeState,
  printSlice?: object,
  loading: boolean,
  onSave?: Function,
  onError?: Function,
  onAuthError?: Function
}

export default class FileForm extends React.Component<Props> {
  filepicker = null

  state = {
    newFile: {
      file:           null,
      layerkeep_sync: true,
      description:    "",
      name:           "",
      id:             null
    },
    filename: null,
    saving: false
  }

  cancelRequest = LayerKeepHandler.cancelSource()

  get data():any {
    return this.state.newFile
  }

  constructor(props:any) {
    super(props)

    this.detectPrintSlice         = this.detectPrintSlice.bind(this)
    this.handleDrop               = this.handleDrop.bind(this)
    this.handleFileChange         = this.handleFileChange.bind(this)
    this.handleNameChange         = this.handleNameChange.bind(this)
    this.handleDescriptionChange  = this.handleDescriptionChange.bind(this)
    this.renderFileDrop           = this.renderFileDrop.bind(this)
    this.renderForm               = this.renderForm.bind(this)
  }


  componentDidMount() {
    this.detectPrintSlice()
  }

  componentDidUpdate(previousProps, previousState) {
    if(previousProps['printSlice'] == this.props['printSlice']) { return }

    this.detectPrintSlice()
  }

  detectPrintSlice() {
    let _printSlice = this.props['printSlice'] || {}
    console.log("PRINT SLICE= ", _printSlice)
    this.setState({
      ...this.state,
      newFile: {
        ...this.state.newFile,
        id:             _printSlice['id']           || null,
        layerkeep_sync: (_printSlice['layerkeep_id'] ? true : false),
        name:           _printSlice['name']         || "",
        description:    _printSlice['description']  || ""
      }
    })
  }


  handleDrop(files, event) {
    this.setState({
      newFile: {
        ...this.state.newFile, 
        file: files[0],
        name: this.state.filename || files[0].name || ""
      }
    })

    this.filepicker.setState({
      files: [files[0]]
    })
  }

  handleFileChange(files) {
    if(files.length < 1) { return }

    this.setState({
      ...this.state,
      newFile: {
        ...this.state.newFile,
        file: files[0],
        name: this.state.filename || files[0].name || ""
      }
    })
  }

  handleNameChange(e) {
    this.setState({
      ...this.state,
      filename: e.target.value,
      newFile: {
        ...this.state.newFile,
        name: e.target.value
      }
    })
  }

  handleDescriptionChange(e) {
    this.setState({
      ...this.state,
      newFile: {
        ...this.state.newFile,
        description: e.target.value
      }
    })
  }

  save() {
    this.setState({saving: true})

    let request = this.state.newFile.id ?
      FileHandler.update(this.props.node, this.state.newFile.id, this.state.newFile, {cancelToken: this.cancelRequest.token}) 
    : FileHandler.create(this.props.node, this.state.newFile, {cancelToken: this.cancelRequest.token}) 

    request.then((res) => {      
      this.setState({saving: false})
      if (this.props.onSave) {
        this.props.onSave(res.data.file)
      }

      toaster.success(`File ${res.data.file.name} has been successfully added`)
    })
    .catch((error) => {
      this.setState({
        ...this.state,
        saving: false
      })
      if(error.response && error.response.status == 401) {

        if (this.props.onAuthError) {
          this.props.onAuthError(error)
          return
        }
      }
      if (this.props.onError) {
        this.props.onError(error)
      }
      var errors = [""]
      if (error.response.data){
        if (error.response.data.errors) {
          errors = Object.keys(error.response.data.errors).map((key, index) => {
            return  `${key} : ${error.response.data.errors[key]}\n`
          })
        } else if (error.response.data.error) {
          errors = [error.response.data.error]
        }
      }

      toaster.danger(
        `Unable to save file ${this.state.newFile.name}`, 
        {description: errors}
      )
    })
  }
  
  renderFileDrop() {
    if(this.state.newFile.id) { return }

    return (
      <FileDrop onDrop={this.handleDrop.bind(this)}>
        <FilePicker ref={fp => this.filepicker = fp}        
          marginBottom={32}
          onChange={this.handleFileChange.bind(this)}
          placeholder="Select the file here!"
        />
      </FileDrop>
    )
  }

  renderForm() {
    return (
      <React.Fragment>
        <Pane>
          <Label htmlFor="description" marginBottom={4} display="block">Name</Label>
          <TextInput 
            name="filename" 
            placeholder="Filename" 
            marginBottom={20}  
            width="100%" 
            height={32}
            value={this.state.newFile.name}
            onChange={this.handleNameChange.bind(this)}
          />
        </Pane>

        <Pane>
          <Label htmlFor="description" marginBottom={4} display="block">Description (optional)</Label>
          <Textarea
            id="description"
            placeholder="Description..."
            onChange={this.handleDescriptionChange.bind(this)}
            value={this.state.newFile.description}
          />
        </Pane>

        <Pane display="flex" marginTop={20}>
          <Pane display="flex" flex={1}>
            <Checkbox
              label="Sync To LayerKeep"
              checked={this.state.newFile.layerkeep_sync}
              onChange={e => 
                this.setState({
                  newFile: {
                    ...this.state.newFile,
                    layerkeep_sync: e.target.checked
                  }
                })
              }
            />
          </Pane>
        </Pane>

      </React.Fragment> 
    )
  }

  render() {
    if(this.props['loading'] || this.state.saving) {
      return (
        <Spinner/>
      )
    }

    return (
      <Pane>
        {this.renderFileDrop()}
        {this.renderForm()}
      </Pane>
    )
  }
}
