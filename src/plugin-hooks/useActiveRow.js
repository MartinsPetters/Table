import React from 'react'

import {
  actions,
  makePropGetter,
  ensurePluginOrder,
  useGetLatest,
  useMountedLayoutEffect
} from 'react-table'

const pluginName = 'useActiveRow'

actions.resetActiveRow = 'resetActiveRow'
actions.setActiveRow = 'setActiveRow'

export const useActiveRow = (hooks) => {
  hooks.getActiveRowProps = [defaultgetActiveRowProps]
  hooks.stateReducers.push(reducer)
  hooks.useInstance.push(useInstance)
  hooks.prepareRow.push(prepareRow)
}

useActiveRow.pluginName = pluginName

const defaultgetActiveRowProps = (props, { row }) => {
  return [
    props,
    {
      onClick: (e) => {
        row.activateRow()
      }
    }
  ]
}

function reducer(state, action, previousState, instance) {
  switch (action.type) {
    case actions.init: {
      return {
        activeRowIndex: -1,
        ...state
      }
    }
    case actions.resetActiveRow: {
      return {
        ...state,
        activeRowIndex: instance.initialState.activeRowIndex || -1
      }
    }
    case actions.setActiveRow: {
      const newIndex = action.index
      const oldIndex = previousState.activeRowIndex
      const index =
        newIndex !== oldIndex && instance.onChangeRow(oldIndex)
          ? newIndex
          : oldIndex
      return {
        ...state,
        activeRowIndex: index
      }
    }
    case actions.gotoPage: {
      //cancel pagination if not allowed to change active row
      const prevPageIndex = previousState.pageIndex
      const newPageIndex = state.pageIndex
      if (prevPageIndex === newPageIndex) {
        return state
      }
      if (instance.onChangeRow(state.activeRowIndex)) {
        return state
      }
      return {
        ...state,
        pageIndex: prevPageIndex
      }
    }
    case actions.toggleSortBy: {
      //cancel sort if not allowed to change active row
      const prevSortBy = previousState.sortBy
      const newSortBy = state.sortBy
      if (prevSortBy === newSortBy) {
        return state
      }
      if (instance.onChangeRow(state.activeRowIndex)) {
        return state
      }
      return {
        ...state,
        sortBy: prevSortBy
      }
    }
    case actions.setFilter: {
      //cancel filter if not allowed to change active row
      const prevFilters = previousState.filters
      const newFilters = state.filters
      if (prevFilters === newFilters) {
        return state
      }
      if (instance.onChangeRow(state.activeRowIndex)) {
        return state
      }
      return {
        ...state,
        filters: prevFilters
      }
    }
    default:
      return state
  }
}

function useInstance(instance) {
  const {
    rows,
    page = rows,
    data,
    getHooks,
    plugins,
    autoresetActiveRow = true,
    state: { activeRowIndex },
    dispatch,
    onChange = () => true
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
    'useActiveRow'
  )

  const activeRowId = React.useMemo(() => {
    let id = ''
    page.forEach((row, idx) => {
      row.isActive = idx === activeRowIndex
      row.rowIndex = idx
      if (row.isActive) {
        id = String(row.id)
      }
    })
    if (!id) {
      if (page.length) {
        //reset active row to the first row in page
        dispatch({ type: actions.setActiveRow, index: 0 })
      } else if (activeRowIndex !== -1) {
        //no rows available, set active row to -1 if it isn't already
        dispatch({ type: actions.setActiveRow, index: -1 })
      }
    }
    return id
  }, [page, activeRowIndex, dispatch])

  const onChangeRow = React.useCallback(
    (index) => {
      const row = page[index]
      if (row) {
        return onChange(row)
      } else {
        console.log(`No active row found for index ${index}`)
        return true
      }
    },
    [page, onChange]
  )

  const activateRow = React.useCallback(
    (index) => dispatch({ type: actions.setActiveRow, index }),
    [dispatch]
  )

  const getAutoresetActiveRow = useGetLatest(autoresetActiveRow)

  useMountedLayoutEffect(() => {
    if (getAutoresetActiveRow()) {
      dispatch({ type: actions.resetActiveRow })
    }
  }, [dispatch, data])

  const getInstance = useGetLatest(instance)

  const getActiveRowProps = makePropGetter(getHooks().getActiveRowProps, {
    instance: getInstance()
  })

  Object.assign(instance, {
    activeRowId,
    activeRowIndex,
    activateRow,
    onChangeRow,
    getActiveRowProps
  })
}

function prepareRow(row, { instance }) {
  row.activateRow = () => instance.activateRow(row.rowIndex)
  row.getActiveRowProps = makePropGetter(
    instance.getHooks().getActiveRowProps,
    { instance: instance, row }
  )
}
