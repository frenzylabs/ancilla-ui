//
//  list.tsx
//  ancilla
// 
//  Created by Kevin Musselman (kevin@frenzylabs.com) on 12/22/19
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
  Checkbox,
  Dialog,
  Paragraph,
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

import ErrorModal from '../modal/error'
import List from '../table/list'
// const qs = require('qs');

import { NodeState, ServiceState, AttachmentModel }  from '../../store/state'


type Props = {  
  node: NodeState, 
  service: ServiceState,
  location: any,
  match: any
}

type StateProps = {
  loading: boolean,
  printerPrint: any,
  redirectTo: any    
}



export class PrintList extends React.Component<Props> {

  state = {    
    redirectTo: null,
    loading: true,
    showAuth: false,
    deleteRemote: false,
    confirmDelete: null,
    deleting: false,
    syncing: [],
    projects: [],
    profiles: [],
    filter: {
      name: ""
    },
    search: {
      page: 1, 
      per_page: 20, 
      q: {name: undefined}
    },
    list: {
      data: [], 
      meta: {}
    }
  }

  timer:number = null

  cancelRequest = null
  
  constructor(props:any) {
    super(props)
    // var qparams = qs.parse(this.props.location.search, { ignoreQueryPrefix: true })

    // this.state = {    
    //   redirectTo: null,
    //   loading: true,
    //   showAuth: false,
    //   deleteRemote: false,
    //   confirmDelete: null,
    //   deleting: false,
    //   syncing: [],
    //   filter: {
    //     name: ""
    //   },
    //   search: {
    //     page: 1, //parseInt(qparams["page"] || 1), 
    //     per_page: 20, //parseInt(qparams["per_page"] || 20), 
    //     q: {name: ""} //qparams["q"] || {}
    //   },
    //   list: {
    //     data: [], 
    //     meta: {}
    //   }
    // }
    this.listPrints         = this.listPrints.bind(this)
    this.renderSectionHeader = this.renderSectionHeader.bind(this)
    this.renderTableHeader   = this.renderTableHeader.bind(this)
    this.renderRow           = this.renderRow.bind(this)    
    this.onChangePage       = this.onChangePage.bind(this)

    // this.renderPagination   = this.renderPagination.bind(this)
    this.handleFilterChange = this.handleFilterChange.bind(this)
    this.syncToLayerkeep    = this.syncToLayerkeep.bind(this)

    this.cancelRequest = PrinterRequest.cancelSource();
  }

  componentDidMount() {
    this.listPrints()
  }

  componentWillUnmount() {
    if (this.cancelRequest)
      this.cancelRequest.cancel("Left Prints Page");
  }

  componentDidUpdate(prevProps, prevState) {
    if (JSON.stringify(this.state.search) != JSON.stringify(prevState.search)) {
      // var url = qs.stringify(this.state.search, { addQueryPrefix: true });      
      this.listPrints();
    }
  }

  listPrints() {
    this.setState({loading: true})
    PrinterRequest.prints(this.props.node, this.props.service, {qs: this.state.search, cancelToken: this.cancelRequest.token})
    .then((res) => {
      this.setState({
        ...this.state,
        list: res.data,
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

  deletePrint(row) {
    console.log("delete print", row)
    PrinterRequest.deletePrint(this.props.node, this.props.service, row.id)
    .then((res) => {
      // this.listLocal()
      
      // this.setState({redirectTo: `/printers/${this.props.service.id}/prints`})
      toaster.success(`${row.name} has been successfully deleted.`)
    })
    .catch((error) => {
      toaster.danger(<ErrorModal requestError={error} />)
      // toaster.danger(`${this.state.printer_print.name} could not be deleted.`)
    })
  }

  syncToLayerkeep(row) {
    // let lkslice  = e.currentTarget.getAttribute('data-row')
    this.setState({syncing: this.state.syncing.concat(row.id)})
    PrinterRequest.syncPrintToLayerkeep(this.props.node, this.props.service, row.id)
    .then((res) => {
      // this.listLocal()
      var prints = this.state.list.data.map((v) => {
        if (v.id == row.id) {
          return res.data.data
        }
        return v
      })
      this.setState({
        list: {...this.state.list, data: prints},
        syncing: this.state.syncing.filter(function(prid) { return prid !== row.id})
      })

      toaster.success(`${row.name} has been successfully synced.`)
    })
    .catch((error) => {
      if (error.response && error.response.status == 401) {
        console.log("Unauthorized")
        // this.setState({showAuth: true, loading: false})
        this.setState({
          loading: false,
          showAuth: true,
          syncing: this.state.syncing.filter(function(prid) { return prid !== row.id})
        })
      } else {
        // this.setState({requestError: error})
        // toaster.danger(<ErrorModal requestError={error} />)
        this.setState({
          loading: false,
          syncing: this.state.syncing.filter(function(prid) { return prid !== row.id})
        })
      }
      toaster.danger(<ErrorModal requestError={error} />)
    })
  }


  unsyncFromLayerkeep(row) {
    PrinterRequest.unsyncFromLayerkeep(this.props.node, this.props.service, row.id)
    .then((res) => {
      // this.listLocal()
      var prints = this.state.list.data.map((v) => {
        if (v.id == row.id) {
          return res.data.data
        }
        return v
      })
      this.setState({
        list: {...this.state.list, data: prints}
      })

      toaster.success(`${row.name} has been successfully unsynced.`)
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

  selectPrint(row) {
    // var url = qs.stringify(this.state.search, { addQueryPrefix: true });      
    var url = this.props.match.url + "/" + row.id
    this.setState({redirectTo: {pathname: url, state: {printerPrint: row}}})
    // this.props.history.push(`${url}`);
  }

  renderLKMenu(row) {
    if (this.state.syncing.find((rid) => rid == row.id)) {
      return (
        <Menu.Item >Syncing to Layerkeep...</Menu.Item>
      )
    }
    else if (row.layerkeep_id) {
      return (
        <Menu.Item onSelect={() => this.unsyncFromLayerkeep(row)}>UnSync from Layerkeep</Menu.Item>
      )
    } else {
      return (
          <Menu.Item onSelect={() => this.syncToLayerkeep(row)}>Sync to Layerkeep</Menu.Item>
      )
    }
  }

  renderDeleteMenu(row) {
    if (this.state.confirmDelete && this.state.confirmDelete.id == row.id) {
      return (<Menu.Item intent="danger"  data-id={row.id} data-name={row.name}>Deleting</Menu.Item>)
    } else {
      return (<Menu.Item intent="danger"  data-id={row.id} data-name={row.name} onSelect={() => this.onDelete(row)}>
        Delete
        </Menu.Item>
      )
    }
  }

  renderRowMenu = (row) => {
    return (
      <Menu>
        <Menu.Group>
          {this.renderLKMenu(row)}
        </Menu.Group>
        <Menu.Divider />
        <Menu.Group>
          {this.renderDeleteMenu(row)}          
        </Menu.Group>
      </Menu>
    )
  }

  renderRow(row, index) {
    return (
      <Table.Row key={row.id} >
        <Table.TextCell>
          <Link to={{pathname: this.props.match.url + "/" + row.id, state: {printerPrint: row}}} >
          {row.name}
          </Link>
        </Table.TextCell>
        <Table.TextCell>{row.status}</Table.TextCell>
        <Table.TextCell>{Dayjs.unix(row.created_at).format('MM.d.YYYY - hh:mm:ss a')}</Table.TextCell>
        <Table.TextCell>{(row.updated_at - row.created_at)}</Table.TextCell>
        <Table.TextCell>
          <Link to={{pathname: this.props.match.url + "/" + row.id, state: {printerPrint: row}}} >
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

  renderSectionHeader() {
    return (
      <Pane display="flex" marginBottom={20}>
        <Pane display="flex" >
          <Link to={"/printers/" + this.props.service.id}>{this.props.service.name}</Link>&nbsp; / Prints
        </Pane>
      </Pane>
    )
  }

  onDelete(row) {
    this.setState({confirmDelete: row})
  }

  renderConfirmLayerkeepDelete() {
    if (this.state.confirmDelete.layerkeep_id) {
      return (
        <Pane>
                <Paragraph>Your print is currently synced with LayerKeep.</Paragraph>
                <Checkbox
                  label="Check this box to delete from LayerKeep as well"
                  checked={this.state.deleteRemote}
                  onChange={e => {
                    this.setState({deleteRemote: e.target.checked})
                  }}
              />
            </Pane>
      )
    } else {
      return (
        <Pane>
        <Paragraph>Are you sure you want to delete this print?</Paragraph>
        </Pane>
      )
    }
  }
  
  renderConfirmDelete() {
    if (!this.state.confirmDelete) return
      return (
        <React.Fragment>
          <Dialog
            isShown={this.state.confirmDelete ? true : false}
            title="Delete Print?"
            isConfirmLoading={this.state.deleting}
            confirmLabel={this.state.deleting ? "Deleting..." : "Delete"}
            onCloseComplete={() => this.setState({...this.state, deleteRemote: false, confirmDelete: null})}
            onConfirm={() => this.deletePrint(this.state.confirmDelete)}
          >

          {({ close }) => (
              this.renderConfirmLayerkeepDelete()
        )}

        </Dialog>
      </React.Fragment>
    )
  }

  render() {
    return (
      <React.Fragment>
        <Pane display="flex" key={"prints"}>
          <Pane display="flex" flexDirection="column" width="100%" background="#fff" padding={20} margin={20} >
            {this.renderConfirmDelete()}
            {this.renderSectionHeader()}
            <List 
              renderHeader={this.renderTableHeader}              
              renderRow={this.renderRow}
              data={this.state.list}
              loading={this.state.loading}
              onChangePage={this.onChangePage}
              height={395}
            />
          </Pane>
        </Pane>
        <Modal
          component={AuthForm}
          componentProps={{
            node: this.props.node,
            onAuthenticated: (res) => {
              this.setState({
                ...this.state,
                showAuth: false
              })
  
              toaster.success('Succssfully signed in to LayerKeep.com')
            }
          }}
          // requestError={this.state.requestError}
          isActive={this.state.showAuth}
          dismissAction={() => this.setState({showAuth: false}) }
          
        />
      </React.Fragment>
    )
  }	
}

export default PrintList
