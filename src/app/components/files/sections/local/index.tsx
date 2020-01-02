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
  Button,
  Dialog,
  Text,
  Position,
  Table,
  Menu,
  Popover,
  toaster
} from 'evergreen-ui'

import Loader from '../../../loader'

import {
  FileHandler
} from '../../../../network'

import FileForm from './file_form'
import Row      from './row'

import List from '../../../table/list'

export default class Local extends React.Component {
  
  state = {
    showingAddFile: false,
    loading:        false,
    saving:         false,
    data:          {
      data: [],
      meta: {}
    },
    filter: {
      name: ""
    },
    search: {
      page: 1, 
      per_page: 20, 
      q: {name: undefined}
    },
    printSlice:     null
  }

  addForm       = {}
  cancelRequest = FileHandler.cancelSource()

  constructor(props:any) {
    super(props)


    this.load     = this.load.bind(this)
    this.download = this.download.bind(this)
    this.delete   = this.delete.bind(this)
    this.save     = this.save.bind(this)
  }

  componentDidMount() {
    this.load()
  }

  componentWillUnmount() {
    if(this.cancelRequest) {
      this.cancelRequest.cancel("Local Files unmounted")
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (JSON.stringify(this.state.search) != JSON.stringify(prevState.search)) {
      this.load();
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
    .catch((err) => {
      console.error(err)

      this.loading = false
    })
  }

  download(id) {
    document.location.href = `${this.props.node.apiUrl}/files/${id}?download=true`
  }

  delete(row) {
    FileHandler.delete(row.id)
    .then((res) => {
      this.load()
      toaster.success(`${row.name} has been successfully deleted.`)
    })
    .catch((_err) => {}) 
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



  onChangePage(page) {
    this.setState({ search: {...this.state.search, page: page }});    
  }

  renderAdd() {
    return (
      <React.Fragment>
        <Dialog
          isShown={this.state.showingAddFile}
          title="Add File"
          confirmLabel={this.state.saving ? "Saving..." : "Save"}
          onCloseComplete={() => this.setState({...this.state, showingAddFile: false})}
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


  renderRow(row, index) {
    return (
          <Row 
            key={row.id}
            row={row}
            download={this.download}
            onDelete={this.delete}
          />
        )
  }
  renderTableHeader() {
    return (
        <Table.Head>
          <Table.SearchHeaderCell />
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
          </Pane>

          <Pane borderBottom borderLeft borderRight>
            {this.renderData()}
          </Pane>
        </Pane>
      </Pane>
    )
  }
}
