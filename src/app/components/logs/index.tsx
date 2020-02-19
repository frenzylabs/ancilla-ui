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


import LogList from './list'



export class Logs extends React.Component<{match: any}> {

  

  
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
              <Route path={`${this.props.match.path}`} render={ props => 
                <LogList {...this.props}  {...props} />  
              }/>
            </Switch>
      </div>
    )
  }	
}

export default Logs
