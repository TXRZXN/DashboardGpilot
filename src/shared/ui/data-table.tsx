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
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import type { GroupedDeal } from "@/shared/types/api";
import type { SortField, SortDirection, HistoryTotals } from "@/features/history/hooks/use-history-data";

export type DataTableVariant = "full" | "compact";

interface DataTableProps {
  readonly loading?: boolean;
  readonly deals: readonly GroupedDeal[];
  readonly totals: HistoryTotals;
  readonly sortField: SortField;
  readonly sortDirection: SortDirection;
  readonly onSort: (field: SortField) => void;
  
  // Customization
  readonly variant?: DataTableVariant;
  
  // Advanced Filters
  readonly hideSymbolFilter?: boolean;
  readonly symbolFilter?: string;
  readonly onSymbolFilterChange?: (value: string) => void;
  readonly typeFilter: string;
  readonly onTypeFilterChange: (value: any) => void;
  readonly typeOptions?: { label: string; value: string }[];
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
  variant = "full",
  hideSymbolFilter = false,
  typeOptions = [
    { label: "All Types", value: "ALL" },
    { label: "BUY", value: "BUY" },
    { label: "SELL", value: "SELL" },
  ]
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
    onSymbolFilterChange?.("");
    onTypeFilterChange("ALL");
    onStartDateChange("");
    onEndDateChange("");
  };

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return "-";
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(date).replace(',', '');
    } catch (e) {
      return isoString;
    }
  };

  const pageTotals = useMemo(() => {
    return deals.reduce((acc, d) => ({
      totalTrades: acc.totalTrades + 1,
      netPL: acc.netPL + d.netProfit,
    }), { totalTrades: 0, netPL: 0 });
  }, [deals]);

  const getDealProfitColor = (profit: number) => {
    if (profit > 0) return "success.main";
    if (profit < 0) return "error.main";
    return "text.primary";
  };

  const renderDealTypeChip = (type: string) => {
    let icon = <SwapHorizIcon sx={{ fontSize: 14, color: "text.secondary" }} />;
    let bgcolor = "rgba(148, 163, 184, 0.2)";
    let color = "text.secondary";
    let label = type;

    if (type === "Trade" || type === "Trades" || type === "BUY" || type === "SELL") {
      icon = <ArrowUpwardIcon sx={{ fontSize: 14, color: `${theme.palette.success.main} !important` }} />;
      bgcolor = "rgba(16, 185, 129, 0.2)";
      color = "success.main";
      label = (type === "Trades" || type === "Trade") ? "Trade" : type;
    } else if (type === "Withdraw" || type === "Withdrawals") {
      icon = <ArrowDownwardIcon sx={{ fontSize: 14, color: `${theme.palette.error.main} !important` }} />;
      bgcolor = "rgba(239, 68, 68, 0.2)";
      color = "error.main";
      label = "Withdraw";
    } else if (type === "Deposit" || type === "Deposits") {
      icon = <ArrowUpwardIcon sx={{ fontSize: 14, color: `${theme.palette.info.main} !important` }} />;
      bgcolor = "rgba(59, 130, 246, 0.2)";
      color = "info.main";
      label = "Deposit";
    } else if (type === "ProfitShare" || type === "ProfitSharing") {
      icon = <SwapHorizIcon sx={{ fontSize: 14, color: `${theme.palette.warning.main} !important` }} />;
      bgcolor = "rgba(245, 158, 11, 0.2)";
      color = "warning.main";
      label = "Profit Share";
    }

    return (
      <Chip
        icon={icon}
        label={label}
        size="small"
        sx={{
          bgcolor,
          color,
          fontWeight: 600,
          fontSize: "0.7rem",
          textTransform: 'uppercase',
          borderRadius: 1.5,
          '& .MuiChip-label': { px: 1 }
        }}
      />
    );
  };

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
              {!hideSymbolFilter && (
                <Grid size={{ xs: 12, sm: 4, md: 3 }}>
                   <TextField
                    fullWidth
                    size="small"
                    label="Symbol"
                    placeholder="Type symbol..."
                    value={symbolFilter}
                    onChange={(e) => onSymbolFilterChange?.(e.target.value)}
                  />
                </Grid>
              )}

              {/* Type Filter */}
              <Grid size={{ xs: 12, sm: 4, md: hideSymbolFilter ? 4 : 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={typeFilter}
                    label="Type"
                    onChange={(e) => onTypeFilterChange(e.target.value as any)}
                  >
                    {typeOptions.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Date Filters */}
              <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                <DatePicker
                  label="Start Date"
                  value={startDate ? dayjs(startDate) : null}
                  onChange={(newValue) => onStartDateChange(newValue ? newValue.format("YYYY-MM-DD") : "")}
                  slotProps={{ textField: { size: "small", fullWidth: true } }}
                  format="DD/MM/YYYY"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                <DatePicker
                  label="End Date"
                  value={endDate ? dayjs(endDate) : null}
                  onChange={(newValue) => onEndDateChange(newValue ? newValue.format("YYYY-MM-DD") : "")}
                  slotProps={{ textField: { size: "small", fullWidth: true } }}
                  format="DD/MM/YYYY"
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
                    active={sortField === "time" || sortField === "closeTime"}
                    direction={(sortField === "time" || sortField === "closeTime") ? sortDirection : "asc"}
                    onClick={() => onSort(variant === "compact" ? "time" : "closeTime")}
                  >
                    Time
                  </TableSortLabel>
                </TableCell>

                {variant === "full" && (
                  <TableCell sx={{ color: "text.secondary", fontWeight: 500, borderColor: theme.palette.divider }}>
                    <TableSortLabel
                      active={sortField === "symbol"}
                      direction={sortField === "symbol" ? sortDirection : "asc"}
                      onClick={() => onSort("symbol")}
                    >
                      Symbol
                    </TableSortLabel>
                  </TableCell>
                )}

                <TableCell sx={{ color: "text.secondary", fontWeight: 500, borderColor: theme.palette.divider }}>
                  Type
                </TableCell>

                {variant === "full" && (
                  <>
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
                  </>
                )}

                <TableCell align="right" sx={{ color: "text.secondary", fontWeight: 500, borderColor: theme.palette.divider }}>
                  <TableSortLabel
                    active={sortField === "netProfit"}
                    direction={sortField === "netProfit" ? sortDirection : "asc"}
                    onClick={() => onSort("netProfit")}
                  >
                    Net Profit
                  </TableSortLabel>
                </TableCell>

                {variant === "compact" && (
                  <TableCell align="right" sx={{ color: "text.secondary", fontWeight: 500, borderColor: theme.palette.divider }}>
                    Balance
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {deals.map((deal, idx) => {
                return (
                  <TableRow
                    key={deal.ticket || `${deal.time}-${deal.netProfit}-${idx}`}
                    sx={{
                      "&:hover": { bgcolor: isDark ? "rgba(148, 163, 184, 0.05)" : "rgba(15, 23, 42, 0.02)" },
                    }}
                  >
                    <TableCell sx={{ fontFamily: '"Inter", monospace', fontSize: "0.75rem", color: "text.secondary", borderColor: theme.palette.divider }}>
                      {formatDateTime(variant === "compact" ? deal.time : deal.closeTime)}
                    </TableCell>

                    {variant === "full" && (
                      <TableCell sx={{ fontFamily: '"Inter", monospace', fontWeight: 500, color: "text.primary", borderColor: theme.palette.divider }}>
                        {deal.symbol || "-"}
                      </TableCell>
                    )}

                    <TableCell sx={{ borderColor: theme.palette.divider }}>
                      {renderDealTypeChip(deal.type)}
                    </TableCell>

                    {variant === "full" && (
                      <>
                        <TableCell align="right" sx={{ fontFamily: '"Inter", monospace', fontSize: "0.8rem", borderColor: theme.palette.divider }}>
                          {deal.openPrice?.toFixed(5) ?? "-"}
                        </TableCell>
                        <TableCell align="right" sx={{ fontFamily: '"Inter", monospace', fontSize: "0.8rem", borderColor: theme.palette.divider }}>
                          {deal.closePrice?.toFixed(5) ?? "-"}
                        </TableCell>
                        <TableCell align="right" sx={{ fontFamily: '"Inter", monospace', color: "text.primary", borderColor: theme.palette.divider }}>
                          {deal.volume?.toFixed(2) ?? "0.00"}
                        </TableCell>
                      </>
                    )}

                    <TableCell
                      align="right"
                      sx={{
                        fontFamily: '"Inter", monospace',
                        fontWeight: 600,
                        color: getDealProfitColor(deal.netProfit),
                        borderColor: theme.palette.divider,
                      }}
                    >
                      {deal.netProfit > 0 ? "+" : ""}${deal.netProfit.toFixed(2)}
                    </TableCell>

                    {variant === "compact" && (
                      <TableCell align="right" sx={{ fontFamily: '"Inter", monospace', color: "text.primary", fontWeight: 500, borderColor: theme.palette.divider }}>
                        ${deal.balance?.toFixed(2) ?? "0.00"}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
              
              {deals.length === 0 && (
                <TableRow>
                  <TableCell colSpan={variant === "compact" ? 4 : 7} align="center" sx={{ py: 4 }}>
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
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ display: { xs: 'none', md: 'block' }, borderBottom: `1px solid ${theme.palette.divider}` }}
        />

        {/* Mobile Card View */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 1.5 }}>
          {deals.map((deal, idx) => {
            const isPositive = deal.netProfit > 0;
            const isNegative = deal.netProfit < 0;
            
            let profitColor = "text.primary";
            if (isPositive) profitColor = "success.main";
            else if (isNegative) profitColor = "error.main";

            return (
              <Paper
                key={deal.ticket || `${deal.time}-${deal.netProfit}-${idx}`}
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
                    {variant === "full" && (
                      <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: "text.primary" }}>
                        {deal.symbol || "-"}
                      </Typography>
                    )}
                    <Box sx={{ mb: 0.5 }}>{renderDealTypeChip(deal.type)}</Box>
                    <Typography variant="caption" sx={{ color: "text.secondary", fontFamily: '"Inter", monospace' }}>
                      {formatDateTime(variant === "compact" ? deal.time : deal.closeTime)}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
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
                    {variant === "compact" && (
                      <Typography variant="caption" sx={{ color: "text.secondary", display: 'block' }}>
                        Bal: ${deal.balance?.toFixed(2) ?? "0.00"}
                      </Typography>
                    )}
                  </Box>
                </Box>
                
                {variant === "full" && (
                  <>
                    <Grid container spacing={1} sx={{ mb: 1 }}>
                      <Grid size={4}>
                        <Typography variant="caption" sx={{ color: "text.secondary", display: 'block' }}>Lot</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{deal.volume?.toFixed(2) ?? "0.00"}</Typography>
                      </Grid>
                    </Grid>

                    <Grid container spacing={1}>
                      <Grid size={4}>
                        <Typography variant="caption" sx={{ color: "text.secondary", display: 'block' }}>Open</Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{deal.openPrice?.toFixed(5) ?? "-"}</Typography>
                      </Grid>
                      <Grid size={4}>
                        <Typography variant="caption" sx={{ color: "text.secondary", display: 'block' }}>Close</Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{deal.closePrice?.toFixed(5) ?? "-"}</Typography>
                      </Grid>
                      <Grid size={4} sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" sx={{ color: "text.secondary", display: 'block' }}>Ticket</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>#{deal.ticket}</Typography>
                      </Grid>
                    </Grid>
                  </>
                )}
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
            gridTemplateColumns: '1.2fr repeat(2, 1fr)',
            bgcolor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)",
            borderBottom: `1px solid ${theme.palette.divider}`,
            p: 1.5
          }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>GROUP</Typography>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', textAlign: 'right' }}>Total Trades</Typography>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', textAlign: 'right' }}>Net P/L</Typography>
          </Box>
 
          {/* PAGE Row */}
          <Box sx={{ 
            display: { xs: 'flex', md: 'grid' }, 
            flexDirection: 'column',
            gridTemplateColumns: '1.2fr repeat(2, 1fr)',
            p: 1.5,
            borderBottom: `1px solid ${theme.palette.divider}`,
            bgcolor: isDark ? 'transparent' : '#fff'
          }}>
            <Typography variant="body2" sx={{ fontWeight: 700, mb: { xs: 1, md: 0 } }}>PAGE TOTAL</Typography>
            <Box sx={{ display: 'flex', justifyContent: { xs: 'space-between', md: 'flex-end' }, alignItems: 'center' }}>
              <Typography variant="caption" sx={{ display: { md: 'none' }, color: 'text.secondary' }}>Trades</Typography>
              <Typography variant="body2" sx={{ textAlign: 'right', fontWeight: 500, fontFamily: '"Inter", monospace' }}>
                {pageTotals.totalTrades}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: { xs: 'space-between', md: 'flex-end' }, alignItems: 'center' }}>
              <Typography variant="caption" sx={{ display: { md: 'none' }, color: 'text.secondary' }}>Net P/L</Typography>
              <Typography variant="body2" sx={{ 
                textAlign: 'right', 
                fontWeight: 700, 
                color: pageTotals.netPL >= 0 ? 'success.main' : 'error.main',
                fontFamily: '"Inter", monospace',
              }}>
                {pageTotals.netPL >= 0 ? '+' : ''}${pageTotals.netPL.toFixed(2)}
              </Typography>
            </Box>
          </Box>
 
          {/* TOTAL Row */}
          <Box sx={{ 
            display: { xs: 'flex', md: 'grid' }, 
            flexDirection: 'column',
            gridTemplateColumns: '1.2fr repeat(2, 1fr)',
            p: 1.5,
            bgcolor: isDark ? "rgba(34, 211, 238, 0.08)" : "rgba(8, 145, 178, 0.05)",
          }}>
            <Typography variant="body2" sx={{ fontWeight: 700, mb: { xs: 1, md: 0 }, color: 'primary.main' }}>TOTAL SUMMARY</Typography>
            <Box sx={{ display: 'flex', justifyContent: { xs: 'space-between', md: 'flex-end' }, alignItems: 'center' }}>
              <Typography variant="caption" sx={{ display: { md: 'none' }, color: 'text.secondary' }}>Trades</Typography>
              <Typography variant="body2" sx={{ textAlign: 'right', fontWeight: 500, fontFamily: '"Inter", monospace' }}>
                {totals.totalTrades}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: { xs: 'space-between', md: 'flex-end' }, alignItems: 'center' }}>
              <Typography variant="caption" sx={{ display: { md: 'none' }, color: 'text.secondary' }}>Net P/L</Typography>
              <Typography variant="body2" sx={{ 
                textAlign: 'right', 
                fontWeight: 700, 
                color: totals.netPL >= 0 ? 'success.main' : 'error.main',
                fontFamily: '"Inter", monospace',
              }}>
                {totals.netPL >= 0 ? '+' : ''}${totals.netPL.toFixed(2)}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </CardContent>
    </Card>
  );
}
