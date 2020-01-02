//
//  table_controller.tsx
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
import TableController from '../table/controller'
// const qs = require('qs');

import PropTypes from 'prop-types'

const optionPropTypes = {
  renderSectionHeader: PropTypes.func,  
  listData: PropTypes.func.isRequired,
  isAuthorized: PropTypes.bool,
  node: PropTypes.object,
  service: PropTypes.object,
  match: PropTypes.object,
  height: PropTypes.number
}

const statePropTypes = {
  loading: PropTypes.bool,
  filter: PropTypes.object,
  search: PropTypes.object,
  showUnauth: PropTypes.func,
  redirectTo: PropTypes.object,
  data: PropTypes.any

}
type TableProps = PropTypes.InferProps<typeof optionPropTypes>
type TableStateProps = PropTypes.InferProps<typeof statePropTypes>

export class RecordingsController extends React.Component<TableProps, TableStateProps> {

  // state = { 
  //   printerPrint: null,
  //   redirectTo: null,
  //   filter: {
  //     name: ""
  //   },
  //   search: {
  //     page: Number, 
  //     per_page: Number, 
  //     q: {name: undefined}
  //   },
  //   data: {
  //     data: [],
  //     meta: {}
  //   },
  //   printerCommand: null
  // }

  timer:number = null

  cancelRequest = null
  
  constructor(props:any) {
    super(props)
    // var qparams = qs.parse(this.props.location.search, { ignoreQueryPrefix: true })

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
    
    this.handleFilterChange = this.handleFilterChange.bind(this)
    this.cancelRequest = PrinterRequest.cancelSource();

  }

  componentDidMount() {

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


  getData(search = {}) {
    
    // var params = {print_id: this.props.printId}
    if (this.props.listData)  {
      // this.setState({loading: true})
    // return PrinterRequest.getPrinterCommands(this.props.node, this.props.service, {qs: search, params: params, cancelToken: this.cancelRequest.token})
      return this.props.listData(this.state.search)
      .then((res) => {
        this.setState({
          ...this.state,
          data: res.data,
          loading: false
        })
      })
      .catch((error) => {
        console.log(error)
        if (error.response && error.response.status == 401) {
          console.log("Unauthorized")
          // this.setState({showAuth: true, loading: false})
          this.setState({loading: false})
        } else {
          // this.setState({requestError: error})
          // toaster.danger(<ErrorModal requestError={error} />)
          this.setState({loading: false})
        }
        // this.cancelRequest = PrinterRequest.cancelSource();
      })
    }
  }


  deleteRecording(row) {
    console.log("delete recording", row)
    CameraRequest.deleteRecording(this.props.node, this.props.service, row.id)
    .then((res) => {
      this.getData(this.state.search)
      
      toaster.success(`Recording has been successfully deleted.`)
    })
    .catch((error) => {
      toaster.danger(<ErrorModal requestError={error} />)
      // toaster.danger(`${this.state.printer_print.name} could not be deleted.`)
    })
  }

  filterList() {
    if (this.state.loading && this.cancelRequest) {
      this.cancelRequest.cancel()
    }
    var search = this.state.search
    this.setState({ search: {...search, page: 1, q: {...search.q, ...this.state.filter} }})
  }

  handleFilterChange(val) {
    // console.log("filter change", val)
    if (this.timer) {
      clearTimeout(this.timer)
    }
    this.timer = setTimeout(this.filterList.bind(this), 500);
    this.setState({ filter: {...this.state.filter, name: val}})
  }

  onChangePage(page) {
    console.log("recordings tc page change", page)
    this.setState({ search: {...this.state.search, page: page }});    
  }

  selectRecording(row) {
    // var url = qs.stringify(this.state.search, { addQueryPrefix: true });      
    var url = this.props.match.url + "/" + row.id
    this.setState({redirectTo: {pathname: url, state: {cameraRecording: row}}})
    // this.props.history.push(`${url}`);
  }
  


  renderRowMenu = (row) => {
    return (
      <Menu>
        <Menu.Group>
        </Menu.Group>
        <Menu.Divider />
        <Menu.Group>
          <Menu.Item intent="danger"  data-id={row.id} data-name={row.name} onSelect={() => this.deleteRecording(row)}>
            Delete... 
          </Menu.Item>
        </Menu.Group>
      </Menu>
    )
  }

  renderRow(row, index) {
    return (
      <Table.Row key={row.id} >
        <Table.TextCell>
          <Link to={{pathname: this.props.match.url + "/" + row.id, state: {cameraRecording: row}}} >
          {row.name}
          </Link>
        </Table.TextCell>
        <Table.TextCell>{row.status}</Table.TextCell>
        <Table.TextCell>{Dayjs.unix(row.created_at).format('MM.d.YYYY - hh:mm:ss a')}</Table.TextCell>
        <Table.TextCell>{(row.updated_at - row.created_at)}</Table.TextCell>
        <Table.TextCell>
          <Link to={{pathname: this.props.match.url + "/" + row.id, state: {cameraRecording: row}}} >
            View
          </Link>
        </Table.TextCell>
        
        <Table.Cell width={48} flex="none">
          <Popover
            content={() => this.renderRowMenu(row)}
            position={Position.BOTTOM_RIGHT}
          >
            <IconButton icon="more" height={24} appearance="minimal" />
          </Popover>
        </Table.Cell>
      </Table.Row>
    )
  }
  
  renderTableHeader() {
    return (
        <Table.Head>
          <Table.SearchHeaderCell 
            onChange={this.handleFilterChange}
            value={this.state.filter.name}
          />
          <Table.TextHeaderCell >
            Status:
          </Table.TextHeaderCell>
          <Table.TextHeaderCell>
            Created At:
          </Table.TextHeaderCell>
          <Table.TextHeaderCell>
            Duration:
          </Table.TextHeaderCell>
          <Table.TextHeaderCell></Table.TextHeaderCell>
          <Table.TextHeaderCell  width={48} flex="none">
          </Table.TextHeaderCell>
        </Table.Head>
      )
  }


  render() {
    return (
      <React.Fragment>
        <TableController 
          {...this.props}
          data={this.state.data}
          listData={this.getData}
          renderHeader={this.renderTableHeader.bind(this)}
          renderRow={this.renderRow.bind(this)}      
          onChangePage={this.onChangePage}
        ></TableController>
      </React.Fragment>)
  }	
}

export default RecordingsController
