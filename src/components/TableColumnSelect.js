import React from 'react'
import {
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent
} from '@material-ui/core'
import { FirstPage, PreviousPage, BackwardIcon } from './Icons'
import { css } from '@emotion/css'

const styleTableColumnSelect = {
  root: {
    display: 'flex',
    '& .TableColumnSelect-list': {
      height: 250,
      width: 175
    },
    '& .TableColumnSelect-icon-button': {
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
    '& .TableColumnSelect-add-button-root,.TableColumnSelect-order-button-root,.TableColumnSelect-show-root,.TableColumnSelect-hide-root':
      {
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }
  },
  button: {
    '&.TableColumnSelect-button-row-root': {
      padding: '10px 0px',
      display: 'flex',
      '& .TableColumnSelect-button-root': {
        paddingRight: 5
      }
    },
    '& .TableColumnSelect-button': {
      fontSize: '14px',
      minWidth: '101px',
      textTransform: 'none',
      backgroundColor: '#2376D7',
      color: '#ffffff',
      '&:hover': {
        backgroundColor: '#00BAF2'
      },
      '&:active': {
        backgroundColor: '#2376D7 !important',
        color: 'white'
      }
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
  const [open, setOpen] = React.useState(false)
  const [showGroup, setShowGroup] = React.useState([])
  const [hideGroup, setHideGroup] = React.useState([])
  const showSelect = React.useRef()
  const hideSelect = React.useRef()

  const resetGroup = React.useCallback(() => {
    const newShowGroup = []
    const newHideGroup = []
    allColumns.forEach(({ id, label, cellType }) => {
      if (cellType !== 'hidden' && id !== 'select_') {
        if (hiddenColumns.includes(id)) {
          newHideGroup.push({ id, label })
        } else {
          newShowGroup.push({ id, label })
        }
      }
    })
    setShowGroup(newShowGroup)
    setHideGroup(newHideGroup)
  }, [allColumns, hiddenColumns])

  const cancelGroup = () => {
    resetGroup()
    setOpen(false)
  }

  const saveGroup = () => {
    setColumnOrder(showGroup.map((col) => col.id))
    setHiddenColumns(hideGroup.map((col) => col.id))
    setOpen(false)
  }

  const defaultGroup = () => {
    resetColumnOrder()
    resetHiddenColumns()
    setOpen(false)
  }

  React.useEffect(() => {
    resetGroup()
  }, [resetGroup])

  React.useEffect(() => {
    const openDialog = () => setOpen(true)
    document.addEventListener('nexus.columnsDisplayed', openDialog)
    return () => {
      document.removeEventListener('nexus.columnsDisplayed', openDialog)
    }
  }, [resetGroup])

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
    <Dialog
      open={open}
      disableEnforceFocus={true}
      fullWidth={false}
      maxWidth={false}
    >
      <DialogTitle>{'Columns Displayed'}</DialogTitle>
      <DialogContent>
        <div className={`TableColumnSelect-root ${css(classes.root)}`}>
          <div className="TableColumnSelect-hide-root">
            {'Available Columns'}
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
              className="TableColumnSelect-icon-button"
              onClick={addToGroup(true, false)}
            >
              <PreviousPage
                className="TableColumnSelect-icon"
                style={{ transform: 'rotate(-180deg)' }}
              />
            </IconButton>
            <IconButton
              className="TableColumnSelect-icon-button"
              onClick={addToGroup(false, false)}
            >
              <PreviousPage
                className="TableColumnSelect-icon"
                style={{ transform: 'rotate(0deg)' }}
              />
            </IconButton>
            <IconButton
              className="TableColumnSelect-icon-button"
              onClick={addToGroup(true, true)}
            >
              <BackwardIcon
                className="TableColumnSelect-icon"
                style={{ transform: 'rotate(-180deg)' }}
              />
            </IconButton>
            <IconButton
              className="TableColumnSelect-icon-button"
              onClick={addToGroup(false, true)}
            >
              <BackwardIcon
                className="TableColumnSelect-icon"
                style={{ transform: 'rotate(0deg)' }}
              />
            </IconButton>
          </div>
          <div className="TableColumnSelect-show-root">
            {'Selected Columns'}
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
              className="TableColumnSelect-icon-button"
              onClick={orderGroup(false, true)}
            >
              <FirstPage
                className="TableColumnSelect-icon"
                style={{ transform: 'rotate(90deg)' }}
              />
            </IconButton>
            <IconButton
              className="TableColumnSelect-icon-button"
              onClick={orderGroup(false, false)}
            >
              <PreviousPage
                className="TableColumnSelect-icon"
                style={{ transform: 'rotate(90deg)' }}
              />
            </IconButton>
            <IconButton
              className="TableColumnSelect-icon-button"
              onClick={orderGroup(true, false)}
            >
              <PreviousPage
                className="TableColumnSelect-icon"
                style={{ transform: 'rotate(-90deg)' }}
              />
            </IconButton>
            <IconButton
              className="TableColumnSelect-icon-button"
              onClick={orderGroup(true, true)}
            >
              <FirstPage
                className="TableColumnSelect-icon"
                style={{ transform: 'rotate(-90deg)' }}
              />
            </IconButton>
          </div>
        </div>
        <div
          className={`TableColumnSelect-button-row-root  ${css(
            classes.button
          )}`}
        >
          <div className="TableColumnSelect-button-root">
            <Button
              className="TableColumnSelect-button"
              onClick={defaultGroup}
              variant="contained"
              color="default"
            >
              {'Reset Default'}
            </Button>
          </div>
          <div className="TableColumnSelect-button-root">
            <Button
              className="TableColumnSelect-button"
              onClick={saveGroup}
              variant="contained"
              color="default"
            >
              {'Save'}
            </Button>
          </div>
          <div className="TableColumnSelect-button-root">
            <Button
              className="TableColumnSelect-button"
              onClick={cancelGroup}
              variant="contained"
              color="default"
            >
              {'Cancel'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
