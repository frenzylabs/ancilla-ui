import {connect}  from 'react-redux'

import {
  Switch,
  Route,
  withRouter,
  matchPath
} from 'react-router-dom'

import SplitPane from 'react-split-pane'

import {
  Pane,
  TextInput,
  Dialog,
  IconButton,
  toaster
} from 'evergreen-ui'

import React  from 'react'


import ErrorModal     from '../../modal/error'

import CameraView from '../cameras/show'
import { ServiceHandler } from '../../../network'
import AttachmentForm from './form'



import ServiceActions from '../../../store/actions/services'

import { NodeState, ServiceState, AttachmentModel }  from '../../../store/state'


type AttachmentProps = {
  listAttachments: Function,
  saveAttachment: Function,
  updateAttachments: Function,
  attachmentReceived: Function,
  attachments: Array<AttachmentModel>,
  node: NodeState, 
  service: ServiceState, 
  reload: Date,
  attachmentKind?: string
}

type StateProps = {
  showing: boolean,
  loading: boolean
}

export class ServiceAttachment extends React.Component<AttachmentProps, StateProps> {
  form: AttachmentForm = null
  cancelRequest = null
  constructor(props:any) {
    super(props)

    
    this.state = {
      showing: false,
      loading: false      
    }

    // this.receiveRequest  = this.receiveRequest.bind(this)
    // this.receiveEvent    = this.receiveEvent.bind(this)
    // this.getAttachments    = this.getAttachments.bind(this)
    this.saveAttachment    = this.saveAttachment.bind(this)
    this.renderAttachments = this.renderAttachments.bind(this)
    this.renderAttachment  = this.renderAttachment.bind(this)
    this.renderView        = this.renderView.bind(this)
    this.toggleAttachmentView = this.toggleAttachmentView.bind(this)

    this.cancelRequest = ServiceHandler.cancelSource()
    
  }

  componentDidMount() {
    // this.getAttachments()
    this.props.listAttachments(this.props.node, this.props.service)
  }

  componentWillUnmount() {
    if (this.cancelRequest)
      this.cancelRequest.cancel("Left Attachments View")
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.service.id != this.props.service.id || prevProps.reload != this.props.reload) {
      // this.getAttachments()
    }
  }
  

  saveAttachment(closeDialog) {
    this.setState({
      ...this.state,
      loading: true
    })

    var attachment = this.form.state.newAttachment
    this.props.saveAttachment(this.props.node, this.props.service, attachment)
    .then((response) => {
      this.setState({loading: false})
      toaster.success(`Attachment ${response.data.attachment.attachment.name} has been successfully added`)
      closeDialog()
    })
    .catch((error) => {
      console.log(error)      
      this.setState({
        loading: false,
      })
      let errors = Object.keys(error.response.data.errors).map((key, index) => {
        return  `${key} : ${error.response.data.errors[key]}<br/>`
      })

      toaster.danger(
        `Unable to save attachment ${JSON.stringify(attachment)}`, 
        {description: errors}
      )
    })

    // ServiceHandler.addAttachment(this.props.node, this.props.service, attachment)
    // .then((response) => {
    //   var attachments = this.state.attachments
    //   var f = response.data.attachment
    //   attachments = attachments.concat(f)
    //   this.setState({
    //     loading: false,
    //     attachments: attachments
    //   })

    //   toaster.success(`Attachment ${f.attachment.name} has been successfully added`)
    //   closeDialog()
    // })
    // .catch((error) => {
    //   console.log(error)      
    //   this.setState({
    //     loading: false,
    //   })
    //   let errors = Object.keys(error.response.data.errors).map((key, index) => {
    //     return  `${key} : ${error.response.data.errors[key]}<br/>`
    //   })

    //   toaster.danger(
    //     `Unable to save attachment ${JSON.stringify(attachment)}`, 
    //     {description: errors}
    //   )
    // })
    // DeviceHandler.addAttachment(this.props.node, this.props.device.id)
    //   .then((response) => {

    //   }).catch((err) => {
    //     console.log(err)
    //   })
  }

  toggleDialog(show:boolean) {
    this.setState({
      ...this.state,
      showing: show
    })
  }

  deleteAttachment(attachment) {
    ServiceHandler.deleteAttachment(this.props.node, this.props.service, attachment)
    .then((response) => {
      var attachments = this.props.attachments.filter((item) => item.id != attachment.id) 
      this.setState({
        loading: false
      })
      this.props.updateAttachments(this.props.node, this.props.service, attachments)

      toaster.success(`Attachment ${attachment.attachment.name} has been deleted`)
    })
    .catch((error) => {
      console.log(error)
      toaster.danger(<ErrorModal requestError={error} />)
    })
  }

  toggleAttachmentView(attachment) {
    var expand = !(attachment.settings.expanded || false)
    // if (attachment.settings.expanded)
    // var settings = {...attachment.settings, expanded: expand}
    attachment.settings = {...attachment.settings, expanded: expand}
    ServiceHandler.updateAttachment(this.props.node, attachment.id, {settings: attachment.settings})
    .then((response) => {
      // console.log(response)
      // var attachments = this.state.attachments.filter((item) => item.id != attachment.id) 
      // // var currentAttachmentIds = attachments.map(item => item.attachment.id)
      // this.setState({
      //   loading: false,
      //   attachments: attachments
      // })
      // toaster.success(`Attachment ${attachment.attachment.name} has been deleted`)
    })
    .catch((error) => {
      console.log(error)
    })    
    this.props.attachmentReceived(this.props.node, this.props.service, attachment)
  }

  renderView(attachment) {
    switch(attachment.attachment.kind) {
      case 'camera':
        var service = this.props.node.services.find(s => s.id == attachment.attachment.id)
        return (
          <Pane display="flex" flex={1} flexDirection="column" key={attachment.id} background={attachment.id % 2 ? "#f9f9f9" : "#fff"} padding={0} alignItems="center" borderTop>
            {this.renderRow(attachment.id, attachment)}
            <Pane padding={10} width="100%" >
              <CameraView {...this.props} service={service} />
            </Pane>
          </Pane>
        )
      default:
        return (
          this.renderRow(attachment.id, attachment)
        )
    }
  }
  

	renderRow(key:number, attachment, caption:string = "") {
		return (
			<Pane display="flex" flex={1} key={key} width="100%" background={key % 2 ? "#f9f9f9" : "#fff"} padding={10} alignItems="center" borderTop borderBottom>
				<Pane display="flex" flex={1}>
					{attachment.attachment.name}
				</Pane>

        <Pane>
          <IconButton appearance="minimal" icon={attachment.settings.expanded ? "chevron-down" : "chevron-left"} onClick={() => this.toggleAttachmentView(attachment) }/>
        </Pane>
				<Pane>
					<IconButton appearance="minimal" icon="trash" onClick={() => this.deleteAttachment(attachment) }/>
				</Pane>
			</Pane>
		)
  }

  renderAttachment(attachment) {
    if (attachment.settings.expanded) {
      return this.renderView(attachment)
    } else {
      return this.renderRow(attachment.id, attachment)
    }
  }
  
  renderAttachments() {
    if (this.props.attachments) {
      return (
        <Pane borderBottom borderLeft borderRight>
          {this.props.attachments.map((da) => {
            return this.renderAttachment(da)
          })}
        </Pane>
      )
    }

  }

  renderAddAttachment() {
    return (
			<React.Fragment>
				<Dialog
          isShown={this.state.showing}
          title={`Attach ${this.props.attachmentKind || 'Service'}`}
          confirmLabel="Save"
          onCloseComplete={() => this.toggleDialog(false)}
          onConfirm={this.saveAttachment}
        >              
          <AttachmentForm ref={frm => this.form = frm} {...this.props} loading={this.state.loading} attachments={this.props.attachments} />
        </Dialog>

				<IconButton appearance='minimal' icon="add" onClick={(e) => this.setState({showing: true})}/>
			</React.Fragment>
		)
  }

  render() {
    // const Component = this.props.component;    
    return (
      <Pane display="flex">
        <Pane display="flex" flexDirection="column" width="100%" background="#fff" padding={20} margin={10} border="default">
          <Pane display="flex">
            <Pane display="flex" flex={1}>
              {this.props.attachmentKind ? `${this.props.attachmentKind}s` : 'Attachments'}
            </Pane>
            <Pane>
              {this.renderAddAttachment()}
            </Pane>
          </Pane>

          {this.renderAttachments()}
        </Pane>
      </Pane>      
    );
 }
}

const mapStateToProps = (state) => {
  // return state
  return {
    // printers: state.activeNode.printers
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    listAttachments: (node, service) => dispatch(ServiceActions.listAttachments(node, service)),
    saveAttachment: (node, service, attachment) => dispatch(ServiceActions.saveAttachment(node, service, attachment)),
    updateAttachments: (node, service, attachments) => dispatch(ServiceActions.updateAttachments(node, service, attachments)),
    attachmentReceived: (node, service, attachment) => dispatch(ServiceActions.attachmentReceived(node, service, attachment))
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(ServiceAttachment)