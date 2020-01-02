//
//  row.tsx
//  ancilla
// 
//  Created by Wess Cope (wess@frenzylabs.com) on 01/02/20
//  Copyright 2019 FrenzyLabs, LLC.
//

import React from 'react'
import Dayjs from 'dayjs'

import {
  Pane,
  Table,
  Popover,
  Menu,
  IconButton,
  Position
} from 'evergreen-ui'

export default class Row extends React.Component {
  
  constructor(props:any) {
    super(props)
  }

  download(id) {
    if(!this.props['download']) { return }

    this.props['download'](id)
  }

  delete(row) {
    console.log("ON DELETE HERE", row)
    if(!this.props.onDelete) { return }

    // let name  = e.currentTarget.getAttribute('data-name')
    // let id    = e.currentTarget.getAttribute('data-id')

    this.props.onDelete(row)
  }

  renderMenu(row) {
    return (
      <Popover
      position={Position.BOTTOM_RIGHT}
      content={() => (
        <Menu>
          <Menu.Group>
            {/* {this.renderLayerkeepSync(row)} */}
            <Menu.Item secondaryText="" onSelect={() => this.download(row.id)}>Download</Menu.Item>
          </Menu.Group>
          
          <Menu.Divider />
          
          <Menu.Group>
            <Menu.Item intent="danger"  onSelect={() => this.delete(row)}>
              Delete... 
            </Menu.Item>
          </Menu.Group>
        </Menu>
      )}>
    <IconButton icon="more" height={24} appearance="minimal" />
  </Popover>

    )
  }

  render() {
    const row = this.props['row']

    return (
      <Table.Row key={row.id} isSelectable>
        <Table.TextCell>{row.name}</Table.TextCell>
        <Table.TextCell>{row.description}</Table.TextCell>
        <Table.TextCell>{Dayjs.unix(row.updated_at).format('MM.d.YYYY - hh:mm:ss a')}</Table.TextCell>
        <Table.Cell width={48} flex="none">{this.renderMenu(row)}</Table.Cell>
      </Table.Row>
    )
  }
}
