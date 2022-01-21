import React from 'react'
import { IconButton } from '@material-ui/core'
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import { css } from '@emotion/css'

const styleHeader = {
  root: {
    display: 'flex',
    '& .Header-expand-root,.Header-sort-root': {
      flex: '0 0 30px',
      padding: '10px 0px 10px 0px'
    },
    '& .Header-label-root': {
      overflowX: 'hidden',
      '& .Header-label': {
        overflow: 'hidden',
        fontSize: 13,
        fontWeight: 400,
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        lineHeight: '1.5',
        letterSpacing: '0.00938em',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        color: 'rgba(146,146,146,1)',
        padding: '15px 1px 15px 1px'
      }
    },
    '&.Header-resizing': {
      cursor: 'col-resize !important',
      '& .Header-item': {
        pointerEvents: 'none'
      }
    },
    '&.Header-dragging': {
      cursor: 'grabbing !important',
      '& .Header-item': {
        pointerEvents: 'none'
      }
    }
  },
  button: {
    '&.Header-sort-button-root,&.Header-expand-button-root': {
      padding: 0
    },
    '&.Header-expand-button-root': {
      float: 'right'
    },

    '& .Header-icon': {
      fontSize: 28,
      '&.Header-desc': {
        transform: 'rotate(-180deg)'
      },
      '&.Header-expanded': {
        transform: 'rotate(90deg)'
      },
      '&.Header-hiden': {
        opacity: '0',
        '&:hover': {
          opacity: '0.5'
        }
      }
    }
  }
}

export default function Header({
  tableName,
  getToggleAllRowsExpandedProps,
  isAllRowsExpanded,
  state: { isResizing, isDragging },
  column: {
    id,
    label,
    canSort,
    disableExpand,
    getSortByToggleProps,
    isSortedDesc
  }
}) {
  const classes = styleHeader

  const onSort = React.useMemo(
    () => getSortByToggleProps().onClick,
    [getSortByToggleProps]
  )

  const onExpand = React.useMemo(
    () => getToggleAllRowsExpandedProps().onClick,
    [getToggleAllRowsExpandedProps]
  )

  return (
    <div
      data-testid={tableName + '_' + id + '_Header'}
      className={`Header-root ${css(classes.root)}${
        isResizing ? ' Header-resizing' : ''
      }${isDragging ? ' Header-dragging' : ''}`}
    >
      {!disableExpand ? (
        <div className="Header-item Header-expand-root">
          <IconButton
            classes={{
              root: 'Header-expand-button-root'
            }}
            className={css(classes.button)}
            onClick={onExpand}
          >
            <ChevronRightIcon
              className={`Header-icon ${
                isAllRowsExpanded === true
                  ? 'Header-expanded'
                  : 'Header-not-expanded'
              }`}
            />
          </IconButton>
        </div>
      ) : (
        <div style={{ width: 16 }}></div>
      )}
      <div className="Header-item Header-label-root">
        <div className="Header-label" title={label}>
          <span>{label}</span>
        </div>
      </div>
      {canSort ? (
        <div className="Header-item Header-sort-root">
          <IconButton
            classes={{
              root: 'Header-sort-button-root'
            }}
            className={css(classes.button)}
            onClick={onSort}
          >
            <ArrowDropUpIcon
              className={`Header-icon ${
                isSortedDesc === false
                  ? 'Header-asc'
                  : isSortedDesc === true
                  ? 'Header-desc'
                  : 'Header-hiden'
              }`}
            />
          </IconButton>
        </div>
      ) : (
        <div style={{ width: 16 }}></div>
      )}
    </div>
  )
}
