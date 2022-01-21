import React from 'react'
import { IconButton } from '@material-ui/core'
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
  pageCount,
  gotoPage,
  previousPage,
  nextPage,
  canPreviousPage,
  canNextPage
}) {
  const classes = styleTableFooter
  return (
    <div className={`TableFooter-root ${css(classes.root)}`}>
      <div className={css(classes.pagination)}>
        <IconButton
          className={css(classes.button)}
          onClick={() => gotoPage(0)}
          disabled={!canPreviousPage}
        >
          <svg className="Footer-icon" viewBox="0 0 251 413">
            <g transform="translate(0,413) scale(0.1,-0.1)">
              <path d="M40 2065 l0 -2025 315 0 315 0 2 746 3 745 895 -743 895 -744 3 1007 c1 554 1 1464 0 2021 l-3 1014 -895 -744 -895 -743 -3 745 -2 746 -315 0 -315 0 0 -2025z" />
            </g>
          </svg>
        </IconButton>
        <IconButton
          className={css(classes.button)}
          onClick={() => previousPage()}
          disabled={!canPreviousPage}
        >
          <svg className="Footer-icon" viewBox="0 0 253 413">
            <g transform="translate(0,413) scale(0.1,-0.1)">
              <path d="M1272 3075 c-662 -551 -1203 -1007 -1202 -1011 1 -9 2406 -2014 2415 -2014 3 0 5 907 5 2015 0 1108 -3 2015 -7 2014 -5 0 -550 -452 -1211 -1004z" />
            </g>
          </svg>
        </IconButton>
        <IconButton
          className={css(classes.button)}
          onClick={() => nextPage()}
          disabled={!canNextPage}
        >
          <svg
            className="Footer-icon"
            viewBox="0 0 253 413"
            style={{ transform: 'rotate(-180deg)' }}
          >
            <g transform="translate(0,413) scale(0.1,-0.1)">
              <path d="M1272 3075 c-662 -551 -1203 -1007 -1202 -1011 1 -9 2406 -2014 2415 -2014 3 0 5 907 5 2015 0 1108 -3 2015 -7 2014 -5 0 -550 -452 -1211 -1004z" />
            </g>
          </svg>
        </IconButton>
        <IconButton
          className={css(classes.button)}
          onClick={() => gotoPage(pageCount - 1)}
          disabled={!canNextPage}
        >
          <svg
            className="Footer-icon"
            viewBox="0 0 251 413"
            style={{ transform: 'rotate(-180deg)' }}
          >
            <g transform="translate(0,413) scale(0.1,-0.1)">
              <path d="M40 2065 l0 -2025 315 0 315 0 2 746 3 745 895 -743 895 -744 3 1007 c1 554 1 1464 0 2021 l-3 1014 -895 -744 -895 -743 -3 745 -2 746 -315 0 -315 0 0 -2025z" />
            </g>
          </svg>
        </IconButton>
      </div>
    </div>
  )
}
