//
//  layerkeep.tsx
//  ancilla
// 
//  Created by Kevin Musselman (kevin@frenzylabs.com) on 01/02/20
//  Copyright 2019 FrenzyLabs, LLC.
//


import React from 'react'
import Dayjs from 'dayjs'

import {
  Pane,
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

import Loader from '../../loader'

import {
  FileHandler, 
  LayerKeepHandler
} from '../../../network'

import { isCancel }       from '../../../network/request'

// import FileForm from './file_form'
// import Row      from './row'

import List from '../../table/list'

import { NodeState }  from '../../../store/state'

type Props = {
  node: NodeState,
  authenticated: boolean,
  showAuth: Function
}


export default class LayerKeep extends React.Component<Props> {
  
  state = {
    showingAddFile: false,
    loading:        false,
    saving:         false,
    authenticated:   false,
    syncing: [],
    data:          {
      data: [],
      meta: {}
    },
    filter: {
      name: ""
    },
    search: {
      page: 1, 
      per_page: 5, 
      q: {name: undefined}
    },
    printSlice:     null
  }

  addForm       = {}
  cancelRequest = LayerKeepHandler.cancelSource()
  timer:number  = null
  

  constructor(props:any) {
    super(props)


    this.listSlices          = this.listSlices.bind(this)
    this.handleFilterChange  = this.handleFilterChange.bind(this)
    this.state.authenticated = (this.props.authenticated == false ? false : true)
    
  }

  componentDidMount() {
    if (this.state.authenticated)
      this.listSlices()
    
  }

  componentWillUnmount() {
    if (this.cancelRequest)
      this.cancelRequest.cancel("Left Layerkeep Page");
  }

  componentDidUpdate(prevProps, prevState) {
    if (JSON.stringify(this.state.search) != JSON.stringify(prevState.search)) {  
      this.listSlices()
    }
    else if (prevProps.authenticated != this.props.authenticated) {
      this.setState({authenticated: this.props.authenticated})
      if (this.props.authenticated) {
        this.listSlices()
      }
    }
  }

  listSlices() {
    this.setState({loading: true})

    LayerKeepHandler.listSlices(this.props.node, {qs: this.state.search, cancelToken: this.cancelRequest.token})
    .then((res) => {
      this.setState({
        ...this.state,
        data: {...this.state.data, ...res.data},
        loading:  false,
        authenticated: true
      })
    })
    .catch((error) => {
      if (isCancel(error)) {
        this.cancelRequest = LayerKeepHandler.cancelSource();
        return
      }
      if (error.response && error.response.status == 401) {
        this.setState({
          ...this.state,
          authenticated: false, 
          loading: false
        })
      } else {
        // this.setState({requestError: error})
        // toaster.danger(<ErrorModal requestError={error} />)
        this.setState({
          ...this.state,
          loading: false,
          error: error
        })
      }
      

      
    })
  }

  syncLocally(lkslice) {
    // let lkslice  = e.currentTarget.getAttribute('data-row')
    
    this.setState({syncing: this.state.syncing.concat(lkslice.id)})
    FileHandler.syncFromLayerkeep(this.props.node, lkslice).then((res) => {
      this.setState({
        syncing: this.state.syncing.filter(function(prid) { return prid !== lkslice.id})
      })
      toaster.success(`${lkslice.attributes.name} has been successfully synced.`)
    }).catch((error) => {
      
      if (error.response && error.response.status == 401) {
        this.props.showAuth()
        this.setState({
          ...this.state,
          authenticated: false,
          syncing: this.state.syncing.filter(function(prid) { return prid !== lkslice.id})
        })
      } else {
        this.setState({
          syncing: this.state.syncing.filter(function(prid) { return prid !== lkslice.id})
        })
      }
    })
  }


  get loading(): boolean {
    return this.state.loading
  }

  set loading(val:boolean) {
    this.setState({
      ...this.state,
      loading: val
    })
  }

  get saving(): boolean {
    return this.state.saving
  }

  set saving(val:boolean) {
    this.setState({
      ...this.state,
      saving: val
    })
  }


  onChangePage(page) {
    this.setState({ search: {...this.state.search, page: page }});    
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


  renderUnauthenticated() {
    // if (this.props.renderUnauthorized)
    return (
      <Pane borderTop padding={20} display="flex" alignItems="center" justifyContent="center" minHeight={340}>
        <Button onClick={() => this.props.showAuth()}>Sign in to LayerKeep.com</Button>
      </Pane>
    )
  }

  renderSyncMenu(row) {
    if (this.state.syncing.find((rid) => rid == row.id)) {
      return (
        <Menu.Item >Syncing to Local Node...</Menu.Item>
      )
    } else {
      return (<Menu.Item onSelect={() => this.syncLocally(row)}>Sync to Local Node</Menu.Item>)
    }
  }

  renderRowMenu = (row) => {
    return (
      <Menu>
        <Menu.Group>
          {this.renderSyncMenu(row)}
        </Menu.Group>
        <Menu.Divider />
        <Menu.Group>
        </Menu.Group>
      </Menu>
    )
  }

  renderRow(row, index) {
    return (
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
            Description:
          </Table.TextHeaderCell>
          <Table.TextHeaderCell>
            Created At:
          </Table.TextHeaderCell>
          <Table.TextHeaderCell width={48} flex="none">
          </Table.TextHeaderCell>
        </Table.Head>
      )
  }

  renderData() {
    if (this.state.authenticated) {
      return (
        <List 
          data={this.state.data}
          loading={this.loading}
          renderHeader={this.renderTableHeader.bind(this)}
          renderRow={this.renderRow.bind(this)}
          onChangePage={this.onChangePage.bind(this)}
        />
      )
    } else {
      return this.renderUnauthenticated()
    }
  }

  render() {
    return (
      <Pane display="flex">
        <Pane display="flex" flexDirection="column" width="100%" background="#fff" padding={20} margin={10} border="default">
          <Pane display="flex">
            <Pane display="flex" flex={1} paddingBottom={10}>LayerKeep</Pane>
          </Pane>

          <Pane borderBottom borderLeft borderRight>
            {this.renderData()}
          </Pane>
        </Pane>
      </Pane>
    )
  }
}
