import type React from "react";
import type {AxiosResponse} from "axios";
import type {FieldValues} from "react-hook-form";

import {useMemo, useState, useEffect, useCallback} from "react";
import apiClient from '@/lib/api';
import {
  CustomTableBulkAction,
  CustomTableColumn,
  CustomTableResponse,
  CustomTableTableState
} from '@/components/custom/data-table/types';

export const useCustomTable = <T extends Record<string, any>>(
  url: string,
  columns: CustomTableColumn<T>[],
  bulkActions: CustomTableBulkAction<T>[] = [],
  initialState: Partial<CustomTableTableState<T>> = {}
) => {
  const [state, setState] = useState<CustomTableTableState<T>>({
    data: [],
    loading: false,
    error: null,
    pages: 0,
    currentPage: 0,
    rowsPerPage: 10,
    recordCount: 0,
    sortBy: null,
    sortDir: 'asc',
    selectedRows: [],
    visibleColumns: columns.map((column) => column.data),
    filters: {},
    ...initialState,
  });

  const fetchData = useCallback(async () => {
    try {
      setState((prev) => ({...prev, loading: true, error: null}));
      const config = {
        params: {
          ...state.filters,
          start: state.currentPage * state.rowsPerPage,
          length: state.rowsPerPage,
          sortBy: state.sortBy,
          sortDir: state.sortDir,
        },
      };
      const response: AxiosResponse<CustomTableResponse<T>> = await apiClient.get(url, config);
      setState((prev) => ({
        ...prev,
        data: response.data.data,
        pages: Math.ceil(response.data.recordsFiltered / state.rowsPerPage),
        recordCount: response.data.recordsTotal,
        loading: false,
        selectedRows: prev.selectedRows.filter(selected =>
          response.data.data.some(newRow => newRow.id === selected.id)
        ),
      }));
    } catch (error: any) {
      setState((prev) => ({...prev, error: error.message, loading: false}));
    }
  }, [url, state.filters, state.currentPage, state.rowsPerPage, state.sortBy, state.sortDir]);

  useEffect(() => {
    fetchData().then(() => null);
  }, [fetchData]);

  const onCheckboxChange = useCallback((event: React.ChangeEvent<HTMLInputElement> | {target: {checked: boolean}}, row: T) => {
    const checked = event.target.checked;
    setState((prev) => {
      if (checked) {
        // Make sure we don't add duplicates
        const isAlreadySelected = prev.selectedRows.some(selectedRow => selectedRow.id === row.id);
        return {
          ...prev,
          selectedRows: isAlreadySelected ? prev.selectedRows : [...prev.selectedRows, row]
        };
      } else {
        return {
          ...prev,
          selectedRows: prev.selectedRows.filter((selectedRow) => selectedRow.id !== row.id)
        };
      }
    });
  }, []);

  const onSelectAllRows = useCallback((event: React.ChangeEvent<HTMLInputElement> | {target: {checked: boolean}}) => {
    const checked = event.target.checked;
    setState((prev) => ({
      ...prev,
      selectedRows: checked ? [...prev.data] : [],
    }));
  }, []);

  const onSort = useCallback((column: keyof T) => {
    setState((prev) => ({
      ...prev,
      sortBy: column,
      sortDir: prev.sortBy === column && prev.sortDir === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  const onFilter = useCallback((filterData: FieldValues) => {
    const filteredData = Object.fromEntries(
      Object.entries(filterData).filter(([, value]) => {
        // Handle arrays properly for multi-select filters
        if (Array.isArray(value)) {
          return value.length > 0;
        }
        return value !== "" && value !== null && value !== undefined;
      })
    );
    setState((prev) => ({...prev, filters: filteredData, currentPage: 0}));
  }, []);

  const setFilters = useCallback((filters: FieldValues) => {
    setState((prev) => ({
      ...prev,
      filters,
      currentPage: 0, // Reset to the first page when filters change
    }));
  }, []);

  const setVisibleColumns = useCallback((columns: (keyof T)[]) => {
    setState((prev) => ({...prev, visibleColumns: columns}));
  }, []);

  // Add function to reset selected rows
  const resetSelectedRows = useCallback(() => {
    setState((prev) => ({...prev, selectedRows: []}));
  }, []);

  const tableActions = useMemo(() => ({
    setCurrentPage: (page: number) => setState((prev) => ({...prev, currentPage: page})),
    setRowsPerPage: (rowsPerPage: number) => setState((prev) => ({...prev, rowsPerPage, currentPage: 0})),
    onCheckboxChange,
    onSelectAllRows,
    onSort,
    onFilter,
    setVisibleColumns,
    refresh: fetchData,
    setFilters,
    resetSelectedRows,
  }), [onCheckboxChange, onSelectAllRows, onSort, onFilter, setVisibleColumns, fetchData, setFilters, resetSelectedRows]);

  return {
    ...state,
    columns,
    bulkActions,
    ...tableActions,
  };
};