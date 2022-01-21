import React from 'react'
import { IconButton, TextField } from '@material-ui/core'
import ClearIcon from '@material-ui/icons/Clear'
import { css } from '@emotion/css'

const styleFilterText = {
  root: {
    width: '100%',
    '& .Filter-input-root': {
      paddingRight: 12,
      paddingLeft: 16,
      paddingTop: 4,
      paddingBottom: 4,
      lineHeight: '2',
      fontSize: '14px',
      borderRadius: '4px',
      backgroundColor: 'rgba(0, 0, 0, 0)',
      borderColor: 'rgb(224, 224, 224)',
      color: 'rgba(0, 0, 0, 0.87)',
      '&:focus': {
        color: '#000',
        '&::placeholder': {
          opacity: '1'
        }
      },
      '& .Filter-input': {
        padding: 0,
        fontSize: 14,
        height: 'auto',
        textOverflow: 'ellipsis',
        '&::placeholder': {
          opacity: '0.5'
        }
      },
      '&.Filter-focused': {
        '& .Filter-input': {
          '&::placeholder': {
            opacity: '0'
          }
        },
        '& .Filter-clear-button-root': {
          opacity: '1 !important'
        },
        borderColor: 'rgb(224, 224, 224)',
        backgroundColor: 'initial',
        color: '#000',
        '&:hover .Filter-notchedOutline': {
          borderColor: 'rgb(224, 224, 224)'
        }
      },
      '& .Filter-notchedOutline': {
        border: '1px solid rgb(224, 224, 224)'
      },
      '&:hover [class*="Filter-notchedOutline"]': {
        borderColor: 'rgb(224, 224, 224)'
      }
    },
    '&.Filter-hasValue .Filter-clear-button-root': {
      opacity: '1 !important'
    }
  },
  clearIconRoot: {
    '&.Filter-clear-button-root': {
      padding: '4px 4px',
      color: 'inherit',
      opacity: '0',
      '&:hover': {
        opacity: '1'
      }
    }
  },
  clearIcon: {}
}

export default function FilterText({
  id,
  label,
  style = {},
  filterValue,
  onFilter,
  delay = 500,
  enableClear = true
}) {
  const classes = styleFilterText
  const [value, setValue] = React.useState(filterValue)
  const didMountRef = React.useRef(false)

  const onFilterHandler = React.useCallback(
    () => onFilter(id, value ? [value] : []),
    [id, value, onFilter]
  )

  React.useEffect(() => {
    if (didMountRef.current) {
      const handler = setTimeout(() => onFilterHandler(), delay)
      return () => clearTimeout(handler)
    }
    return () => {
      didMountRef.current = true
    }
  }, [onFilterHandler, delay])

  const clearIcon = enableClear ? (
    <IconButton
      classes={{
        root: 'Filter-clear-button-root'
      }}
      className={css(classes.clearIconRoot)}
      onClick={() => setValue('')}
    >
      <ClearIcon fontSize="small" className={css(classes.clearIcon)} />
    </IconButton>
  ) : null

  return (
    <TextField
      placeholder={label}
      type="text"
      variant="outlined"
      style={style}
      className={css(classes.root) + (filterValue ? ' Filter-hasValue' : '')}
      onChange={(e) => setValue(e.target.value)}
      value={value}
      InputProps={{
        classes: {
          root: 'Filter-input-root',
          input: 'Filter-input',
          focused: 'Filter-focused',
          notchedOutline: 'Filter-notchedOutline'
        },
        endAdornment: clearIcon
      }}
    />
  )
}
