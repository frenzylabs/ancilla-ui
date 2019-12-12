//
//  index.tsx
//  ancilla
// 
//  Created by Wess Cope (me@wess.io) on 12/04/19
//  Copyright 2019 Wess Cope
//

import React from 'react'

import {
  Pane,
  Heading,
  Tablist,
  SidebarTab
} from 'evergreen-ui'

export default class SettingsView extends React.Component {
  state = {
  }

  constructor(props:any) {
    super(props)

    this.renderSections = this.renderSections.bind(this)
    this.renderForms    = this.renderForms.bind(this)
  }

  renderSections() {
    return Object.keys(this.props.service.model.settings).map((tab, index) => (
      <Pane key={tab} id={`settings-${tab}-content`} borderBottom={(Object.keys(this.state.settings).length - 1) > index ? true : false} padding={20} paddingTop={0} marginBottom={20}>
        <h1>{tab}</h1>
        {this.props.service.model.settings[tab] && (
          Object.keys(this.props.service.model.settings[tab]).map((setting, index) => (
            <p key={`${setting}-${index}`}>{setting} : {this.state.settings[tab][setting]}</p>
          ))
        )}
      </Pane>
    ))
  }

  renderForms() {
    if(this.props.forms == undefined) { return }

    return this.props.forms.map((form, index) => (
      <Pane key={`form-${index}`} id={`form-${index}-content`} padding={20} marginBottom={20}>
        {form}
      </Pane>
    ))
  }

  render() {    
    return (
      <Pane margin={40} padding={20} background="white" elevation={1} border className="">
        <Heading size={600}>Settings</Heading>
        
        <Pane display="flex" flexDirection="column" borderTop marginTop={10} paddingTop={10}>
          {this.renderForms()}
        </Pane>

        {this.props.service.model.setting && (
          <Pane display="flex" flexDirection="column" borderTop marginTop={10} paddingTop={10}>
            {this.renderSections()}
          </Pane>
        )}
      </Pane>
    )
  }
}
