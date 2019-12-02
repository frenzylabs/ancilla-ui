//
//  index.tsx
//  ancilla
// 
//  Created by Wess Cope (me@wess.io) on 11/08/19
//  Copyright 2019 Wess Cope
//

import React from 'react'
import {connect}  from 'react-redux'

import {
  Dialog,
  toaster
} from 'evergreen-ui'

import Tree from '../../../tree'
import { NodeAction } from '../../../../store/actions/node'

import Form from './form'
import {default as request} from '../../../../network/camera'

export class Cameras extends React.Component {
  state = {
    showing: false,
    loading: false,
    cameras: Array<string>()
  }
  form: Form = {}

  constructor(props:any) {
    super(props)

    this.toggleDialog = this.toggleDialog.bind(this)
    this.saveCamera  = this.saveCamera.bind(this)
    this.getCameras  = this.getCameras.bind(this)
  }

  componentDidMount() {
    // this.getCameras()
    this.props.listCameras()
  }

  getCameras() {
    request.list()
    .then((response) => {
      if (response.data && response.data.cameras) {
        this.setState({cameras: response.data.cameras})
      }
    })
  }

  saveCamera(closeDialog) {
    this.setState({
      ...this.state,
      loading: true
    })

    var camera = this.form.state.newCamera
    request.create(camera)
    .then((response) => {
      var cameras = this.state.cameras
      var f = response.data.camera
      cameras = cameras.concat(f)
      this.setState({
        loading: false,
        cameras: cameras
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
        `Unable to save file ${camera.name}`, 
        {description: errors}
      )
    })
  }

  selectCamera(item) {
    let url = `/cameras/${item.service.id}`
    this.props.history.push(`${url}`);    
  }

  toggleDialog(show:boolean) {
    this.setState({
      ...this.state,
      showing: show
    })
  }

  render() {
    let items =  this.props.cameras.length > 0 ? this.props.cameras : [{name: "No Cameras added."}]

    return (
      <React.Fragment key="cameras">
        <Dialog
          isShown={this.state.showing}
          title="Add Camera"
          confirmLabel="Save"
          onCloseComplete={() => this.toggleDialog(false)}
          onConfirm={this.saveCamera}
        >
          <Form ref={frm => this.form = frm} save={this.saveCamera} loading={this.state.loading}/>
        </Dialog>

        <Tree.Node name="Cameras" key="cameras" children={items} addAction={() => this.toggleDialog(true)}  selectItem={this.selectCamera.bind(this)} />
      </React.Fragment>
    )
  }
}



const mapStateToProps = (state) => {
  // return state
  return {
    cameras: state.activeNode.cameras
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    listCameras: () => dispatch(NodeAction.listCameras())
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(Cameras)