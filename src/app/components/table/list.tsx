//
//  list.tsx
//  ancilla
// 
//  Created by Kevin Musselman (kevin@frenzylabs.com) on 01/02/20
//  Copyright 2019 FrenzyLabs, LLC.
//


import React from 'react'

import {
  Pane,
  Table,
} from 'evergreen-ui'


import { PaginatedList } from '../utils/pagination'


import Loader from '../loader/index'


import PropTypes from 'prop-types'

const optionPropTypes = {
  renderSectionHeader: PropTypes.func,
  renderHeader: PropTypes.func,
  renderRow: PropTypes.func,
  onChangePage: PropTypes.func,
  data: PropTypes.any,
  loading: PropTypes.bool,
  search: PropTypes.object,
  height: PropTypes.number,
  width: PropTypes.number
}

const statePropTypes = {
  search: PropTypes.object,
  data: PropTypes.any
}

type TableProps = PropTypes.InferProps<typeof optionPropTypes>
type TableStateProps = PropTypes.InferProps<typeof statePropTypes>



export class List extends React.Component<TableProps, TableStateProps> {

  
  constructor(props:any) {
    super(props)

    this.state = {
      search: {
        page: 1, 
        per_page: 5, 
        q: {name: ""}
      }
    }

    this.onChangePage       = this.onChangePage.bind(this)
    this.renderData         = this.renderData.bind(this)
    this.renderRows         = this.renderRows.bind(this)
    this.renderRow          = this.renderRow.bind(this)
    this.renderPagination   = this.renderPagination.bind(this)
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  componentDidUpdate(prevProps, prevState) {
    if(prevProps.search != this.props.search) {
      this.setState({search: this.props.search})
    }
  }


  onChangePage(page) {
    if (this.props.onChangePage) {
      this.props.onChangePage(page)
    }
  }

  renderRow(row, index) {
    if (this.props.renderRow) {
      return (this.props.renderRow(row, index))
    } else {
      
      var columns = (Object.keys(row).map((k, colindex) => {
        return (<Table.TextCell key={colindex}>
                {JSON.stringify(row[k])}
                </Table.TextCell>
              )
      }))
      return (<Table.Row key={index} >{columns}</Table.Row>)
    }
  }

  renderRows(rows) {
    if (!rows) return null
    return rows.map((row, index) => {
        return this.renderRow(row, index)
    })
  }

  renderTableHeader() {
    if (this.props.renderHeader) {
      return this.props.renderHeader()
    } else {
      var columns = []
      columns[0] = (<Table.TextHeaderCell key="default"></Table.TextHeaderCell>)
      if (this.props.data && this.props.data.data) {
        var first = this.props.data.data[0]
        if (first) {
          columns = (Object.keys(first).map((k) => {
            return (<Table.TextHeaderCell key={k}>
                    {k}
                    </Table.TextHeaderCell>
                  )
          }))
        } 
      }
      return (<Table.Head>{columns}</Table.Head>)
      
    }
  }

  renderTable() {
  //   if (this.props.loading) {
  //     return (
  //       <Pane borderTop padding={20} display="flex" alignItems="center" justifyContent="center" minHeight={340}>
  //         <Loader/>
  //       </Pane>
  //     )
  // } 
    return (
      <Table>
        {this.renderTableHeader()}

        <Table.VirtualBody height={this.props.height || 240}>
          {this.props.loading ? <Loader/> : this.renderRows(this.props.data.data)}
        </Table.VirtualBody>
      </Table>)
  }

  renderPagination() {
    if (this.props.data && this.props.data.data.length > 0) {
      var {current_page, last_page, total} = this.props.data.meta;
      return (
        <PaginatedList currentPage={current_page} pageSize={this.state.search.per_page} totalPages={last_page} totalItems={total} onChangePage={this.onChangePage} /> 
      )
    }
  }

  renderSectionHeader() {
    if (this.props.renderSectionHeader) {
      return this.props.renderSectionHeader()
    }
    return null
  }

  renderData() {
    
    // else {
      return (
        <React.Fragment>
          <Pane borderBottom borderLeft borderRight>
            {this.renderTable()}
          </Pane>
          {this.renderPagination()}
        </React.Fragment>
      )
    // }
  }

  render() {
    return (
      <Pane display="flex">
        <Pane display="flex" flexDirection="column" width="100%" background="#fff"  border="default">
          
          {this.renderSectionHeader()}
          {this.renderData()}
          
        </Pane>
      </Pane>
    )
  }	
}

export default List
