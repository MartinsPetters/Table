import React from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { SeparatorIcon } from './Icons'
import { css } from '@emotion/css'

const styleTableHeader = {
  root: {
    '& .TableHeader-header-row-root': {
      minWidth: '100%',
      width: 'fit-content',
      paddingRight: 5,
      borderBottom: '1px solid #e0e0e0',
      '& .TableHeader-header-row': {
        height: 50
      }
    },
    '& .TableHeader-filter-row-root': {
      minWidth: '100%',
      width: 'fit-content',
      paddingRight: 5,
      borderBottom: '1px solid #e0e0e0',
      '& .TableHeader-filter-row': {
        height: 47
      }
    },
    '& .TableHeader-header-root': {
      height: '100%',
      backgroundColor: '#dedede',
      '& .TableHeader-header': {
        minHeight: 50,
        userSelect: 'none',
        background: '#ffffff',
        '&.TableHeader-dropping': {
          transitionDuration: '0.001s !important'
        },
        '&.TableHeader-dragging': {
          backgroundColor: '#E6F1FF'
        },
        '&:not(.TableHeader-dragging)': {
          transform: 'translate(0,0) !important'
        }
      }
    },
    '& .TableHeader-filter-root': {
      height: '100%',
      padding: '5px 2.5px 5px 2.5px'
    },
    '& .TableHeader-resizer': {
      userSelect: 'none',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      width: '10px',
      height: '100%',
      position: 'absolute',
      right: 0,
      top: 0,
      transform: 'translateX(50%)',
      zIndex: 1,
      touchAction: 'none',
      opacity: '0.5',
      '&:hover': {
        opacity: '1'
      },
      '&.TableHeader-resizing': {
        opacity: '1'
      },
      '& .TableHeader-resizer-icon': {
        height: '100%'
      }
    }
  }
}

export default function TableHeader({
  tableName,
  headerGroups,
  allColumns,
  setColumnOrder,
  startDragging,
  endDragging
}) {
  const classes = styleTableHeader
  const currentColOrder = React.useRef()

  return (
    <div
      data-testid={tableName + '_TableHeader'}
      className={`TableHeader-root ${css(classes.root)}`}
    >
      <div className="TableHeader-header-row-root">
        {headerGroups.map((headerGroup, idx) => (
          <DragDropContext
            key={idx}
            onDragStart={() => {
              startDragging()
              currentColOrder.current = allColumns.map((col) => col.id)
            }}
            onDragUpdate={(dragUpdateObj) => {
              const colOrder = [...currentColOrder.current]
              const colId = dragUpdateObj.draggableId
              const colIndexSrc = dragUpdateObj.source.index
              const colIndexDst = dragUpdateObj.destination?.index
              if (
                typeof colIndexSrc === 'number' &&
                typeof colIndexDst === 'number'
              ) {
                colOrder.splice(colIndexSrc, 1)
                colOrder.splice(colIndexDst, 0, colId)
                setColumnOrder(colOrder)
              }
            }}
            onDragEnd={() => {
              endDragging()
            }}
          >
            <Droppable droppableId="droppable" direction="horizontal">
              {({ innerRef }) => (
                <div
                  ref={innerRef}
                  {...headerGroup.getHeaderGroupProps()}
                  className="TableHeader-header-row"
                >
                  {headerGroup.headers.map((header, idx) => (
                    <Draggable
                      key={header.id}
                      draggableId={header.id}
                      index={idx}
                      isDragDisabled={header.disableDragging}
                    >
                      {(
                        { innerRef, draggableProps, dragHandleProps },
                        { isDragging, isDropAnimating }
                      ) => (
                        <div
                          {...header.getHeaderProps()}
                          className="TableHeader-header-root"
                        >
                          <div
                            ref={innerRef}
                            {...draggableProps}
                            {...dragHandleProps}
                            className={`TableHeader-header${
                              isDragging ? ' TableHeader-dragging' : ''
                            }${isDropAnimating ? ' TableHeader-dropping' : ''}`}
                          >
                            {header.id === 'select_'
                              ? header.render('Select', { type: 'header' })
                              : header.render('Header')}
                          </div>
                          <div
                            {...(!header.disableResizing
                              ? header.getResizerProps()
                              : {})}
                            className={`TableHeader-resizer${
                              header.isResizing ? ' TableHeader-resizing' : ''
                            }`}
                          >
                            <SeparatorIcon
                              preserveAspectRatio="none"
                              className={'TableHeader-resizer-icon'}
                            />
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        ))}
      </div>

      <div className="TableHeader-filter-row-root">
        {headerGroups.map((headerGroup, idx) => (
          <div
            key={idx}
            className="TableHeader-filter-row"
            {...headerGroup.getHeaderGroupProps()}
          >
            {headerGroup.headers.map((header) => (
              <div
                key={header.id}
                className="TableHeader-filter-root"
                {...header.getHeaderProps()}
              >
                {header.canFilter ? header.render('Filter') : null}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
