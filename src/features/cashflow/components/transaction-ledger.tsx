"use client";

import { useState } from "react";
import { 
  Card, 
  CardContent, 
  Box, 
  Typography, 
  Chip, 
  Skeleton, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  TablePagination,
  Paper,
  Avatar
} from "@mui/material";
import { 
  CallReceived as CallReceivedIcon, 
  CallMade as CallMadeIcon, 
  CheckCircle as CheckCircleIcon, 
  AccessTime as AccessTimeIcon, 
  Cancel as CancelIcon 
} from "@mui/icons-material";
import type { Transaction } from "../hooks/use-cashflow-data";

interface TransactionLedgerProps {
  readonly loading?: boolean;
  readonly transactions: readonly Transaction[];
}

const statusConfig = {
  completed: { icon: CheckCircleIcon, color: "#10B981", bgColor: "rgba(16, 185, 129, 0.2)" },
  pending: { icon: AccessTimeIcon, color: "#22D3EE", bgColor: "rgba(34, 211, 238, 0.2)" },
  failed: { icon: CancelIcon, color: "#EF4444", bgColor: "rgba(239, 68, 68, 0.2)" },
};

export function TransactionLedger({ loading, transactions }: Readonly<TransactionLedgerProps>) {
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  if (loading) {
    return (
      <Card>
        <CardContent sx={{ p: { xs: 2, lg: 3 } }}>
          <Skeleton variant="text" width="30%" height={24} sx={{ mb: 2 }} />
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} variant="rectangular" height={52} sx={{ mb: 1, borderRadius: 1 }} />
          ))}
        </CardContent>
      </Card>
    );
  }

  const paginatedTransactions = transactions.slice(
    page * rowsPerPage,
    (page + 1) * rowsPerPage
  );

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ p: { xs: 2, lg: 3 }, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, color: "text.primary", fontSize: '1.1rem' }}
          >
            Transaction Ledger
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Complete history of deposits, withdrawals and transfers
          </Typography>
        </Box>

        <TableContainer component={Paper} elevation={0} sx={{ 
          bgcolor: 'transparent',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          overflowX: 'auto'
        }}>
          <Table sx={{ minWidth: 650 }} aria-label="transaction ledger table">
            <TableHead>
              <TableRow sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}>
                <TableCell sx={{ fontWeight: 600, py: 2 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Method</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedTransactions.map((tx) => {
                const statusKey = tx.status.toLowerCase() as keyof typeof statusConfig;
                const status = statusConfig[statusKey] || statusConfig.completed;
                const StatusIcon = status.icon;

                return (
                  <TableRow
                    key={tx.id}
                    hover
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell sx={{ py: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: 
                              tx.type === "ProfitSharing" || tx.type.toLowerCase() === "withdrawal" ? "rgba(239, 68, 68, 0.15)" :
                              tx.type.toLowerCase() === "deposit" ? "rgba(16, 185, 129, 0.15)" : 
                              "rgba(255, 255, 255, 0.15)", // Fallback
                            color: 
                              tx.type === "ProfitSharing" || tx.type.toLowerCase() === "withdrawal" ? "error.main" :
                              tx.type.toLowerCase() === "deposit" ? "success.main" : 
                              "text.primary",
                          }}
                        >
                          {tx.type === "ProfitSharing" || tx.type.toLowerCase() === "withdrawal" ? (
                            <CallMadeIcon sx={{ fontSize: 18 }} />
                          ) : (
                            <CallReceivedIcon sx={{ fontSize: 18 }} />
                          )}
                        </Avatar>
                        <Typography sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
                          {tx.type === "ProfitSharing" ? "Profit Sharing" : tx.type}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.875rem' }}>{tx.method}</TableCell>
                    <TableCell sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>{tx.date}</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                        <Typography
                        component="span"
                        sx={{
                          fontWeight: 600,
                          color: tx.type === "ProfitSharing" || tx.type.toLowerCase() === "withdrawal" ? "error.main" : "success.main",
                          fontSize: 'inherit'
                        }}
                      >
                        {tx.type === "ProfitSharing" || tx.type.toLowerCase() === "withdrawal" ? "-" : "+"}${tx.amount.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={<StatusIcon sx={{ fontSize: 14, color: `${status.color} !important` }} />}
                        label={tx.status}
                        size="small"
                        sx={{
                          bgcolor: status.bgColor,
                          color: status.color,
                          fontWeight: 600,
                          fontSize: "0.75rem",
                          textTransform: "capitalize",
                          borderRadius: '6px',
                          border: `1px solid ${status.color}20`,
                          "& .MuiChip-icon": {
                            ml: 0.5,
                          },
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
              {paginatedTransactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No transactions found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[10]}
          component="div"
          count={transactions.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          sx={{
            borderTop: 'none',
            '.MuiTablePagination-toolbar': {
              minHeight: 52,
            }
          }}
        />
      </CardContent>
    </Card>
  );
}
