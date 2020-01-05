//
//  printers.tsx
//  ancilla
// 
//  Created by Wess Cope (me@wess.io) on 11/08/19
//  Copyright 2019 Wess Cope
//

import React from 'react'
import { Link, Redirect }       from 'react-router-dom';
import {connect}  from 'react-redux'

import {
  Pane,
  Dialog,
  Heading,
  Button,
  toaster
} from 'evergreen-ui'

import {
  Printer
} from '../../../models'

import Modal from '../../modal/index'
import ErrorModal from '../../modal/error'
import Form from './form'
import { NodeAction } from '../../../store/actions/node'
import { NodeState, CameraState }  from '../../../store/state'


type Props = {
  node: NodeState,
  camera: CameraState,
  addCamera: Function,
  history: any
}

export class CameraNew extends React.Component<Props> {  
  state = {
    showing: false,
    loading: false
  }
  form: Form = null

  constructor(props:any) {
    super(props)    

    this.toggleDialog = this.toggleDialog.bind(this)
    this.onSave       = this.onSave.bind(this)
    this.onError      = this.onError.bind(this)
    // this.getPrinters  = this.getPrinters.bind(this)
  }

  componentDidMount() {
    // this.props.listPrinters()
    // this.getPrinters()
  }

  // componentDidUpdate(op, os) {
  //   console.log("did update porps", op)
  //   console.log("did update stae", os)
  // }

  toggleDialog(show:boolean) {
    this.setState({
      ...this.state,
      showing: show
    })
  }

  onSave(response) {
    console.log("response on save", response)
    this.props.addCamera(this.props.node, response.data.camera) 
  
  }

  onError(error) {
    // if (error.response.status == 401) {
    //   console.log("Unauthorized")
    //   this.setState({showing: true, loading: false})
    // } else {
      // this.setState({requestError: error})
      toaster.danger(<ErrorModal requestError={error} />)
    // }
  }


  authenticated(res) {
    console.log("Authenticated", res)
    this.setState({showing: false})
    
  }

  selectCamera(item) {
    let url = `/cameras/${item.id}`
    this.props.history.push(`${url}`);    
  }

  // renderError() {
  //   if (this.state.requestError) {
  //     return (<Pane background="redTint" border marginBottom={10} padding={10}>
  //       <ErrorModal requestError={this.state.requestError} />
  //     </Pane>)
  //   }
  // }

  render() {
    let cameras = this.props.node.services.filter((item) => item.kind == "camera") //Object.values(this.props.printers)
    let items =  cameras.length > 0 ? cameras : [{name: "No cameras found."}]
    
    return ( 
      <Pane display="flex" is="section" flexDirection="column" padding={16} background="tint2" borderRadius={3}>
        <Pane flex={1} alignItems="center" display="flex">
          <Heading >Add Camera</Heading>
        </Pane>
        <Pane flex={1} alignItems="center" display="flex">
          <Form ref={frm => this.form = frm} node={this.props.node} onSave={this.onSave} onError={this.onError}/>        
        </Pane>
      </Pane>
    )
  }
}


const mapStateToProps = (state) => {
  // return state
  return {
    // printers: state.activeNode.printers
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    addCamera: (node, camera) => dispatch(NodeAction.addCamera(node, camera)),
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(CameraNew)

// export default PrinterNew
