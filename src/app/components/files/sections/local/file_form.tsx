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
} from 'evergreen-ui'

import FileDrop from 'react-file-drop'

import {
  LayerKeepHandler,
} from '../../../../network'

export default class FileForm extends React.Component {
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

  detectPrintSlice() {
    let _printSlice = this.props['printSlice'] || {}

    this.setState({
      ...this.state.newFile,
      id:             _printSlice['id']           || null,
      layerkeep_sync: _printSlice['layerkeep_id'] || null,
      name:           _printSlice['name']         || "",
      description:    _printSlice['description']  || ""
    })
  }

  componentDidMount() {
    this.detectPrintSlice()
  }

  componentDidUpdate(previousProps, previousState) {
    if(previousProps['printSlice'] == this.props['printSlice']) { return }

    this.detectPrintSlice()
  }

  handleDrop(files, event) {
    this.setState({
      newFile: {
        ...this.state.newFile, 
        file: files[0]
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
    if(this.props['loading']) {
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
