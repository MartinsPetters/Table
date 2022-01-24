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
import { useHierarchyFilters } from './plugin-hooks/useHierarchyFilters'
import { useSimpleRowSelect } from './plugin-hooks/useSimpleRowSelect'
import { useColumnUtilities } from './plugin-hooks/useColumnUtilities'
import { useActiveRow } from './plugin-hooks/useActiveRow'
import TableToolbar from './components/TableToolbar'
import TableColumnSelect from './components/TableColumnSelect'
import TableFooter from './components/TableFooter'
import TableHeader from './components/TableHeader'
import Header from './components/Header'
import Filter from './components/Filter'
import Select from './components/Select'
import TableBody from './components/TableBody'
import Cell from './components/Cell'

import CircularJSON from 'circular-json'
import ReactJson from 'react-json-view'
import makeData from './makeData'

const styleTable = {
  root: {
    border: '1px solid #e0e0e0',
    overflowX: 'auto',
    '*': {
      boxSizing: 'border-box'
    }
  }
}

function Table({ columns: userColumns, data, initialState }) {
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
              return rowValue !== undefined ? rowValue === value : true
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

  const getRowId = React.useCallback((row) => {
    //console.log(row)
    return row['id_']
  }, [])

  const canSelect = React.useCallback((row) => {
    const { values } = row
    if (values.firstName.indexOf('a') === -1) {
      return false
    }
    return true
  }, [])

  const onSelect = React.useCallback((...props) => {
    console.log('SELECT ROW', props)
    return true
  }, [])

  const onChange = React.useCallback((...props) => {
    console.log('ACTIVATE ROW', props)
    return true
  }, [])

  const table = useTable(
    {
      tableName: 'Table',
      columns: userColumns,
      data,
      initialState,
      Tools: TableToolbar,
      defaultColumn,
      manualFilters: true,
      onSelect,
      canSelect,
      //canFilter: canSelect,
      onChange,
      getRowId,
      getSubRows: (row) => row.subRows,
      stateReducer: (newState, action, prevState) => {
        console.log('REDUCER', newState, action, prevState)
        return newState
      },
      useControlledState: (state) => {
        console.log('CONTROLED STATE', state)
        return state
      }
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
    useColumnUtilities //active other utilities
  )

  const {
    tools,
    tableName,
    getTableProps,
    getTableBodyProps,
    headerGroups,
    setColumnOrder,
    allColumns,
    prepareRow,
    page, // Instead of using 'rows', we'll use page,
    pageCount,
    gotoPage,
    canPreviousPage,
    previousPage,
    canNextPage,
    nextPage,
    startDragging,
    endDragging,
    setHiddenColumns,
    resetHiddenColumns,
    resetColumnOrder,
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

      <pre>
        <ReactJson
          src={JSON.parse(CircularJSON.stringify({ table }))}
          name={false}
          collapsed={true}
          displayDataTypes={false}
        />
      </pre>
    </>
  )
}

function App() {
  const columns = React.useMemo(
    () => [
      {
        label: 'ID',
        cellType: 'hidden',
        accessor: 'id_'
      },
      {
        accessor: 'firstName',
        label: 'First Name',
        filterType: 'text'
      },
      {
        label: 'Last Name',
        accessor: 'lastName',
        filterType: 'text'
      },
      {
        accessor: 'age',
        label: 'Age',
        filterType: 'text'
        //Filter: SliderColumnFilter,
        //filter: 'text'
      },
      {
        accessor: 'visits',
        label: 'Visits',
        filterType: 'select',
        filterOptions: (rows) => {
          let options = new Set()
          rows.forEach((row) => {
            options.add(String(row.values['visits']))
          })
          options = Array.from(options)
          options.sort((firstEl, secondEl) =>
            Number(firstEl) < Number(secondEl) ? -1 : 1
          )
          console.log('filterOptions', options, rows)
          return options
        }
      },
      {
        accessor: 'progress',
        cellType: 'boolean',
        cellFormat: (value) => (value ? 'Y' : 'N'),
        label: 'Profile Progress'
        //Header: 'Profile Progress'
        //Filter: SliderColumnFilter,
        //filter: filterGreaterThan,
        //filter: 'text'
      },
      {
        accessor: 'status',
        label: 'Status',
        filterType: 'select',
        filterOptions: (rows) => {
          let options = new Set()
          rows.forEach((row) => {
            options.add(row.values['status'])
          })
          options = Array.from(options)
          options.sort((firstEl, secondEl) => (firstEl < secondEl ? -1 : 1))
          console.log('filterOptions', options, rows)
          return options
        }
      }
    ],
    []
  )

  const data = React.useMemo(() => makeData(30, 3, 2), [])

  const initialState = React.useMemo(() => {
    let columnOrder = []
    columns.reduce((state, col) => {
      state.push(col.accessor || col.id)
      return state
    }, columnOrder)
    return { columnOrder }
  }, [columns])

  return (
    <div style={{ margin: 10 }}>
      <button
        onClick={() =>
          document.dispatchEvent(
            new CustomEvent('nexus.columnsDisplayed', {
              detail: {
                tableName: 'Table'
              }
            })
          )
        }
      >
        {'Columns Displayed'}
      </button>
      <div style={{ width: 1000 }}>
        <Table columns={columns} data={data} initialState={initialState} />
      </div>
    </div>
  )
}

export default App
