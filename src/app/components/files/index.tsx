//
//  index.tsx
//  ancilla
// 
//  Created by Wess Cope (me@wess.io) on 11/16/19
//  Copyright 2019 Wess Cope
//

import React from 'react'

import {
	Pane,
	TabNavigation,
	Tab,
	IconButton,
	Button,
	Dialog
} from 'evergreen-ui'

import Form from '../subnav/sections/files/form'

export default class FilesView extends React.Component {
	state = {
		dialogShowing: false,
		isSaving: false,
		sections: {
			'all': [
				'all-file-1',
				'all-file-2',
				'all-file-3',
				'all-file-4',
				'all-file-5',
			],
			'LayerKeep': [
				'layerkeep-file-1',
				'layerkeep-file-2',
				'layerkeep-file-3',
				'layerkeep-file-4',
				'layerkeep-file-5',
			],
			'Local': [
				'local-file-1',
				'local-file-2',
				'local-file-3', 
				'local-file-4',
				'local-file-5',
			],
			'SD Card': [
				'sd-card-file-1',
				'sd-card-file-2',
				'sd-card-file-3',
				'sd-card-file-4',
				'sd-card-file-5',
			]
		},

		currentSection: 0
	}

	form:Form = {}
	
	constructor(props:any) {
		super(props)

		this.selectSection	= this.selectSection.bind(this)
		this.saveFile				= this.saveFile.bind(this)
		this.toggleDialog		= this.toggleDialog.bind(this)
		this.renderRow 			= this.renderRow.bind(this)
		this.renderGroup 		= this.renderGroup.bind(this)
		this.renderGroups		= this.renderGroups.bind(this)
		this.renderTopBar		= this.renderTopBar.bind(this)
		this.renderSection	= this.renderSection.bind(this)
	}

	selectSection(index:number) {
		this.setState({
			...this.state,
			currentSection: index
		})
	}

	saveFile() {

	}

	toggleDialog(show:boolean) {
		if(show == this.state.dialogShowing) { return }
		
    this.setState({
      ...this.state,
      dialogShowing: show
    })
  }

	renderAddFile() {
		return (
			<React.Fragment>
				<Dialog
					isShown={this.state.dialogShowing}
					title="Add File"
					confirmLabel="Save"
					onCloseComplete={() => this.toggleDialog(false)}
					onConfirm={this.saveFile}
				>
					<Form ref={frm => this.form = frm} save={this.saveFile} loading={this.state.isSaving}/>
				</Dialog>

				<IconButton appearance='minimal' icon="add" onClick={() => this.toggleDialog(true)}/>
			</React.Fragment>
		)
	}
	renderRow(key:number, name:string, caption:string = "") {
		return (
			<Pane display="flex" flex={1} key={key} background={key % 2 ? "#f9f9f9" : "#fff"} padding={10} alignItems="center" borderTop>
				<Pane display="flex" flex={1}>
					{name}
				</Pane>

				<Pane>
					{caption}
				</Pane>

				<Pane>
					<IconButton appearance="minimal" icon="download"/>
				</Pane>

				<Pane>
					<IconButton appearance="minimal" icon="trash"/>
				</Pane>
			</Pane>
		)
	}

	renderGroup(name:string, index:number) {
		let key 	= Object.keys(this.state.sections)[index]
		let files = this.state.sections[key] || []

		return (
			<Pane display="flex">
				<Pane display="flex" flexDirection="column" width="100%" background="#fff" padding={20} margin={10} border="default">
					<Pane display="flex">
						<Pane display="flex" flex={1}>
							<Button data-index={index} appearance="minimal" size={600} color="black" marginLeft={0} marginBottom={8} paddingLeft={0} onClick={() => this.selectSection(index) }>{name}</Button>
						</Pane>
						<Pane>
							{this.renderAddFile()}
						</Pane>
					</Pane>

					<Pane borderBottom borderLeft borderRight>
						{files.map((row, index) => this.renderRow(index, row))}
					</Pane>
				</Pane>
			</Pane>
		)
	}

	renderGroups() {
		return (
			<React.Fragment>
				{this.renderGroup("LayerKeep", 1)}
				{this.renderGroup("Local", 2)}
				{this.renderGroup("SD Card", 3)}
			</React.Fragment>
		)
	}

	renderTopBar() {
		return (
			<Pane display="flex" flexDirection="column" width="100%" background="#fff" padding={6} border="default">
				<TabNavigation>
					{
						Object.keys(this.state.sections).map((tab, index) => (
							<Tab key={tab} data-index={index} onSelect={() => this.selectSection(index)}  isSelected={index === this.state.currentSection}>
								{tab}
							</Tab>
						))
					}
				</TabNavigation>
				</Pane>
		)
	}

	renderSection() {
		return (
			<Pane>
				{this.state.currentSection == 0 && this.renderGroups()}
				{this.state.currentSection == 1 && this.renderGroup("LayerKeep", 1)}
				{this.state.currentSection == 2 && this.renderGroup("Local", 2)}
				{this.state.currentSection == 3 && this.renderGroup("SD Card", 3)}
			</Pane>
		)
	}

	render() {
		return (
			<Pane>
				{this.renderTopBar()}
				{this.renderSection()}
			</Pane>
		)
	}	
}
