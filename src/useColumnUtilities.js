import React from 'react'
import { actions } from 'react-table'

const pluginName = 'useColumnUtilities'

actions.columnStartResizing = 'columnStartResizing'
actions.columnDoneResizing = 'columnDoneResizing'
actions.columnStartDragging = 'columnStartDragging'
actions.columnDoneDragging = 'columnDoneDragging'

export const useColumnUtilities = (hooks) => {
  hooks.stateReducers.push(reducer)
  hooks.useInstance.push(useInstance)
  hooks.visibleColumns.push(visibleColumns)
  hooks.getHeaderProps.push({
    style: {
      position: 'absolute'
    }
  })
}

useColumnUtilities.pluginName = pluginName

function visibleColumns(columns) {
  return columns.filter((col) => col.cellType !== 'hidden')
}

function reducer(state, action, previousState, instance) {
  switch (action.type) {
    case actions.init: {
      return {
        isResizing: false,
        isDragging: false,
        ...state
      }
    }
    case actions.columnStartResizing: {
      return {
        ...state,
        isResizing: true
      }
    }
    case actions.columnDoneResizing: {
      return {
        ...state,
        isResizing: false
      }
    }
    case actions.columnStartDragging: {
      return {
        ...state,
        isDragging: true
      }
    }
    case actions.columnDoneDragging: {
      return {
        ...state,
        isDragging: false
      }
    }
    default:
      return state
  }
}

function useInstance(instance) {
  const { dispatch, headerGroups } = instance

  const startDragging = React.useCallback(
    () => dispatch({ type: actions.columnStartDragging }),
    [dispatch]
  )

  const endDragging = React.useCallback(
    () => dispatch({ type: actions.columnDoneDragging }),
    [dispatch]
  )

  const resetHiddenColumns = React.useCallback(
    () => dispatch({ type: actions.resetHiddenColumns }),
    [dispatch]
  )

  const resetColumnOrder = React.useCallback(
    () => dispatch({ type: actions.resetColumnOrder }),
    [dispatch]
  )

  const expandColumnId = React.useMemo(() => {
    let expandColId = ''
    headerGroups.forEach((group) => {
      group.headers.forEach((header) => {
        if (header.id === 'select_') {
          header.disableExpand = true
        } else if (!expandColId) {
          expandColId = header.id
          header.disableExpand = false
        } else {
          header.disableExpand = true
        }
      })
    })
    return expandColId
  }, [headerGroups])

  Object.assign(instance, {
    expandColumnId,
    resetHiddenColumns,
    resetColumnOrder,
    startDragging,
    endDragging
  })
}
