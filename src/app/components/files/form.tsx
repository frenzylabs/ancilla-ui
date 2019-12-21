//
//  form.tsx
//  ancilla
// 
//  Created by Wess Cope (me@wess.io) on 11/08/19
//  Copyright 2019 Wess Cope
//

import React from 'react'

import {
  Pane,
  Label,
  Textarea,
  TextInput,
  Combobox,
  Checkbox,
  FilePicker,
  Spinner,
  toaster
} from 'evergreen-ui'

import FileDrop       from 'react-file-drop'
import RepoForm from './repo_form'

import {default as request} from '../../network/files'
import { Layerkeep } from '../../network/layerkeep'

export default class Form extends React.Component<{save:Function, loading:boolean}> {
  filepicker = null;
  state = {
    newFile: {
      file: null,
      layerkeep_sync: true,
      description: "",
      name: "",
      id: null
    },
    filename: "",
    projects: [],
    profiles: [],
    currentProjects: [],
    currentProfiles: [],
    file: null   
  }
  cancelRequest = null

  constructor(props:any) {
    super(props)

    // this.loadProjects      = this.loadProjects.bind(this)
    // this.loadProfiles      = this.loadProfiles.bind(this)
    // this.createSelectedRepoOptions = this.createSelectedRepoOptions.bind(this)
    // this.onRepoFileSelected   = this.onRepoFileSelected.bind(this)

    this.cancelRequest = Layerkeep.cancelSource();
    
  }

  componentDidMount() {
    if (this.props.printSlice) {
      var fstate = {layerkeep_sync: false, id: this.props.printSlice.id}
      if (this.props.printSlice.layerkeep_id) 
        fstate["layerkeep_sync"] = true
      fstate["name"] = this.props.printSlice.name
      fstate["description"] = this.props.printSlice.description
      this.setState({newFile: {...this.state.newFile, ...fstate}})
    }
    // this.loadProjects()
    // this.loadProfiles()

    // if (this.props.printerSlice) {
    //   var projectFiles = this.createSelectedRepoOptions(this.props.printerSlice.attributes.project_files)
    //   var profileFiles = this.createSelectedRepoOptions(this.props.printerSlice.attributes.profile_files)
    //   this.setState({canSubmit: true, currentProjects: projectFiles, currentProfiles: profileFiles})
    // }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.printSlice != this.props.printSlice && this.props.printSlice) {
        var fstate = {layerkeep_sync: false}
        if (this.props.printSlice.layerkeep_id) 
          fstate["layerkeep_sync"] = true
        fstate["name"] = this.props.printSlice.name
        fstate["description"] = this.props.printSlice.description
        this.setState({newFile: {...this.state.newFile, ...fstate}})
    }
  }

  createSelectedRepoOptions(repos) {
    return repos.map((item) => {
      return {id: item.id, repoId: item.attributes.repo_id, repoPath: item.attributes.repo_path, revision: item.attributes.commit, filepath: item.attributes.filepath}
    }) || []
  }


  save() {    
    // this.props.save(this.state.file)
  }

  // loadProjects() {    
  //   Layerkeep.listProjects(this.props.node, {cancelToken: this.cancelRequest.token})
  //   .then((response) => {
  //     // console.log()
  //     var projects = response.data.data.map((item) => {
  //       return {name: item.attributes.name, value: item.attributes.path, id: item.id, kind: item.attributes.kind}
  //     })
      
  //     this.setState({ projects: projects})
  //   })
  //   .catch((error) => {
  //     console.log(error);
  //   });
  // }

  // loadProfiles() {    
  //   Layerkeep.listProfiles(this.props.node, {cancelToken: this.cancelRequest.token})
  //   .then((response) => {
  //     // console.log()
  //     var profiles = response.data.data.map((item) => {
  //       return {name: item.attributes.name, value: item.attributes.path, id: item.id, kind: item.attributes.kind}
  //     })
      
  //     this.setState({ profiles: profiles})
  //   })
  //   .catch((error) => {
  //     console.log(error);
  //   });
  // }

  
  handleDrop(files, evt) {

    this.setState({newFile: {...this.state.newFile, file: files[0]}})
    this.filepicker.setState({files: [files[0]]})
  }

  handleFileChange(files) {
    var fchange = {...this.state.newFile, file: files[0]}
    console.log("handle file change", files[0])
    if (this.state.filename.length < 1 && files[0].name) {
      fchange["name"] = files[0].name
    }
    console.log("handle file change", fchange)
    this.setState({newFile: fchange})
    // this.setState({file: files[0]})
  }

  handleNameChange(e) {
    this.setState({filename: e.target.value, newFile: {...this.state.newFile, name: e.target.value}})
    // this.setState({newFile: {...this.state.newFile, name: files[0]}})
    // this.setState({file: files[0]})
  }

  handleDescriptionChange(e) {
    this.setState({newFile: {...this.state.newFile, description: e.target.value}})
  }

  onRepoFileSelected(kind, repos) {
    var selectedRepos = Object.keys(repos).reduce((acc, key) => {
      var item = repos[key];
      if (item.selectedFile && item.selectedFile.name) {
        acc.push({id: item.id, repo_id: item.selectedRepo.id, revision: item.selectedRevision.value, filepath: item.selectedFile.value})
      }
      return acc;
    }, [])

    let newFile = this.state.newFile
    // if (kind == "Profile") {
    //   newFile['profiles'] = selectedRepos
    // } else {
    //   newFile['projects'] = selectedRepos
    // }
    this.setState({newFile: newFile})
  }

  renderProjectSection() {
    return (
      <Pane className={`card package`}>
        <div className="card-header">
          <p className="card-header-title">
            Attach Project File
          </p>
        </div>

        <div className="card-content">
          <Pane className="is-fluid">            
            <RepoForm kind="Project" node={this.props.node} repos={this.state.projects}  onFileSelected={this.onRepoFileSelected} currentRepos={this.state.currentProjects} />
          </Pane>
        </div>
      </Pane>
    )
  }

  renderProfileSection() {
    return (
      <div className={`card package`}>
        <div className="card-header">
          <p className="card-header-title">
            Attach Profile
          </p>
        </div>

        <div className="card-content">
          <Pane className="is-fluid">
            <RepoForm kind="Profile" node={this.props.node} repos={this.state.profiles} onFileSelected={this.onRepoFileSelected} currentRepos={this.state.currentProfiles} />
          </Pane>
        </div>
      </div>
    )
  }

  renderFileDrop() {
    if (this.state.newFile.id) return
    return (
    <FileDrop onDrop={this.handleDrop.bind(this)}>
      <FilePicker ref={fp => this.filepicker = fp}        
        marginBottom={32}
        onChange={this.handleFileChange.bind(this)}
        placeholder="Select the file here!"
      />
    </FileDrop>
    )
  }

  render() {
    if (this.props.loading) {
      return <Spinner />
    }
    return (
      <Pane>
        {this.renderFileDrop()}
        

        <Pane>
          <Label
            htmlFor="description"
            marginBottom={4}
            display="block"
          >
            Name
          </Label>
          <TextInput 
            name="filename" 
            placeholder="Filename" 
            marginBottom={20}  
            width="100%" 
            height={32}
            value={this.state.newFile.name}
            onChange={this.handleNameChange.bind(this)}
          />
        </Pane>
        
        <Pane>
          <Label
            htmlFor="description"
            marginBottom={4}
            display="block"
          >
            Description (optional)
          </Label>
          <Textarea
            id="description"
            placeholder="Description..."
            onChange={this.handleDescriptionChange.bind(this)}
            value={this.state.newFile.description}
          />
        </Pane>

        <Pane display="flex" marginTop={20}>
          <Pane display="flex" flex={1}>
            <Checkbox
              label="Sync To LayerKeep"
              checked={this.state.newFile.layerkeep_sync}
              onChange={e => 
                this.setState({
                  newFile: {
                    ...this.state.newFile,
                    layerkeep_sync: e.target.checked
                  }
                })
              }
            />
          </Pane>
        </Pane>

        
      </Pane>
    )
  }
}
