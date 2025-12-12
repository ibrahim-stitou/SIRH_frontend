// Improved CustomTable.tsx with fixed bulk actions and selection

import React, { useEffect, useRef, useState } from 'react';
import { useCustomTable } from '@/hooks/use-custom-table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { CustomTableProps } from '@/components/custom/data-table/types';
import { CustomTableToolbar } from '@/components/custom/data-table/custom-table-toolbar';
import { IconLoader } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import CustomTablePagination from '@/components/custom/data-table/custom-table-pagination';
import { useLanguage } from '@/context/LanguageContext';

const CustomTable = <T extends Record<string, any>>({
  url,
  columns,
  filters,
  bulkActions = [],
  onInit,
  clickCard
}: CustomTableProps<T>) => {
  const table = useCustomTable(url, columns, bulkActions);
  const { t } = useLanguage();
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [clickedRow, setClickedRow] = useState<T | null>(null);
  const [showClickCard, setShowClickCard] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });
  const tableRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const initRef = useRef(false);

  useEffect(() => {
    if (onInit && !initRef.current) {
      // Call onInit only once to avoid re-render loops
      // Consumers can use table.refresh etc. afterward
      // If you need to re-initialize on url/columns change, consider resetting initRef accordingly.
      // For now, keep it once-per-mount to prevent infinite updates.
      // @ts-ignore
      onInit(table);
      initRef.current = true;
    }
  }, [onInit, table]);

  // Add click outside handler to close the card
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showClickCard &&
        cardRef.current &&
        !cardRef.current.contains(event.target as Node)
      ) {
        // Check if the click is on a table row (which has its own click handler)
        const isClickOnTableRow =
          (event.target as Element)?.closest('tr') !== null;

        if (!isClickOnTableRow) {
          setIsAnimatingOut(true);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showClickCard]);

  // Handle animation out effect
  useEffect(() => {
    if (isAnimatingOut) {
      const timer = setTimeout(() => {
        setShowClickCard(false);
        setClickedRow(null);
        setIsAnimatingOut(false);
      }, 300); // Match this with the animation duration

      return () => clearTimeout(timer);
    }
  }, [isAnimatingOut]);
  useEffect(() => {
    setShowBulkActions(table.selectedRows.length > 0);
  }, [table.selectedRows]);

  const areAllRowsSelected =
    table.data.length > 0 &&
    table.data.every((row) =>
      table.selectedRows.some((selectedRow) => selectedRow.id === row.id)
    );
  const areSomeRowsSelected =
    table.selectedRows.length > 0 && !areAllRowsSelected;

  return (
    <div className='flex flex-1 flex-col space-y-4'>
      <div className={0 ? 'hidden' : ''}>
        <CustomTableToolbar table={table} filters={filters} />
      </div>

      {/* Bulk Actions Bar */}
      {showBulkActions && bulkActions && bulkActions.length > 0 && (
        <div className='bg-muted flex items-center gap-2 rounded-md p-2'>
          <span className='text-sm font-medium'>
            {table.selectedRows.length} {t('table.selected')}
          </span>
          <div className='flex-1'></div>
          <div className='flex items-center gap-2'>
            {bulkActions.map((action, index) => (
              <Button
                key={index}
                variant='outline'
                size='sm'
                onClick={() => action.action(table.selectedRows, table.refresh)}
                disabled={
                  action.disabled ? action.disabled(table.selectedRows) : false
                }
                className={`flex items-center gap-1 rounded-lg shadow-sm ${action.className ?? ''}`}
              >
                {action.icon && action.icon}
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {!!0 && <div className='space-y-4'>{/* Skeleton content */}</div>}
      {!0 && (
        <>
          <div className='relative flex flex-1' ref={tableRef}>
            {table.loading && (
              <div className='bg-accent absolute inset-0 z-50 flex h-full w-full items-center justify-center rounded-lg border opacity-40'>
                <IconLoader className='animate-spin' />
              </div>
            )}

            <div
              className={`absolute inset-0 flex overflow-hidden rounded-lg border ${table.loading && 'blur-sm'}`}
            >
              <ScrollArea className='h-full w-full'>
                <Table>
                  <TableHeader className='bg-muted sticky top-0 z-10'>
                    <TableRow>
                      {/* Selection checkbox column */}
                      {bulkActions && bulkActions.length > 0 && (
                        <TableHead className='w-[50px]'>
                          <Checkbox
                            checked={areAllRowsSelected}
                            //@ts-ignore
                            indeterminate={areSomeRowsSelected}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                const newSelectedRows = [...table.selectedRows];
                                table.data.forEach((row) => {
                                  if (
                                    !table.selectedRows.some(
                                      (selectedRow) => selectedRow.id === row.id
                                    )
                                  ) {
                                    newSelectedRows.push(row);
                                  }
                                });
                                table.selectedRows = newSelectedRows;
                                table.onSelectAllRows({
                                  target: { checked: true }
                                } as any);
                              } else {
                                table.selectedRows = table.selectedRows.filter(
                                  (selectedRow) =>
                                    !table.data.some(
                                      (row) => row.id === selectedRow.id
                                    )
                                );
                                table.onSelectAllRows({
                                  target: { checked: false }
                                } as any);
                              }
                            }}
                            aria-label='Select all'
                            className='rounded-lg'
                          />
                        </TableHead>
                      )}

                      {table.columns.map(
                        (col) =>
                          // @ts-ignore
                          table.visibleColumns.includes(col.data) && (
                            <TableHead
                              // @ts-ignore
                              key={col.data}
                              style={
                                col.width
                                  ? { width: `${col.width}px` }
                                  : undefined
                              }
                              className={
                                col.sortable
                                  ? 'hover:bg-muted-foreground/10 cursor-pointer'
                                  : ''
                              }
                              onClick={() => {
                                if (col.sortable) {
                                  // @ts-ignore
                                  table.onSort(col.data);
                                }
                              }}
                            >
                              <div className='flex items-center'>
                                {col.label}
                                {col.sortable && (
                                  <span className='ml-1'>
                                    {/* @ts-ignore */}
                                    {table.sortBy === col.data &&
                                      table.sortDir === 'asc' &&
                                      '▲'}
                                    {/* @ts-ignore */}
                                    {table.sortBy === col.data &&
                                      table.sortDir === 'desc' &&
                                      '▼'}
                                  </span>
                                )}
                              </div>
                            </TableHead>
                          )
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {table.data?.length ? (
                      table.data.map((row) => (
                        <TableRow
                          className={`hover:bg-muted-foreground/10 ${clickCard ? 'cursor-pointer' : ''}`}
                          key={row.id}
                          onClick={(e) => {
                            if (clickCard) {
                              // Find the clicked cell
                              const clickedCell = (e.target as Element).closest(
                                'td'
                              );

                              // If we can't find the cell, or if it's the checkbox cell, proceed normally
                              if (!clickedCell) {
                                return;
                              }

                              // Find the index of the clicked cell within its row
                              const cellIndex = Array.from(
                                clickedCell.parentElement?.children || []
                              ).indexOf(clickedCell);

                              // Adjust for the checkbox column if present
                              const columnIndex =
                                bulkActions && bulkActions.length > 0
                                  ? cellIndex - 1
                                  : cellIndex;

                              // Get the corresponding column
                              const clickedColumn = table.columns[columnIndex];

                              // If the column is marked as clickable, don't show the card
                              if (clickedColumn && clickedColumn.clickable) {
                                return;
                              }

                              // Set position for hover card
                              const viewportWidth = window.innerWidth;
                              const viewportHeight = window.innerHeight;

                              // Estimate hover card dimensions
                              const hoverCardWidth = 400; // maxWidth from the style
                              const hoverCardHeight = 300; // approximate height

                              let x =
                                e.clientX -
                                (tableRef.current?.getBoundingClientRect().x ??
                                  0);
                              let y = e.clientY - 20;

                              // Adjust if too close to right edge
                              if (x + hoverCardWidth > viewportWidth - 20) {
                                x = Math.max(
                                  20,
                                  viewportWidth - hoverCardWidth - 20
                                );
                              }

                              // Adjust if too close to bottom edge
                              if (y + hoverCardHeight > viewportHeight - 20) {
                                y = Math.max(
                                  20,
                                  viewportHeight - hoverCardHeight - 20
                                );
                              }

                              setClickPosition({ x, y });

                              // If clicking on the same row, toggle the card
                              if (
                                clickedRow &&
                                clickedRow.id === row.id &&
                                showClickCard
                              ) {
                                setShowClickCard(false);
                                setClickedRow(null);
                              } else {
                                // Set the clicked row and show the card
                                setClickedRow(row);
                                setIsAnimatingOut(false);
                                setShowClickCard(true);
                              }
                            }
                          }}
                        >
                          {/* Row selection checkbox */}
                          {bulkActions && bulkActions.length > 0 && (
                            <TableCell>
                              <Checkbox
                                checked={table.selectedRows.some(
                                  (selectedRow) => selectedRow.id === row.id
                                )}
                                onCheckedChange={(checked) =>
                                  table.onCheckboxChange(
                                    { target: { checked } } as any,
                                    row
                                  )
                                }
                                aria-label='Select row'
                                className='rounded-lg'
                              />
                            </TableCell>
                          )}

                          {table.columns.map(
                            (col) =>
                              // @ts-ignore
                              table.visibleColumns.includes(col.data) &&
                              // @ts-ignore
                              (col.render ? (
                                <TableCell
                                  // @ts-ignore
                                  key={col.data + '-' + row.id}
                                  style={
                                    col.width
                                      ? { width: `${col.width}px` }
                                      : undefined
                                  }
                                >
                                  {col.render(
                                    row[col.data],
                                    row,
                                    table.refresh
                                  )}
                                </TableCell>
                              ) : (
                                <TableCell
                                  // @ts-ignore
                                  key={`${col.data}-${row.id}`}
                                  style={
                                    col.width
                                      ? { width: `${col.width}px` }
                                      : undefined
                                  }
                                >
                                  {/*@ts-ignore*/}
                                  {row[col.data] ?? ''}
                                </TableCell>
                              ))
                          )}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={
                            (bulkActions && bulkActions.length > 0 ? 1 : 0) +
                            (table.visibleColumns.length ?? 0)
                          }
                          className='h-24 text-center'
                        >
                          {t('table.noData')}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                <ScrollBar orientation='horizontal' />
              </ScrollArea>
            </div>
          </div>
          <CustomTablePagination<T> table={table} />
        </>
      )}

      {/* Detail Card (formerly Hover Card) */}
      {clickCard && showClickCard && clickedRow && (
        <div
          ref={cardRef}
          className={`absolute z-50 transform-gpu rounded-lg border bg-white p-4 shadow-lg duration-300 ease-out ${
            isAnimatingOut ? 'fade-out-0' : 'animate-in fade-in-0 zoom-in-95'
          }`}
          style={{
            top: `${clickPosition.y}px`,
            left: `${clickPosition.x}px`,
            maxWidth: '400px',
            minWidth: '200px'
          }}
        >
          <div className='mb-2 flex items-start justify-between'>
            <div className='font-medium'>Détails</div>
            <button
              className='text-gray-500 hover:text-gray-700'
              onClick={() => {
                setIsAnimatingOut(true);
                // Card will be hidden after animation completes via useEffect
              }}
            >
              ✕
            </button>
          </div>
          {clickCard(clickedRow)}
        </div>
      )}
    </div>
  );
};

export default CustomTable;
