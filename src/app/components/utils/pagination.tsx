/*
 *  list.js
 *  LayerKeep
 * 
 *  Created by Wess Cope (me@wess.io) on 04/26/19
 *  Copyright 2018 WessCope
 */

import React from 'react';

import {
  Pane,
  IconButton,
  Button,
  Text
} from 'evergreen-ui'

const defaultProps = {
    currentPage: 1,
    pageSize: 10
}

export class PaginatedList extends React.Component<{onChangePage?, currentPage, lastPage?, totalItems, totalPages, pageSize}, {pager}> {
  constructor(props) {
    super(props);
    
    window.pl   = this
    this.state  = { pager: {} };    

    this.renderPrevious = this.renderPrevious.bind(this)
    this.renderNext     = this.renderNext.bind(this)
    this.renderList     = this.renderList.bind(this)
  }

  componentWillMount() {
      // set page if items total isn't empty
      if (this.props.totalItems > 1) {
          this.setPage(this.props.currentPage);
      }
  }

  setPage(page) {
    var { totalItems, pageSize, totalPages } = this.props;
    var pager = this.state.pager;

    if (page < 1 || page > totalPages) {
        return;
    }

    // get new pager object for specified page
    pager = this.getPager(totalItems, page, totalPages, pageSize);

    // get new page of items from items array

    // update state
    this.setState({ pager: pager });

    // call change page function in parent component
    this.props.onChangePage(page);
}


  getPager(totalItems, currentPage, totalPages, pageSize) {
    // default to first page
    currentPage = currentPage || 1;

    // default page size is 10
    pageSize = pageSize || 10;

    // calculate total pages

    var startPage, endPage;
    if (totalPages <= 10) {
        // less than 10 total pages so show all
        startPage = 1;
        endPage = totalPages;
    } else {
        // more than 10 total pages so calculate start and end pages
        if (currentPage <= 6) {
            startPage = 1;
            endPage = 10;
        } else if (currentPage + 4 >= totalPages) {
            startPage = totalPages - 9;
            endPage = totalPages;
        } else {
            startPage = currentPage - 5;
            endPage = currentPage + 4;
        }
    }

    // create an array of pages to loop in the pager control
    var pages = [...Array((endPage + 1) - startPage).keys()].map(i => startPage + i);

    // return object with all pager properties required by the view
    return {
        totalItems: totalItems,
        currentPage: currentPage,
        pageSize: pageSize,
        totalPages: totalPages,
        startPage: startPage,
        endPage: endPage,
        pages: pages
    };
  }


  renderPrevious() {
    let pager = this.state.pager
    let currentPage   = pager.currentPage
    let previousPage  = currentPage > 1 ? currentPage - 1 : null

    return (
      <React.Fragment>
        {pager.startPage > 1 && (
          <Button marginLeft={4} marginRight={4} onClick={() => this.setPage(1)}>First</Button>
        )}

        {pager.currentPage > 1  && (
          <IconButton icon="arrow-left" marginRight={8} onClick={() => this.setPage(previousPage)}/>
        )}

        {(pager.startPage > 1) && (
          <Pane display="flex" marginLeft={8} marginRight={8} alignItems="center" justifyContent="center">
            <Text>...</Text>
          </Pane>
        )}
      </React.Fragment>
    )
  }

  renderNext() {
    let pager = this.state.pager
    let currentPage = pager.currentPage
    let nextPage    = currentPage < pager.totalPages ? currentPage + 1 : null

    return (
      <React.Fragment>
        {pager.endPage < pager.totalPages &&
          <Pane display="flex" marginLeft={8} marginRight={8} alignItems="center" justifyContent="center">
            <Text>...</Text>
          </Pane>
        }

        {pager.currentPage < pager.endPage && (
          <IconButton icon="arrow-right" marginLeft={8} onClick={() => this.setPage(nextPage)}/>
        )}

        {pager.endPage < pager.totalPages && (
          <Button marginLeft={4} marginRight={4} onClick={() => this.setPage(this.props.totalPages)}>Last({this.props.totalPages})</Button>
        )}
      </React.Fragment>
    )
  }

  renderList() {
    let pager         = this.state.pager;
    let currentPage   = pager.currentPage; 

    return (
      <React.Fragment>
        {pager.pages.map((page, index) =>
          <Button key={index} marginLeft={4} marginRight={4} isActive={page == (currentPage)} onClick={() => this.setPage(page)}>
            {page}
          </Button>
        )}
      </React.Fragment>
    )
  }

  render() {
    var pager = this.state.pager;
    if (!pager.pages || pager.pages.length <= 1) {
        // don't display pager if there is only 1 page
        return null;
    }

    return (
      <Pane display="flex" marginTop={10} justifyContent="center">
        {this.renderPrevious()}
        {this.renderList()}
        {this.renderNext()}
      </Pane>
    )
  }
}

export default PaginatedList
