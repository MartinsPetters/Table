import React from 'react'
import { actions, flexRender, useGetLatest } from 'react-table'

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
      instance.onChangeColumn(state, action)
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
      instance.onChangeColumn(state, action)
      return {
        ...state,
        isDragging: false
      }
    }
    case actions.resetHiddenColumns: {
      instance.onChangeColumn(state, action)
      return state
    }
    case actions.resetColumnOrder: {
      instance.onChangeColumn(state, action)
      return state
    }
    case actions.setHiddenColumns: {
      instance.onChangeColumn(state, action)
      return state
    }
    case actions.setColumnOrder: {
      if (!state.isDragging) instance.onChangeColumn(state, action)
      return state
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

  const getInstance = useGetLatest(instance)

  const tools = React.useMemo(
    () => ({
      render: (userProps) => {
        const instance = getInstance()
        const { Tools } = instance
        const props = { ...instance, userProps }
        return flexRender(Tools, props)
      }
    }),
    [getInstance]
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
    tools,
    expandColumnId,
    resetHiddenColumns,
    resetColumnOrder,
    startDragging,
    endDragging
  })
}
