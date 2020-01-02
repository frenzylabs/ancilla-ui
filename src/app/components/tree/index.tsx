//
//  index.tsx
//  ancilla
// 
//  Created by Wess Cope (me@wess.io) on 10/31/19
//  Copyright 2019 Wess Cope
//

import React from 'react'
import {connect}  from 'react-redux'

import {
  Pane,
  Button,
  IconButton
} from 'evergreen-ui'


namespace Tree {
  export class Node extends React.Component<{name:string, key:string, icon?:string, children?:Array<{}>, addAction?:Function}> {
    state = {
      expanded: false
    }

    constructor(props:any) {
      super(props)

      this.toggleMenu   = this.toggleMenu.bind(this)
      this.renderSingle = this.renderSingle.bind(this)
			this.renderGroup  = this.renderGroup.bind(this)
			this.onSelect 		= this.onSelect.bind(this)
    }

    toggleMenu(e) {
      this.setState({
        ...this.state,
        expanded: !this.state.expanded
      })
		}
		
    onSelect() {
      if (this.props.selectItem) {
				this.props.selectItem(this.props.item)
			}
    }

    renderSingle() {
      return (
        <Pane width={180} height={25}>
          <Button onClick={this.onSelect} height={25} minWidth={180} iconBefore="application" appearance="minimal" color="#f0f0f0">{this.props.name}</Button>
        </Pane>
      )
    }

    renderGroup() {
      return (
        <Pane marginBottom={12} padding={0}>
           <Pane display="flex" height={25} width={180} alignItems="center">
            <Button 
              display="flex" 
              flex={1} 
              iconBefore={this.state.expanded ? "caret-down" : "caret-right"} 
              appearance="minimal" 
              color="#f0f0f0" 
              onClick={this.toggleMenu}>
                {this.props.name}
              </Button>
            {this.props.addAction && 
              (<IconButton icon="add" appearance="minimal" color="#fff" height={32} onClick={this.props.addAction} />)
            }
          </Pane>

          {(this.state.expanded && this.props.children) && (
            <Pane id={`group-${this.props.name}`} paddingLeft={16} paddingTop={0} marginTop={0} marginBottom={0}>
              {this.props.children.map((child, index) => {
                return (
                  <Tree.Node selectItem={this.props.selectItem} name={child.name} item={child} key={`tree-node-${this.props.name}-${index}`}/>
                )
              })}
            </Pane>
          )}
        </Pane>
      )
    }

    render() {
      return ((this.props.children || []).length > 0) ? this.renderGroup() : this.renderSingle()
    }
  }
}

export default Tree

