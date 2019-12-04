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
  Cameras,
  Files
} from './sections'

import Toolbar from './toolbar'

export default class SubNav extends React.Component {
	constructor(props:any) {
		super(props)

		this.filesSelected = this.filesSelected.bind(this)
	}

  componentDidMount() {
    // this.getPrinters()
    // console.log("INSIDE SUBNAV ", this.props)
    // window.snav = this;
	}
	
	filesSelected() {
		this.props.history.push('/files')
	}

  render() {
    return (
      <Pane margin={0} padding={0} height="100%" display="flex" flexDirection="column" background="#425A70">
        <Pane width={180} padding={0} margin={0}>
          <Toolbar/>
          
          <br/>
          <Printers {...this.props} />
          <Cameras {...this.props} />
          {/*<Files {...this.props}/>*/}
					<Tree.Node name="Files" selectItem={this.filesSelected}/>
        </Pane>

      </Pane>
    )
  }
}

