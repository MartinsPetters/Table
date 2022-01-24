import React from 'react'
import styled from 'styled-components'
import {
  useTable,
  useExpanded,
  useSortBy,
  useFilters,
  useResizeColumns,
  useColumnOrder,
  useAbsoluteLayout,
  usePagination,
  emptyRenderer
} from 'react-table'

import CircularJSON from 'circular-json'
import ReactJson from 'react-json-view'

import makeData from './makeData'
import { useHierarchyFilters } from './useHierarchyFilters'
import { useSimpleRowSelect } from './useSimpleRowSelect'
import { useColumnUtilities } from './useColumnUtilities'
import { useActiveRow } from './useActiveRow'
import { css } from '@emotion/css'

import TableColumnSelect from './components/TableColumnSelect'
import TableFooter from './components/TableFooter'
import TableHeader from './components/TableHeader'
import Header from './components/Header'
import Filter from './components/Filter'
import Select from './components/Select'
import TableBody from './components/TableBody'
import Cell from './components/Cell'

const Styles = styled.div`
  padding: 1rem;

  * {
    box-sizing: border-box;
  }

  .table {
    border: 1px solid #000;
    overflow-x: auto;
  }

  .header {
    font-weight: bold;
    background-color: #dedede;
  }

  .rows {
    overflow-y: auto;
  }

  .row {
    border-bottom: 1px solid #000;
    height: 32px;
    &.filters {
      height: 47px;
    }
    &.active {
      background-color: #e6f1ff;
    }
    &.body {
      :last-child {
        border: 0;
      }
    }
  }

  .cell {
    height: 100%;
    line-height: 30px;
    border-right: 1px solid #000;
    padding-left: 5px;
    &.filter {
      padding: 5px 2.5px 5px 2.5px;
    }
    :last-child {
      border: 0;
    }
    .resizer {
      display: inline-block;
      background: blue;
      width: 10px;
      height: 100%;
      position: absolute;
      right: 0;
      top: 0;
      transform: translateX(50%);
      z-index: 1;
      ${'' /* prevents from scrolling while dragging on touch devices */}
      touch-action:none;

      &.isResizing {
        background: red;
      }
    }
  }
  .header-group {
    height: 51px;
  }
`

// Define a default UI for filtering
function DefaultColumnFilter_old({
  column: { filterValue, preFilteredRows, setFilter }
}) {
  const count = preFilteredRows.length

  return (
    <input
      value={filterValue || ''}
      onChange={(e) => {
        setFilter(e.target.value || undefined) // Set undefined to remove the filter entirely
      }}
      placeholder={`Search ${count} records...`}
      style={{
        width: '100%',
        boxSizing: 'border-box'
      }}
    />
  )
}

// This is a custom filter UI for selecting
// a unique option from a list
function SelectColumnFilter({
  column: { filterValue, setFilter, preFilteredRows, id }
}) {
  // Calculate the options for filtering
  // using the preFilteredRows
  const options = React.useMemo(() => {
    const options = new Set()
    preFilteredRows.forEach((row) => {
      options.add(row.values[id])
    })
    return [...options.values()]
  }, [id, preFilteredRows])

  // Render a multi-select box
  return (
    <select
      value={filterValue}
      onChange={(e) => {
        setFilter(e.target.value || undefined)
      }}
    >
      <option value="">All</option>
      {options.map((option, i) => (
        <option key={i} value={option}>
          {option}
        </option>
      ))}
    </select>
  )
}

// This is a custom UI for our 'between' or number range
// filter. It uses two number boxes and filters rows to
// ones that have values between the two
function NumberRangeColumnFilter({
  column: { filterValue = [], preFilteredRows, setFilter, id }
}) {
  const [min, max] = React.useMemo(() => {
    let min = preFilteredRows.length ? preFilteredRows[0].values[id] : 0
    let max = preFilteredRows.length ? preFilteredRows[0].values[id] : 0
    preFilteredRows.forEach((row) => {
      min = Math.min(row.values[id], min)
      max = Math.max(row.values[id], max)
    })
    return [min, max]
  }, [id, preFilteredRows])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap'
      }}
    >
      <div>
        <input
          value={filterValue[0] || ''}
          type="number"
          onChange={(e) => {
            const val = e.target.value
            setFilter((old = []) => [
              val ? parseInt(val, 10) : undefined,
              old[1]
            ])
          }}
          placeholder={`Min (${min})`}
          style={{
            width: '70px',
            marginRight: '0.5rem'
          }}
        />
      </div>
      <div>to</div>
      <div>
        <input
          value={filterValue[1] || ''}
          type="number"
          onChange={(e) => {
            const val = e.target.value
            setFilter((old = []) => [
              old[0],
              val ? parseInt(val, 10) : undefined
            ])
          }}
          placeholder={`Max (${max})`}
          style={{
            width: '70px',
            marginLeft: '0.5rem'
          }}
        />
      </div>
    </div>
  )
}

const IndeterminateCheckbox = React.forwardRef(
  ({ indeterminate, ...rest }, ref) => {
    const defaultRef = React.useRef()
    const resolvedRef = ref || defaultRef

    React.useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate
    }, [resolvedRef, indeterminate])

    return <input type="checkbox" ref={resolvedRef} {...rest} />
  }
)

// Define a custom filter filter function!
function filterGreaterThan(rows, id, filterValue) {
  return rows.filter((row) => {
    const rowValue = row.values[id]
    return rowValue >= filterValue
  })
}

// This is an autoRemove method on the filter function that
// when given the new filter value and returns true, the filter
// will be automatically removed. Normally this is just an undefined
// check, but here, we want to remove the filter if it's not a number
filterGreaterThan.autoRemove = (val) => typeof val !== 'number'

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

  const filterTypes = React.useMemo(
    () => ({
      // Add a new  filter types.
      greaterThan: filterGreaterThan,
      // Or, override the default text filter to use
      // "startWith"
      text: (rows, id, filterValue) => {
        const value = filterValue?.[0] || ''
        const result = rows.filter((row) => {
          const rowValue = row.values[id]
          return rowValue !== undefined
            ? String(rowValue)
                .toLowerCase()
                .startsWith(String(value).toLowerCase())
            : true
        })
        //console.log('FILTER.TEXT', id, rows, filterValue, result)
        return result
      }
    }),
    []
  )

  const defaultColumn = React.useMemo(
    () => ({
      // Let's set up our default Filter UI
      cellType: 'text',
      cellFormat: (value) => String(value),
      filterType: '',
      Filter: Filter,
      Header: Header,
      Select: Select,
      Cell: Cell,
      width: 180
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
      tableName: 'CHANGE_ME',
      columns: userColumns,
      data,
      initialState,
      defaultColumn,
      filterTypes,
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
    useHierarchyFilters,
    useSortBy, //sort hook
    useExpanded, // expand hook
    useColumnOrder, //order
    useAbsoluteLayout, //div table hook
    useResizeColumns, // resize hook
    usePagination, // pagination
    useSimpleRowSelect, // select rows
    useActiveRow, //active row
    useColumnUtilities
  )

  const {
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
        allColumns={allColumns}
        hiddenColumns={hiddenColumns}
        setColumnOrder={setColumnOrder}
        setHiddenColumns={setHiddenColumns}
        resetColumnOrder={resetColumnOrder}
        resetHiddenColumns={resetHiddenColumns}
      />
      <div style={{ width: 1000 }}>
        <div>
          <div
            {...getTableProps()}
            className={`Table-root ${css(classes.root)}`}
          >
            <TableHeader
              headerGroups={headerGroups}
              allColumns={allColumns}
              setColumnOrder={setColumnOrder}
              startDragging={startDragging}
              endDragging={endDragging}
            />
            <TableBody
              getTableBodyProps={getTableBodyProps}
              page={page}
              prepareRow={prepareRow}
            />
          </div>
          <TableFooter
            pageCount={pageCount}
            gotoPage={gotoPage}
            previousPage={previousPage}
            nextPage={nextPage}
            canPreviousPage={canPreviousPage}
            canNextPage={canNextPage}
          />
        </div>
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
          document.dispatchEvent(new CustomEvent('nexus.columnsDisplayed'))
        }
      >
        {'Columns Displayed'}
      </button>
      <Table columns={columns} data={data} initialState={initialState} />
    </div>
  )
}

export default App
