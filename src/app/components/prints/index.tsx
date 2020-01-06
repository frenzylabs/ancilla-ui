//
//  index.tsx
//  ancilla
// 
//  Created by Kevin Musselman (kevin@frenzylabs.com) on 12/22/19
//  Copyright 2019 FrenzyLabs, LLC.
//


import React from 'react'
import { Switch, Route, Link, Redirect }       from 'react-router-dom';


import PrintList from './list'
import PrintShow from './show'

export class Prints extends React.Component<{match: any}> {

  
  constructor(props:any) {
    super(props)
   
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
              <Route path={`${this.props.match.path}/:printId`} render={ props => 
                <PrintShow {...this.props} {...props}  /> 
              }/>

              <Route path={`${this.props.match.path}`} render={ props => 
                <PrintList {...this.props}  {...props} />  
              }/>
            </Switch>
      </div>
    )
  }	
}

export default Prints
