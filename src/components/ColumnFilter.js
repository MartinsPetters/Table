import React from 'react'
import { Grid } from '@material-ui/core'
import FilterSelect from './filter/FilterSelect'
import FilterText from './filter/FilterText'

export default function ColumnFilter({
  tableName,
  setFilter,
  column: {
    id,
    filterType,
    filterValue = [],
    filterOptions,
    filterPlaceholder = 'Filter',
    preFilteredRows
  }
}) {
  const options = React.useMemo(() => {
    return (
      (typeof filterOptions === 'function'
        ? filterOptions(preFilteredRows)
        : filterOptions) || []
    )
  }, [filterOptions, preFilteredRows])

  const onFilter = React.useCallback(
    (id, value) => {
      setFilter(id, (value.length && value) || undefined)
    },
    [setFilter]
  )

  return (
    <Grid
      data-testid={tableName + '_' + id + '_Filter'}
      className="Filter-root"
      container
    >
      <Grid item xs>
        {filterType === 'select' ? (
          <FilterSelect
            id={id}
            label={filterPlaceholder}
            options={options}
            onFilter={onFilter}
            filterValue={filterValue?.[0] || ''}
          />
        ) : filterType === 'text' ? (
          <FilterText
            id={id}
            label={filterPlaceholder}
            onFilter={onFilter}
            filterValue={filterValue?.[0] || ''}
          />
        ) : null}
      </Grid>
    </Grid>
  )
}
