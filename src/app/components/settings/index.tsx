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
    selected: 0,
    settings: {
      "one" : {
        "one_setting_one" : "value",
        "one_setting_two" : "value",
        "one_setting_three" : "value",
        "one_setting_four" : "value",
        "one_setting_five" : "value",
      },

      "two" : {
        "two_setting_one" : "value",
        "two_setting_two" : "value",
        "two_setting_three" : "value",
        "two_setting_four" : "value",
        "two_setting_five" : "value",
      },

      "three" : {
        "three_setting_one" : "value",
        "three_setting_two" : "value",
        "three_setting_three" : "value",
        "three_setting_four" : "value",
        "three_setting_five" : "value",
      },
    }
  }

  constructor(props:any) {
    super(props)

    this.renderTabs     = this.renderTabs.bind(this)
    this.renderSections = this.renderSections.bind(this)
  }

  renderTabs() {
    return Object.keys(this.state.settings).map((tab, index) => (
      <SidebarTab 
        key={tab} 
        id={`settings-${tab}`} 
        isSelected={index === this.state.selected}
        onSelect={() => this.setState({selected: index})}>
          {tab}
      </SidebarTab>
    ))
  }

  renderSections() {
    return Object.keys(this.state.settings).map((tab, index) => (
      <Pane key={tab} id={`settings-${tab}-content`} display={index === this.state.selected ? 'block' : 'block'}>
        {this.state.settings[tab] && (
          Object.keys(this.state.settings[tab]).map((setting, index) => (
            <p key={`${setting}-${index}`}>{setting} : {this.state.settings[tab][setting]}</p>
          ))
        )}
      </Pane>
    ))
  }

  render() {
    return (
      <Pane margin={40} padding={20} background="white" elevation={1} border>
        <Heading size={600}>Settings</Heading>
        
        <Pane display="flex" borderTop marginTop={10} paddingTop={10}>
          <Pane display="flex">
            <Tablist flexBasis={300} width={180} marginBottom={16} marginRight={24}>
              {this.renderTabs()}
            </Tablist>
          </Pane>

          

          <Pane marginLeft={8}>
            {this.renderSections()}
          </Pane>
        </Pane>
      </Pane>
    )
  }
}
