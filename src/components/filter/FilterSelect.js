import React from 'react'
import { TextField, Popper } from '@material-ui/core'
import Autocomplete from '@material-ui/lab/Autocomplete'
import { css } from '@emotion/css'

const styleFilterSelect = {
  root: {
    '&.Filter-root': {
      width: '100%',
      '& .Filter-input-root': {
        paddingRight: '55px !important',
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
          padding: '0 !important',
          fontSize: 14,
          height: 'auto',
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
          borderColor: 'rgb(224, 224, 224)',
          backgroundColor: 'initial',
          color: '#000',
          '&:hover .Filter-notchedOutline': {
            borderColor: 'rgb(224, 224, 224)'
          }
        }
      },
      '& .Filter-notchedOutline': {
        border: '1px solid rgb(224, 224, 224)'
      },
      '&:hover [class*="Filter-notchedOutline"]': {
        borderColor: 'rgb(224, 224, 224)'
      },
      '&.Filter-hasValue .Filter-clear-button-root': {
        opacity: '1 !important'
      },
      '& .Filter-clear-button-root': {
        visibility: 'visible !important',
        opacity: '0',
        '&:hover': {
          opacity: '1'
        }
      },
      '& .Filter-button-root': {
        top: 'auto',
        '& button': {
          color: 'inherit'
        }
      }
    }
  },
  menuItemRoot: {
    '& .Filter-option': {
      paddingLeft: 11,
      paddingRight: 11,
      paddingTop: 6,
      paddingBottom: 6,
      '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.04) !important'
      }
    },
    '& .Filter-option[aria-selected="true"]': {
      backgroundColor: 'initial'
    },
    '& .Filter-option[data-focus="true"]': {
      backgroundColor: 'initial'
    }
  }
}

export default function FilterSelect({
  id,
  label,
  style = {},
  options,
  filterValue,
  onFilter
}) {
  const classes = styleFilterSelect

  const onFilterHandler = React.useCallback(
    (event, option) => {
      if (option && filterValue !== option) {
        onFilter(id, [option])
      } else {
        onFilter(id, [])
      }
    },
    [id, filterValue, onFilter]
  )

  return (
    <Autocomplete
      className={css(classes.root) + (filterValue ? ' Filter-hasValue' : '')}
      style={style}
      options={options}
      onChange={onFilterHandler}
      getOptionSelected={(option, value) => option === value}
      value={filterValue}
      defaultValue={filterValue}
      classes={{
        root: 'Filter-root',
        option: 'Filter-option',
        endAdornment: 'Filter-button-root',
        popupIndicator: 'Filter-popup-button-root',
        clearIndicator: 'Filter-clear-button-root'
      }}
      PopperComponent={(params) => (
        <Popper {...params} className={css(classes.menuItemRoot)} />
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          placeholder={label}
          InputProps={{
            ...params.InputProps,
            classes: {
              root: 'Filter-input-root',
              input: 'Filter-input',
              focused: 'Filter-focused',
              notchedOutline: 'Filter-notchedOutline'
            }
          }}
        />
      )}
      renderOption={(option, { inputValue }) => {
        return (
          <div>
            <span style={{ fontWeight: inputValue === option ? 700 : 400 }}>
              {option}
            </span>
          </div>
        )
      }}
    />
  )
}
