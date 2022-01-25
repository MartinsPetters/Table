import React from 'react'
import { css } from '@emotion/css'
import {
  useTable,
  useExpanded,
  useSortBy,
  useFilters,
  useResizeColumns,
  useColumnOrder,
  useAbsoluteLayout,
  usePagination
} from 'react-table'
import { useHierarchyFilters } from '../plugin-hooks/useHierarchyFilters'
import { useSimpleRowSelect } from '../plugin-hooks/useSimpleRowSelect'
import { useColumnUtilities } from '../plugin-hooks/useColumnUtilities'
import { useActiveRow } from '../plugin-hooks/useActiveRow'
import TableToolbar from './TableToolbar'
import TableColumnSelect from './TableColumnSelect'
import TableFooter from './TableFooter'
import TableHeader from './TableHeader'
import Header from './Header'
import Filter from './Filter'
import Select from './Select'
import TableBody from './TableBody'
import Cell from './Cell'

const styleTable = {
  root: {
    border: '1px solid #e0e0e0',
    overflowX: 'auto',
    '*': {
      boxSizing: 'border-box'
    }
  }
}

export default function Table({
  tableCfg = {},
  columnsCfg = [],
  data = [],
  initialState = {}
}) {
  const classes = styleTable

  const defaultColumn = React.useMemo(
    () => ({
      cellType: 'text',
      cellFormat: (value) => String(value),
      filterType: '',
      filter: (rows, id, filterValue, filterType) => {
        switch (filterType) {
          case 'select': {
            const value = filterValue?.[0] || ''
            const result = rows.filter((row) => {
              const rowValue = row.values[id]
              return rowValue !== undefined
                ? String(rowValue) === String(value)
                : true
            })
            return result
          }
          default: {
            const value = filterValue?.[0] || ''
            const result = rows.filter((row) => {
              const rowValue = row.values[id]
              return rowValue !== undefined
                ? String(rowValue)
                    .toLowerCase()
                    .includes(String(value).toLowerCase())
                : true
            })
            return result
          }
        }
      },
      Filter: Filter,
      Header: Header,
      Select: Select,
      Cell: Cell,
      width: 150
    }),
    []
  )

  const table = useTable(
    {
      data,
      initialState,
      tableName: 'Table',
      getRowId: (row) => row['id_'],
      getSubRows: (row) => row.subRows,
      onChangeRow: () => true,
      onSelectRow: () => true,
      canSelectRow: () => true,
      canFilterRow: () => true,
      onChangeColumn: () => {},
      defaultColumn,
      columns: columnsCfg,
      multiselect: false,
      manualFilters: true,
      Tools: TableToolbar,
      ...tableCfg
    },
    useFilters, // filter hook
    useHierarchyFilters, //filter hook for hierarchy
    useSortBy, //sort hook
    useExpanded, // expand hook
    useColumnOrder, //order
    useAbsoluteLayout, //div table hook
    useResizeColumns, // resize hook
    usePagination, // pagination
    useSimpleRowSelect, // select rows
    useActiveRow, //active row
    useColumnUtilities // other utilities
  )

  const {
    tableName,
    getTableProps,
    getTableBodyProps,
    tools,
    headerGroups,
    page,
    prepareRow,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    startDragging,
    endDragging,
    setHiddenColumns,
    resetHiddenColumns,
    resetColumnOrder,
    setColumnOrder,
    allColumns,
    state: { hiddenColumns }
  } = table

  return (
    <>
      <TableColumnSelect
        tableName={tableName}
        allColumns={allColumns}
        hiddenColumns={hiddenColumns}
        setColumnOrder={setColumnOrder}
        setHiddenColumns={setHiddenColumns}
        resetColumnOrder={resetColumnOrder}
        resetHiddenColumns={resetHiddenColumns}
      />
      <div>
        <div>{tools.render()}</div>
        <div {...getTableProps()} className={`Table-root ${css(classes.root)}`}>
          <TableHeader
            tableName={tableName}
            headerGroups={headerGroups}
            allColumns={allColumns}
            setColumnOrder={setColumnOrder}
            startDragging={startDragging}
            endDragging={endDragging}
          />
          <TableBody
            tableName={tableName}
            getTableBodyProps={getTableBodyProps}
            page={page}
            prepareRow={prepareRow}
          />
        </div>
        <TableFooter
          tableName={tableName}
          pageCount={pageCount}
          gotoPage={gotoPage}
          previousPage={previousPage}
          nextPage={nextPage}
          canPreviousPage={canPreviousPage}
          canNextPage={canNextPage}
        />
      </div>
    </>
  )
}
