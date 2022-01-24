import React from 'react'
import { IconButton } from '@material-ui/core'
import { FirstPageIcon, PreviousPageIcon } from './Icons'
import { css } from '@emotion/css'

const styleTableFooter = {
  root: {
    textAlign: 'center'
  },
  pagination: {
    display: 'inline-block',
    verticalAlign: 'middle'
  },
  button: {
    fontSize: 15,
    '&:hover': {
      backgroundColor: 'transparent !important',
      '& .Footer-icon': {
        fill: '#00BAF2'
      }
    },
    '&:disabled': {
      '& .Footer-icon': {
        fill: '#0000008a'
      }
    },
    '& .Footer-icon': {
      height: 15,
      width: 15,
      fill: '#2376D7'
    }
  }
}

export default function TableFooter({
  tableName,
  pageCount,
  gotoPage,
  previousPage,
  nextPage,
  canPreviousPage,
  canNextPage
}) {
  const classes = styleTableFooter
  return (
    <div
      data-testid={tableName + '_TableFooter'}
      className={`TableFooter-root ${css(classes.root)}`}
    >
      <div className={css(classes.pagination)}>
        <IconButton
          className={css(classes.button)}
          onClick={() => gotoPage(0)}
          disabled={!canPreviousPage}
        >
          <FirstPageIcon className="Footer-icon Footer-first" />
        </IconButton>
        <IconButton
          className={css(classes.button)}
          onClick={() => previousPage()}
          disabled={!canPreviousPage}
        >
          <PreviousPageIcon className="Footer-icon Footer-previous" />
        </IconButton>
        <IconButton
          className={css(classes.button)}
          onClick={() => nextPage()}
          disabled={!canNextPage}
        >
          <PreviousPageIcon
            className="Footer-icon Footer-next"
            style={{ transform: 'rotate(-180deg)' }}
          />
        </IconButton>
        <IconButton
          className={css(classes.button)}
          onClick={() => gotoPage(pageCount - 1)}
          disabled={!canNextPage}
        >
          <FirstPageIcon
            className="Footer-icon Footer-last"
            style={{ transform: 'rotate(-180deg)' }}
          />
        </IconButton>
      </div>
    </div>
  )
}
