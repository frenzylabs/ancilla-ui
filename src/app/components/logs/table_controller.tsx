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
  IconButton,
  Position,
  Table,
  Menu,
  Popover,
  toaster
} from 'evergreen-ui'

// import Form 				from './form'
import PrinterRequest 	from '../../network/printer'

import ErrorModal from '../modal/error'


import TableController from '../table/controller'


import PropTypes, { number } from 'prop-types'
import { ServiceHandler } from '../../network';

const optionPropTypes = {
  renderSectionHeader: PropTypes.func,  
  listData: PropTypes.func.isRequired,
  isAuthorized: PropTypes.bool,
  node: PropTypes.any,
  service: PropTypes.any,
  match: PropTypes.any,
  height: PropTypes.number,
  reload: PropTypes.any
}

const statePropTypes = {
  loading: PropTypes.bool,
  filter: PropTypes.shape({
    name: PropTypes.string
  }),
  search: PropTypes.shape({
    per_page: PropTypes.number,
    page: PropTypes.number,
    q: PropTypes.object
  }),
  showUnauth: PropTypes.func,
  redirectTo: PropTypes.object,
  data: PropTypes.any

}
type TableProps = PropTypes.InferProps<typeof optionPropTypes>
type TableStateProps = PropTypes.InferProps<typeof statePropTypes>

export class LogsController extends React.Component<TableProps, TableStateProps> {


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
    if (JSON.stringify(this.state.search) != JSON.stringify(prevState.search) || 
        prevProps.reload != this.props.reload) {
      // var url = qs.stringify(this.state.search, { addQueryPrefix: true });      
      this.getData();
    }
  }


  getData(search = {}) {
    
    // var params = {print_id: this.props.printId}
    if (this.props.listData)  {

      return this.props.listData(this.state.search)
      .then((res) => {
        this.setState({
          ...this.state,
          data: {...this.state.data, ...res.data},
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


  deleteLog(row) {

    ServiceHandler.deleteLog(this.props.node, this.props.service, row.filename)
    .then((res) => {
      this.getData(this.state.search)
      
      toaster.success(`Log has been successfully deleted.`)
    })
    .catch((error) => {
      toaster.danger(<ErrorModal requestError={error} />)
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
    this.setState({ search: {...this.state.search, page: page }});    
  }

  downloadFile(filename) {
    window.open(
      `${this.props.node.apiUrl}/services/${this.props.service.kind}/${this.props.service.id}/logs/${filename}?download=true`,
      '_blank' 
    );
  }


  renderRowMenu = (row) => {
    return (
      <Menu>
        <Menu.Group>
          <Menu.Item secondaryText="" onSelect={() => this.downloadFile(row.filename)}>Download</Menu.Item>
        </Menu.Group>
        <Menu.Divider />
        <Menu.Group>
          <Menu.Item intent="danger"  data-id={row.id} data-name={row.name} onSelect={() => this.deleteLog(row)}>
            Delete... 
          </Menu.Item>
        </Menu.Group>
      </Menu>
    )
  }

  renderRow(row, index) {

    var key = (row.id || row.filename)
    return (
      <Table.Row key={key} >
        <Table.TextCell>
          {row.filename}
        </Table.TextCell>
        <Table.TextCell>{row.size}</Table.TextCell>
        <Table.TextCell>{Dayjs.unix(row.mtime).format('MM.d.YYYY - hh:mm:ss a')}</Table.TextCell>
        
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
          <Table.TextHeaderCell >
            Filename:
          </Table.TextHeaderCell>
          <Table.TextHeaderCell >
            Size:
          </Table.TextHeaderCell>
          <Table.TextHeaderCell>
            Created At:
          </Table.TextHeaderCell>
          <Table.TextHeaderCell  width={48} flex="none"></Table.TextHeaderCell>
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

export default LogsController
