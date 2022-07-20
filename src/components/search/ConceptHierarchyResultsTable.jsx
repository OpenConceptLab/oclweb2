import React from 'react';
import {
  TableContainer, Table, TableHead, TableBody, TableCell, TableRow,
  Collapse, IconButton, Box, Checkbox,
  CircularProgress, Pagination
} from '@mui/material';
import RightIcon from '@mui/icons-material/KeyboardArrowRight';
import DownIcon from '@mui/icons-material/KeyboardArrowDown';
import {
  map, get, includes, find, keys, isEmpty, reject,
  last, isArray, uniqBy
} from 'lodash';
import APIService from '../../services/APIService';
import {
  BLUE, WHITE, DARKGRAY
} from '../../common/constants';
import { ALL_COLUMNS } from './ResultConstants'
import SelectedResourceControls from './SelectedResourceControls';


const CONCEPTS_DEFINITION = {
  headBgColor: BLUE,
  headTextColor: WHITE,
  columns: ALL_COLUMNS.concepts.slice(0, 7),
};

const getValue = (item, column) => {
  const value = get(item, column.value, '')
  if(get(column, 'formatter') && value)
    return column.formatter(value)
  if(get(column, 'renderer'))
    return column.renderer(item)
  if(isArray(value))
    return value.join(', ')
  return value
}

const Row = ({ item, columns, isSelected, onSelectChange, containerOnSelectChange, selectedList, level }) => {
  const [open, setOpen] = React.useState(false);
  const [children, setChidren] = React.useState([]);
  const [selected, setSelected] = React.useState(isSelected);
  const [fetched, setFetched] = React.useState(!item.has_children);

  React.useEffect(() => setSelected(isSelected), [isSelected]);

  const onCheckboxClick = event => {
    event.stopPropagation();
    event.preventDefault();
    setSelected(prevSelected => {
      const newValue = !prevSelected;
      onSelectChange(item, newValue)
      return newValue;
    })
  }

  const onRowClick = event => {
    event.stopPropagation()
    event.preventDefault()
    setSelected(() => {
      fetchChildren()
      setOpen(true)
      onSelectChange(item, true)
      return true
    })
  }

  const onExpandClick = event => {
    event.preventDefault()
    event.stopPropagation()
    const newOpen = !open
    if(newOpen)
      fetchChildren()
    setOpen(newOpen)
  }

  const fetchChildren = () => {
    if(!fetched) {
      APIService.new().overrideURL(item.url).appendToUrl('children/').get().then(response => {
        setChidren(response.data || [])
        setFetched(true)
      })
    }
  }

  const firstCellWidth = `${15 - level}%`
  const expandCellWidth = `${40 + (level * 10)}px`
  console.log(item)

  return (
    <React.Fragment>
      <TableRow
        hover
        onClick={onRowClick}
        style={selected ? {backgroundColor: 'rgb(190, 209, 226)', cursor: 'pointer'} : {cursor: 'pointer'}}>
        <TableCell style={{width: '30px', padding: '2px'}} align="left">
          <Checkbox size='small' style={{padding: '0px'}} checked={selected} onClick={onCheckboxClick} />
        </TableCell>
        <TableCell style={{minWidth: expandCellWidth, padding: '2px'}} align="right">
          {
            item.has_children === false ? null :
            <IconButton size='small' onClick={onExpandClick}>
              { open ? <DownIcon fontSize='inherit' /> : <RightIcon fontSize='inherit' /> }
            </IconButton>
          }
        </TableCell>
        {
          map(columns, (column, i) => (
            <TableCell key={column.id} align={column.align || 'left'} className={column.className} style={ i == 0 ? {width: firstCellWidth} : {width: '20%'}}>
              { getValue(item, column) }
            </TableCell>
          ))
        }
      </TableRow>
      <TableRow>
        <TableCell style={{padding: 0}} colSpan={columns.length + 2}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box>
              <Table size="small">
                <TableBody>
                  {
                    !fetched && isEmpty(children) ?
                    <TableRow>
                      <TableCell colSpan={columns.length + 2} align='left'>
                        <CircularProgress />
                      </TableCell>
                    </TableRow> :
                    (
                      children.map(child => (
                        <Row
                          key={child.uuid}
                          item={child}
                          selectedList={selectedList}
                          isSelected={includes(selectedList, child.id)}
                          onSelectChange={onSelectChange}
                          containerOnSelectChange={containerOnSelectChange}
                          columns={columns}
                          level={level + 1}
                        />
                      ))
                    )
                  }
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  )
}


const ConceptHierarchyResultsTable = ({
  results, onPageChange, onSelect, onSelectChange, viewFields,
  onCreateSimilarClick, onCreateMappingClick
}) => {
  const [selectedList, setSelectedList] = React.useState([]);
  const resourceDefinition = CONCEPTS_DEFINITION;
  const canRender = results.total && resourceDefinition;
  const theadBgColor = get(resourceDefinition, 'headBgColor', BLUE);
  const theadTextColor = get(resourceDefinition, 'headTextColor', WHITE);
  const theadStyles = {
    backgroundColor: theadBgColor,
    border: `1px solid ${theadBgColor}`,
  }

  const updateSelected = (item, selected) => {
    const newList = selected ? uniqBy([...selectedList, item], 'uuid') : reject(selectedList, {uuid: item.uuid})
    setSelectedList(newList)

    if(onSelect)
      onSelect(last(newList))
  };

  const filterColumnsFromViewFields = () => {
    const result = map(viewFields, fieldConfig => {
      const attr = keys(fieldConfig)[0]
      const label = fieldConfig[attr];
      const column = find(ALL_COLUMNS.concepts, {value: attr})
      return column ? {...column, label: label} : {label: label, id: attr, value: attr, sortable: false}
    })
    return result
  }

  let columns = reject(resourceDefinition.columns, c => c.essential === false)
  columns = isEmpty(viewFields) ? columns : filterColumnsFromViewFields()
  const columnsCount = get(columns, 'length', 1) + 2;
  const selectionRowColumnsCount = selectedList.length > 0 ? columnsCount - 1 : columnsCount;

  return (
    <React.Fragment>
      <div className='col-sm-12 no-side-padding'>
        {
          canRender ?
          <div className='col-sm-12 no-side-padding search-results'>
            <TableContainer style={{borderRadius: '4px'}}>
              <Table size='small'>
                <TableHead style={theadStyles}>
                  {
                    selectedList.length > 0 &&
                    <TableRow colSpan={selectionRowColumnsCount} style={{backgroundColor: DARKGRAY, border: `1px solid ${DARKGRAY}`}}>
                      <TableCell colSpan={columnsCount} align='left' style={{color: WHITE}}>
                        <span className='flex-vertical-center'>
                          <span style={{margin: '0px 50px 0 15px'}}>{selectedList.length} Selected</span>
                          <SelectedResourceControls
                            selectedItems={selectedList}
                            resource='concepts'
                            onCreateSimilarClick={onCreateSimilarClick}
                            onCreateMappingClick={onCreateMappingClick}
                          />
                        </span>
                      </TableCell>
                    </TableRow>
                  }
                  <TableRow>
                    <TableCell />
                    <TableCell />
                    {
                      map(columns, column => (
                        <TableCell key={column.id} align='left' style={{color: theadTextColor}}>
                          {column.label}
                        </TableCell>
                      ))
                    }
                  </TableRow>
                </TableHead>
                <TableBody>
                  {
                    map(results.items, item => (
                      <Row
                        key={item.uuid}
                        item={item}
                        selectedList={selectedList}
                        isSelected={includes(selectedList, item.id)}
                        onSelectChange={updateSelected}
                        containerOnSelectChange={onSelectChange}
                        columns={columns}
                        level={0}
                      />
                    ))
                  }
                  <TableRow colSpan={columnsCount}>
                    <TableCell colSpan={columnsCount} align='center' className='pagination-center'>
                      <Pagination
                        onChange={(event, page) => onPageChange(page)}
                        count={results.pages}
                        variant="outlined"
                        shape="rounded"
                        color="primary"
                        showFirstButton
                        showLastButton
                        page={results.pageNumber}
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </div> :
          <div style={{padding: '2px'}}>We found 0 Concepts.</div>
        }
      </div>
    </React.Fragment>

  )
};

export default ConceptHierarchyResultsTable;
