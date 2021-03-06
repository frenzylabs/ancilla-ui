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
  TextInput,
  Combobox,
  Checkbox,
  Button,
  Label,
  Switch,
  Heading,
  Paragraph,
  Tooltip,
  Position,
  Icon,
  toaster
} from 'evergreen-ui'

import PrinterHandler from '../../../network/printer'

import { ServiceHandler } from '../../../network'
import { NodeState, PrinterState }  from '../../../store/state'

type Props = {
  node: NodeState,
  kind: string,
  save?:Function, 
  data?: any, 
  onSave: Function, 
  onError: Function
}

// function isMergeableObject(object) {
//   return object && typeof value === 'object' && object.isMergeable !== false
// }

export default class SettingsForm extends React.Component<Props> {
  state = {
    // logging: {
    //   level: "INFO",
    //   stdout: {on: true, level: "WARNING"},
    //   file: {on: true, level: "INFO", fileSize: 640000}
    // },
    settings:     {
      logging: {
        level: "INFO",
        stdout: {on: false, level: "WARNING"},
        file: {on: true, level: "INFO", maxBytes: 64_000_000, backupCount: 1}
      },
      tempReporting: {
        enabled: true,
        strategy: "poll",
        interval: "5"
      }
    },
    logLevels: [
      "DEBUG",
      "INFO",
      "WARNING",
      "ERROR",
      "CRITICAL"
    ],
    tempReportingOptions: [
      {name: "Poll", value: "poll", description: "Uses M105 to periodically get Printer's Temperature"},
      {name: "AutoReport", value: "auto", description: "If your firmware has the capability, this will send an M155 command to tell the firmware to automatically report the temperature."}
    ],
    loading: false,
    name:     ''
  }

  constructor(props:any) {
    super(props)

    this.save = this.save.bind(this)
    this.savePrinter = this.savePrinter.bind(this)
  }

  componentDidMount() {
    if (this.props.data) {
      var data = this.props.data || {}


      var settings = this.state.settings


      var merged = this.mergeState(settings, data.settings || {})
      this.setState({settings: merged})

    }

  }

  componentDidUpdate(prevProps, prevState) {

  }
  

  mergeState(target, source) {
    var newobj = Object.assign({}, source)
    Object.keys(target).forEach((key) => { 
      
      var val = target[key]
      var newval = source[key]
      
      
      if (newval != undefined) {
        if (typeof val === 'object' && typeof newval === 'object') {
          newval = this.mergeState(val, newval)
        }
      } else {
        newval = val
      }
      
      newobj[key] = newval
    })
    return newobj
  }

  savePrinter() {

    this.setState({
      ...this.state,
      loading: true
    })

    var req;
    if (!(this.props.data && this.props.data.id)) {
      return 
    }
    
    PrinterHandler.update(this.props.node, this.props.data.id, {"settings": this.state.settings})
    .then((response) => {
      this.setState({
        loading: false
      })
      if (this.props.onSave) {
        this.props.onSave(response)
      }
      toaster.success(`Printer ${name} has been successfully saved`)
    })
    .catch((error) => {
      if (this.props.onError) {
        this.props.onError(error)
      }
      else {
        var errors = [""]
        if (error.response.data && error.response.data.errors) {
            errors = Object.keys(error.response.data.errors).map((key, index) => {
              return  `${key} : ${error.response.data.errors[key]}\n`
            })
        }

        toaster.danger(
          `Unable to save printer ${name}`, 
          {description: errors}
        )
      }
      this.setState({
        loading: false
      })
    })
  }

  save() {
    if(this.props.save  == undefined) {
      // alert("No save function given")
      this.savePrinter()
      // return
    } else {
      this.props.save(this.state.settings)
    }
  }

  fileSettingsChanged(kind, key, val) {
    var intval = parseInt(val)
    var txtinput = ""
    if (!isNaN(intval)) {
      txtinput = `${intval}`
    }
    this.setLoggingState(kind, key, txtinput)
  }

  
  setLoggingState(kind, key, val) {
    var settings = this.state.settings
    var newlogging = {...settings["logging"][kind], [key]: val}
    this.setSettingState("logging", kind, newlogging)
  }

  setSettingState(kind, key, val) {
    var settings = this.state.settings
    this.setState({settings: {...settings, [kind]: {...settings[kind], [key]: val}}})
  }

  renderBaseLogForm(kind) {
    var logging = this.state.settings["logging"] || {}
    var logsettings = logging[kind]
    if (!logsettings) return
    return (
      <Pane>
        <Label
              size={400}
              display="inline-block"
            >
              On:
          </Label>
      <Switch
          margin={20}
          height={24}
          display="inline-block"
          checked={logsettings.on}
          onChange={e => this.setLoggingState(kind, "on", e.target.checked)}
        />
        <Pane display="flex" flexDirection="column" borderTop marginTop={10} paddingTop={10}>
          <Label
            htmlFor="description"
            marginBottom={4}
            display="block"
          >
            Log Level <small>(DEBUG is most granular)</small>
          </Label>
          <Combobox 
            openOnFocus 
            items={this.state.logLevels} 
            placeholder={"Log Level"} 
            marginTop={4} 
            marginBottom={4}  
            // width="100%" 
            height={48}
            selectedItem={logsettings.level}
            initialSelectedItem={logsettings.level}
            disabled={!logsettings.on}
            onChange={selected => this.setLoggingState(kind, "level", selected)}
            
          />
        </Pane>
      </Pane>        
    )
  }

  renderFileLogging() {
    var kind = "file"
    var logging = this.state.settings["logging"] || {}
    var logsettings = logging[kind]
    if (!logsettings) return
    
    return (
      <Pane margin={20} padding={20} background="white" elevation={1} border >
        <Heading size={600}>{"File"}</Heading>
        <Pane>
          <Paragraph size={300} marginTop="10px">
              This uses a rotating log. When the size of the file is about to reach maxBytes and backupCount is greater than 0 then 
              the file is closed and new file is silently opened for output. * Remember to keep your available disk space in mind when setting this. 

              <Tooltip 
                position={Position.BOTTOM}
                statelessProps={{
                  maxWidth: "60vw"
                }}
                content={
                  <Paragraph margin={10}>
                    You can use the maxBytes and backupCount values to allow the file to rollover at a predetermined size. 
                    When the size is about to be exceeded, the file is closed and a new file is silently opened for output. 
                    Rollover occurs whenever the current log file is nearly maxBytes in length; but if either of maxBytes 
                    or backupCount is zero, rollover never occurs, so you generally want to set backupCount to at least 1, 
                    and have a non-zero maxBytes. When backupCount is non-zero, the system will save old log files by appending 
                    the extensions ‘.1’, ‘.2’ etc., to the filename. For example, with a backupCount of 5 and a base file name 
                    of app.log, you would get app.log, app.log.1, app.log.2, up to app.log.5. The file being written to is 
                    always app.log. When this file is filled, it is closed and renamed to app.log.1, and if files app.log.1, 
                    app.log.2, etc. exist, then they are renamed to app.log.2, app.log.3 etc. respectively.
                  </Paragraph>
                }
                appearance="card"
              >
                <Icon size={12} marginLeft={4} icon="info-sign" />
              </Tooltip>

              
          </Paragraph>
        </Pane>
        {this.renderBaseLogForm(kind)}
        <Pane width={"100%"}>
          <Label
              htmlFor="filesize"
              marginBottom={4}
              display="block"
            >
              Max File Size <small>(bytes)</small>
          </Label>
          <TextInput
            name="filesize" 
            placeholder="Log File Size" 
            disabled={!logsettings.on}
            marginBottom={4}
            height={48}
            value={logsettings.maxBytes}
            onChange={e => 
              this.fileSettingsChanged(kind, "maxBytes", e.target.value)
            }
          />
        </Pane>
        <Pane width={"100%"}>
          <Label
              htmlFor="filecount"
              marginBottom={4}
              display="block"
            >
              Max Number of Files
          </Label>
          <TextInput
            name="filecount" 
            placeholder="Log File Count" 
            disabled={!logsettings.on}
            marginBottom={4}
            height={48}
            value={logsettings.backupCount}
            onChange={e => 
              this.fileSettingsChanged(kind, "backupCount", e.target.value)
            }
          />
        </Pane>
        
      </Pane>
    )
  }

  renderStdoutLogging() {
    var kind = "stdout"
    var logging = this.state.settings["logging"] || {}
    var logsettings = logging[kind]
    if (!logsettings) return 

    return (
      <Pane margin={20} padding={20} background="white" elevation={1} border >
        <Heading size={600}>{"STDOUT"}</Heading>
        <Pane>
          <Paragraph size={300} marginTop="10px">
              This should probably remain off to save your system resouces.  
          </Paragraph>
        </Pane>
        {this.renderBaseLogForm(kind)}
      </Pane>
    )
  }

  renderPollForm(skey, tempReporting) {
    
    return (
      <Pane width={"100%"}>
          <Label
              htmlFor="interval"
              marginBottom={4}
              display="block"
            >
              Poll Interval <small>(seconds)</small>
          </Label>
          <TextInput
            name="interval" 
            placeholder="Interval" 
            disabled={!tempReporting.enabled}
            marginBottom={4}
            height={48}
            value={tempReporting.interval}
            onChange={e => {
                var val = parseInt(e.target.value) || ""
                this.setSettingState(skey, "interval", `${val}`)
              }
            }
          />
        </Pane>
    )
  }
  renderTempForm() {
    var skey = "tempReporting"
    var tempReporting = this.state.settings[skey] || {}
    var selectedStrategy = this.state.tempReportingOptions.find((x) => x.value == tempReporting.strategy)
    return (
      <Pane margin={20} padding={20} background="white" elevation={1} border >
        <Heading size={600}>{"Temperature Reporting"}</Heading>
        
        <Pane>
          <Label
                size={400}
                display="inline-block"
              >
                On:
            </Label>
        <Switch
            margin={20}
            height={24}
            display="inline-block"
            checked={tempReporting.enabled}
            onChange={e => this.setSettingState(skey, "enabled", e.target.checked)}
          />
          <Pane display="flex" flexDirection="column" borderTop marginTop={10} paddingTop={10}>
            <Label
              htmlFor="strategy"
              marginBottom={4}
              display="block"
            >
              Strategy 
            </Label>
            <Pane display="flex" flex="1" marginBottom="10px">
              <Combobox 
                openOnFocus 
                items={this.state.tempReportingOptions} 
                itemToString={item => item ? item.name : ''}
                placeholder={"Temp Reporting"} 
                marginTop={4} 
                marginBottom={4}  
                // width="100%" 
                height={48}
                selectedItem={selectedStrategy}
                // initialSelectedItem={tempReporting.strategy}
                disabled={!tempReporting.enabled}
                onChange={selected => {
                  this.setSettingState(skey, "strategy", selected.value)
                }
                }
                
              />
            
              <Paragraph>
                {selectedStrategy["description"] || ""}
              </Paragraph> 
            </Pane>
          </Pane>
          {tempReporting.strategy == "poll" && this.renderPollForm(skey, tempReporting)}
        </Pane>        
       </Pane> 
    )
  }

  renderLoggingForm() {
    return (
      <React.Fragment>
        {this.renderFileLogging()}
        {this.renderStdoutLogging()}
      </React.Fragment>
    )
  }

  renderAdvancedForm() {
    return (
      <React.Fragment>
        {this.renderTempForm()}
        
      </React.Fragment>
    )
  }

  renderForm() {
    switch (this.props.kind) {
      case 'logging':
        return this.renderLoggingForm()
        break;
      case 'advanced':
        return this.renderAdvancedForm()
        break;
      default:
        return 
    }
  }

  render() {
    return (
      <Pane>
        {this.renderForm()}
        <Pane margin={10} padding={10} >
            <Button isLoading={this.state.loading} appearance="primary" onClick={this.save}>Save</Button>
        </Pane>
      </Pane>    
    )
  }
}
