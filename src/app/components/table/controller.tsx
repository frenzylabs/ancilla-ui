//
//  controller.tsx
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
  Heading,
  Paragraph,
  Position,
  Table,
  Menu,
  Popover,
  toaster
} from 'evergreen-ui'

// import Form 				from './form'
import PrinterRequest 	from '../../network/printer'
import CameraRequest    from '../../network/camera'
import Layerkeep 	from '../../network/layerkeep'
import Modal from '../modal/index'
import AuthForm from '../services/layerkeep/form'
import { PaginatedList } from '../utils/pagination'

import ErrorModal from '../modal/error'

import List from '../table/list'
// const qs = require('qs');

import PropTypes from 'prop-types'

const optionPropTypes = {
  renderSectionHeader: PropTypes.func,
  renderHeader: PropTypes.func,
  renderRow: PropTypes.func,
  showUnauth: PropTypes.func,
  onFilter: PropTypes.func,
  onSearch: PropTypes.func,
  onChangePage: PropTypes.func,
  listData: PropTypes.func,
  isAuthorized: PropTypes.bool,
  loading: PropTypes.bool,
  data: PropTypes.any

}

const statePropTypes = {
  
  filter: PropTypes.object,
  search: PropTypes.object,
  showUnauth: PropTypes.func,
  redirectTo: PropTypes.object,
  data: PropTypes.any

}
type TableProps = PropTypes.InferProps<typeof optionPropTypes>
type TableStateProps = PropTypes.InferProps<typeof statePropTypes>




export class TableController extends React.Component<TableProps, TableStateProps> {

  timer:number = null
  cancelRequest = null
  
  constructor(props:any) {
    super(props)

    this.state = {
      redirectTo: null,
      filter: {
        name: ""
      },
      search: {
        page: 1, //parseInt(qparams["page"] || 1), 
        per_page: 5, //parseInt(qparams["per_page"] || 20), 
        q: {name: ""} //qparams["q"] || {}
      },
      data: {
        data: [],
        meta: {}
      }
    }
    this.getData        = this.getData.bind(this)
    this.onChangePage       = this.onChangePage.bind(this)


    // this.cancelRequest = PrinterRequest.cancelSource();

  }

  componentDidMount() {
    this.getData()
  }


  componentWillUnmount() {
    if (this.cancelRequest)
      this.cancelRequest.cancel("Left Print Show Page");
  }

  componentDidUpdate(prevProps, prevState) {
    if (JSON.stringify(this.state.search) != JSON.stringify(prevState.search)) {
      // var url = qs.stringify(this.state.search, { addQueryPrefix: true });      
      this.getData();
    }
  }


  getData() {
    if (this.props.listData) {
      this.props.listData(this.state.search)      
    }
  }


  
  onChangePage(page) {
    if (this.props.onChangePage) {
      this.props.onChangePage(page)
    } else {
      this.setState({ search: {...this.state.search, page: page }});    
    }
  }

  
  renderSectionHeader() {
    if (this.props.renderSectionHeader)
      return this.props.renderSectionHeader()
  }
  
  renderHeader() {
    if (this.props.renderHeader)
      return this.props.renderHeader()
  }
  renderRow(row, index) {
    if (this.props.renderRow)
      return this.props.renderRow(row, index)
  }


  render() {
    return (
      <List 
        renderSectionHeader={this.renderSectionHeader.bind(this)} 
        data={this.props.data}
        loading={this.props.loading}
        renderHeader={this.renderHeader.bind(this)}
        renderRow={this.renderRow.bind(this)}
        onChangePage={this.onChangePage}
      ></List>
    )
  }	
}

export default TableController
