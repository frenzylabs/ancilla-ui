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
// import {
//   Nav,
//   SubNav,
//   Statusbar,
//   Summary
// } from '../../'

import ErrorModal     from '../../modal/error'

import CameraView from '../cameras/show'
import { ServiceHandler } from '../../../network'
import AttachmentForm from './form'

import PubSub from 'pubsub-js'
import { ServiceState } from '../../../store/reducers/service'
import dayjs from 'dayjs'

export default class ServiceAttachment extends React.Component<{node: object, service: ServiceState}> {
  form: AttachmentForm = null
  cancelRequest = null
  constructor(props:any) {
    super(props)

    
    this.state = {
      showing: false,
      isLoading: false,
      attachments: [],
      currentAttachmentIds: [],
      recordSettings: {
        videoSettings: {
          fps: 10
        },
        timelapse: 2
      }
    }

    // this.receiveRequest  = this.receiveRequest.bind(this)
    // this.receiveEvent    = this.receiveEvent.bind(this)
    this.getAttachments    = this.getAttachments.bind(this)
    this.saveAttachment    = this.saveAttachment.bind(this)
    this.renderAttachments = this.renderAttachments.bind(this)
    this.renderAttachment  = this.renderAttachment.bind(this)
    this.renderView        = this.renderView.bind(this)
    this.toggleAttachmentView = this.toggleAttachmentView.bind(this)

    window.at = this
    this.cancelRequest = ServiceHandler.cancelSource()
    
  }

  componentDidMount() {
    this.getAttachments()
  }

  componentWillUnmount() {
    if (this.cancelRequest)
      this.cancelRequest.cancel("Left Attachments View")
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.service.id != this.props.service.id) {
      this.getAttachments()
    }
  }
  
  getAttachments() {
    if (this.props.service) {
      this.setState({isLoading: true})
      ServiceHandler.attachments(this.props.node, this.props.service, {cancelToken: this.cancelRequest.token})
      .then((response) => {
        var currentAttachmentIds = response.data.attachments.map((a) => a.attachment.id)
        this.setState({isLoading: false, attachments: response.data.attachments, currentAttachmentIds: currentAttachmentIds})
      }).catch((err) => {
        console.log(err)
        this.setState({isLoading: false})
      })
      // PubSub.publishSync(this.props.node.name + ".request", [this.props.camera.name, "SUB", "events.connection"])
      // PubSub.publishSync(this.props.node.name + ".request", [this.props.camera.name, "REQUEST.get_state"])
      // // console.log("Has printer")
      // this.requestTopic = `${this.props.node.name}.${this.props.camera.name}.request`
      // this.eventTopic = `${this.props.node.name}.${this.props.camera.name}.events`
      // if (this.pubsubRequestToken) {
      //   PubSub.unsubscribe(this.pubsubRequestToken)
      // }
      // if (this.pubsubToken) {
      //   PubSub.unsubscribe(this.pubsubToken)
      // }
      // this.pubsubRequestToken = PubSub.subscribe(this.requestTopic, this.receiveRequest);
      // this.pubsubToken = PubSub.subscribe(this.eventTopic, this.receiveEvent);
    }
  }

  saveAttachment(closeDialog) {
    this.setState({
      ...this.state,
      loading: true
    })

    var attachment = this.form.state.newAttachment
    ServiceHandler.addAttachment(this.props.node, this.props.service, attachment)
    .then((response) => {
      var attachments = this.state.attachments
      var f = response.data.attachment
      attachments = attachments.concat(f)
      this.setState({
        loading: false,
        attachments: attachments
      })

      toaster.success(`Attachment ${f.attachment.name} has been successfully added`)
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
      var attachments = this.state.attachments.filter((item) => item.id != attachment.id) 
      // var currentAttachmentIds = attachments.map(item => item.attachment.id)
      this.setState({
        loading: false,
        attachments: attachments
      })

      toaster.success(`Attachment ${attachment.attachment.name} has been deleted`)
    })
    .catch((error) => {
      console.log(error)
      toaster.danger(<ErrorModal requestError={error} />)
    })
  }

  toggleAttachmentView(attachment) {
    console.log(attachment)
    var expand = !(attachment.settings.expanded || false)
    // if (attachment.settings.expanded)
    var settings = {...attachment.settings, expanded: expand}
    ServiceHandler.updateAttachment(this.props.node, attachment.id, {settings: settings})
    .then((response) => {
      console.log(response)
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
    var atc = this.state.attachments.map((a) => {
      if (a.id == attachment.id) {
        return {...a, settings: settings}
      }
      return a
    })
    this.setState({attachments: atc})
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
  

	renderRow(key:number, attachment:object, caption:string = "") {
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

  renderAttachment(attachment:object) {
    if (attachment.settings.expanded) {
      return this.renderView(attachment)
    } else {
      return this.renderRow(attachment.id, attachment)
    }
  }
  
  renderAttachments() {
    if (this.state.attachments) {
      return (
        <Pane borderBottom borderLeft borderRight>
          {this.state.attachments.map((da) => {
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
          <AttachmentForm ref={frm => this.form = frm} {...this.props} attachments={this.state.attachments} />
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