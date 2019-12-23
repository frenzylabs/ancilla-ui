//
//  ancilla
//  index.tsx
// 
//  Created by Wess Cope (me@wess.io) on 11/16/19
//  Copyright 2019 Wess Cope
//

import React from 'react'
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

import Form 				from './form'
import FileRequest 	from '../../network/files'
import Layerkeep 	from '../../network/layerkeep'
import Modal from '../modal/index'
import AuthForm from '../services/layerkeep/form'
import { PaginatedList } from '../utils/pagination'
import { isCancel } from '../../network/request'

// const qs = require('qs');

export class LKSlicedFilesView extends React.Component {

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
    this.listSlices      = this.listSlices.bind(this)
    this.onChangePage    = this.onChangePage.bind(this)
    this.renderPagination  = this.renderPagination.bind(this)
    this.handleFilterChange = this.handleFilterChange.bind(this)
    this.syncLocally        = this.syncLocally.bind(this)
    // this.deleteFile     = this.deleteFile.bind(this)
    // this.saveFile				= this.saveFile.bind(this)
    // this.toggleDialog		= this.toggleDialog.bind(this)
    // this.renderRow 			= this.renderRow.bind(this)
    // this.renderGroup 		= this.renderGroup.bind(this)
    // this.renderGroups		= this.renderGroups.bind(this)
    // this.renderTopBar		= this.renderTopBar.bind(this)
    // this.renderSection	= this.renderSection.bind(this)

    this.cancelRequest = Layerkeep.cancelSource();
  }

  componentDidMount() {
    this.listSlices()
  }

  componentWillUnmount() {
    if (this.cancelRequest)
      this.cancelRequest.cancel("Left Layerkeep Page");
  }

  componentDidUpdate(prevProps, prevState) {
    if (JSON.stringify(this.state.search) != JSON.stringify(prevState.search)) {
      // var url = qs.stringify(this.state.search, { addQueryPrefix: true });      
      this.listSlices();
    }
  }

  listSlices() {
    this.setState({loading: true})
    Layerkeep.listSlices(this.props.node, {qs: this.state.search, cancelToken: this.cancelRequest.token})
    .then((res) => {
      this.setState({
        ...this.state,
        list: res.data,
        loading: false
      })
    })
    .catch((error) => {
      console.log("ListSlices Error", error)
      if (isCancel(error)) return
      if (error.response && error.response.status == 401) {
        console.log("Unauthorized")
        // this.setState({showAuth: true, loading: false})
        this.setState({loading: false})
      } else {
        // this.setState({requestError: error})
        // toaster.danger(<ErrorModal requestError={error} />)
        this.setState({loading: false})
      }
      this.cancelRequest = Layerkeep.cancelSource();

      
    })
  }

  syncLocally(lkslice) {
    // let lkslice  = e.currentTarget.getAttribute('data-row')
    

    FileRequest.syncFromLayerkeep(this.props.node, lkslice)
    .then((res) => {
      // this.listLocal()

      toaster.success(`${name} has been successfully deleted.`)
    })
    .catch((_err) => {})
  }

  filterList() {
    if (this.state.loading && this.cancelRequest) {
      this.cancelRequest.cancel()
    }
    var search = this.state.search
    this.setState({ search: {...search, page: 1, q: {...search.q, ...this.state.filter} }})
  }

  handleFilterChange(val) {
    console.log("filter change", val)
    if (this.timer) {
      clearTimeout(this.timer)
    }
    this.timer = setTimeout(this.filterList.bind(this), 500);
    this.setState({ filter: {...this.state.filter, name: val}})
    // if (this.state.loading && this.cancelRequest) {
    //   this.cancelRequest.cancel()
    // }
    // var search = this.state.search
    // this.setState({ search: {...search, page: 1, q: {...search.q, name: val} }})
    // this.filterchange = 
    // this.setState({ search: {...search, page: 1, q: {...search.q, project_id: item["id"]} }})
  }

  onChangePage(page) {
    this.setState({ search: {...this.state.search, page: page }});    
  }


  renderRowMenu = (row) => {
    return (
      <Menu>
        <Menu.Group>
          <Menu.Item onSelect={() => this.syncLocally(row)}>Sync to Local Node...</Menu.Item>
        </Menu.Group>
        <Menu.Divider />
        <Menu.Group>
          <Menu.Item intent="danger"  data-id={row.id} data-name={row.attributes.name} onSelect={this.deleteFile}>
            Delete... 
          </Menu.Item>
        </Menu.Group>
      </Menu>
    )
  }

  renderFiles(files) {
    return files.map((row, index) => (
      <Table.Row key={row.id} isSelectable >
        <Table.TextCell>{row.attributes.name}</Table.TextCell>
        <Table.TextCell>{row.attributes.description}</Table.TextCell>
        <Table.TextCell>{Dayjs(row.attributes.updated_at).format('MM.d.YYYY - hh:mm:ss a')}</Table.TextCell>
        
        <Table.Cell width={48} flex="none">
          <Popover
            content={() => this.renderRowMenu(row)}
            position={Position.BOTTOM_RIGHT}
          >
            <IconButton icon="more" height={24} appearance="minimal" />
          </Popover>
        </Table.Cell>
      </Table.Row>
    ))
  }
  renderTable() {

    return (
      <Table>
        <Table.Head>
          <Table.SearchHeaderCell 
            onChange={this.handleFilterChange}
            value={this.state.filter.name}
          />
          <Table.TextHeaderCell >
            Description:
          </Table.TextHeaderCell>
          <Table.TextHeaderCell>
            Created At:
          </Table.TextHeaderCell>
          <Table.TextHeaderCell  width={48} flex="none">
          </Table.TextHeaderCell>
        </Table.Head>
        <Table.VirtualBody height={240}>
          {this.renderFiles(this.state.list.data)}
        </Table.VirtualBody>
      </Table>)
  }

  renderPagination() {
    if (this.state.list.data.length > 0) {
      var {current_page, last_page, total} = this.state.list.meta;
      // console.log("render Pagination ", current_page, last_page, total)
      return (
        <PaginatedList currentPage={current_page} pageSize={this.state.search.per_page} totalPages={last_page} totalItems={total} onChangePage={this.onChangePage} /> 
      )
    }
  }

  render() {
    return (
      <div>
      <Pane display="flex" key={"layerkeep"}>
        <Pane display="flex" flexDirection="column" width="100%" background="#fff" padding={20} margin={10} border="default">
          <Pane display="flex">
            <Pane display="flex" flex={1}>
                LayerKeep
            </Pane>
            <Pane>
              
            </Pane>
          </Pane>

          <Pane borderBottom borderLeft borderRight>
            {this.renderTable()}
            {/* {files.map((row, index) => this.renderRow(row.id, row.name, Dayjs.unix(row.updated_at).format('MM.d.YYYY - hh:mm:ss a')))} */}
          </Pane>
          {this.renderPagination()}
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

export default LKSlicedFilesView
