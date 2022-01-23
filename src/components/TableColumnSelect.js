import React from 'react'
import { IconButton } from '@material-ui/core'
import { FirstPage, PreviousPage, BackwardIcon } from './Icons'
import { css } from '@emotion/css'

const styleTableColumnSelect = {
  root: {
    display: 'flex',
    '& .TableColumnSelect-list': {
      height: 250,
      width: 175
    },
    '& .TableColumnSelect-button': {
      fontSize: 15,
      '&:hover': {
        backgroundColor: 'transparent !important',
        '& .TableColumnSelect-icon': {
          fill: '#00BAF2'
        }
      },
      '& .TableColumnSelect-icon': {
        height: 15,
        width: 15,
        fill: '#2376D7'
      }
    },
    '& .TableColumnSelect-add-button-root,.TableColumnSelect-order-button-root':
      {
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }
  }
}

export default function TableColumnSelect({
  allColumns,
  hiddenColumns,
  setColumnOrder,
  setHiddenColumns,
  resetColumnOrder,
  resetHiddenColumns
}) {
  const classes = styleTableColumnSelect

  const [showGroup, setShowGroup] = React.useState([])
  const [hideGroup, setHideGroup] = React.useState([])
  const showSelect = React.useRef()
  const hideSelect = React.useRef()

  const resetGroup = (allCol, hiddenCol) => {
    const newShowGroup = []
    const newHideGroup = []
    allCol.forEach(({ id, label, cellType }) => {
      if (cellType !== 'hidden' && id !== 'select_') {
        if (hiddenCol.includes(id)) {
          newHideGroup.push({ id, label })
        } else {
          newShowGroup.push({ id, label })
        }
      }
    })
    setShowGroup(newShowGroup)
    setHideGroup(newHideGroup)
  }

  const saveGroup = () => {
    setColumnOrder(showGroup.map((col) => col.id))
    setHiddenColumns(hideGroup.map((col) => col.id))
  }

  const defaultGroup = () => {
    resetColumnOrder()
    resetHiddenColumns()
  }

  React.useEffect(() => {
    resetGroup(allColumns, hiddenColumns)
  }, [allColumns, hiddenColumns])

  const addToGroup = (show, all) => () => {
    const options = Array.apply(
      null,
      show ? hideSelect.current.options : showSelect.current.options
    )
    const addGroup = show ? showGroup : hideGroup

    const newAddGroup = addGroup.concat(
      options
        .filter((o) => all || o.selected)
        .map((o) => ({ id: o.value, label: o.text }))
    )

    const removeGroup = options
      .filter((o) => !(all || o.selected))
      .map((o) => ({ id: o.value, label: o.text }))

    setShowGroup(show ? newAddGroup : removeGroup)
    setHideGroup(show ? removeGroup : newAddGroup)
  }

  const orderGroup = (up, end) => () => {
    const options = Array.apply(null, showSelect.current.options)
    const selected = options.reduce((result, o, idx) => {
      if (o.selected) result.push(idx)
      return result
    }, [])
    if (selected.length === 1) {
      const delta = ((up && 1) || -1) * ((end && options.length) || 1)
      const minIndex = 0
      const maxIndex = options.length - 1
      const oldIndex = selected[0]
      let newIndex = selected[0] + delta
      newIndex =
        newIndex > maxIndex
          ? maxIndex
          : newIndex < minIndex
          ? minIndex
          : newIndex

      const newShowGroup = [...showGroup]
      newShowGroup.splice(newIndex, 0, newShowGroup.splice(oldIndex, 1)[0])
      setShowGroup(newShowGroup)
    }
  }

  return (
    <>
      <div className={`TableColumnSelect-root ${css(classes.root)}`}>
        <div className="TableColumnSelect-hide-root">
          <select
            ref={hideSelect}
            className="TableColumnSelect-list"
            type="text "
            multiple="multiple"
          >
            {hideGroup.map((col) => (
              <option
                className="TableColumnSelect-option"
                key={col.id}
                value={col.id}
              >
                {col.label}
              </option>
            ))}
          </select>
        </div>
        <div className="TableColumnSelect-add-button-root">
          <IconButton
            className="TableColumnSelect-button"
            onClick={addToGroup(true, false)}
          >
            <PreviousPage
              className="TableColumnSelect-icon"
              style={{ transform: 'rotate(-180deg)' }}
            />
          </IconButton>
          <IconButton
            className="TableColumnSelect-button"
            onClick={addToGroup(false, false)}
          >
            <PreviousPage
              className="TableColumnSelect-icon"
              style={{ transform: 'rotate(0deg)' }}
            />
          </IconButton>
          <IconButton
            className="TableColumnSelect-button"
            onClick={addToGroup(true, true)}
          >
            <BackwardIcon
              className="TableColumnSelect-icon"
              style={{ transform: 'rotate(-180deg)' }}
            />
          </IconButton>
          <IconButton
            className="TableColumnSelect-button"
            onClick={addToGroup(false, true)}
          >
            <BackwardIcon
              className="TableColumnSelect-icon"
              style={{ transform: 'rotate(0deg)' }}
            />
          </IconButton>
        </div>
        <div className="TableColumnSelect-show-root">
          <select
            ref={showSelect}
            className="TableColumnSelect-list"
            type="text "
            multiple="multiple"
          >
            {showGroup.map((col) => (
              <option
                className="TableColumnSelect-option"
                key={col.id}
                value={col.id}
              >
                {col.label}
              </option>
            ))}
          </select>
        </div>
        <div className="TableColumnSelect-order-button-root">
          <IconButton
            className="TableColumnSelect-button"
            onClick={orderGroup(false, true)}
          >
            <FirstPage
              className="TableColumnSelect-icon"
              style={{ transform: 'rotate(90deg)' }}
            />
          </IconButton>
          <IconButton
            className="TableColumnSelect-button"
            onClick={orderGroup(false, false)}
          >
            <PreviousPage
              className="TableColumnSelect-icon"
              style={{ transform: 'rotate(90deg)' }}
            />
          </IconButton>
          <IconButton
            className="TableColumnSelect-button"
            onClick={orderGroup(true, false)}
          >
            <PreviousPage
              className="TableColumnSelect-icon"
              style={{ transform: 'rotate(-90deg)' }}
            />
          </IconButton>
          <IconButton
            className="TableColumnSelect-button"
            onClick={orderGroup(true, true)}
          >
            <FirstPage
              className="TableColumnSelect-icon"
              style={{ transform: 'rotate(-90deg)' }}
            />
          </IconButton>
        </div>
      </div>
      <button onClick={defaultGroup}>{'Reset Default'}</button>
      <button onClick={saveGroup}>{'Save'}</button>
      <button onClick={resetGroup}>{'Cancel'}</button>
    </>
  )
}
