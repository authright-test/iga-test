import { Box, Table, } from '@chakra-ui/react';
import React from 'react';

export const DataTable = ({
                            columns,
                            data,
                            isLoading,
                            emptyState,
                            onRowClick,
                            ...props
                          }) => {
  if (isLoading) {
    return (
      <Box
        p={4}
        borderWidth='1px'
        borderRadius='md'
        {...props}
      >
        Loading...
      </Box>
    );
  }

  if (!data || data.length === 0) {
    return emptyState || (
      <Box
        p={4}
        borderWidth='1px'
        borderRadius='md'
        textAlign='center'
        {...props}
      >
        No data available
      </Box>
    );
  }

  return (
    <Box
      borderWidth='1px'
      borderRadius='md'
      overflowX='auto'
      {...props}
    >
      <Table.Root variant='simple'>
        <Table.Header>
          <Table.Row>
            {columns.map((column, index) => (
              <Table.ColumnHeader
                key={index}
                fontWeight='semibold'
                textTransform='none'
                fontSize='sm'
                py={4}
              >
                {column.header}
              </Table.ColumnHeader>
            ))}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {data.map((row, rowIndex) => (
            <Table.Row
              key={rowIndex}
              onClick={() => onRowClick?.(row)}
              cursor={onRowClick ? 'pointer' : 'default'}
            >
              {columns.map((column, colIndex) => (
                <Table.Cell
                  key={colIndex}
                  py={4}
                >
                  {column.cell ? column.cell(row) : row[column.accessor]}
                </Table.Cell>
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
};
