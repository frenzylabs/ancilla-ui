import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import Option from './option'

const propTypes = {
  children: PropTypes.node,
  style: PropTypes.object,
  isSelected: PropTypes.bool,
  isHighlighted: PropTypes.bool
}

type autoProps = PropTypes.InferProps<typeof propTypes>
export default class AutocompleteItem extends PureComponent<autoProps> {


  render() {
    const { isHighlighted, isSelected, style, children, ...props } = this.props

    return (
      <Option
        isHighlighted={isHighlighted}
        isSelected={isSelected}
        label={children}
        style={style}
        {...props}
      />
    )
  }
}