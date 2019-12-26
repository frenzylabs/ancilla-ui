//
//  index.tsx
//  ancilla
// 
//  Created by Wess Cope (wess@frenzylabs.com) on 12/26/19
//  Copyright 2019 FrenzyLabs, LLC.
//

import React from 'react'

import {
  Pane,
  Spinner
} from 'evergreen-ui'

export default class Loader extends React.Component {
  render() {
    return (
      <Pane>
        <Spinner marginX="auto" marginY="auto" />
      </Pane>
    )
  }
}
