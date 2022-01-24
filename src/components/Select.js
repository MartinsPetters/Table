import React from 'react'
import { Checkbox } from '@material-ui/core'
import { css } from '@emotion/css'

const styleSelect = {
  root: {
    '&.Select-header, &.Select-cell': {
      padding: '6px 6px'
    },
    '& .Select-checkbox-root': {
      padding: 9,
      '&.Select-checked': {
        color: '#2376D7'
      },
      '&.Select-disabled': {
        color: 'rgba(0, 0, 0, 0.26)'
      },
      '&:hover': {
        backgroundColor: 'rgba(35, 118, 215, 0.04)'
      }
    },
    '& svg': {
      filter: 'none',
      fontSize: '20px'
    }
  }
}

export default function Select({
  tableName,
  type = 'cell',
  row,
  getToggleAllRowsSelectedProps
}) {
  const classes = styleSelect
  return (
    <div
      data-testid={tableName + '_' + type + '_Filter'}
      className={`Select-root Select-${type} ${css(classes.root)}`}
    >
      <Checkbox
        color="default"
        classes={{
          root: 'Select-checkbox-root',
          checked: 'Select-checked',
          disabled: 'Select-disabled'
        }}
        {...(type === 'header'
          ? getToggleAllRowsSelectedProps()
          : row?.getToggleRowSelectedProps())}
      />
    </div>
  )
}
