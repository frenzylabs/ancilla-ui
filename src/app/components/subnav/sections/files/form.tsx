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
  FilePicker,
  toaster
} from 'evergreen-ui'

import FileDrop       from 'react-file-drop'

import {default as request} from '../../../../network/files'

export default class Form extends React.Component<{save:Function, loading:boolean}> {
  filepicker = null;
  state = {
    file: null   
  }


  save() {    
    // this.props.save(this.state.file)
  }

  handleDrop(files, evt) {

    this.setState({file: files[0]})
    this.filepicker.setState({files: [files[0]]})
  }

  handleFileChange(files) {
    this.setState({file: files[0]})
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
        
      </Pane>
    )
  }
}
