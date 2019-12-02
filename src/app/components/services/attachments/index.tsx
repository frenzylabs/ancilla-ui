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

import { ServiceHandler } from '../../../network'
import AttachmentForm from './form'

import PubSub from 'pubsub-js'
import { ServiceState } from '../../../store/reducers/service'

export default class ServiceAttachment extends React.Component<{node: object, service: ServiceState}> {
  form: AttachmentForm = null
  constructor(props:any) {
    super(props)

    
    this.state = {
      showing: false,
      isLoading: false,
      attachments: [],
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

    window.at = this
    
  }

  componentDidMount() {
    this.getAttachments()
  }
  
  getAttachments() {
    if (this.props.service) {
      this.setState({isLoading: true})
      ServiceHandler.attachments(this.props.node, this.props.service)
      .then((response) => {
        this.setState({isLoading: false, attachments: response.data.attachments})
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

      toaster.success(`Attachment ${f.name} has been successfully added`)
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

  // receiveRequest(msg, data) {
  //   // console.log("PV Received Data here1", msg)    
  //   // console.log("PV Received Data here2", data)
  //   // console.log(typeof(data))
  //   if(!data)
  //     return
  //   if (data["action"] == "get_state") {
  //     // console.log("get STATE", data)
  //     this.setState({deviceState: data["resp"]})
  //   }
  //   if (data["action"] == "start_recording") {
  //     // console.log("get STATE", data)
  //     this.setState({...this.state, deviceState: {...this.state.deviceState, recording: true}})
  //   } else if (data["action"] == "stop_recording") {
  //     // console.log("get STATE", data)
  //     this.setState({...this.state, deviceState: {...this.state.deviceState, recording: false}})
  //   }
  // }

  // receiveEvent(msg, data) {
  //   // console.log("PV Received Event here1", msg)    
  //   // console.log("PV Received Event here2", data)
  //   // console.log(typeof(data))
  //   var [to, kind] = msg.split("events.")
  //   // console.log("EVENT KIND", kind)
  //   switch(kind) {
  //     case 'camera_recording.state':
  //         console.log("Camera Recording STate", data)
  //         // this.setState({...this.state, deviceState: {...this.state.deviceState, open: false}})
  //         break
  //     case 'connection.closed':
  //         this.setState({...this.state, deviceState: {...this.state.deviceState, open: false}})
  //         break
  //     case 'connection.opened':
  //         this.setState({...this.state, deviceState: {...this.state.deviceState, open: true}})
  //         break
  //     case 'print.started':
  //         this.setState({...this.state, deviceState: {...this.state.deviceState, printing: true}})
  //         break
  //     case 'print.cancelled':
  //         this.setState({...this.state, deviceState: {...this.state.deviceState, printing: false}})
  //         break
  //     case 'print.failed':
  //         this.setState({...this.state, deviceState: {...this.state.deviceState, printing: false, status: "print_failed"}})
  //         break
  //     default:
  //       break
  //   }    
  // }

    
  // componentWillUnmount() {
  //   if (this.pubsubToken)
  //     PubSub.unsubscribe(this.pubsubToken)
  //   if (this.pubsubRequestToken)
  //     PubSub.unsubscribe(this.pubsubRequestToken)
  // }

  // componentDidUpdate(prevProps, prevState) {
  //   if (prevProps.printer != this.props.printer) {
  //     this.setupPrinter()
  //   }
  // }

  toggleDialog(show:boolean) {
    this.setState({
      ...this.state,
      showing: show
    })
  }

  

	renderRow(key:number, attachment:object, caption:string = "") {
		return (
			<Pane display="flex" flex={1} key={key} background={key % 2 ? "#f9f9f9" : "#fff"} padding={10} alignItems="center" borderTop>
				<Pane display="flex" flex={1}>
					{attachment.name}
				</Pane>

				<Pane>
					{attachment.device_type}
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
  
  renderAttachments() {
    
    return (
      <Pane borderBottom borderLeft borderRight>
        {this.state.attachments.map((da) => {
          return this.renderRow(da.id, da.attachment)
        })}
      </Pane>
    )

  }

  renderAddAttachment() {
    return (
			<React.Fragment>
				<Dialog
          isShown={this.state.showing}
          title="Attach Service"
          confirmLabel="Save"
          onCloseComplete={() => this.toggleDialog(false)}
          onConfirm={this.saveAttachment}
        >              
          <AttachmentForm ref={frm => this.form = frm} {...this.props} />
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
              Attachments
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