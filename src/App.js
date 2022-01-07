import React from 'react';
import styled from 'styled-components';
import {
	useTable,
	useExpanded,
	useSortBy,
	useFilters,
	useResizeColumns,
	useColumnOrder,
	useAbsoluteLayout,
} from 'react-table';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import CircularJSON from 'circular-json';
import ReactJson from 'react-json-view';

import makeData from './makeData';

const Styles = styled.div`
	padding: 1rem;

	* {
		box-sizing: border-box;
	}

	.table {
		border: 1px solid #000;
		max-width: 1200px;
		overflow-x: auto;
	}

	.header {
		font-weight: bold;
	}

	.rows {
		overflow-y: auto;
	}

	.row {
		border-bottom: 1px solid #000;
		height: 32px;

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
		height: 100px;
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
			style={{
				width: '100%',
				boxSizing: 'border-box',
			}}
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
      {filterValue}
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
				flexDirection: 'row',
				flexWrap: 'wrap',
			}}
		>
			<div>
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
			</div>
			<div>to</div>
			<div>
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
		</div>
	);
}

const IndeterminateCheckbox = React.forwardRef(({ indeterminate, ...rest }, ref) => {
	const defaultRef = React.useRef();
	const resolvedRef = ref || defaultRef;

	React.useEffect(() => {
		resolvedRef.current.indeterminate = indeterminate;
	}, [resolvedRef, indeterminate]);

	return <input type="checkbox" ref={resolvedRef} {...rest} />;
});

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

const getItemStyle = ({ isDragging, isDropAnimating }, draggableStyle) => ({
	...draggableStyle,
	// some basic styles to make the items look a bit nicer
	userSelect: 'none',
	height: '99px',
	// change background colour if dragging
	background: isDragging ? 'lightgreen' : 'white',

	...(!isDragging && { transform: 'translate(0,0)' }),
	...(isDropAnimating && { transitionDuration: '0.001s' }),

	// styles we need to apply on draggables
});

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
			width: 180,
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
		useExpanded, // expand hook
		useColumnOrder, //order
		useAbsoluteLayout, //div table hook
		useResizeColumns // resize hook
	);

	const {
		getTableProps,
		getTableBodyProps,
		getToggleHideAllColumnsProps,
		headerGroups,
		rows,
		setColumnOrder,
		allColumns,
		prepareRow,
	} = table;

	const currentColOrder = React.useRef();

	return (
		<>
			<div>
				<div>
					<IndeterminateCheckbox {...getToggleHideAllColumnsProps()} /> Toggle All
				</div>
				{allColumns.map((column) => (
					<div key={column.id}>
						<label>
							<input type="checkbox" {...column.getToggleHiddenProps()} /> {column.Header}
						</label>
					</div>
				))}
				<br />
			</div>
			<div {...getTableProps()} className="table">
				<div>
					{headerGroups.map((headerGroup) => (
						<DragDropContext
							onDragStart={() => {
								currentColOrder.current = allColumns.map((o) => o.id);
							}}
							onDragUpdate={(dragUpdateObj, b) => {
								// console.log("onDragUpdate", dragUpdateObj, b);

								const colOrder = [...currentColOrder.current];
								const sIndex = dragUpdateObj.source.index;
								const dIndex = dragUpdateObj.destination && dragUpdateObj.destination.index;

								if (typeof sIndex === 'number' && typeof dIndex === 'number') {
									colOrder.splice(sIndex, 1);
									colOrder.splice(dIndex, 0, dragUpdateObj.draggableId);
									setColumnOrder(colOrder);

									// console.log(
									//   "onDragUpdate",
									//   dragUpdateObj.destination.index,
									//   dragUpdateObj.source.index
									// );
									// console.log(temp);
								}
							}}
						>
							<Droppable droppableId="droppable" direction="horizontal">
								{(droppableProvided, snapshot) => (
									<div
										{...headerGroup.getHeaderGroupProps()}
										ref={droppableProvided.innerRef}
										className="row header-group"
									>
										{headerGroup.headers.map((column, index) => (
											<Draggable
												key={column.id}
												draggableId={column.id}
												index={index}
												isDragDisabled={!column.accessor}
											>
												{(provided, snapshot) => {
													// console.log(column.getHeaderProps());

													// const {
													//   style,
													//   ...extraProps
													// } = column.getHeaderProps();

													// console.log(style, extraProps);

													return (
														<div
															{...column.getHeaderProps({ style: { position: 'absolute' } })}
															className="cell header"
														>
															<div
																{...provided.draggableProps}
																{...provided.dragHandleProps}
																// {...extraProps}
																ref={provided.innerRef}
																style={{
																	...getItemStyle(snapshot, provided.draggableProps.style),
																	// ...style
																}}
															>
																{column.render('Header')}
																<div {...column.getSortByToggleProps()}>
																	{/* Add a sort direction indicator */}
																	{column.canSort ? (
																		<span>
																			{column.isSorted
																				? column.isSortedDesc
																					? ' 🔽'
																					: ' 🔼'
																				: ' ⏹️'}
																		</span>
																	) : null}
																</div>
																{/* Render the columns filter UI */}
																<div>{column.canFilter ? column.render('Filter') : null}</div>
																<div
																	{...column.getResizerProps()}
																	className={`resizer ${column.isResizing ? 'isResizing' : ''}`}
																/>
															</div>
															<div
																{...column.getResizerProps()}
																className={`resizer ${column.isResizing ? 'isResizing' : ''}`}
															/>
														</div>
													);
												}}
											</Draggable>
										))}
										{/* {droppableProvided.placeholder} */}
									</div>
								)}
							</Droppable>
						</DragDropContext>
					))}
				</div>
				<div className="rows" {...getTableBodyProps()}>
					{rows.map((row, i) => {
						prepareRow(row);
						return (
							<div {...row.getRowProps()} className="row body">
								{row.cells.map((cell, index) => (
									<div {...cell.getCellProps()} key={index} className="cell">
										{cell.render('Cell')}
									</div>
								))}
							</div>
						);
					})}
				</div>
			</div>

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
					<span {...getToggleAllRowsExpandedProps()}>{isAllRowsExpanded ? '➖' : '➕'}</span>
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
							{row.isExpanded ? '➖' : '➕'}
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
