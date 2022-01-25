import React from 'react'

function isFunction(a) {
  if (typeof a === 'function') {
    return a
  }
}

const pluginName = 'useHierarchyFilters'

export function getFilterMethod(filter, filterTypes) {
  return isFunction(filter) || filterTypes[filter] || filterTypes.text
}

export const useHierarchyFilters = (hooks) => {
  hooks.useInstance.push(useInstance)
}

useHierarchyFilters.pluginName = pluginName

function useInstance(instance) {
  const {
    rows,
    flatRows,
    rowsById,
    allColumns,
    canFilterRow = () => true,
    filterTypes: userFilterTypes,
    state: { filters }
  } = instance

  const [filteredRows, filteredFlatRows, filteredRowsById] =
    React.useMemo(() => {
      const filteredFlatRows = []
      const filteredRowsById = {}

      const filterRows = (rows) => {
        let filteredRows = rows
        let idx = 0
        while (idx !== filteredRows.length) {
          const curentRow = filteredRows[idx]
          const hide =
            canFilterRow(curentRow) &&
            filters.some(({ id: columnId, value: filterValue }) => {
              const column = allColumns.find((d) => d.id === columnId)
              if (!column) {
                return false
              }
              const filterMethod = getFilterMethod(
                column.filter,
                userFilterTypes || {}
              )
              if (!filterMethod) {
                console.warn(
                  `Could not find a valid 'column.filter' for column with the ID: ${column.id}.`
                )
                return false
              }
              const result = filterMethod(
                [curentRow],
                [columnId],
                filterValue,
                column.filterType
              )
              return !result?.length
            })
          if (hide) {
            if (curentRow.subRows) {
              filteredRows = [
                ...filteredRows.slice(0, idx),
                ...curentRow.subRows,
                ...filteredRows.slice(idx + 1)
              ]
            } else {
              filteredRows = [
                ...filteredRows.slice(0, idx),
                ...filteredRows.slice(idx + 1)
              ]
            }
          } else {
            filteredFlatRows.push(curentRow)
            filteredRowsById[curentRow.id] = curentRow
            if (curentRow.subRows) {
              curentRow.subRows = filterRows(curentRow.subRows)
            }
            idx++
          }
        }
        return filteredRows
      }

      return [filterRows(rows), filteredFlatRows, filteredRowsById]
    }, [filters, rows, allColumns, userFilterTypes, canFilterRow])

  React.useMemo(() => {
    const nonFilteredColumns = allColumns.filter(
      (column) => !filters.find((d) => d.id === column.id)
    )

    nonFilteredColumns.forEach((column) => {
      column.preFilteredRows = filteredRows
      column.filteredRows = filteredRows
    })
  }, [filteredRows, filters, allColumns])

  Object.assign(instance, {
    preFilteredRows: rows,
    preFilteredFlatRows: flatRows,
    preFilteredRowsById: rowsById,
    filteredRows,
    filteredFlatRows,
    filteredRowsById,
    rows: filteredRows,
    flatRows: filteredFlatRows,
    rowsById: filteredRowsById
  })
}
