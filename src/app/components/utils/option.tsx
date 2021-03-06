//
//  option.tsx
//  ancilla
// 
//  Created by Kevin Musselman (kevin@frenzylabs.com) on 12/21/19
//  Copyright 2019 FrenzyLabs, LLC.
//


import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
// import { Pane } from '../../layers'
// import { Icon } from '../../icon'
// import { Image } from '../../image'
import { Pane, Icon, Image, TableRow, TextTableCell } from 'evergreen-ui'

const optionPropTypes = {
  label: PropTypes.any,
  icon: PropTypes.string,
  style: PropTypes.any,
  height: PropTypes.number,
  onSelect: PropTypes.func,
  onDeselect: PropTypes.func,
  isHighlighted: PropTypes.bool,
  isSelected: PropTypes.bool,
  isSelectable: PropTypes.bool,
  disabled: PropTypes.bool
}

type UserProps = PropTypes.InferProps<typeof optionPropTypes>

export default class Option extends PureComponent<UserProps> {
  // static propTypes = {
  //   label: PropTypes.string,
  //   icon: PropTypes.string,
  //   style: PropTypes.any,
  //   height: PropTypes.number,
  //   onSelect: PropTypes.func,
  //   onDeselect: PropTypes.func,
  //   isHighlighted: PropTypes.bool,
  //   isSelected: PropTypes.bool,
  //   isSelectable: PropTypes.bool,
  //   disabled: PropTypes.bool
  // }

  render() {
    const {
      label,
      onSelect,
      onDeselect,
      isHighlighted,
      isSelected,
      isSelectable,
      disabled,
      style,
      height,
      icon,
      ...props
    } = this.props

    const textProps = {color: ''}
    if (disabled) {
      textProps.color = 'muted'
    }

    if (isSelected) {
      textProps.color = 'selected'
    }

    return (
      <TableRow
        isSelectable={isSelectable && !disabled}
        isHighlighted={isHighlighted}
        onSelect={onSelect}
        onDeselect={onDeselect}
        isSelected={isSelected}
        style={style}
        display="flex"
        alignItems="center"
        borderBottom={false}
        {...props}
      >
        <Pane
          paddingLeft={12}
          paddingRight={8}
          opacity={isSelected ? 1 : 0}
          flexGrow={0}
          paddingTop={4}
        >
          <Icon color="selected" icon="tick" size={14} />
        </Pane>
        <TextTableCell
          height={height}
          borderBottom="muted"
          textProps={textProps}
          paddingLeft={0}
          borderRight={null}
          flex={1}
          alignSelf="stretch"
          cursor={disabled ? 'default' : 'pointer'}
        >
          <Pane alignItems="center" display="flex">
            {icon && <Image src={icon} width={24} marginRight={8} />}
            {label}
          </Pane>
        </TextTableCell>
      </TableRow>
    )
  }
}