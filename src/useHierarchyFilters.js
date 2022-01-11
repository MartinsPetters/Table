import React from 'react'

function isFunction(a) {
  if (typeof a === 'function') {
    return a
  }
}

export function getFilterMethod(filter, filterTypes) {
  return isFunction(filter) || filterTypes[filter] || filterTypes.text
}

export const useHierarchyFilters = (hooks) => {
  hooks.useInstance.push(useInstance)
}

function useInstance(instance) {
  const {
    rows,
    flatRows,
    rowsById,
    allColumns,
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
          const hide = filters.some(({ id: columnId, value: filterValue }) => {
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
            const result = filterMethod([curentRow], [columnId], filterValue)
            console.log('RESULT', result)
            return !result.length
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
    }, [filters, rows, allColumns, userFilterTypes])

  React.useMemo(() => {
    // Now that each filtered column has it's partially filtered rows,
    // lets assign the final filtered rows to all of the other columns
    const nonFilteredColumns = allColumns.filter(
      (column) => !filters.find((d) => d.id === column.id)
    )

    // This essentially enables faceted filter options to be built easily
    // using every column's preFilteredRows value
    nonFilteredColumns.forEach((column) => {
      column.preFilteredRows = filteredRows
      column.filteredRows = filteredRows
    })
  }, [filteredRows, filters, allColumns])

  console.log('NEW STATE', {
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
