import React from 'react'
import { Checkbox } from '@material-ui/core'
import { css } from '@emotion/css'

const styleCell = {
  root: {
    '&.Cell-root': {
      overflow: 'hidden',
      '& .Cell-text-root': {
        padding: '15px 8px',
        '& .Cell-text': {
          height: 20,
          lineHeight: '1.43',
          fontSize: '13px',
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
          fontWeight: '400',
          letterSpacing: '0.01071em',
          textAlign: 'left',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          overflow: 'hidden'
        }
      },
      '& .Cell-checkbox-root': {
        padding: '6px 6px',
        '& .Cell-checkbox': {
          padding: 9,
          '&.Cell-checked': {
            color: '#2376D7'
          },
          '&.Cell-disabled': {
            color: 'rgba(0, 0, 0, 0.26)'
          },
          '&:hover': {
            backgroundColor: 'rgba(35, 118, 215, 0.04)'
          },
          '& svg': {
            filter: 'none',
            fontSize: '20px'
          }
        }
      }
    }
  }
}

export default function Cell({ value, column }) {
  const { cellType, cellFormat } = column
  const classes = styleCell

  return (
    <div className={`Cell-root Cell-type-${cellType} ${css(classes.root)}`}>
      {cellType === 'boolean' ? (
        <div className="Cell-checkbox-root" title={cellFormat(value)}>
          <Checkbox
            disabled={true}
            checked={value}
            color="default"
            classes={{
              root: 'Cell-checkbox',
              checked: 'Cell-checked',
              disabled: 'Cell-disabled'
            }}
          />
        </div>
      ) : (
        <div className="Cell-text-root">
          <div className="Cell-text" title={cellFormat(value)}>
            {cellFormat(value)}
          </div>
        </div>
      )}
    </div>
  )
}
