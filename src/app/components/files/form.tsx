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
  FilePicker,
  toaster
} from 'evergreen-ui'

import FileDrop       from 'react-file-drop'

import {default as request} from '../../network/files'

export default class Form extends React.Component<{save:Function, loading:boolean}> {
  filepicker = null;
  state = {
    newFile: {
      file: null,
      layerkeep_sync: false
    },
    file: null   
  }


  save() {    
    // this.props.save(this.state.file)
  }

  handleDrop(files, evt) {

    this.setState({newFile: {...this.state.newFile, file: files[0]}})
    this.filepicker.setState({files: [files[0]]})
  }

  handleFileChange(files) {
    this.setState({newFile: {...this.state.newFile, file: files[0]}})
    // this.setState({file: files[0]})
  }

  render() {
    return (
      <Pane>
        <FileDrop onDrop={this.handleDrop.bind(this)}>
          <FilePicker ref={fp => this.filepicker = fp}        
            marginBottom={32}
            onChange={this.handleFileChange.bind(this)}
            placeholder="Select the file here!"
          />
        </FileDrop>

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
        
      </Pane>
    )
  }
}
