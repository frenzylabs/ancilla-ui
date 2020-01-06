//
//  index.tsx
//  ancilla
// 
//  Created by Kevin Musselman (kevin@frenzylabs.com) on 12/31/19
//  Copyright 2019 FrenzyLabs, LLC.
//


import React from 'react'
import { Switch, Route, Link, Redirect }       from 'react-router-dom';
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


import RecordingList from './list'
import RecordingShow from './show'


export class Recordings extends React.Component<{match: any}> {

  

  
  constructor(props:any) {
    super(props)    
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  componentDidUpdate(prevProps, prevState) {
  }

  render() {
    return (
      <div>
        <Switch>
              {/* <Route path={`${this.props.match.path}/new`} render={ props =>
                <PrinterNew {...this.props}  {...props}/> 
              }/> 
              <Route path={`${this.props.match.path}/:printerId/edit`} exact={true} render={ props =>
                <PrinterEdit {...this.props}  {...props} /> 
              }/>
              <Route path={`${this.props.match.path}/:printerId`} render={ props =>
                <PrinterDetails  {...this.props} {...props} /> 
              }/> */}
              <Route path={`${this.props.match.path}/:recordingId`} render={ props => 
                <RecordingShow {...this.props} {...props}  /> 
              }/>

              <Route path={`${this.props.match.path}`} render={ props => 
                <RecordingList {...this.props}  {...props} />  
              }/>
            </Switch>
      </div>
    )
  }	
}

export default Recordings
