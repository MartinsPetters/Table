import React from 'react'
import { IconButton } from '@material-ui/core'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import { css } from '@emotion/css'

const styleTableBody = {
  root: {
    '& .TableBody-row-root': {
      minWidth: '100%',
      width: 'fit-content',
      paddingRight: 5,
      borderBottom: '1px solid #e0e0e0',
      '&.TableBody-row-active': {
        backgroundColor: '#E6F1FF'
      },
      '& .TableBody-row': {
        height: 50,
        '& .TableBody-active': {
          width: 5,
          height: '100%',
          backgroundColor: '#2376D7'
        },
        '& .TableBody-cell-root': {
          display: 'flex',
          overflow: 'hidden'
        }
      }
    },
    '& .TableBody-cell-expand-root': {
      marginRight: '-8px',
      userSelect: 'none',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      '& .TableBody-cell-expand-placeholder': {
        width: 28
      },
      '& .TableBody-cell-expand-button-root': {
        padding: 0,
        '& .TableBody-icon': {
          fontSize: 28,
          '&.TableBody-cell-expanded': {
            transform: 'rotate(90deg)'
          }
        }
      }
    }
  }
}

export default function TableBody({ tableName, page, prepareRow }) {
  const classes = styleTableBody

  return (
    <div
      data-testid={tableName + '_TableBody'}
      className={`TableBody-root  ${css(classes.root)}`}
    >
      {page.map((row, idx) => {
        prepareRow(row)
        return (
          <div
            key={row.id}
            className={`TableBody-row-root${
              row.isActive ? ' TableBody-row-active' : ''
            }`}
          >
            <div
              data-testid={tableName + '_' + idx + '_Row'}
              {...row.getRowProps()}
              {...row.getActiveRowProps()}
              className="TableBody-row"
            >
              {row.isActive ? <div className="TableBody-active" /> : null}
              {row.cells.map((cell, index) => (
                <div
                  {...cell.getCellProps()}
                  key={index}
                  className="TableBody-cell-root"
                >
                  {!cell.column.disableExpand ? (
                    <div
                      className="TableBody-cell-expand-root"
                      style={{
                        paddingLeft: `${row.depth * 8}px`
                      }}
                    >
                      {row.canExpand ? (
                        <IconButton
                          classes={{
                            root: 'TableBody-cell-expand-button-root'
                          }}
                          {...row.getToggleRowExpandedProps({ title: '' })}
                        >
                          <ChevronRightIcon
                            className={`TableBody-icon ${
                              row.isExpanded
                                ? 'TableBody-cell-expanded'
                                : 'TableBody-cell-not-expanded'
                            }`}
                          />
                        </IconButton>
                      ) : (
                        <div className={'TableBody-cell-expand-placeholder'} />
                      )}
                    </div>
                  ) : null}

                  {cell.column.id === 'select_'
                    ? cell.render('Select')
                    : cell.render('Cell')}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
