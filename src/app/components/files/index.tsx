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

import Layerkeep from './layerkeep'

export default class FilesView extends React.Component {

  state = {
    dialog: {
      layerkeep: 	false,
      local: 			false,
      sd: 				false
    },
    isSaving: false,
    sections: {
      'all': [],
      // 'LayerKeep': [
      // 	'layerkeep-file-1',
      // 	'layerkeep-file-2',
      // 	'layerkeep-file-3',
      // 	'layerkeep-file-4',
      // 	'layerkeep-file-5',
      // ],
      'Local': [
        /* {name:, id:, updated_at} */
      ],
      // 'SD Card': [
      // 	'sd-card-file-1',
      // 	'sd-card-file-2',
      // 	'sd-card-file-3',
      // 	'sd-card-file-4',
      // 	'sd-card-file-5',
      // ]
    },

    currentSection: 0
  }

  form:Form = {}
  
  constructor(props:any) {
    super(props)

    this.listLocal      = this.listLocal.bind(this)
    this.selectSection	= this.selectSection.bind(this)
    this.deleteFile     = this.deleteFile.bind(this)
    this.saveFile				= this.saveFile.bind(this)
    this.toggleDialog		= this.toggleDialog.bind(this)
    this.renderRow 			= this.renderRow.bind(this)
    this.renderGroup 		= this.renderGroup.bind(this)
    this.renderGroups		= this.renderGroups.bind(this)
    this.renderTopBar		= this.renderTopBar.bind(this)
    this.renderSection	= this.renderSection.bind(this)
  }

  componentDidMount() {
    this.listLocal()
  }

  listLocal() {
    FileRequest.listLocal()
    .then((res) => {
      let files = res.data['files'] || []

      this.setState({
        ...this.state,
        sections: {
          Local: files
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

    FileRequest.create(this.props.node, this.form.state.newFile)
    .then((res) => {
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
          Local: (this.state.sections.Local || []).concat(res.data.file)
        }
      })

      toaster.success(`File ${res.data.file.name} has been successfully added`)
    })
    .catch((err) => {
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

  toggleDialog(show:boolean, section:string) {
    var _dialog = this.state.dialog
    _dialog[section] = show

    this.setState({
      ...this.state,
      dialog: _dialog
    })
  }

  renderAddFile(section) {
    if(typeof section === 'undefined' || section == 'all') { return }

    return (
      <React.Fragment>
        <Dialog
          isShown={this.state.dialog[section] || false}
          title="Add File"
          confirmLabel="Save"
          onCloseComplete={() => this.toggleDialog(false, section)}
          onConfirm={this.saveFile}
        >
          <Form ref={frm => this.form = frm} save={this.saveFile} loading={this.state.isSaving}/>
        </Dialog>

        <IconButton appearance='minimal' icon="add" onClick={() => this.toggleDialog(true, section)}/>
      </React.Fragment>
    )
  }
  renderRow(key:number, name:string, timestamp:string = "") {
    return (
      <Pane display="flex" flex={1} key={key} background={key % 2 ? "#f9f9f9" : "#fff"} padding={10} alignItems="center" borderTop>
        <Pane display="flex" flex={1}>
          {name}
        </Pane>

        <Pane marginRight={50}>
          <Text size={300}>Updated:</Text> <Text size={400} color="dark">{timestamp}</Text>
        </Pane>

        <Pane>
          <IconButton appearance="minimal" icon="download"/>
        </Pane>

        <Pane>
          <IconButton data-id={key} data-name={name} appearance="minimal" icon="trash" onClick={this.deleteFile}/>
        </Pane>
      </Pane>
    )
  }

  renderRowMenu = (row) => {
    return (
      <Menu>
        <Menu.Group>
          <Menu.Item>Sync to Layerkeep...</Menu.Item>
          <Menu.Item secondaryText="⌘R">Rename...</Menu.Item>
        </Menu.Group>
        <Menu.Divider />
        <Menu.Group>
          <Menu.Item intent="danger"  data-id={row.id} data-name={row.name} onClick={this.deleteFile}>
            Delete... 
          </Menu.Item>
        </Menu.Group>
      </Menu>
    )
  }

  renderTable(files) {
    return (
      <Table>
        <Table.Head>
          <Table.SearchHeaderCell />
          <Table.TextHeaderCell>
            Created At:
          </Table.TextHeaderCell>
          <Table.TextHeaderCell>
            
          </Table.TextHeaderCell>
        </Table.Head>
        <Table.VirtualBody height={240}>
          {files.map((row, index) => (
            <Table.Row key={row.id} isSelectable >
              <Table.TextCell>{row.name}</Table.TextCell>
              <Table.TextCell>{Dayjs.unix(row.updated_at).format('MM.d.YYYY - hh:mm:ss a')}</Table.TextCell>
              <Table.TextCell isNumber>
                
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
          ))}
        </Table.VirtualBody>
      </Table>)
  }

  renderGroup(name:string, index:number) {
    let key 	= Object.keys(this.state.sections)[index]
    let files = this.state.sections[name] || []

    return (
      <Pane display="flex" key={key}>
        <Pane display="flex" flexDirection="column" width="100%" background="#fff" padding={20} margin={10} border="default">
          <Pane display="flex">
            <Pane display="flex" flex={1}>
              <Button data-index={index} appearance="minimal" size={600} color="black" marginLeft={0} marginBottom={8} paddingLeft={0} onClick={() => this.selectSection(index) }>{name}</Button>
            </Pane>
            <Pane>
              {this.renderAddFile(name.toLowerCase())}
            </Pane>
          </Pane>

          <Pane borderBottom borderLeft borderRight>
            {this.renderTable(files)}
            {/* {files.map((row, index) => this.renderRow(row.id, row.name, Dayjs.unix(row.updated_at).format('MM.d.YYYY - hh:mm:ss a')))} */}
          </Pane>
        </Pane>
      </Pane>
    )
  }

  renderGroups() {
    return (
      <React.Fragment>
        {Object.keys(this.state.sections)
               .filter((section) => section.toLowerCase() != 'all')
               .map((section, index) => this.renderGroup(section, index))}
      </React.Fragment>
    )
  }

  renderTopBar() {
    return (
      <Pane display="flex" flexDirection="column" width="100%" background="#fff" padding={6} border="default">
        <TabNavigation>
          {
            Object.keys(this.state.sections).map((tab, index) => (
              <Tab key={tab} data-index={index} onSelect={() => this.selectSection(index)}  isSelected={index === this.state.currentSection}>
                {tab}
              </Tab>
            ))
          }
        </TabNavigation>
        </Pane>
    )
  }

  renderSection() {
    return (
      <Pane>
        {this.state.currentSection == 0 && this.renderGroups()}
        {/* {this.state.currentSection == 1 && this.renderGroup("LayerKeep", 1)} */}
        {this.state.currentSection == 1 && this.renderGroup("Local", 1)}
        {/* {this.state.currentSection == 3 && this.renderGroup("SD Card", 3)} */}
      </Pane>
    )
  }

  render() {
    return (
      <Pane >
        {this.renderTopBar()}
        <div className="scrollable-content">
          {this.renderSection()}
          <Layerkeep {...this.props} />
        </div>
      </Pane>
    )
  }	
}
