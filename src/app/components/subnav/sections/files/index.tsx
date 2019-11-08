//
//  index.tsx
//  ancilla
// 
//  Created by Wess Cope (me@wess.io) on 11/08/19
//  Copyright 2019 Wess Cope
//

import React from 'react'

import {
  Dialog,
  Pane,
  TextInput,
  Combobox,
  FilePicker,
  toaster
} from 'evergreen-ui'

import Tree from '../../../tree'

import Form from './form'

import file, {default as request} from '../../../../network/files'

export default class Files extends React.Component {
  state = {
    files: Array(),
    showing: false,
    loading: false
  }
  form: Form = {}

  constructor(props:any) {
    super(props)

    this.toggleDialog = this.toggleDialog.bind(this)
    this.saveFile  = this.saveFile.bind(this)
    this.getFiles  = this.getFiles.bind(this)
  }

  componentDidMount() {
    this.getFiles()
  }

  toggleDialog(show:boolean) {
    this.setState({
      ...this.state,
      showing: show
    })
  }

  getFiles() {
    request.list()
    .then((response) => {
      if (response.data && response.data.files) {
        this.setState({files: response.data.files})
      }
    })
  }

  saveFile(closeDialog) {    
    this.setState({
      ...this.state,
      loading: true
    })

    var fileobj = this.form.state.file
    request.create(fileobj)
    .then((response) => {
      var files = this.state.files
      var f = response.data.file
      files = files.concat(f)
      this.setState({
        loading: false,
        files: files
      })

      toaster.success(`File ${f.name} has been successfully added`)
      closeDialog()
    })
    .catch((error) => {
      console.log(error)
      this.setState({
        loading: false,
      })
      let errors = Object.keys(error.response.data.errors).map((key, index) => {
        return  `${key} : ${error.response.data.errors[key]}<br/>`
      })

      toaster.danger(
        `Unable to save file ${fileobj.name}`, 
        {description: errors}
      )
    })
  }

  render() {
    let items =  this.state.files.length > 0 ? this.state.files : [{name: "No files found."}]

    return ( 
      <React.Fragment key="files">
        <Dialog
          isShown={this.state.showing}
          title="Add File"
          confirmLabel="Save"
          onCloseComplete={() => this.toggleDialog(false)}
          onConfirm={this.saveFile}
        >
          <Form ref={frm => this.form = frm} save={this.saveFile} loading={this.state.loading}/>
        </Dialog>

        <Tree.Node name="Files" key="files" children={items} addAction={() => this.toggleDialog(true)} />
      </React.Fragment>
    )
  }
}
