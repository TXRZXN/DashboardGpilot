"use client";

import { 
  Card, 
  CardContent, 
  Box, 
  Typography, 
  TextField, 
  InputAdornment, 
  IconButton, 
  Chip, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  TableSortLabel, 
  Grid, 
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Collapse,
  Button,
  Stack,
  TablePagination
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useTheme } from "@mui/material/styles";
import { useState } from "react";
import type { Deal } from "@/shared/types/api";
import type { SortField, SortDirection, HistoryTotals } from "../hooks/use-history-data";

interface TradeTableProps {
  readonly loading?: boolean;
  readonly deals: readonly Deal[];
  readonly totals: HistoryTotals;
  readonly search: string;
  readonly onSearchChange: (value: string) => void;
  readonly sortField: SortField;
  readonly sortDirection: SortDirection;
  readonly onSort: (field: SortField) => void;
  
  // Advanced Filters
  readonly typeFilter: "ALL" | "BUY" | "SELL";
  readonly onTypeFilterChange: (value: "ALL" | "BUY" | "SELL") => void;
  readonly startDate: string;
  readonly onStartDateChange: (value: string) => void;
  readonly endDate: string;
  readonly onEndDateChange: (value: string) => void;
  readonly minProfit: string;
  readonly onMinProfitChange: (value: string) => void;
  readonly maxProfit: string;
  readonly onMaxProfitChange: (value: string) => void;
  readonly minVolume: string;
  readonly onMinVolumeChange: (value: string) => void;
  readonly maxVolume: string;
  readonly onMaxVolumeChange: (value: string) => void;

  readonly filteredCount: number;
}

export function TradeTable({
  loading,
  deals,
  totals,
  search,
  onSearchChange,
  sortField,
  sortDirection,
  onSort,

  // Advanced Filters
  typeFilter,
  onTypeFilterChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  minProfit,
  onMinProfitChange,
  maxProfit,
  onMaxProfitChange,
  minVolume,
  onMinVolumeChange,
  maxVolume,
  onMaxVolumeChange,

  filteredCount,
}: Readonly<TradeTableProps>) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedDeals = deals.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const handleResetFilters = () => {
    onSearchChange("");
    onTypeFilterChange("ALL");
    onStartDateChange("");
    onEndDateChange("");
    onMinProfitChange("");
    onMaxProfitChange("");
    onMinVolumeChange("");
    onMaxVolumeChange("");
  };

  return (
    <Card>
      <CardContent sx={{ p: { xs: 2, lg: 3 } }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", lg: "row" },
            justifyContent: "space-between",
            alignItems: { lg: "center" },
            gap: 2,
            mb: 2,
          }}
        >
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "text.primary" }}>
              Trade History
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {filteredCount} trades found
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <TextField
              size="small"
              placeholder="Search symbol..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                flex: 1,
                minWidth: { lg: 240 },
                "& .MuiOutlinedInput-root": {
                  bgcolor: isDark ? "rgba(148, 163, 184, 0.05)" : "rgba(15, 23, 42, 0.02)",
                  "& fieldset": {
                    borderColor: isDark ? "rgba(148, 163, 184, 0.1)" : "rgba(15, 23, 42, 0.1)",
                  },
                },
              }}
            />
            <IconButton
              onClick={() => setShowFilters(!showFilters)}
              color={showFilters ? "primary" : "default"}
              sx={{
                border: isDark ? "1px solid rgba(148, 163, 184, 0.1)" : "1px solid rgba(15, 23, 42, 0.1)",
                borderRadius: 2,
                bgcolor: showFilters ? theme.palette.primary.main + "10" : "transparent"
              }}
            >
              <FilterListIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Box>

        <Collapse in={showFilters}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 2, 
              mb: 3, 
              bgcolor: isDark ? "rgba(148, 163, 184, 0.03)" : "rgba(15, 23, 42, 0.01)",
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2
            }}
          >
            <Grid container spacing={2}>
              {/* Type Filter */}
              <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={typeFilter}
                    label="Type"
                    onChange={(e) => onTypeFilterChange(e.target.value as any)}
                  >
                    <MenuItem value="ALL">All Types</MenuItem>
                    <MenuItem value="BUY">BUY</MenuItem>
                    <MenuItem value="SELL">SELL</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Date Filters */}
              <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={(e) => onStartDateChange(e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="End Date"
                  type="date"
                  value={endDate}
                  onChange={(e) => onEndDateChange(e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>

              {/* Profit Range */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <TextField
                    fullWidth
                    size="small"
                    label="Min Profit"
                    type="number"
                    value={minProfit}
                    onChange={(e) => onMinProfitChange(e.target.value)}
                  />
                  <Typography variant="caption">-</Typography>
                  <TextField
                    fullWidth
                    size="small"
                    label="Max Profit"
                    type="number"
                    value={maxProfit}
                    onChange={(e) => onMaxProfitChange(e.target.value)}
                  />
                </Stack>
              </Grid>

              {/* Volume Range */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <TextField
                    fullWidth
                    size="small"
                    label="Min Vol"
                    type="number"
                    value={minVolume}
                    onChange={(e) => onMinVolumeChange(e.target.value)}
                  />
                  <Typography variant="caption">-</Typography>
                  <TextField
                    fullWidth
                    size="small"
                    label="Max Vol"
                    type="number"
                    value={maxVolume}
                    onChange={(e) => onMaxVolumeChange(e.target.value)}
                  />
                </Stack>
              </Grid>

              <Grid size={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  size="small" 
                  startIcon={<RefreshIcon />}
                  onClick={handleResetFilters}
                  sx={{ textTransform: 'none' }}
                >
                  Reset Filters
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Collapse>

        {/* Desktop Table View */}
        <TableContainer sx={{ display: { xs: 'none', md: 'block' } }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: "text.secondary", fontWeight: 500, borderColor: theme.palette.divider }}>
                  <TableSortLabel
                    active={sortField === "time"}
                    direction={sortField === "time" ? sortDirection : "asc"}
                    onClick={() => onSort("time")}
                  >
                    Time
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ color: "text.secondary", fontWeight: 500, borderColor: theme.palette.divider }}>
                  <TableSortLabel
                    active={sortField === "symbol"}
                    direction={sortField === "symbol" ? sortDirection : "asc"}
                    onClick={() => onSort("symbol")}
                  >
                    Symbol
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ color: "text.secondary", fontWeight: 500, borderColor: theme.palette.divider }}>
                  <TableSortLabel
                    active={sortField === "type"}
                    direction={sortField === "type" ? sortDirection : "asc"}
                    onClick={() => onSort("type")}
                  >
                    Type
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right" sx={{ color: "text.secondary", fontWeight: 500, borderColor: theme.palette.divider }}>
                  <TableSortLabel
                    active={sortField === "volume"}
                    direction={sortField === "volume" ? sortDirection : "asc"}
                    onClick={() => onSort("volume")}
                  >
                    Lot
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right" sx={{ color: "text.secondary", fontWeight: 500, borderColor: theme.palette.divider }}>
                  <TableSortLabel
                    active={sortField === "profit"}
                    direction={sortField === "profit" ? sortDirection : "asc"}
                    onClick={() => onSort("profit")}
                  >
                    Net Profit
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedDeals.map((deal) => {
                const renderDealTypeChip = () => {
                  let icon = <SwapHorizIcon sx={{ fontSize: 14, color: "text.secondary" }} />;
                  let bgcolor = "rgba(148, 163, 184, 0.2)";
                  let color = "text.secondary";

                  if (deal.type === "BUY") {
                    icon = <ArrowUpwardIcon sx={{ fontSize: 14, color: `${theme.palette.success.main} !important` }} />;
                    bgcolor = "rgba(16, 185, 129, 0.2)";
                    color = "success.main";
                  } else if (deal.type === "SELL") {
                    icon = <ArrowDownwardIcon sx={{ fontSize: 14, color: `${theme.palette.error.main} !important` }} />;
                    bgcolor = "rgba(239, 68, 68, 0.2)";
                    color = "error.main";
                  }

                  return (
                    <Chip
                      icon={icon}
                      label={deal.type}
                      size="small"
                      sx={{
                        bgcolor,
                        color,
                        fontWeight: 500,
                        fontSize: "0.7rem",
                      }}
                    />
                  );
                };

                const getDealProfitColor = () => {
                  if (deal.net_profit > 0) return "success.main";
                  if (deal.net_profit < 0) return "error.main";
                  return "text.primary";
                };

                return (
                  <TableRow
                    key={deal.ticket}
                    sx={{
                      "&:hover": { bgcolor: isDark ? "rgba(148, 163, 184, 0.05)" : "rgba(15, 23, 42, 0.02)" },
                    }}
                  >
                    <TableCell sx={{ fontFamily: '"Inter", monospace', fontSize: "0.75rem", color: "text.secondary", borderColor: theme.palette.divider }}>
                      {deal.time}
                    </TableCell>
                    <TableCell sx={{ fontFamily: '"Inter", monospace', fontWeight: 500, color: "text.primary", borderColor: theme.palette.divider }}>
                      {deal.symbol || "-"}
                    </TableCell>
                    <TableCell sx={{ borderColor: theme.palette.divider }}>
                      {renderDealTypeChip()}
                    </TableCell>
                    <TableCell align="right" sx={{ fontFamily: '"Inter", monospace', color: "text.primary", borderColor: theme.palette.divider }}>
                      {deal.volume.toFixed(2)}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontFamily: '"Inter", monospace',
                        fontWeight: 500,
                        color: getDealProfitColor(),
                        borderColor: theme.palette.divider,
                      }}
                    >
                      {deal.net_profit > 0 ? "+" : ""}${deal.net_profit.toFixed(2)}
                    </TableCell>
                  </TableRow>
                );
              })}
              
              {/* Summary Row inside table body (Matching "Total 11") */}
              <TableRow sx={{ bgcolor: isDark ? "rgba(34, 211, 238, 0.05)" : "rgba(8, 145, 178, 0.03)" }}>
                <TableCell colSpan={3} sx={{ fontWeight: 700, borderColor: theme.palette.divider }}>TOTAL</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, borderColor: theme.palette.divider }}>{totals.volume.toFixed(2)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: totals.netPL >= 0 ? "success.main" : "error.main", borderColor: theme.palette.divider }}>
                  {totals.netPL >= 0 ? "+" : ""}${totals.netPL.toFixed(2)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={deals.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ display: { xs: 'none', md: 'block' }, borderBottom: `1px solid ${theme.palette.divider}` }}
        />

        {/* Mobile Card View */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 1.5 }}>
          {paginatedDeals.map((deal) => {
            const isPositive = deal.net_profit > 0;
            const isNegative = deal.net_profit < 0;
            
            let profitColor = "text.primary";
            if (isPositive) profitColor = "success.main";
            else if (isNegative) profitColor = "error.main";

            let typeColor = "text.primary";
            if (deal.type === 'BUY') typeColor = 'success.main';
            else if (deal.type === 'SELL') typeColor = 'error.main';

            return (
              <Paper
                key={deal.ticket}
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  bgcolor: isDark ? "rgba(148, 163, 184, 0.02)" : "rgba(15, 23, 42, 0.01)",
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: "text.primary" }}>
                      {deal.symbol || "-"}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary", fontFamily: '"Inter", monospace' }}>
                      {deal.time}
                    </Typography>
                  </Box>
                  <Typography
                    sx={{
                      fontFamily: '"Inter", monospace',
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      color: profitColor
                    }}
                  >
                    {isPositive ? "+" : ""}${deal.net_profit.toFixed(2)}
                  </Typography>
                </Box>
                
                <Grid container spacing={1}>
                  <Grid size={4}>
                    <Typography variant="caption" sx={{ color: "text.secondary", display: 'block' }}>Type</Typography>
                    <Typography variant="body2" sx={{ 
                      fontWeight: 600, 
                      color: typeColor 
                    }}>
                      {deal.type}
                    </Typography>
                  </Grid>
                  <Grid size={4}>
                    <Typography variant="caption" sx={{ color: "text.secondary", display: 'block' }}>Lot</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{deal.volume.toFixed(2)}</Typography>
                  </Grid>
                  <Grid size={4} sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" sx={{ color: "text.secondary", display: 'block' }}>Ticket</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>#{deal.ticket}</Typography>
                  </Grid>
                </Grid>
              </Paper>
            );
          })}
          
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={deals.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{ display: { xs: 'block', md: 'none' }, borderTop: `1px solid ${theme.palette.divider}` }}
          />

          {deals.length === 0 && (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">No trades found</Typography>
            </Box>
          )}
        </Box>

        <Paper
          sx={{
            mt: 2,
            p: 2,
            bgcolor: isDark ? "rgba(148, 163, 184, 0.05)" : "rgba(15, 23, 42, 0.02)",
            border: isDark ? "1px solid rgba(148, 163, 184, 0.08)" : "1px solid rgba(15, 23, 42, 0.05)",
          }}
        >
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, md: 2 }}>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Total Trades
              </Typography>
              <Typography
                sx={{
                  fontFamily: '"Inter", monospace',
                  fontWeight: 700,
                  color: "text.primary",
                }}
              >
                {totals.totalTrades}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Total Volume
              </Typography>
              <Typography
                sx={{
                  fontFamily: '"Inter", monospace',
                  fontWeight: 700,
                  color: "text.primary",
                }}
              >
                {totals.volume.toFixed(2)} lots
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Gross Profit
              </Typography>
              <Typography
                sx={{
                  fontFamily: '"Inter", monospace',
                  fontWeight: 700,
                  color: "success.main",
                }}
              >
                +${totals.grossProfit.toFixed(2)}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Gross Loss
              </Typography>
              <Typography
                sx={{
                  fontFamily: '"Inter", monospace',
                  fontWeight: 700,
                  color: "error.main",
                }}
              >
                ${totals.grossLoss.toFixed(2)}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Net P/L
              </Typography>
              <Typography
                sx={{
                  fontFamily: '"Inter", monospace',
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  color: totals.netPL >= 0 ? "success.main" : "error.main",
                }}
              >
                {totals.netPL > 0 ? "+" : ""}${totals.netPL.toFixed(2)}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Fee/Comm/Swap
              </Typography>
              <Typography
                sx={{
                  fontFamily: '"Inter", monospace',
                  fontWeight: 500,
                  color: "text.secondary",
                  fontSize: "0.8rem"
                }}
              >
                ${(totals.commission + totals.swap + (totals as any).fee || 0).toFixed(2)}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </CardContent>
    </Card>
  );
}
