//
//  commands_controller.tsx
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
  Dialog,
  Paragraph,
  Table,
} from 'evergreen-ui'


import PrinterRequest 	from '../../network/printer'

import ErrorModal from '../modal/error'


import TableController from '../table/controller'


import PropTypes from 'prop-types'

const optionPropTypes = {
  renderSectionHeader: PropTypes.func,  
  listData: PropTypes.func.isRequired,
  isAuthorized: PropTypes.bool,
  node: PropTypes.object,
  service: PropTypes.object,
  match: PropTypes.object,
  height: PropTypes.number,
  printId: PropTypes.number
}

const statePropTypes = {
  loading: PropTypes.bool,
  filter: PropTypes.object,
  search: PropTypes.object,
  showUnauth: PropTypes.func,
  redirectTo: PropTypes.object,
  data: PropTypes.any,
  printerCommand: PropTypes.any

}
type TableProps = PropTypes.InferProps<typeof optionPropTypes>
type TableStateProps = PropTypes.InferProps<typeof statePropTypes>

export class CommandsController extends React.Component<TableProps, TableStateProps> {

  timer:number = null

  cancelRequest = null
  
  constructor(props:any) {
    super(props)
    // var qparams = qs.parse(this.props.location.search, { ignoreQueryPrefix: true })

    this.state = {    
      loading: true,
      redirectTo: null,
      filter: {
        name: ""
      },
      search: {
        page: 1, 
        per_page: 5, //parseInt(qparams["per_page"] || 20), 
        q: {name: ""} //qparams["q"] || {}
      },
      data: {
        data: [],
        meta: {}
      },
      printerCommand: null
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
      this.getData();
    }
  }


  getData() {
    this.setState({loading: true})
    var params = {print_id: this.props.printId}
    var req = null
    if (this.props.listData)  {
      req = this.props.listData(this.state.search)      
    } else {
      req = PrinterRequest.getPrinterCommands(this.props.node, this.props.service, {qs: this.state.search, params: params, cancelToken: this.cancelRequest.token}) 
    }
    return req
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
        this.cancelRequest = PrinterRequest.cancelSource();
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
    if (this.timer) {
      clearTimeout(this.timer)
    }
    this.timer = setTimeout(this.filterList.bind(this), 500);
    this.setState({ filter: {...this.state.filter, name: val}})
  }

  onChangePage(page) {
    this.setState({ search: {...this.state.search, page: page }});    
  }

  showResponse(row) {
    this.setState({printerCommand: row})
  } 


  renderCommandRow(row, index) {
    return (
      <Table.Row key={row.id} isSelectable >
        <Table.TextCell>{row.command}</Table.TextCell>
        <Table.TextCell>{row.status}</Table.TextCell>        
        <Table.TextCell onClick={() => this.showResponse(row)}>{row.response}</Table.TextCell>
        <Table.TextCell width={210} flex="none">{Dayjs.unix(row.created_at).format('MM.d.YYYY - hh:mm:ss a')}</Table.TextCell>
      </Table.Row>
    )
  }

  renderCommandHeader() {
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
            Response:
          </Table.TextHeaderCell>
          <Table.TextHeaderCell  width={210} flex="none">
            Created At:
          </Table.TextHeaderCell>
        </Table.Head>
    )
  }

  renderCommandResponse(response) {
    return (response || []).map((r, index) => {
      return (
        <Paragraph key={index}>{r}</Paragraph>
      )
    })
  }

  renderDialog() {
    return (<Dialog
      isShown={!!this.state.printerCommand}
      title={this.state.printerCommand && this.state.printerCommand.command}
      confirmLabel="OK"
      onCloseComplete={() => this.setState({printerCommand: null})}
      hasCancel={false}
    >
        <Pane >{this.state.printerCommand && this.renderCommandResponse(this.state.printerCommand.response)}</Pane>

    </Dialog>)
  }

  
  renderSectionHeader(title) {
    return (
      <Pane display="flex" flexDirection="column" width="100%" background="#fff" paddingY={10} paddingX={15} margin={0} borderBottom="default">
        {title}
      </Pane>
    )
  }
  

  render() {
    if (this.state.redirectTo) {
      return (<Redirect to={this.state.redirectTo} />)
    }
    return (
      <React.Fragment>
        <TableController 
          {...this.props}
          data={this.state.data}
          listData={this.getData}
          loading={this.state.loading}
          renderHeader={this.renderCommandHeader.bind(this)}
          renderRow={this.renderCommandRow.bind(this)}  
          onChangePage={this.onChangePage}        
        ></TableController>
        {this.renderDialog()}
      </React.Fragment>)
  }	
}

export default CommandsController
