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

import { NodeState, ServiceState, AttachmentModel }  from '../../store/state'


type Props = {  
  node: NodeState, 
  service: any,
  forms: [any],
  title?: any
}

type StateProps = {
  loading: boolean,
  cameraRecording: any,
  redirectTo: any,
  parentMatch: any    
}

export default class SettingsView extends React.Component<Props> {
  state = {
    tabs: [],
    sections: [],
    selectedSettingsIndex: 0
  }

  constructor(props:any) {
    super(props)

    this.renderSections = this.renderSections.bind(this)
    this.renderForms    = this.renderForms.bind(this)
    this.setupSections  = this.setupSections.bind(this)
  }

  componentDidMount() {
    this.setupSections()
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.forms != this.props.forms) {
      this.setupSections()
    }
  }

  setupSections() {
    var tabs = []
    var sections = []
    var forms = (this.props.forms || [])
    forms.forEach((frm) => {
      if ("key" in frm && frm["key"] != null) {        
        tabs = tabs.concat(frm)
      } else {
        sections = sections.concat(frm)
      }
    })

    this.setState({tabs: tabs, sections: sections})
  }

  renderForms() {
    if(!this.state.sections.length) { return }

    return this.state.sections.map((form, index) => (
      <Pane key={`form-${index}`} id={`form-${index}-content`} padding={20} marginBottom={20}>
        {form}
      </Pane>
    ))
  }

  renderSections() {
    if (!this.state.tabs.length) return

    const $component = this.state.tabs[this.state.selectedSettingsIndex].component
    return (<Pane display="flex" width="100%" flex={1}>
              <Tablist marginBottom={16} flexBasis={140} marginRight={24}>
                {this.state.tabs.map((tab, index) => {
                  return (
                    <SidebarTab
                    key={tab.key}
                    id={tab.key}
                    onSelect={() => this.setState({ selectedSettingsIndex: index })}
                    isSelected={index === this.state.selectedSettingsIndex}
                    aria-controls={`panel-${tab.key}`}
                  >
                    {tab.key}
                  </SidebarTab>
                  )
                })}
              </Tablist>
              <Pane padding={16} background="tint1" flex={1} width="500px">  
                 {$component}
              </Pane>
            </Pane>
              )
  }

  render() {    
    return (
      <Pane margin={40} padding={20} background="white" elevation={1} border >
        <Heading size={600}>{this.props.title || "Settings"}</Heading>
        
        <Pane display="flex" flexDirection="column" borderTop marginTop={10} paddingTop={10}>
          {this.renderSections()}
          {this.renderForms()}
        </Pane>

        {/* {this.props.service.model && this.props.service.model.settings && (
          <Pane display="flex" flexDirection="column" borderTop marginTop={10} paddingTop={10}>
            {this.renderSections()}
          </Pane>
        )} */}
      </Pane>
    )
  }
}
