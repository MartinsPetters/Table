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

export default function TableToolbar({
  tableName,
  multiselect,
  state: { selectedRowIds }
}) {
  const selectedCount = React.useMemo(
    () => Object.keys(selectedRowIds).length,
    [selectedRowIds]
  )
  const classes = styleTableToolbar
  return multiselect ? (
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
  ) : null
}
