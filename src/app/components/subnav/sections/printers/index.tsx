//
//  printers.tsx
//  ancilla
// 
//  Created by Wess Cope (me@wess.io) on 11/08/19
//  Copyright 2019 Wess Cope
//

import React from 'react'
import {connect}  from 'react-redux'

import {
  Printer
} from '../../../../models'

import Tree from '../../../tree'
import { NodeAction } from '../../../../store/actions/node'

import { NodeState, PrinterState }  from '../../../../store/state'


type Props = {
  node: NodeState,
  printer: PrinterState,
  listPrinters: Function,
  history: any
}

export class Printers extends React.Component<Props> {  
  state = {
    printers: Array<Printer>(),
    showing: false,
    loading: false,
    auth_showing: false,
    printerParams: {}
  }

  constructor(props:any) {
    super(props)    

    // this.savePrinter  = this.savePrinter.bind(this)
    // this.getPrinters  = this.getPrinters.bind(this)
  }

  componentDidMount() {
  }

  addPrinter() {
    let url = `/printers/new`
    this.props.history.push(`${url}`);
  }

  selectPrinter(item) {
    if (item && item.id) {
      let url = `/printers/${item.id}`
      this.props.history.push(`${url}`);    
    } else {
      this.addPrinter()
    }
  }

  authenticated(res, closeDialog) {
    this.setState({auth_showing: false, showing: true})
    
  }


  render() {
    let printers = this.props.node.services.filter((item) => item.kind == "printer") //Object.values(this.props.printers)
    let items =  printers.length > 0 ? printers : [{name: "No printers found."}]
    
    return ( 
      <React.Fragment key="printers">
        <Tree.Node name="Printers" key="printers" children={items} addAction={() => this.addPrinter()} selectItem={this.selectPrinter.bind(this)} />
      </React.Fragment>
    )
  }
}


const mapStateToProps = (state) => {
  return {
    printers: state.activeNode.printers
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    listPrinters: () => dispatch(NodeAction.listPrinters())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Printers)
