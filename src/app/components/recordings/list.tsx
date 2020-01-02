//
//  list.tsx
//  ancilla
// 
//  Created by Kevin Musselman (kevin@frenzylabs.com) on 01/02/20
//  Copyright 2019 FrenzyLabs, LLC.
//


import React from 'react'
import { Link, Redirect }       from 'react-router-dom';
import Dayjs from 'dayjs'

import {
  Pane,
  TabNavigation,
  Tab,
  IconButton,
  Button,
  Dialog,
  Text,
  Position,
  Table,
  Menu,
  Popover,
  toaster
} from 'evergreen-ui'

// import Form 				from './form'
import CameraRequest 	from '../../network/camera'
import Layerkeep 	from '../../network/layerkeep'
import Modal from '../modal/index'
import AuthForm from '../services/layerkeep/form'
import { PaginatedList } from '../utils/pagination'

import ErrorModal from '../modal/error'
import RecordingsController from './table_controller'
// const qs = require('qs');

export class RecordingList extends React.Component {

  state = {    
    redirectTo: null,
    isLoading: true,
    showAuth: false,
    filter: {
      name: ""
    },
    search: {
      page: Number, 
      per_page: Number, 
      q: {name: undefined}
    },
    list: {
      data: [], 
      meta: {}
    }
  }

  timer:number = null

  form:Form = {}
  cancelRequest = null
  
  constructor(props:any) {
    super(props)
    // var qparams = qs.parse(this.props.location.search, { ignoreQueryPrefix: true })

    this.state = {    
      redirectTo: null,
      isLoading: true,
      filter: {
        name: ""
      },
      search: {
        page: 1, //parseInt(qparams["page"] || 1), 
        per_page: 20, //parseInt(qparams["per_page"] || 20), 
        q: {name: ""} //qparams["q"] || {}
      },
      list: {
        data: [], 
        meta: {}
      }
    }
    this.listRecordings         = this.listRecordings.bind(this)
    
    // this.renderPagination   = this.renderPagination.bind(this)
    // this.handleFilterChange = this.handleFilterChange.bind(this)
    
    // this.deleteFile     = this.deleteFile.bind(this)
    // this.saveFile				= this.saveFile.bind(this)
    // this.toggleDialog		= this.toggleDialog.bind(this)
    // this.renderRow 			= this.renderRow.bind(this)
    // this.renderGroup 		= this.renderGroup.bind(this)
    // this.renderGroups		= this.renderGroups.bind(this)
    // this.renderTopBar		= this.renderTopBar.bind(this)
    // this.renderSection	= this.renderSection.bind(this)

    this.cancelRequest = CameraRequest.cancelSource();
  }

  componentDidMount() {
    this.listRecordings()
  }

  componentWillUnmount() {
    if (this.cancelRequest)
      this.cancelRequest.cancel("Left Prints Page");
  }

  componentDidUpdate(prevProps, prevState) {
    // if (JSON.stringify(this.state.search) != JSON.stringify(prevState.search)) {
    //   // var url = qs.stringify(this.state.search, { addQueryPrefix: true });      
    //   this.listRecordings();
    // }
  }

  listRecordings(search = {}) {
    this.setState({loading: true, search: search})
    return CameraRequest.recordings(this.props.node, this.props.service, {qs: search, cancelToken: this.cancelRequest.token})
    // .then((res) => {
    //   this.setState({
    //     ...this.state,
    //     list: res.data,
    //     loading: false
    //   })
    // })
    // .catch((error) => {
    //   console.log(error)
    //   if (error.response && error.response.status == 401) {
    //     console.log("Unauthorized")
    //     // this.setState({showAuth: true, loading: false})
    //     this.setState({loading: false})
    //   } else {
    //     // this.setState({requestError: error})
    //     // toaster.danger(<ErrorModal requestError={error} />)
    //     this.setState({loading: false})
    //   }
    //   this.cancelRequest = CameraRequest.cancelSource();
    // })
  }

  deleteRecording(row) {
    console.log("delete recording", row)
    CameraRequest.deleteRecording(this.props.node, this.props.service, row.id)
    .then((res) => {
      this.listRecordings(this.state.search)
      
      toaster.success(`Recording has been successfully deleted.`)
    })
    .catch((error) => {
      toaster.danger(<ErrorModal requestError={error} />)
      // toaster.danger(`${this.state.printer_print.name} could not be deleted.`)
    })
  }

  renderHeader() {
    return (
      <Pane display="flex" marginBottom={20}>
        <Pane display="flex" >
          <Link to={"/cameras/" + this.props.service.id}>{this.props.service.name}</Link>&nbsp; / Recordings
        </Pane>
      </Pane>
    )
  }

  render() {
    return (
      <div>
      <Pane display="flex" key={"prints"}>
        <Pane display="flex" flexDirection="column" width="100%" background="#fff" padding={20} margin={20} border="default">
          {this.renderHeader()}
          <RecordingsController 
            {...this.props}
            listData={this.listRecordings.bind(this)} 
            height={395}
          />

        </Pane>
      </Pane>
      <Modal
          component={AuthForm}
          node={this.props.node}
          // requestError={this.state.requestError}
          isActive={this.state.showAuth}
          // dismissAction={this.authenticated.bind(this)}
          // onAuthenticated={this.authenticated.bind(this)}
        />
      </div>
    )
  }	
}

export default RecordingList
