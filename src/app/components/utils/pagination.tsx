/*
 *  list.js
 *  LayerKeep
 * 
 *  Created by Wess Cope (me@wess.io) on 04/26/19
 *  Copyright 2018 WessCope
 */

import React from 'react';

import {
  Pane
} from 'evergreen-ui'
// import { Container, Breadcrumb, BreadcrumbItem, Pagination, PageControl, PageList, Page, PageLink, PageEllipsis }    from 'bloomer';
// import PropTypes from 'prop-types';
// import PropTypes, { InferProps } from "prop-types";

// const propTypes = {
//     onChangePage: PropTypes.func.isRequired,
//     currentPage: PropTypes.number,
//     lastPage: PropTypes.number,
//     totalItems: PropTypes.number,
//     pageSize: PropTypes.number
// }

const defaultProps = {
    currentPage: 1,
    pageSize: 10
}

export class PaginatedList extends React.Component<{onChangePage?, currentPage, lastPage?, totalItems, totalPages, pageSize}, {pager}> {
  constructor(props) {
    super(props);
    this.state = { pager: {} };
    window.pl = this
  }

  componentWillMount() {
      // set page if items total isn't empty
      if (this.props.totalItems > 1) {
          this.setPage(this.props.currentPage);
      }
  }

  componentDidUpdate(prevProps, prevState) {
      // if (this.props.totalItems !== prevProps.totalItems ||
      //   this.props.pageSize !== prevProps.pageSize || this.props.currentPage != prevProps.currentPage) {
      //     this.setPage(this.props.currentPage);
      // }
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


  

  render() {
    var pager = this.state.pager;
    console.log("INSIDE PAGINATION render")

    // if (!pager.pages || pager.pages.length <= 1) {
    //     // don't display pager if there is only 1 page
    //     return null;
    // }

    return (
      <Pane>
      <ul>
      {pager.pages.map((page, index) =>
        <li key={index} >
            <span onClick={() => this.setPage(page)}>{page}</span>
        </li>
      )}
      </ul>
    </Pane>)


    // return (<Container className="is-fluid">
    //       <Pagination isAlign="centered">
            
    //         <PageControl {...(pager.currentPage <= 1  ? {disabled: true} : "")} isPrevious onClick={() => this.setPage(pager.currentPage-1)}>Previous</PageControl>
    //         <PageControl {...(pager.currentPage >= pager.totalPages ? {disabled: true} : "")} isNext onClick={() => this.setPage(pager.currentPage + 1)} >Next</PageControl>

    //         <PageList>
    //            {pager.pages.map((page, index) =>
    //                 <Page key={index} >
    //                   <PageLink isCurrent={pager.currentPage == page} onClick={() => this.setPage(page)}>{page}</PageLink>
    //                 </Page>                    
    //             )}
    //         </PageList>
    //       </Pagination>
    //     </Container>)
  }
}

// PaginatedList.propTypes = propTypes;
// PaginatedList.defaultProps = defaultProps;
export default PaginatedList;
