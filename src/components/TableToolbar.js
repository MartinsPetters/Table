import React from 'react'
import { Typography } from '@material-ui/core'
import { css } from '@emotion/css'

const styleTableToolbar = {
  root: {
    color: '#000000',
    paddingLeft: 24,
    paddingRight: 24,
    display: 'flex',
    position: 'relative',
    alignItems: 'center',
    minHeight: 50
  }
}

export default function TableToolbar({ tableName, selectedFlatRows }) {
  const selectedCount = selectedFlatRows.length
  const classes = styleTableToolbar
  return (
    <div
      data-testid={tableName + '_TableToolbar'}
      className={`TableToolbar-root ${css(classes.root)}`}
    >
      {selectedCount > 0 ? (
        <Typography color="inherit" variant="subtitle1" component="div">
          {`${selectedCount} selected`}
        </Typography>
      ) : (
        <div />
      )}
    </div>
  )
}
