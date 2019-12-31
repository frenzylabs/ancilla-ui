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
import Layerkeep    from './layerkeep'
import Modal        from '../modal/index'
import AuthForm     from '../services/layerkeep/form'
import Loader       from '../loader'

export default class FilesView extends React.Component {

  state = {
    loading: {
      local:      true,
      layerkeep:  true
    },
    dialog: {
      layerkeep: 	false,
      local: 			false,
      sd: 				false
    },
    isSaving: false,
    printSlice: null,
    sections: {
      'all': [],
      'Local': [],
    },

    currentSection: 0
  }

  form:Form = {}
  cancelRequest = null
  
  constructor(props:any) {
    super(props)

    this.listLocal      = this.listLocal.bind(this)
    this.selectSection	= this.selectSection.bind(this)
    this.deleteFile     = this.deleteFile.bind(this)
    this.syncFile       = this.syncFile.bind(this)
    this.unsyncFile     = this.unsyncFile.bind(this)
    this.downloadFile   = this.downloadFile.bind(this)
    this.saveFile				= this.saveFile.bind(this)
    this.toggleDialog		= this.toggleDialog.bind(this)

    this.cancelRequest = FileRequest.cancelSource();
  }

  componentDidMount() {
    this.listLocal()
  }

  componentWillUnmount() {
    if (this.cancelRequest)
      this.cancelRequest.cancel("FileView Unmounted")
  }

  listLocal() {
    this.setState({
      loading: {
        ...this.state.loading,
        local: true
      }
    })

    FileRequest.listLocal({cancelToken: this.cancelRequest.token})
    .then((res) => {
      let files = res.data['files'] || []

      this.setState({
        ...this.state,
        sections: {
          Local: files
        },
        loading: {
          ...this.state.loading,
          local: false
        }
      })
    })
    .catch((err) => {
      console.log(err)
    })
  }

  selectSection(index:number) {
    this.setState({
      ...this.state,
      currentSection: index
    })
  }

  saveFile() {
    this.setState({
      ...this.state,
      isSaving: true
    })

    var request = null
    if (this.form.state.newFile.id){
      request = FileRequest.update(this.props.node, this.form.state.newFile.id, this.form.state.newFile, {cancelToken: this.cancelRequest.token})
    } else {
     request = FileRequest.create(this.props.node, this.form.state.newFile, {cancelToken: this.cancelRequest.token})
    }

    request.then((res) => {
      var files = (this.state.sections.Local || [])
      if (this.form.state.newFile.id) {
        files = files.map((f) => {
          if (f.id == res.data.file.id) {
            return res.data.file
          } 
          return f
        })
      } else {
        files.unshift(res.data.file)
      }

      this.setState({
        ...this.state,
        isSaving: false,
        dialog: {
          layerkeep: 	false,
          local: 			false,
          sd: 				false
        },		
        sections: {
          ...this.state.sections,
          Local: files
        }
      })

      toaster.success(`File ${res.data.file.name} has been successfully added`)
    })
    .catch((err) => {
      if (err.response && err.response.status == 401) {
        console.log("Unauthorized")
        this.setState({
          showAuth: true, 
          isSaving: false
        })
      } else {

        this.setState({
          ...this.state,
          isSaving: false,
          dialog: {
            layerkeep: 	false,
            local: 			false,
            sd: 				false
          }
        })

        let errors = Object.keys(err.response.data.errors).map((key, index) => {
          return  `${key} : ${err.response.data.errors[key]}<br/>`
        })

        toaster.danger(
          `Unable to save file ${this.form.state.file.name}`, 
          {description: errors}
        )
      }
    })
  }

  deleteFile(e) {
    let name  = e.currentTarget.getAttribute('data-name')
    let id    = e.currentTarget.getAttribute('data-id')

    FileRequest.delete(id)
    .then((res) => {
      this.listLocal()

      toaster.success(`${name} has been successfully deleted.`)
    })
    .catch((_err) => {})
  }

  
  syncFile(row) {
    console.log(row)
    FileRequest.syncToLayerkeep(this.props.node, row)
    .then((res) => {
      // this.listLocal()
      console.log("Sync Success", res)
      toaster.success(`${row.name} has been successfully added to Layerkeep.`)
    })
    .catch((error) => {
      console.log("Sync Error", error)
    })
  }

  unsyncFile(row) {
    console.log(row)
    FileRequest.unsyncFromLayerkeep(this.props.node, row)
    .then((res) => {
      // this.listLocal()
      console.log("UnSync Success", res)
      toaster.success(`${row.name} has been successfully unsynced.`)
    })
    .catch((error) => {
      console.log("UnSync Error", error)
    })
  }

  downloadFile(fileId) {
    document.location.href = `${this.props.node.apiUrl}/files/${fileId}?download=true`
  }

  authenticated(res) {
    this.setState({showAuth: false})
  }

  toggleDialog(show:boolean, section:string) {
    var _dialog = this.state.dialog
    _dialog[section] = show

    this.setState({
      ...this.state,
      dialog: _dialog,
      printSlice: (show ? this.state.printSlice : null)
    })
  }

  renderAddFile(section) {
    if(typeof section === 'undefined' || section == 'all') { return }

    return (
      <React.Fragment>
        <Dialog
          isShown={this.state.dialog[section] || false}
          title="Add File"
          confirmLabel={this.state.isSaving ? 'Saving...' : 'Save'}
          onCloseComplete={() => this.toggleDialog(false, section)}
          onConfirm={this.saveFile}
          
        >
          <Form ref={frm => this.form = frm} node={this.props.node} save={this.saveFile} loading={this.state.isSaving} printSlice={this.state.printSlice} />
        </Dialog>

        <IconButton appearance='minimal' icon="add" onClick={() => this.toggleDialog(true, section)}/>
      </React.Fragment>
    )
  }

  renderLayerkeepSync = (row) => {
    if (row.layerkeep_id) {
      return (<Menu.Item onSelect={() => this.unsyncFile(row)}>UnSync from Layerkeep...</Menu.Item>)
    } else {
      return (<Menu.Item onSelect={() => this.syncFile(row)}>Sync to Layerkeep...</Menu.Item>)
    }
  }

  renderEdit(section, row) {
    this.state.dialog[section] = true
    this.setState({printSlice: row})
  }

  renderRowMenu = (section, row) => {
    return (
      <Menu>
        <Menu.Group>
          {this.renderLayerkeepSync(row)}
          <Menu.Item onSelect={() => this.renderEdit(section, row)}>Edit</Menu.Item>
          <Menu.Item secondaryText="" onSelect={() => this.downloadFile(row.id)}>Download</Menu.Item>
        </Menu.Group>
        <Menu.Divider />
        <Menu.Group>
          <Menu.Item intent="danger"  data-id={row.id} data-name={row.name} onSelect={this.deleteFile}>
            Delete... 
          </Menu.Item>
        </Menu.Group>
      </Menu>
    )
  }

  renderTable(section, files) {
    return (
      <Table>
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
        <Table.VirtualBody minHeight={340}>
          {files.map((row, index) => (
            <Table.Row key={row.id} isSelectable >
              <Table.TextCell>{row.name}</Table.TextCell>
              <Table.TextCell >
                {row.description}
              </Table.TextCell>
              <Table.TextCell>{Dayjs.unix(row.updated_at).format('MM.d.YYYY - hh:mm:ss a')}</Table.TextCell>
              
              <Table.Cell width={48} flex="none">
                <Popover
                  content={() => this.renderRowMenu(section, row)}
                  position={Position.BOTTOM_RIGHT}
                >
                  <IconButton icon="more" height={24} appearance="minimal" />
                </Popover>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.VirtualBody>
      </Table>)
  }
  
  renderLoader() {
    return (
      <Pane borderTop padding={20} display="flex" alignItems="center" justifyContent="center" minHeight={340}>
        <Loader/>
      </Pane>
    )
  }

  renderLocal() {
    return (
      <Pane display="flex">
        <Pane display="flex" flexDirection="column" width="100%" background="#fff" padding={20} margin={10} border="default">
          <Pane display="flex">
            <Pane display="flex" flex={1}>
              Local
            </Pane>
          
            <Pane>
              {this.renderAddFile('local')}
            </Pane>
          </Pane>

          <Pane borderBottom borderLeft borderRight>
            {this.state.loading.local ? this.renderLoader() : this.renderTable('local', this.state.sections.Local)}
          </Pane>
        </Pane>
      </Pane>
    )
  }
  
  renderLayerKeep() {
    return (
      <Layerkeep {...this.props} />
    )
  }

  render() {
    return (
      <Pane>
        <div className="scrollable-content" >
          {this.renderLocal()}
          {this.renderLayerKeep()}
        </div>
        
        <Modal
          component={AuthForm}
          node={this.props.node}
          // requestError={this.state.requestError}
          isActive={this.state.showAuth}
          dismissAction={() => this.setState({showAuth: false})}
          onAuthenticated={this.authenticated.bind(this)}
        />
      </Pane>
    )
  }	
}
