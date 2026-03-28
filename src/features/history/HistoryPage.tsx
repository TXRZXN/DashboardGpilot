"use client";

import { Box, Typography, Alert } from "@mui/material";
import { TradeTable } from "@/features/history/components";
import { useHistoryData } from "@/features/history/hooks";

export default function HistoryPage() {
  const {
    loading,
    error,
    deals,
    totals,
    
    // Sort
    sortField,
    sortDirection,
    handleSort,

    // Filter Controls
    search, setSearch,
    typeFilter, setTypeFilter,
    startDate, setStartDate,
    endDate, setEndDate,
    minProfit, setMinProfit,
    maxProfit, setMaxProfit,
    minVolume, setMinVolume,
    maxVolume, setMaxVolume,
    
    filteredCount,
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

      <TradeTable
        loading={loading}
        deals={deals}
        totals={totals}
        
        // Search & Sort
        search={search}
        onSearchChange={setSearch}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        
        // Advanced Filters
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        minProfit={minProfit}
        onMinProfitChange={setMinProfit}
        maxProfit={maxProfit}
        onMaxProfitChange={setMaxProfit}
        minVolume={minVolume}
        onMinVolumeChange={setMinVolume}
        maxVolume={maxVolume}
        onMaxVolumeChange={setMaxVolume}
        
        filteredCount={filteredCount}
      />
    </Box>
  );
}
