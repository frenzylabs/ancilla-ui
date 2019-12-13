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


import {default as request} from '../../../../network/camera'

export class Cameras extends React.Component {
  state = {
    showing: false,
    loading: false,
    cameras: Array<string>()
  }

  constructor(props:any) {
    super(props)
    
    // this.getCameras  = this.getCameras.bind(this)
  }

  componentDidMount() {
    // this.getCameras()
    // this.props.listCameras()
  }

  getCameras() {
    request.list()
    .then((response) => {
      if (response.data && response.data.cameras) {
        this.setState({cameras: response.data.cameras})
      }
    })
  }

  selectCamera(item) {
    let url = `/cameras/${item.id}`
    this.props.history.push(`${url}`);
  }


  addCamera() {
    let url = `/cameras/new`
    this.props.history.push(`${url}`);    
  }


  render() {
    let cameras = this.props.node.services.filter((item) => item.kind == "camera") //Object.values(this.props.printers)
    let items =  cameras.length > 0 ? cameras : [{name: "No cameras found."}]

    return (
      <React.Fragment key="cameras">
        <Tree.Node name="Cameras" key="cameras" children={items} addAction={() => this.addCamera()}  selectItem={this.selectCamera.bind(this)} />
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
