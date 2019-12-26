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
import Loader from '../loader'

// const qs = require('qs');

export class LKSlicedFilesView extends React.Component {

  state = {    
    isLoading: true,
    showAuth: false,
    authorized: false,
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
    // this.setState({loading: true})

    Layerkeep.listSlices(this.props.node, {qs: this.state.search, cancelToken: this.cancelRequest.token})
    .then((res) => {
      this.setState({
        ...this.state,
        list: res.data,
        isLoading: false
      })
    })
    .catch((error) => {
      console.log("ListSlices Error", error)
      if (isCancel(error)) return
      if (error.response && error.response.status == 401) {
        console.log("Unauthorized")
        this.setState({authorized: false, isLoading: false})
      } else {
        // this.setState({requestError: error})
        // toaster.danger(<ErrorModal requestError={error} />)
        this.setState({isLoading: false})
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
    // console.log("filter change", val)
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
    if(this.state.isLoading) {
      return this.renderLoader()
    }

    if(!this.state.authorized) {
      return this.renderLogin()
    }

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
        <Table.VirtualBody minHeight={this.state.search.per_page * 30}>
          {this.renderFiles(this.state.list.data)}
        </Table.VirtualBody>
      </Table>)
  }

  renderPagination() {
    if (this.state.list.data.length > 0) {
      let {current_page, last_page, total} = this.state.list.meta

      return (
        <PaginatedList currentPage={current_page} pageSize={this.state.search.per_page} totalPages={last_page} totalItems={total} onChangePage={this.onChangePage} /> 
      )
    }
  }

  renderLoader() {
    return (
      <Pane borderTop padding={20} display="flex" alignItems="center" justifyContent="center" minHeight={340}>
        <Loader/>
      </Pane>
    )
  }


  renderLogin() {
    return (
      <Pane borderTop padding={20} display="flex" alignItems="center" justifyContent="center" minHeight={340}>
        <Button onClick={() => {
          this.setState({
            ...this.state,
            showAuth: true
          })
        }}>Sign in to LayerKeep.com</Button>
      </Pane>
    )
  }

  render() {
    return (
      <div>
      <Pane display="flex" key={"layerkeep"}>
        <Pane display="flex" flexDirection="column" width="100%" background="#fff" padding={20} margin={10} border="default">
          <Pane display="flex">
            <Pane display="flex" flex={1} marginBottom={20}>
                LayerKeep
            </Pane>
            <Pane>
            </Pane>
          </Pane>

          <Pane borderBottom borderLeft borderRight>
            {this.renderTable()}
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
