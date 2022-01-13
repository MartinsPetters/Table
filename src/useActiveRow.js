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
        activeRowId: '',
        ...state
      }
    }
    case actions.resetActiveRow: {
      return {
        ...state,
        activeRowId: instance.initialState.activeRowId || ''
      }
    }
    case actions.setActiveRow: {
      const newId = action.id
      const oldId = previousState.activeRowId
      const id =
        newId !== oldId && instance.onActivateRow(newId, oldId) ? newId : oldId
      return {
        ...state,
        activeRowId: id
      }
    }
    default:
      return state
  }
}

function useInstance(instance) {
  const {
    data,
    getHooks,
    plugins,
    rowsById,
    autoresetActiveRow = true,
    state: { activeRowId },
    dispatch,
    onActivate = () => true
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

  const onActivateRow = React.useCallback(
    (newId, oldId) => {
      const newRow = rowsById[newId]
      const oldRow = rowsById[oldId]
      return onActivate(newRow, oldRow)
    },
    [rowsById, onActivate]
  )

  const activateRow = React.useCallback(
    (id) => dispatch({ type: actions.setActiveRow, id }),
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
    activateRow,
    onActivateRow,
    getActiveRowProps
  })
}

function prepareRow(row, { instance }) {
  row.activateRow = () => instance.activateRow(row.id)
  row.isActive = row.id === instance.state.activeRowId

  row.getActiveRowProps = makePropGetter(
    instance.getHooks().getActiveRowProps,
    { instance: instance, row }
  )
}
