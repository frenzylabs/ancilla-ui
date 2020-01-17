import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import fuzzaldrin from 'fuzzaldrin-plus'
import Downshift from 'downshift'
import VirtualList from 'react-tiny-virtual-list'

import { Popover, Position, Heading, Pane } from 'evergreen-ui'

import AutocompleteItem from './autocompleteItem'

const fuzzyFilter = itemToString => {
  if (itemToString) {
    return (items, input) => {
      const wrappedItems = items.map(item => ({
        key: itemToString(item),
        item
      }))

      return fuzzaldrin
        .filter(wrappedItems, input, { key: 'key' })
        .map(({ item }) => item)
    }
  }

  return (items, input) => fuzzaldrin.filter(items, input)
}

const noop = () => {}

const autocompleteItemRenderer = props => <AutocompleteItem {...props} />


const propTypes = {
  /**
   * This prop can be either a string or a Node.
   * It will provide a title for the items
   */
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),

  /**
   * An array of items to be used as options for the select
   */
  items: PropTypes.array.isRequired,

  /**
   * The selected Item to be shown on the autocomplete
   */
  selectedItem: PropTypes.any,

  /**
   * In case the array of items is not an array of strings,
   * this function is used on each item to return the string that will be shown on the filter
   */
  itemToString: PropTypes.func.isRequired,

  /**
   * Function that will render the 'filter' component.
   */
  children: PropTypes.func.isRequired,

  /**
   * The height of each item in the list
   * Because the list is virtualized this is required beforehand.
   */
  itemSize: PropTypes.number,

  /**
   * Function that returns a component to render the item
   */
  renderItem: PropTypes.func,

  /**
   * The position of the Popover the Autocomplete is rendered in.
   */
  position: PropTypes.oneOf(Object.keys(Position)),

  /**
   * A function that is used to filter the items.
   * It should return a subset of the initial items.
   * By default the "fuzzaldrin-plus" package is used.
   */
  itemsFilter: PropTypes.func,

  /**
   * Prop that enables and disables filtering
   * True: Enables Filtering
   * False: Disables Filtering
   */
  isFilterDisabled: PropTypes.bool,

  /**
   * Defines the minimum height the results container will be
   */
  popoverMinWidth: PropTypes.number,

  /**
   * Defines the maximum height the results container will be
   */
  popoverMaxHeight: PropTypes.number,

  /**
   * The selected item to be selected & shown by default on the autocomplete (deprecated)
   */

  ...Downshift.propTypes
}

type autoProps = PropTypes.InferProps<typeof propTypes>


// https://github.com/paypal/downshift/issues/164
export class Autocomplete extends PureComponent<autoProps> {
  // static propTypes = {
  //   /**
  //    * This prop can be either a string or a Node.
  //    * It will provide a title for the items
  //    */
  //   title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),

  //   /**
  //    * An array of items to be used as options for the select
  //    */
  //   items: PropTypes.array.isRequired,

  //   /**
  //    * The selected Item to be shown on the autocomplete
  //    */
  //   selectedItem: PropTypes.any,

  //   /**
  //    * In case the array of items is not an array of strings,
  //    * this function is used on each item to return the string that will be shown on the filter
  //    */
  //   itemToString: PropTypes.func.isRequired,

  //   /**
  //    * Function that will render the 'filter' component.
  //    */
  //   children: PropTypes.func.isRequired,

  //   /**
  //    * The height of each item in the list
  //    * Because the list is virtualized this is required beforehand.
  //    */
  //   itemSize: PropTypes.number,

  //   /**
  //    * Function that returns a component to render the item
  //    */
  //   renderItem: PropTypes.func,

  //   /**
  //    * The position of the Popover the Autocomplete is rendered in.
  //    */
  //   position: PropTypes.oneOf(Object.keys(Position)),

  //   /**
  //    * A function that is used to filter the items.
  //    * It should return a subset of the initial items.
  //    * By default the "fuzzaldrin-plus" package is used.
  //    */
  //   itemsFilter: PropTypes.func,

  //   /**
  //    * Prop that enables and disables filtering
  //    * True: Enables Filtering
  //    * False: Disables Filtering
  //    */
  //   isFilterDisabled: PropTypes.bool,

  //   /**
  //    * Defines the minimum height the results container will be
  //    */
  //   popoverMinWidth: PropTypes.number,

  //   /**
  //    * Defines the maximum height the results container will be
  //    */
  //   popoverMaxHeight: PropTypes.number,

  //   /**
  //    * The selected item to be selected & shown by default on the autocomplete (deprecated)
  //    */

  //   ...Downshift.propTypes
  // }

  state = {
    targetWidth: 0
  }

  static defaultProps = {
    itemToString: i => (i ? String(i) : ''),
    itemSize: 32,
    isFilterDisabled: false,
    popoverMinWidth: 240,
    popoverMaxHeight: 240,
    renderItem: autocompleteItemRenderer
  }

  componentDidMount() {
    this.setState({
      targetWidth: this.targetRef.getBoundingClientRect().width
    })
  }

  stateReducer = (state, changes) => {
    const { items } = this.props

    if (
      Object.prototype.hasOwnProperty.call(changes, 'isOpen') &&
      changes.isOpen
    ) {
      return {
        ...changes,
        highlightedIndex: items.indexOf(state.selectedItem)
      }
    }

    return changes
  }

  renderResults = ({
    width,
    inputValue,
    highlightedIndex,
    selectItemAtIndex,
    selectedItem,
    getItemProps
  }) => {
    const {
      title,
      itemSize,
      itemsFilter,
      items: originalItems,
      itemToString,
      renderItem,
      popoverMaxHeight,
      isFilterDisabled
    } = this.props

    const filter = itemsFilter || fuzzyFilter(itemToString)
    const items =
      isFilterDisabled || inputValue.trim() === ''
        ? originalItems
        : filter(originalItems, inputValue)

    if (items.length === 0) return null

    return (
      <Pane width={width}>
        {title && (
          <Pane padding={8} borderBottom="muted">
            <Heading size={100}>{title}</Heading>
          </Pane>
        )}
        {items.length > 0 && (
          <VirtualList
            width="100%"
            height={Math.min(items.length * itemSize, popoverMaxHeight)}
            itemSize={itemSize}
            itemCount={items.length}
            scrollToIndex={highlightedIndex || 0}
            overscanCount={3}
            scrollToAlignment="auto"
            renderItem={({ index, style }) => {
              const item = items[index]
              const itemString = itemToString(item)
              const onSelect = () => {
                selectItemAtIndex(index)
              }

              const itemKey = (item) => {
                if (item && (typeof item) === "object" && item.hasOwnProperty("key")){
                  return item["key"]
                } else {
                  return itemToString(item)
                }
              }
              return renderItem(
                {...getItemProps({
                  item,
                  key: itemKey(item),
                  index,
                  style,
                  children: itemString,
                  onMouseUp: onSelect,
                  onTouchEnd: onSelect,
                  isSelected: itemKey(selectedItem) === itemKey(item),
                  isHighlighted: highlightedIndex === index
                }), item: item}

              )
            }}
          />
        )}
      </Pane>
    )
  }

  render() {
    const {
      children,
      itemSize,
      position,
      renderItem,
      itemsFilter,
      popoverMaxHeight,
      popoverMinWidth,
      initialSelectedItem,
      defaultInputValue, // Deprecated
      initialInputValue,
      getButtonProps, // Deprecated
      getToggleButtonProps,
      ...props
    } = this.props

    return (
      <Downshift
        initialSelectedItem={initialSelectedItem}
        initialInputValue={initialInputValue || defaultInputValue}
        getToggleButtonProps={getToggleButtonProps || getButtonProps}
        stateReducer={this.stateReducer}
        scrollIntoView={noop}
        {...props}
      >
        {({
          isOpen: isShown,
          inputValue,
          getItemProps,
          selectedItem,
          highlightedIndex,
          selectItemAtIndex,
          getRootProps,
          ...restDownshiftProps
        }) => (
          <Pane width="100%" {...getRootProps({ refKey: 'innerRef' })}>
            <Popover
              bringFocusInside={false}
              isShown={isShown}
              minWidth={popoverMinWidth}
              position={
                position ||
                (this.state.targetWidth < popoverMinWidth
                  ? Position.BOTTOM_LEFT
                  : Position.BOTTOM)
              }
              content={() => {
                return this.renderResults({
                  width: Math.max(this.state.targetWidth, popoverMinWidth),
                  inputValue,
                  getItemProps,
                  selectedItem,
                  highlightedIndex,
                  selectItemAtIndex
                })
              }}
              minHeight={0}
              animationDuration={0}
            >
              {({ isShown: isShownPopover, toggle, getRef }) =>
                children({
                  isShown: isShownPopover,
                  toggle,
                  getRef: ref => {
                    // Use the ref internally to determine the width
                    this.targetRef = ref
                    getRef(ref)
                  },
                  inputValue,
                  selectedItem,
                  highlightedIndex,
                  selectItemAtIndex,
                  ...restDownshiftProps
                })
              }
            </Popover>
          </Pane>
        )}
      </Downshift>
    )
  }
}

export default Autocomplete
