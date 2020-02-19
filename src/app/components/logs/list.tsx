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

import { ServiceHandler, CameraHandler } 	from '../../network'
import Layerkeep 	from '../../network/layerkeep'
import Modal from '../modal/index'
import AuthForm from '../services/layerkeep/form'
import { PaginatedList } from '../utils/pagination'

import ErrorModal from '../modal/error'
import LogsController from './table_controller'
// const qs = require('qs');


import { NodeState, ServiceState, AttachmentModel }  from '../../store/state'


type Props = {  
  node: NodeState, 
  service: ServiceState
}

type StateProps = {
  loading: boolean,
    filter: {
      name: ""
    },
    search: {
      page: Number, 
      per_page: Number, 
      q: {
        name: any,
        print_id: any, 
        camera_id: any
      }
    },
    list: {
      data: [], 
      meta: {}
    }
}


export class LogList extends React.Component<Props, StateProps> {

  // state = {    
  //   redirectTo: null,
  //   isLoading: true,
  //   showAuth: false,
  //   filter: {
  //     name: ""
  //   },
  //   search: {
  //     page: Number, 
  //     per_page: Number, 
  //     q: {name: undefined}
  //   },
  //   list: {
  //     data: [], 
  //     meta: {}
  //   }
  // }

  timer:number = null

  cancelRequest = null
  
  constructor(props:any) {
    super(props)
    // var qparams = qs.parse(this.props.location.search, { ignoreQueryPrefix: true })

    this.state = {
      loading: true,
      filter: {
        name: ""
      },
      search: {
        page: 1, //parseInt(qparams["page"] || 1), 
        per_page: 20, //parseInt(qparams["per_page"] || 20), 
        q: {
          name: "",
          print_id: null,
          camera_id: null
        } //qparams["q"] || {}
      },
      list: {
        data: [], 
        meta: {}
      }
    }
    this.listLogs         = this.listLogs.bind(this)
    
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

    this.cancelRequest = CameraHandler.cancelSource();
  }

  componentDidMount() {
    // this.listLogs()
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

  listLogs(search = {}) {
    // this.setState({loading: true, search: search})
    // if (this.props.service.kind == 'camera' && this.props.service.model["model"]) {
    //   return CameraHandler.recordings(this.props.node, this.props.service, {qs: search, cancelToken: this.cancelRequest.token})
    //   // if (!search['q']) search['q'] = {}
    //   // search['q']["camera_id"] = this.props.service.model["model"]["id"]
    // }
    return ServiceHandler.logs(this.props.node, this.props.service, {qs: search, cancelToken: this.cancelRequest.token})
  }

  deleteLog(row) {
    // ServiceHandler.deleteLog(this.props.node, this.props.service, row.id)
    // .then((res) => {
    //   this.listRecordings(this.state.search)
      
    //   toaster.success(`Recording has been successfully deleted.`)
    // })
    // .catch((error) => {
    //   toaster.danger(<ErrorModal requestError={error} />)
    //   // toaster.danger(`${this.state.printer_print.name} could not be deleted.`)
    // })
  }

  renderHeader() {
    return (
      <Pane display="flex" marginBottom={20}>
        <Pane display="flex" >
          <Link to={`/${this.props.service.kind}s/${this.props.service.id}`}>{this.props.service.name}</Link>&nbsp; / Logs
        </Pane>
      </Pane>
    )
  }

  render() {
    return (
      <Pane display="flex" key={"recordings"}>
        <Pane display="flex" flexDirection="column" width="100%" background="#fff" padding={20} margin={20} border="default">
          {this.renderHeader()}
          <LogsController 
            {...this.props}
            listData={this.listLogs} 
            height={395}
          />

        </Pane>
      </Pane>
    )
  }	
}

export default LogList
