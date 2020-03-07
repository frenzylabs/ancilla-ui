//
//  local.tsx
//  ancilla
// 
//  Created by Wess Cope (wess@frenzylabs.com) on 01/02/20
//  Copyright 2019 FrenzyLabs, LLC.
//

import React from 'react'
import Dayjs from 'dayjs'

import {
  Pane,
  IconButton,
  Checkbox,
  Button,
  Dialog,
  Paragraph,
  Text,
  Position,
  Table,
  Menu,
  Popover,
  toaster
} from 'evergreen-ui'

import PubSub from 'pubsub-js'

import Loader from '../../../loader'

import {
  FileHandler
} from '../../../../network'

import FileForm from './file_form'
import Row      from './row'

import List from '../../../table/list'


import { NodeState, ServiceState }  from '../../../../store/state'

type Props = {
  node: NodeState,
  service: ServiceState,
  authenticated: boolean,
  showAuth: Function
}


export default class Local extends React.Component<Props> {
  
  state = {
    showingAddFile: false,
    loading:        false,
    saving:         false,
    syncing: [],
    data:          {
      data: [],
      meta: {
        total: 0
      }
    },
    filter: {
      name: ""
    },
    search: {
      page: 1, 
      per_page: 20, 
      q: {name: undefined}
    },
    printSlice:     null,
    deleteRemote: false,
    confirmDelete: null,
    deleting: false,
    editFile: false    
  }

  addForm: FileForm       =  null
  cancelRequest = FileHandler.cancelSource()
  pubsubToken  = null
  eventTopic   = ""
  timer:number  = null

  constructor(props:any) {
    super(props)


    this.load     = this.load.bind(this)
    this.download = this.download.bind(this)
    this.delete   = this.delete.bind(this)
    this.save     = this.save.bind(this)
    this.setupListeners = this.setupListeners.bind(this)
    this.receiveEvent  = this.receiveEvent.bind(this)
    
    this.handleFilterChange  = this.handleFilterChange.bind(this)
    this.renderLayerkeepSync = this.renderLayerkeepSync.bind(this)
  }

  componentDidMount() {
    this.setupListeners()
    this.load()
  }

  componentWillUnmount() {
    if(this.cancelRequest) {
      this.cancelRequest.cancel("Local Files unmounted")
    }
    PubSub.publishSync(this.props.node.uuid + ".request", [this.props.service.identity, "UNSUB", "events.file"])
    if (this.pubsubToken)
      PubSub.unsubscribe(this.pubsubToken)
  }

  componentDidUpdate(prevProps, prevState) {
    if (JSON.stringify(this.state.search) != JSON.stringify(prevState.search)) {
      this.load();
    }
    
    if (prevProps.service != this.props.service || prevProps.node.uuid != this.props.node.uuid) {
      this.setupListeners()
    }
  }

  setupListeners() {
    if (this.props.service) {
      this.eventTopic = `${this.props.node.uuid}.${this.props.service.identity}.events.file`
      PubSub.publishSync(this.props.node.uuid + ".request", [this.props.service.identity, "SUB", ""])

      if (this.pubsubToken) {
        PubSub.unsubscribe(this.pubsubToken)
      }
      this.pubsubToken = PubSub.subscribe(this.eventTopic, this.receiveEvent);
    }
  }

  
  receiveEvent(msg, data) {
    var [to, kind] = msg.split("events.")
    switch(kind) {
      case 'file.created':
          this.load()
          break
      default:
        break
    }
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


  load() {
    this.loading = true

    FileHandler.listLocal(this.props.node, {qs: this.state.search, cancelToken: this.cancelRequest.token})
    .then((res) => {
      this.setState({
        ...this.state,
        data: res.data,
        loading: false
      })
    })
    .catch((error) => {
      console.error(error)      
      this.loading = false
    })
  }

  download(id) {
    document.location.href = `${this.props.node.apiUrl}/files/${id}?download=true`
  }


  save() {
    this.saving = true

    let request = this.addForm.data.id ?
      FileHandler.update(this.props.node, this.addForm.data.id, this.addForm.data, {cancelToken: this.cancelRequest.token}) 
    : FileHandler.create(this.props.node, this.addForm.data, {cancelToken: this.cancelRequest.token}) 

    request.then((res) => {
      var files = this.state.data.data
      
      if(this.addForm.data.id) {
        files = files.map((f) => {
          return f.id == res.data.file.id ? res.data.file : f
        })
      } else {
        files.unshift(res.data.file)
        this.state.data.meta.total = (this.state.data.meta.total || 0) + 1
      }

      this.setState({
        ...this.state,
        saving:         false,
        showingAddFile: false,
        data: {...this.state.data, data: files, meta: this.state.data.meta}
      })

      toaster.success(`File ${res.data.file.name} has been successfully added`)
    })
    .catch((err) => {
      if(err.response && err.response.status == 401) {
        this.saving = false
        this.props.showAuth()

        return
      }

      this.setState({
        ...this.state,
        saving: false,
        showingAddFile: false
      })

      toaster.danger(
        `Unable to save file ${this.addForm.data.file.name}`, 
        {description: Object.keys(err.response.data.errors).map((key, index) => `${key} : ${err.response.data.errors[key]}<br/>`)}
      )
    })
  }


  delete(row) {
    var params = {}
    if (this.state.deleteRemote) {
      params = {"delete_remote": true}
    }
    this.setState({deleting: true})
    FileHandler.delete(this.props.node, row.id, params)
    .then((res) => {
      this.setState({deleting: false, deleteRemote: false, confirmDelete: false})
      this.load()
      toaster.success(`${row.name} has been successfully deleted.`)
    })
    .catch((_err) => {
      this.setState({deleting: false, deleteRemote: false, confirmDelete: false})
    }) 
  }

  syncFile(row) {
    if (!this.props.authenticated) {
      return this.props.showAuth()
    }
    this.setState({syncing: this.state.syncing.concat(row.id)})
    FileHandler.syncToLayerkeep(this.props.node, row)
    .then((res) => {
      // this.listLocal()
      toaster.success(`${row.name} has been successfully added to Layerkeep.`)
      var file = res.data.file
      var files = this.state.data.data.map((f) => {
        if (f.id == file.id) {
          return file
        }
        return f
      })
      this.setState({
        data: {...this.state.data, data: files},
        syncing: this.state.syncing.filter(function(prid) { return prid !== row.id})
      })
    })
    .catch((error) => {
      this.setState({
        syncing: this.state.syncing.filter(function(prid) { return prid !== row.id})
      })
      if (error.response && error.response.status == 401) {
        this.props.showAuth()        
      }
      console.log("Sync Error", error)
    })
  }

  unsyncFile(row) {
    FileHandler.unsyncFromLayerkeep(this.props.node, row)
    .then((res) => {
      toaster.success(`${row.name} has been successfully unsynced.`)
      var file = res.data.file
      var files = this.state.data.data.map((f) => {
        if (f.id == file.id) {
          return file
        }
        return f
      })
      this.setState({data: {...this.state.data, data: files}})
    })
    .catch((error) => {
      console.log("UnSync Error", error)
    })
  }

  onChangePage(page) {
    this.setState({ search: {...this.state.search, page: page }});    
  }

  onDelete(row) {
    if (this.props.authenticated && row.layerkeep_id) {
      this.setState({confirmDelete: row})
    } else {
      this.delete(row)
    }
  }

  editFile(row) {
    this.setState({showingAddFile: true, printSlice: row})
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


  renderAdd() {
    return (
      <React.Fragment>
        <Dialog
          isShown={this.state.showingAddFile}
          title={(this.state.printSlice && this.state.printSlice.id ? "Edit File" : "Add File")}
          isConfirmLoading={this.state.saving}
          confirmLabel={this.state.saving ? "Saving..." : "Save"}
          onCloseComplete={() => this.setState({...this.state, printSlice: null, showingAddFile: false})}
          onConfirm={this.save}
        >          
          <FileForm
            ref={f => this.addForm = f}
            printSlice={this.state.printSlice}
            loading={this.state.saving}
            node={this.props.node}
          />
        </Dialog>

        <IconButton appearance='minimal' icon="add" onClick={() => {this.setState({...this.state, showingAddFile: true})}}/>
      </React.Fragment>
    )
  }

  renderLayerkeepSync = (row) => {
    if (this.state.syncing.find((rid) => rid == row.id)) {
      return (
        <Menu.Item >Syncing to Layerkeep...</Menu.Item>
      )
    }
    else if (row.layerkeep_id) {
      return (<Menu.Item onSelect={() => this.unsyncFile(row)}>UnSync from Layerkeep</Menu.Item>)
    } else {
      return (<Menu.Item onSelect={() => this.syncFile(row)}>Sync to Layerkeep</Menu.Item>)
    }
  }

  renderConfirmDelete() {
    if (!this.state.confirmDelete) return
      return (
        <React.Fragment>
          <Dialog
            isShown={this.state.confirmDelete ? true : false}
            title="Delete File?"
            isConfirmLoading={this.state.deleting}
            confirmLabel={this.state.deleting ? "Deleting..." : "Delete"}
            onCloseComplete={() => this.setState({...this.state, deleteRemote: false, confirmDelete: null})}
            onConfirm={() => this.delete(this.state.confirmDelete)}
          >

          {({ close }) => (
            <Pane>
              <Paragraph>Your file is currently synced with LayerKeep.</Paragraph>
              <Checkbox
                label="Check this box to delete from LayerKeep as well"
                checked={this.state.deleteRemote}
                onChange={e => {
                  this.setState({deleteRemote: e.target.checked})
                }}
            />
          </Pane>
        )}

        </Dialog>
      </React.Fragment>
    )
  }

  renderMenu(row) {
    return (
      <Popover
        position={Position.BOTTOM_RIGHT}
        content={() => (
          <Menu>
            <Menu.Group>
              
              <Menu.Item secondaryText="" onSelect={() => this.editFile(row)}>Edit</Menu.Item>
              {this.renderLayerkeepSync(row)}
              <Menu.Item secondaryText="" onSelect={() => this.download(row.id)}>Download</Menu.Item>
            </Menu.Group>
            
            <Menu.Divider />
            
            <Menu.Group>
              <Menu.Item intent="danger"  onSelect={() => this.onDelete(row)}>
                Delete... 
              </Menu.Item>
            </Menu.Group>
          </Menu>
        )}>
        <IconButton icon="more" height={24} appearance="minimal" />
      </Popover>

    )
  }

  renderRow(row, index) {
    // const row = this.props['row']

    return (
      <Table.Row key={row.id} isSelectable>
        <Table.TextCell>{row.name}</Table.TextCell>
        <Table.TextCell>{row.description}</Table.TextCell>
        <Table.TextCell>{Dayjs.unix(row.updated_at).format('MM.d.YYYY - hh:mm:ss a')}</Table.TextCell>
        <Table.Cell width={48} flex="none">{this.renderMenu(row)}</Table.Cell>
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
    return (
      <List 
        data={this.state.data}
        loading={this.loading}
        renderHeader={this.renderTableHeader.bind(this)}
        renderRow={this.renderRow.bind(this)}
        onChangePage={this.onChangePage.bind(this)}
      />
    )
  }

  render() {
    return (
      <Pane display="flex">
        <Pane display="flex" flexDirection="column" width="100%" background="#fff" padding={20} margin={10} border="default">
          <Pane display="flex">
            <Pane display="flex" flex={1}>Local</Pane>
            <Pane>{this.renderAdd()}</Pane>
            {this.renderConfirmDelete()}
          </Pane>

          <Pane borderBottom borderLeft borderRight>
            {this.renderData()}
          </Pane>

        </Pane>
      </Pane>
    )
  }
}
