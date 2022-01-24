import React from 'react'

import {
  actions,
  makePropGetter,
  ensurePluginOrder,
  useGetLatest,
  useMountedLayoutEffect
} from 'react-table'

const pluginName = 'useSimpleRowSelect'

actions.resetSelectedRows = 'resetSelectedRows'
actions.toggleAllRowsSelected = 'toggleAllRowsSelected'
actions.toggleRowSelected = 'toggleRowSelected'

export const useSimpleRowSelect = (hooks) => {
  hooks.getToggleRowSelectedProps = [defaultGetToggleRowSelectedProps]
  hooks.getToggleAllRowsSelectedProps = [defaultGetToggleAllRowsSelectedProps]
  hooks.visibleColumns.push(visibleColumns)
  hooks.stateReducers.push(reducer)
  hooks.useInstance.push(useInstance)
  hooks.prepareRow.push(prepareRow)
}

useSimpleRowSelect.pluginName = pluginName

const defaultGetToggleRowSelectedProps = (props, { instance, row }) => {
  const { manualRowSelectedKey = 'isSelected' } = instance
  let checked = false

  if (row.original && row.original[manualRowSelectedKey]) {
    checked = true
  } else {
    checked = row.isSelected
  }

  return [
    props,
    {
      onChange: (e) => {
        row.toggleRowSelected(e.target.checked)
      },
      style: {
        cursor: 'pointer'
      },
      disabled: !row.canSelectRow(),
      checked
    }
  ]
}

const defaultGetToggleAllRowsSelectedProps = (props, { instance }) => [
  props,
  {
    onChange: (e) => {
      instance.toggleAllRowsSelected(e.target.checked)
    },
    style: {
      cursor: 'pointer'
    },
    disabled: false,
    checked: instance.isAllRowsSelected,
    indeterminate: Boolean(
      !instance.isAllRowsSelected &&
        Object.keys(instance.state.selectedRowIds).length
    )
  }
]

function visibleColumns(columns) {
  const newColumns = [
    {
      id: 'select_',
      disableDragging: true,
      disableResizing: true,
      disableExpand: true,
      maxWidth: 50
    },
    ...columns
  ]
  return newColumns
}

function reducer(state, action, previousState, instance) {
  if (action.type === actions.init) {
    return {
      selectedRowIds: {},
      ...state
    }
  }

  if (action.type === actions.resetSelectedRows) {
    return {
      ...state,
      selectedRowIds: instance.initialState.selectedRowIds || {}
    }
  }

  if (action.type === actions.toggleAllRowsSelected) {
    const { value: setSelected } = action
    const {
      isAllRowsSelected,
      rowsById,
      nonGroupedRowsById = rowsById
    } = instance

    const selectAll =
      typeof setSelected !== 'undefined' ? setSelected : !isAllRowsSelected

    const selectedRowIds = { ...state.selectedRowIds }

    if (selectAll) {
      Object.keys(nonGroupedRowsById).forEach((rowId) => {
        if (instance.canSelectRow(rowId) && instance.onSelectRow(rowId, true)) {
          selectedRowIds[rowId] = true
        }
      })
    } else {
      Object.keys(nonGroupedRowsById).forEach((rowId) => {
        if (
          instance.canSelectRow(rowId) &&
          instance.onSelectRow(rowId, false)
        ) {
          delete selectedRowIds[rowId]
        }
      })
    }

    return {
      ...state,
      selectedRowIds
    }
  }

  if (action.type === actions.toggleRowSelected) {
    const { id, value: setSelected } = action
    const { rowsById, selectSubRows = false, getSubRows } = instance
    const isSelected = state.selectedRowIds[id]
    const shouldSelect =
      typeof setSelected !== 'undefined' ? setSelected : !isSelected

    if (isSelected === shouldSelect) {
      return state
    }

    const selectedRowIds = { ...state.selectedRowIds }

    const handleRowById = (id) => {
      const row = rowsById[id]

      if (!row.isGrouped) {
        if (shouldSelect) {
          if (instance.canSelectRow(id)) {
            selectedRowIds[id] = true
          }
        } else {
          if (instance.canSelectRow(id)) {
            delete selectedRowIds[id]
          }
        }
      }
      const subRows = getSubRows(row)
      if (selectSubRows && subRows) {
        return subRows.forEach((row) => handleRowById(row.id))
      }
    }

    if (instance.onSelectRow(id, shouldSelect)) {
      handleRowById(id)
    }

    return {
      ...state,
      selectedRowIds: selectedRowIds
    }
  }

  return state
}

function useInstance(instance) {
  const {
    data,
    rows,
    getHooks,
    plugins,
    rowsById,
    nonGroupedRowsById = rowsById,
    autoResetSelectedRows = true,
    state: { selectedRowIds },
    dispatch,
    canSelect = () => true,
    onSelect = () => true
  } = instance

  ensurePluginOrder(
    plugins,
    [
      'useHierarchyFilters',
      'useGroupBy',
      'useSortBy',
      'useExpanded',
      'usePagination'
    ],
    'useSimpleRowSelect'
  )

  const selectedFlatRows = React.useMemo(() => {
    const selectedFlatRows = []

    rows.forEach((row) => {
      const isSelected = !!selectedRowIds[row.id]
      row.isSelected = isSelected
      if (isSelected) {
        selectedFlatRows.push(row)
      }
    })

    return selectedFlatRows
  }, [rows, selectedRowIds])

  const onSelectRow = React.useCallback(
    (id, setSelected) => {
      const row = rowsById[id]
      return onSelect(row, setSelected)
    },
    [rowsById, onSelect]
  )

  const canSelectRow = React.useCallback(
    (id) => {
      const row = rowsById[id]
      if (row) {
        return canSelect(row)
      } else {
        return false
      }
    },
    [rowsById, canSelect]
  )

  let isAllRowsSelected = Boolean(
    Object.keys(nonGroupedRowsById).length && Object.keys(selectedRowIds).length
  )

  if (isAllRowsSelected) {
    if (
      Object.keys(nonGroupedRowsById).some((id) =>
        canSelectRow(id) ? !selectedRowIds[id] : false
      )
    ) {
      isAllRowsSelected = false
    }
  }

  const getAutoResetSelectedRows = useGetLatest(autoResetSelectedRows)

  useMountedLayoutEffect(() => {
    if (getAutoResetSelectedRows()) {
      dispatch({ type: actions.resetSelectedRows })
    }
  }, [dispatch, data])

  const toggleAllRowsSelected = React.useCallback(
    (value) => dispatch({ type: actions.toggleAllRowsSelected, value }),
    [dispatch]
  )

  const toggleRowSelected = React.useCallback(
    (id, value) => dispatch({ type: actions.toggleRowSelected, id, value }),
    [dispatch]
  )

  const getInstance = useGetLatest(instance)

  const getToggleAllRowsSelectedProps = makePropGetter(
    getHooks().getToggleAllRowsSelectedProps,
    { instance: getInstance() }
  )

  Object.assign(instance, {
    selectedFlatRows,
    isAllRowsSelected,
    onSelectRow,
    canSelectRow,
    toggleRowSelected,
    toggleAllRowsSelected,
    getToggleAllRowsSelectedProps
  })
}

function prepareRow(row, { instance }) {
  row.toggleRowSelected = (set) => instance.toggleRowSelected(row.id, set)
  row.canSelectRow = () => instance.canSelectRow(row.id)

  row.getToggleRowSelectedProps = makePropGetter(
    instance.getHooks().getToggleRowSelectedProps,
    { instance: instance, row }
  )
}
