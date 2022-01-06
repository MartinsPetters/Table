import React from 'react';
import styled from 'styled-components';
import { useTable, useExpanded, useSortBy, useFilters } from 'react-table';
import CircularJSON from 'circular-json';
import ReactJson from 'react-json-view';

import makeData from './makeData';

const Styles = styled.div`
	padding: 1rem;

	table {
		border-spacing: 0;
		border: 1px solid black;

		tr {
			:last-child {
				td {
					border-bottom: 0;
				}
			}
		}

		th,
		td {
			margin: 0;
			padding: 0.5rem;
			border-bottom: 1px solid black;
			border-right: 1px solid black;

			:last-child {
				border-right: 0;
			}
		}
	}
`;

// Define a default UI for filtering
function DefaultColumnFilter({ column: { filterValue, preFilteredRows, setFilter } }) {
	const count = preFilteredRows.length;

	return (
		<input
			value={filterValue || ''}
			onChange={(e) => {
				setFilter(e.target.value || undefined); // Set undefined to remove the filter entirely
			}}
			placeholder={`Search ${count} records...`}
		/>
	);
}

// This is a custom filter UI for selecting
// a unique option from a list
function SelectColumnFilter({ column: { filterValue, setFilter, preFilteredRows, id } }) {
	// Calculate the options for filtering
	// using the preFilteredRows
	const options = React.useMemo(() => {
		const options = new Set();
		preFilteredRows.forEach((row) => {
			options.add(row.values[id]);
		});
		return [...options.values()];
	}, [id, preFilteredRows]);

	// Render a multi-select box
	return (
		<select
			value={filterValue}
			onChange={(e) => {
				setFilter(e.target.value || undefined);
			}}
		>
			<option value="">All</option>
			{options.map((option, i) => (
				<option key={i} value={option}>
					{option}
				</option>
			))}
		</select>
	);
}

// This is a custom filter UI that uses a
// slider to set the filter value between a column's
// min and max values
function SliderColumnFilter({ column: { filterValue, setFilter, preFilteredRows, id } }) {
	// Calculate the min and max
	// using the preFilteredRows

	const [min, max] = React.useMemo(() => {
		let min = preFilteredRows.length ? preFilteredRows[0].values[id] : 0;
		let max = preFilteredRows.length ? preFilteredRows[0].values[id] : 0;
		preFilteredRows.forEach((row) => {
			min = Math.min(row.values[id], min);
			max = Math.max(row.values[id], max);
		});
		return [min, max];
	}, [id, preFilteredRows]);

	return (
		<>
			<input
				type="range"
				min={min}
				max={max}
				value={filterValue || min}
				onChange={(e) => {
					setFilter(parseInt(e.target.value, 10));
				}}
			/>
			<button onClick={() => setFilter(undefined)}>Off</button>
		</>
	);
}

// This is a custom UI for our 'between' or number range
// filter. It uses two number boxes and filters rows to
// ones that have values between the two
function NumberRangeColumnFilter({ column: { filterValue = [], preFilteredRows, setFilter, id } }) {
	const [min, max] = React.useMemo(() => {
		let min = preFilteredRows.length ? preFilteredRows[0].values[id] : 0;
		let max = preFilteredRows.length ? preFilteredRows[0].values[id] : 0;
		preFilteredRows.forEach((row) => {
			min = Math.min(row.values[id], min);
			max = Math.max(row.values[id], max);
		});
		return [min, max];
	}, [id, preFilteredRows]);

	return (
		<div
			style={{
				display: 'flex',
			}}
		>
			<input
				value={filterValue[0] || ''}
				type="number"
				onChange={(e) => {
					const val = e.target.value;
					setFilter((old = []) => [val ? parseInt(val, 10) : undefined, old[1]]);
				}}
				placeholder={`Min (${min})`}
				style={{
					width: '70px',
					marginRight: '0.5rem',
				}}
			/>
			to
			<input
				value={filterValue[1] || ''}
				type="number"
				onChange={(e) => {
					const val = e.target.value;
					setFilter((old = []) => [old[0], val ? parseInt(val, 10) : undefined]);
				}}
				placeholder={`Max (${max})`}
				style={{
					width: '70px',
					marginLeft: '0.5rem',
				}}
			/>
		</div>
	);
}

// Define a custom filter filter function!
function filterGreaterThan(rows, id, filterValue) {
	return rows.filter((row) => {
		const rowValue = row.values[id];
		return rowValue >= filterValue;
	});
}

// This is an autoRemove method on the filter function that
// when given the new filter value and returns true, the filter
// will be automatically removed. Normally this is just an undefined
// check, but here, we want to remove the filter if it's not a number
filterGreaterThan.autoRemove = (val) => typeof val !== 'number';

function Table({ columns: userColumns, data }) {
	const filterTypes = React.useMemo(
		() => ({
			// Add a new  filter types.
			greaterThan: filterGreaterThan,
			// Or, override the default text filter to use
			// "startWith"
			text: (rows, id, filterValue) => {
				return rows.filter((row) => {
					const rowValue = row.values[id];
					return rowValue !== undefined
						? String(rowValue).toLowerCase().startsWith(String(filterValue).toLowerCase())
						: true;
				});
			},
		}),
		[]
	);

	const defaultColumn = React.useMemo(
		() => ({
			// Let's set up our default Filter UI
			Filter: DefaultColumnFilter,
		}),
		[]
	);

	const table = useTable(
		{
			columns: userColumns,
			data,
			defaultColumn,
			filterTypes,
			getSubRows: (row) => row.subRows,
		},
		useFilters, // filter hook
		useSortBy, //sort hook
		useExpanded // expand hook
	);

	const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = table;

	return (
		<>
			<table {...getTableProps()}>
				<thead>
					{headerGroups.map((headerGroup) => (
						<tr {...headerGroup.getHeaderGroupProps()}>
							{headerGroup.headers.map((column) => (
								// Add the sorting props to control sorting.
								<th {...column.getHeaderProps()}>
									<div {...column.getSortByToggleProps()}>
										{column.render('Header')}
										{/* Add a sort direction indicator */}
										<span>{column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}</span>
									</div>
									{/* Render the columns filter UI */}
									<div>{column.canFilter ? column.render('Filter') : null}</div>
								</th>
							))}
						</tr>
					))}
				</thead>
				<tbody {...getTableBodyProps()}>
					{rows.map((row, i) => {
						prepareRow(row);
						return (
							<tr {...row.getRowProps()}>
								{row.cells.map((cell) => {
									return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
								})}
							</tr>
						);
					})}
				</tbody>
			</table>
			<br />
			<div>Showing the first 20 results of {rows.length} rows</div>
			<pre>
				<ReactJson
					src={JSON.parse(CircularJSON.stringify({ table }))}
					name={false}
					collapsed={true}
					displayDataTypes={false}
				/>
			</pre>
		</>
	);
}

function App() {
	const columns = React.useMemo(
		() => [
			{
				// Build our expander column
				id: 'expander', // Make sure it has an ID
				Header: ({ getToggleAllRowsExpandedProps, isAllRowsExpanded }) => (
					<span {...getToggleAllRowsExpandedProps()}>{isAllRowsExpanded ? '👇' : '👉'}</span>
				),
				disableFilters: true,
				Cell: ({ row }) => {
					console.log('Expand', row, row.getToggleRowExpandedProps());
					// Use the row.canExpand and row.getToggleRowExpandedProps prop getter
					// to build the toggle for expanding a row
					return row.canExpand ? (
						<span
							{...row.getToggleRowExpandedProps({
								style: {
									// We can even use the row.depth property
									// and paddingLeft to indicate the depth
									// of the row
									paddingLeft: `${row.depth * 2}rem`,
								},
							})}
						>
							{row.isExpanded ? '👇' : '👉'}
						</span>
					) : null;
				},
			},

			{
				Header: 'First Name',
				accessor: 'firstName',
				filter: 'text',
			},
			{
				Header: 'Last Name',
				accessor: 'lastName',
				//filter: 'text',
			},

			{
				Header: 'Age',
				accessor: 'age',
				Filter: SliderColumnFilter,
				filter: 'equals',
			},
			{
				Header: 'Visits',
				accessor: 'visits',
				Filter: NumberRangeColumnFilter,
				filter: 'between',
			},
			{
				Header: 'Status',
				accessor: 'status',
				Filter: SelectColumnFilter,
				filter: 'includes',
			},
			{
				Header: 'Profile Progress',
				accessor: 'progress',
				Filter: SliderColumnFilter,
				//filter: filterGreaterThan,
				filter: 'greaterThan',
			},
		],
		[]
	);

	const data = React.useMemo(() => makeData(5, 3, 2), []);

	return (
		<Styles>
			<Table columns={columns} data={data} />
		</Styles>
	);
}

export default App;
