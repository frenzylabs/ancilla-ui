/*
 *  index.js
 *  LayerKeep
 * 
 *  Created by Wess Cope (me@wess.io) on 05/07/19
 *  Copyright 2018 WessCope
 */

import React                                        from 'react';

import {
  Pane,
  Dialog,
  Heading,
  Button,
  toaster
} from 'evergreen-ui'

import LKAuthModal        from './auth';
import SpinnerModal       from './spinner';
import ErrorModal         from './error';


export default class Modal extends React.Component<{component: React.Component}> {
  static auth         = LKAuthModal;
  static spinner        = SpinnerModal;
  static error          = ErrorModal;

  dismissAction() {
    console.log("dismiss action", arguments)
    if (this.props.dismissAction)
      this.props.dismissAction()
  }

  render() {
    const styles = this.props.component.parentStyles || {}
    const Comp = this.props.component 
    return (<Dialog
      isShown={this.props.isActive}
      title="Login to Layerkeep"
      confirmLabel="Login"
      onCloseComplete={this.dismissAction.bind(this)}
      hasFooter={false}
      
    >
      {({ close }) => (
        <Comp dismissAction={this.props.dismissAction} {...this.props} />
    )}

    </Dialog>
    )

    // return (
    //   <BulmaModal isActive={this.props.isActive}>
    //     <BulmaModalBackground onClick={this.props.dismissAction}/>
    //     <BulmaModalContent>
    //       <Box 
    //         style={styles}>{<this.props.component 
    //         dismissAction={this.props.dismissAction} 
    //         {...this.props} />}
    //       </Box>
    //     </BulmaModalContent>

    //     <BulmaModalClose onClick={this.props.dismissAction}/>
    //   </BulmaModal>
    // )
  }
}
 