"use client";

import { 
  Card, 
  CardContent, 
  Box, 
  Typography, 
  TextField, 
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
  TablePagination
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useTheme } from "@mui/material/styles";
import { useState, useMemo } from "react";
import type { GroupedDeal } from "@/shared/types/api";
import type { SortField, SortDirection, HistoryTotals } from "@/features/history/hooks/use-history-data";

interface DataTableProps {
  readonly loading?: boolean;
  readonly deals: readonly GroupedDeal[];
  readonly totals: HistoryTotals;
  readonly sortField: SortField;
  readonly sortDirection: SortDirection;
  readonly onSort: (field: SortField) => void;
  
  // Advanced Filters
  readonly symbolFilter: string;
  readonly onSymbolFilterChange: (value: string) => void;
  readonly typeFilter: "ALL" | "BUY" | "SELL";
  readonly onTypeFilterChange: (value: "ALL" | "BUY" | "SELL") => void;
  readonly startDate: string;
  readonly onStartDateChange: (value: string) => void;
  readonly endDate: string;
  readonly onEndDateChange: (value: string) => void;

  // External Pagination
  readonly totalCount: number;
  readonly page: number;
  readonly rowsPerPage: number;
  readonly onPageChange: (newPage: number) => void;
  readonly onRowsPerPageChange: (newRowsPerPage: number) => void;
}

export function DataTable({
  loading,
  deals,
  totals,
  sortField,
  sortDirection,
  onSort,

  // Advanced Filters
  symbolFilter,
  onSymbolFilterChange,
  typeFilter,
  onTypeFilterChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,

  // External Pagination
  totalCount,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}: Readonly<DataTableProps>) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [showFilters, setShowFilters] = useState(false);

  const handleChangePage = (_event: unknown, newPage: number) => {
    onPageChange(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onRowsPerPageChange(Number.parseInt(event.target.value, 10));
  };

  const handleResetFilters = () => {
    onSymbolFilterChange("");
    onTypeFilterChange("ALL");
    onStartDateChange("");
    onEndDateChange("");
  };

  const pageTotals = useMemo(() => {
    return deals.reduce((acc, d) => ({
      totalTrades: acc.totalTrades + 1,
      volume: acc.volume + d.volume,
      grossProfit: acc.grossProfit + (d.netProfit > 0 ? d.netProfit : 0),
      grossLoss: acc.grossLoss + (d.netProfit < 0 ? Math.abs(d.netProfit) : 0),
      netPL: acc.netPL + d.netProfit,
      fees: acc.fees + (d.commission + d.swap + d.fee)
    }), { totalTrades: 0, volume: 0, grossProfit: 0, grossLoss: 0, netPL: 0, fees: 0 });
  }, [deals]);

  return (
    <Card>
      <CardContent sx={{ p: { xs: 2, lg: 3 }, position: 'relative' }}>
        {loading && (
          <Box 
            sx={{ 
              position: 'absolute', 
              top: 0, left: 0, right: 0, bottom: 0, 
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              bgcolor: isDark ? 'rgba(15, 23, 42, 0.5)' : 'rgba(255, 255, 255, 0.5)',
              zIndex: 10,
              borderRadius: 2
            }}
          >
            <CircularProgress />
          </Box>
        )}
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
            mb: 2,
          }}
        >
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "text.primary" }}>
              Trade History
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {totalCount} trades found
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
              {/* Symbol Filter */}
              <Grid size={{ xs: 12, sm: 4, md: 3 }}>
                 <TextField
                  fullWidth
                  size="small"
                  label="Symbol"
                  placeholder="Type symbol..."
                  value={symbolFilter}
                  onChange={(e) => onSymbolFilterChange(e.target.value)}
                />
              </Grid>

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

              <Grid size={{ xs: 12, md: 3 }} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
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
                    active={sortField === "closeTime"}
                    direction={sortField === "closeTime" ? sortDirection : "asc"}
                    onClick={() => onSort("closeTime")}
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
                  Open
                </TableCell>
                <TableCell align="right" sx={{ color: "text.secondary", fontWeight: 500, borderColor: theme.palette.divider }}>
                  Close
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
                    active={sortField === "netProfit"}
                    direction={sortField === "netProfit" ? sortDirection : "asc"}
                    onClick={() => onSort("netProfit")}
                  >
                    Net Profit
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {deals.map((deal) => {
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
                  if (deal.netProfit > 0) return "success.main";
                  if (deal.netProfit < 0) return "error.main";
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
                      {deal.closeTime}
                    </TableCell>
                    <TableCell sx={{ fontFamily: '"Inter", monospace', fontWeight: 500, color: "text.primary", borderColor: theme.palette.divider }}>
                      {deal.symbol || "-"}
                    </TableCell>
                    <TableCell sx={{ borderColor: theme.palette.divider }}>
                      {renderDealTypeChip()}
                    </TableCell>
                    <TableCell align="right" sx={{ fontFamily: '"Inter", monospace', fontSize: "0.8rem", borderColor: theme.palette.divider }}>
                      {deal.openPrice.toFixed(5)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontFamily: '"Inter", monospace', fontSize: "0.8rem", borderColor: theme.palette.divider }}>
                      {deal.closePrice.toFixed(5)}
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
                      {deal.netProfit > 0 ? "+" : ""}${deal.netProfit.toFixed(2)}
                    </TableCell>
                  </TableRow>
                );
              })}
              
              {deals.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No trades found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
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
          {deals.map((deal) => {
            const isPositive = deal.netProfit > 0;
            const isNegative = deal.netProfit < 0;
            
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
                      {deal.closeTime}
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
                    {isPositive ? "+" : ""}${deal.netProfit.toFixed(2)}
                  </Typography>
                </Box>
                
                <Grid container spacing={1} sx={{ mb: 1 }}>
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
                    <Typography variant="caption" sx={{ color: "text.secondary", display: 'block' }}>Symbol</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{deal.symbol || "-"}</Typography>
                  </Grid>
                </Grid>

                <Grid container spacing={1}>
                  <Grid size={4}>
                    <Typography variant="caption" sx={{ color: "text.secondary", display: 'block' }}>Open</Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{deal.openPrice.toFixed(5)}</Typography>
                  </Grid>
                  <Grid size={4}>
                    <Typography variant="caption" sx={{ color: "text.secondary", display: 'block' }}>Close</Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{deal.closePrice.toFixed(5)}</Typography>
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
            count={totalCount}
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
          elevation={0}
          sx={{
            mt: 2,
            overflow: 'hidden',
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          {/* Header Labels (Desktop Only) */}
          <Box sx={{ 
            display: { xs: 'none', md: 'grid' }, 
            gridTemplateColumns: '1.2fr repeat(6, 1fr)',
            bgcolor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)",
            borderBottom: `1px solid ${theme.palette.divider}`,
            p: 1.5
          }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>GROUP</Typography>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', textAlign: 'right' }}>Total Trades</Typography>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', textAlign: 'right' }}>Total Volume</Typography>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', textAlign: 'right' }}>Gross Profit</Typography>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', textAlign: 'right' }}>Gross Loss</Typography>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', textAlign: 'right' }}>Net P/L</Typography>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', textAlign: 'right' }}>Fees/Comm</Typography>
          </Box>

          {/* PAGE Row */}
          <Box sx={{ 
            display: { xs: 'flex', md: 'grid' }, 
            flexDirection: 'column',
            gridTemplateColumns: '1.2fr repeat(6, 1fr)',
            p: 1.5,
            borderBottom: `1px solid ${theme.palette.divider}`,
            bgcolor: isDark ? 'transparent' : '#fff'
          }}>
            <Typography variant="body2" sx={{ fontWeight: 700, mb: { xs: 1, md: 0 } }}>PAGE TOTAL</Typography>
            {[
              { label: 'Trades', value: pageTotals.totalTrades, color: 'text.primary' },
              { label: 'Volume', value: pageTotals.volume.toFixed(2), color: 'text.primary' },
              { label: 'Gross Prof.', value: `+$${pageTotals.grossProfit.toFixed(2)}`, color: 'success.main' },
              { label: 'Gross Loss', value: `-$${pageTotals.grossLoss.toFixed(2)}`, color: 'error.main' },
              { label: 'Net P/L', value: `${pageTotals.netPL >= 0 ? '+' : ''}$${pageTotals.netPL.toFixed(2)}`, color: pageTotals.netPL >= 0 ? 'success.main' : 'error.main', bold: true },
              { label: 'Fees', value: `$${pageTotals.fees.toFixed(2)}`, color: 'text.secondary' },
            ].map((m, idx) => (
              <Box key={m.label} sx={{ 
                display: 'flex', 
                justifyContent: { xs: 'space-between', md: 'flex-end' }, 
                alignItems: 'center',
                mb: { xs: 0.5, md: 0 } 
              }}>
                <Typography variant="caption" sx={{ display: { md: 'none' }, color: 'text.secondary' }}>{m.label}</Typography>
                <Typography variant="body2" sx={{ 
                  textAlign: 'right', 
                  fontWeight: m.bold ? 700 : 500, 
                  color: m.color,
                  fontFamily: '"Inter", monospace',
                }}>
                  {m.value}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* TOTAL Row */}
          <Box sx={{ 
            display: { xs: 'flex', md: 'grid' }, 
            flexDirection: 'column',
            gridTemplateColumns: '1.2fr repeat(6, 1fr)',
            p: 1.5,
            bgcolor: isDark ? "rgba(34, 211, 238, 0.08)" : "rgba(8, 145, 178, 0.05)",
          }}>
            <Typography variant="body2" sx={{ fontWeight: 700, mb: { xs: 1, md: 0 }, color: 'primary.main' }}>TOTAL SUMMARY</Typography>
            {[
              { label: 'Trades', value: totals.totalTrades, color: 'text.primary' },
              { label: 'Volume', value: totals.volume.toFixed(2), color: 'text.primary' },
              { label: 'Gross Prof.', value: `+$${totals.grossProfit.toFixed(2)}`, color: 'success.main' },
              { label: 'Gross Loss', value: `-$${totals.grossLoss.toFixed(2)}`, color: 'error.main' },
              { label: 'Net P/L', value: `${totals.netPL >= 0 ? '+' : ''}$${totals.netPL.toFixed(2)}`, color: totals.netPL >= 0 ? 'success.main' : 'error.main', bold: true },
              { label: 'Fees', value: `$${(totals.commission + totals.swap + (totals as any).fee || 0).toFixed(2)}`, color: 'text.secondary' },
            ].map((m, idx) => (
              <Box key={m.label} sx={{ 
                display: 'flex', 
                justifyContent: { xs: 'space-between', md: 'flex-end' }, 
                alignItems: 'center',
                mb: { xs: 0.5, md: 0 } 
              }}>
                <Typography variant="caption" sx={{ display: { md: 'none' }, color: 'text.secondary' }}>{m.label}</Typography>
                <Typography variant="body2" sx={{ 
                  textAlign: 'right', 
                  fontWeight: m.bold ? 700 : 500, 
                  color: m.color,
                  fontFamily: '"Inter", monospace',
                }}>
                  {m.value}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      </CardContent>
    </Card>
  );
}
