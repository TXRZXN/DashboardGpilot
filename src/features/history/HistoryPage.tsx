"use client";

import { Box, Typography, Alert } from "@mui/material";
import { DataTable } from "@/shared/ui";
import { useHistoryData } from "@/features/history/hooks";

export default function HistoryPage() {
  const {
    loading,
    error,
    deals,
    totals,

    // Pagination
    page,
    rowsPerPage,
    totalCount,
    handlePageChange,
    handleRowsPerPageChange,

    // Sort
    sortField,
    sortDirection,
    handleSort,

    // Filter Controls
    symbolFilter, setSymbolFilter,
    typeFilter, setTypeFilter,
    startDate, setStartDate,
    endDate, setEndDate,
  } = useHistoryData();

  return (
    <Box sx={{ p: { xs: 2, lg: 3 }, flex: 1 }}>
      <Box sx={{ mb: { xs: 2, lg: 3 } }}>
        <Typography
          variant="h5"
          sx={{
            fontFamily: '"Manrope", sans-serif',
            fontWeight: 700,
            color: "text.primary",
            fontSize: { xs: "1.25rem", lg: "1.5rem" },
          }}
        >
          Trade History
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Complete trading record with advanced filtering and grouping
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <DataTable
        loading={loading}
        deals={deals}
        totals={totals}
        
        // Search & Sort
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        
        // Advanced Filters
        symbolFilter={symbolFilter}
        onSymbolFilterChange={setSymbolFilter}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        
        // Pagination
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={totalCount}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    </Box>
  );
}
