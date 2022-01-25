import React from 'react'
import { css } from '@emotion/css'

import TableToolbar from './components/TableToolbar'
import Table from './components/Table'

import CircularJSON from 'circular-json'
import ReactJson from 'react-json-view'
import makeData from './makeData'

function App() {
  const table = React.useMemo(
    () => ({
      tableName: 'Table_test',
      multiselect: true,
      stateReducer: (newState, action, prevState) => {
        console.log('REDUCER', newState, action, prevState)
        return newState
      },
      useControlledState: (state) => {
        console.log('CONTROLED STATE', state)
        return state
      },
      canSelectRow: (row) => {
        const { values } = row
        if (values.firstName.indexOf('a') === -1) {
          return false
        }
        return true
      },
      onSelectRow: (...props) => {
        console.log('SELECT ROW', props)
        return true
      },
      onChangeRow: (...props) => {
        console.log('ACTIVATE ROW', props)
        return true
      },
      onChangeColumn: (...props) => {
        console.log('CHANGE COLUMN', props)
        return true
      },
      Tools: (instance) => (
        <>
          <pre>
            <ReactJson
              src={JSON.parse(CircularJSON.stringify({ instance }))}
              name={false}
              collapsed={true}
              displayDataTypes={false}
            />
          </pre>
          <TableToolbar {...instance} />
        </>
      )
    }),
    []
  )

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
                tableName: 'Table_test'
              }
            })
          )
        }
      >
        {'Columns Displayed'}
      </button>
      <div style={{ width: 1000 }}>
        <Table
          tableCfg={table}
          columnsCfg={columns}
          data={data}
          initialState={initialState}
        />
      </div>
    </div>
  )
}

export default App
