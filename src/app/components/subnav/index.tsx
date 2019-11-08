//
//  index.ts
//  ancilla
// 
//  Created by Wess Cope (me@wess.io) on 10/31/19
//  Copyright 2019 Wess Cope
//

import React from 'react'

import {
  Pane,
  Dialog,
  TextInput,
  Combobox,
  toaster
} from 'evergreen-ui'

import Tree from '../tree'

import {
  Printer
} from '../../models'

import printer, {default as request} from '../../network/printer'

import {
  Printers,
  Devices,
  Files
} from './sections'

export default class SubNav extends React.Component {
  componentDidMount() {
    // this.getPrinters()
    // console.log("INSIDE SUBNAV ", this.props)
    // window.snav = this;
  }
  render() {
    return (
      <Pane margin={0} padding={0} height="100%" display="flex" flexDirection="column" background="#425A70">
        <Pane width={180} padding={0} margin={0}>
          <br/>
          <Printers/>
          <Devices/>
          <Files/>
        </Pane>

      </Pane>
    )
  }
}

