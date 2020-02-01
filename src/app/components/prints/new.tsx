//
//  index.tsx
//  ancilla
// 
//  Created by Kevin Musselman (kevin@frenzylabs.com) on 12/22/19
//  Copyright 2019 FrenzyLabs, LLC.
//


import React from 'react'
import {connect}  from 'react-redux'
import { Switch, Route, Link, Redirect }       from 'react-router-dom';


import {
  Pane,
  Heading,
  Button,
  Text,
  Strong,
  Dialog,
  toaster
} from 'evergreen-ui'


// import Form from './form'
import { PrinterHandler, ServiceHandler } from '../../network'

import ErrorModal           from '../modal/error'


import { NodeState, PrinterState }  from '../../store/state'

import ServiceActions from '../../store/actions/services'



import PubSub from 'pubsub-js'

// type Props = {
//   node: NodeState, 
//   service: ServiceState
// }

import PrintList from './list'
import PrintShow from './show'

import PrintForm from './print_form'

import PropTypes from 'prop-types'


// function myNode(objType, props, propName, componentName) {
//   componentName = componentName || 'ANONYMOUS';
//   console.log("MY NODE Validator", propName)
//   if (props[propName]) {
//     let value = props[propName];
//     if (typeof value == objType) {
//       return null
//     } else {
//         return `${propName} is not of type Node State`;
//     }
//   }

//   // assume all ok
//   return null;
// }

// var nodeState = myNode.bind('NodeState')
// var printerState = myNode.bind('PrinterStated')

// function createChainableTypeChecker(validate) {
//   function checkType(isRequired, props, propName, componentName, location) {
//     componentName = componentName || 'ANONYMOUS';
//     if (props[propName] == null) {
//       // var locationName = ReactPropTypeLocationNames[location];
//       if (isRequired) {
//         return new Error(
//           ("Required " + location + " `" + propName + "` was not specified in ") +
//           ("`" + componentName + "`.")
//         );
//       }
//       return null;
//     } else {
//       return validate(props, propName, componentName, location);
//     }
//   }

//   var chainedCheckType = checkType.bind(null, false);
//   chainedCheckType.isRequired = checkType.bind(null, true);

//   return chainedCheckType;
// }
// var nodePropType = createChainableTypeChecker(nodeState)
// var printerPropType = createChainableTypeChecker(printerState)

const optionPropTypes = {
  // node: nodePropType.isRequired,  
  // printer: printerPropType.isRequired,
  isAuthorized: PropTypes.bool.isRequired,
  service: PropTypes.object,
  match: PropTypes.object,
  onComplete: PropTypes.func,
  onAttachmentAdded: PropTypes.func
}

const statePropTypes = {
  showing: PropTypes.bool,
  loading: PropTypes.bool,
  filter: PropTypes.object,
  search: PropTypes.object,
  showUnauth: PropTypes.func,
  redirectTo: PropTypes.object,
  data: PropTypes.any,
  printerCommand: PropTypes.any

}



// { node: PropTypes.shape(NodeState) }
type PrintProps = PropTypes.InferProps<typeof optionPropTypes> & { 
  saveAttachment: Function,
  updateService: Function,
  node: NodeState,
  printerService: PrinterState
}

type PrintStateProps = PropTypes.InferProps<typeof statePropTypes>

export class NewPrint extends React.Component<PrintProps, PrintStateProps> {

  
  form = null
  constructor(props:any) {
    super(props)
    this.state = {    
      loading: false,
      redirectTo: null,
      showing: true,
      data: {
        data: [],
        meta: {}
      },
      printerCommand: null
    }
    // this.startPrint = this.startPrint.bind(this)
    // this.state.showing = true
    // this.setState({showing: true})    
  }

  componentDidUpdate(prevProps) {
    // if (prevProps.service.state.printing != this.props.service.state.printing) {
      // this.setState({showing: true})
    // }
  }

  toggleDialog(show:boolean) {
    if (!show) {
      if (this.props.onComplete)
        this.props.onComplete()
    }
    // this.setState({
    //   ...this.state,
    //   showing: show
    // })
  }

  onNewPrint(closeDialog) {
    if (!(this.form.state.newPrint && this.form.state.newPrint.file_id)) {
      toaster.danger("Select a File")
      return
    }
    this.setState({
      ...this.state,
      loading: true
    })

    var newPrint = this.form.state.newPrint
    if (newPrint.settings.record_print && newPrint.settings.cameras) {
      var curAttachments = this.props.printerService.model.attachments.map((a) => { return a.attachment.id })
      var cameras = newPrint.settings.cameras
      for (var c in cameras) {
        var cservice = this.props.node.services.find((s) => `${s.id}` == c)
        if (!curAttachments.includes(parseInt(c))) {          
          this.addAttachment(c)          
        }
        this.updateCameraEvents(cservice)
      }
    }
    this.startPrint(newPrint, closeDialog)
  }

  updateCameraEvents(cservice) {
    var camEvents = {
      "printer.print.started": {"action": "start_recording"},
      "printer.print.finished": {"action": "stop_recording"},
      "printer.print.failed": {"action": "stop_recording"},
      "printer.print.cancelled": {"action": "stop_recording"},
      "printer.print.paused": {"action": "pause_recording"},
    }
    var event_listeners = cservice.model.event_listeners
    Object.keys(camEvents).forEach(key => {
      var val = camEvents[key]
      var pkey = this.props.printerService.name + ".events." + key
      if (pkey in event_listeners) {
        if (!(event_listeners[pkey].find((x) => x["action"] == val["action"]))) {
          event_listeners[pkey].push(val)
        }
      } else {
        event_listeners[pkey] = [val]
      }
    });

    this.props.updateService(this.props.node, cservice, {"event_listeners": event_listeners})
    .then((response) => {
      // console.log(response)
      // var f = response.data.attachment
      
    })
    .catch((error) => {
      console.log(error)
      if (error.response && error.response.data && error.response.data) {
        let errors = Object.keys(error.response.data.errors).map((key, index) => {
          return  `${key} : ${error.response.data.errors[key]}<br/>`
        })
  
        toaster.danger(
          `Unable to update camera ${JSON.stringify(cservice)}`,
          {description: errors}
        )
      }
    })

  }

  addAttachment(service_id) {

      this.props.saveAttachment(this.props.node, this.props.printerService, {service_id: service_id})
      .then((response) => {
        // console.log(response)
        // var f = response.data.attachment
        
      })
      .catch((error) => {
        console.log(error)
        if (error.response && error.response.data && error.response.data) {
          let errors = Object.keys(error.response.data.errors).map((key, index) => {
            return  `${key} : ${error.response.data.errors[key]}<br/>`
          })
    
          toaster.danger(
            `Unable to save attachment ${JSON.stringify(service_id)}`, 
            {description: errors}
          )
        }
      })
  }

  startPrint(printParams, closeDialog = null) {
    // if (!(this.form.state.newPrint && this.form.state.newPrint.file_id)) {
    //   toaster.danger("Select a File")
    //   return
    // }

    // this.form.state.selectedPrinter
    // var newPrint = this.form.state.newPrint
    return PrinterHandler.start_print(this.props.node, this.props.printerService, printParams)
    .then((response) => {
      // var attachments = this.state.attachments
      console.log("START PRINT", response.data)
      var f = response.data.print
      // attachments = attachments.concat(f)
      // this.setState({
      //   loading: false,
      //   attachments: attachments
      // })

      toaster.success(`Print Started ${printParams.name} has been successfully added`)
      if (closeDialog)
        closeDialog()
    })
    .catch((error) => {
      console.log(error)
      if (closeDialog)
        closeDialog()
      toaster.danger(<ErrorModal requestError={error} />)

      this.setState({
        loading: false,
      })
    })
  }

  render() {
    // if (!this.props.service.state.printing) {
      
      return (
        <React.Fragment key="print">
        <Dialog
          isShown={this.state.showing}
          title="Start Print"
          confirmLabel="Save"
          onCloseComplete={() => this.toggleDialog(false)}
          onConfirm={this.onNewPrint.bind(this)}
        >
          <PrintForm ref={frm => this.form = frm} {...this.props} node={this.props.node} loading={this.state.loading}/>
        </Dialog>

        </React.Fragment>
      )
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
    // listAttachments: (node, service) => dispatch(ServiceActions.listAttachments(node, service)),
    saveAttachment: (node, service, attachment) => dispatch(ServiceActions.saveAttachment(node, service, attachment)),
    updateService: (node, service, params) => dispatch(ServiceActions.updateService(node, service, params)),
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(NewPrint)

// export default NewPrint

