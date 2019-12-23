//
//  ancilla
//  index.tsx
// 
//  Created by Wess Cope (me@wess.io) on 11/16/19
//  Copyright 2019 Wess Cope
//

import React from 'react'
import { Switch, Route, Link, Redirect }       from 'react-router-dom';
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
import PrinterRequest 	from '../../network/printer'
import Layerkeep 	from '../../network/layerkeep'
import Modal from '../modal/index'
import AuthForm from '../services/layerkeep/form'
import { PaginatedList } from '../utils/pagination'

import PrintList from './list'
import PrintShow from './show'
// const qs = require('qs');

export class Prints extends React.Component {

  state = {    
    isLoading: true,
    showAuth: false,
    projects: [],
    profiles: [],
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
      isLoading: true,
      projects: [],
      profiles: [],
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
    // this.listPrints         = this.listPrints.bind(this)
    // this.onChangePage       = this.onChangePage.bind(this)
    // this.renderPagination   = this.renderPagination.bind(this)
    // this.handleFilterChange = this.handleFilterChange.bind(this)
    // this.syncToLayerkeep    = this.syncToLayerkeep.bind(this)
    // this.deleteFile     = this.deleteFile.bind(this)
    // this.saveFile				= this.saveFile.bind(this)
    // this.toggleDialog		= this.toggleDialog.bind(this)
    // this.renderRow 			= this.renderRow.bind(this)
    // this.renderGroup 		= this.renderGroup.bind(this)
    // this.renderGroups		= this.renderGroups.bind(this)
    // this.renderTopBar		= this.renderTopBar.bind(this)
    // this.renderSection	= this.renderSection.bind(this)

    this.cancelRequest = PrinterRequest.cancelSource();
  }

  componentDidMount() {
    // this.listPrints()
  }

  componentWillUnmount() {
    if (this.cancelRequest)
      this.cancelRequest.cancel("Left Prints Page");
  }

  componentDidUpdate(prevProps, prevState) {
    if (JSON.stringify(this.state.search) != JSON.stringify(prevState.search)) {
      // var url = qs.stringify(this.state.search, { addQueryPrefix: true });      
      // this.listPrints();
    }
  }

  render() {
    return (
      <div>
        <Switch>
              {/* <Route path={`${this.props.match.path}/new`} render={ props =>
                <PrinterNew {...this.props}  {...props}/> 
              }/> 
              <Route path={`${this.props.match.path}/:printerId/edit`} exact={true} render={ props =>
                <PrinterEdit {...this.props}  {...props} /> 
              }/>
              <Route path={`${this.props.match.path}/:printerId`} render={ props =>
                <PrinterDetails  {...this.props} {...props} /> 
              }/> */}
              <Route path={`${this.props.match.path}/:printId`} render={ props => 
                <PrintShow {...this.props} {...props}  /> 
              }/>

              <Route path={`${this.props.match.path}`} render={ props => 
                <PrintList {...this.props}  {...props} />  
              }/>
            </Switch>
      </div>
    )
  }	
}

export default Prints
