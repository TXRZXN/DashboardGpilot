"use client";

import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Stack, 
  Alert, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Skeleton,
  CircularProgress,
  Divider,
  useTheme,
  useMediaQuery
} from "@mui/material";
import { 
  Sync as SyncIcon, 
  FileDownload as ExportIcon, 
  ErrorOutline as ErrorIcon, 
  CheckCircleOutline as SuccessIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  ChevronLeft,
  ChevronRight
} from "@mui/icons-material";
import { useState, useEffect, useCallback, useMemo } from "react";
import { TradeHistoryService } from "@/shared/services/trade-history-service";
import { createLogger } from "@/shared/utils/logger";
import { ReferralSyncSummary, ReferralSyncTrade } from "@/shared/types/api";
import { getMostRecentMonday, getEndOfWeek, addDays, toISODateString } from "@/shared/utils/date-utils";

const logger = createLogger("ReferralSyncCard");

/**
 * ฟอร์แมตวันที่แบบไทยโดยใช้ Intl (ลดการพึ่งพา library ภายนอก)
 */
const formatDate = (date: string | Date, includeTime = true) => {
  const d = new Date(date);
  return new Intl.DateTimeFormat('th-TH', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: includeTime ? '2-digit' : undefined,
    minute: includeTime ? '2-digit' : undefined,
  }).format(d);
};

export function ReferralSyncCard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  
  const [anchorDate, setAnchorDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [data, setData] = useState<ReferralSyncSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentMonday = useMemo(() => getMostRecentMonday(anchorDate), [anchorDate]);
  const currentSunday = useMemo(() => getEndOfWeek(anchorDate), [anchorDate]);

  const fetchHistory = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError(null);
    try {
      const response = await TradeHistoryService.getReferralHistory({
        from_date: toISODateString(currentMonday),
        to_date: toISODateString(currentSunday)
      });
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError(response.error?.message ?? "ไม่สามารถดึงข้อมูลประวัติได้");
      }
    } catch (e) {
      logger.error("Fetch history error", e instanceof Error ? e : String(e));
      setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [currentMonday, currentSunday]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handlePrevWeek = () => setAnchorDate(prev => addDays(prev, -7));
  const handleNextWeek = () => setAnchorDate(prev => addDays(prev, 7));
  const handleResetWeek = () => setAnchorDate(new Date());

  const isCurrentWeek = getMostRecentMonday(new Date()).getTime() === currentMonday.getTime();

  const handleSync = async () => {
    setSyncing(true);
    setError(null);
    try {
      const response = await TradeHistoryService.syncReferralTrades();
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError(response.error?.message ?? "การซิงค์ข้อมูลล้มเหลว");
      }
    } catch (e) {
      logger.error("Sync error", e instanceof Error ? e : String(e));
      setError("เกิดข้อผิดพลาดในการซิงค์ข้อมูล");
    } finally {
      setSyncing(false);
    }
  };

  const handleExport = () => {
    if (!data?.trades.length) return;

    // Create CSV content
    const headers = ["วันที่", "Account ID", "Email", "ยอดที่หัก (USD)", "สถานะ", "หมายเหตุ"];
    const rows = data.trades.map(t => [
      formatDate(t.date),
      t.accountId,
      t.email,
      t.amount.toFixed(2),
      t.status === 'success' ? 'สำเร็จ' : 'ล้มเหลว',
      t.error ?? ''
    ]);

    const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `referral_sync_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderSkeleton = () => (
    <Stack spacing={2}>
      <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 3 }} />
      <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 3 }} />
    </Stack>
  );

  return (
    <Card sx={{ borderRadius: 4, overflow: 'hidden' }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ 
              p: 1, 
              borderRadius: 2, 
              bgcolor: 'primary.main', 
              color: 'white',
              display: 'flex'
            }}>
              <PeopleIcon fontSize="small" />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                ระบบซิงค์ข้อมูลเพื่อน
              </Typography>
              {data?.lastSync && (
                <Typography variant="caption" sx={{ color: "text.secondary", display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <ScheduleIcon sx={{ fontSize: 12 }} /> 
                  ซิงค์ล่าสุด: {formatDate(data.lastSync)}
                </Typography>
              )}
            </Box>
          </Stack>
          
          <Stack direction="row" spacing={1}>
            <Tooltip title="ส่งออก Excel">
              <span>
                <IconButton 
                  onClick={handleExport} 
                  disabled={loading || syncing || !data?.trades.length}
                  sx={{ border: '1px solid', borderColor: 'divider' }}
                >
                  <ExportIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Button 
              variant="contained" 
              size={isMobile ? "small" : "medium"}
              startIcon={syncing ? <CircularProgress size={18} color="inherit" /> : <SyncIcon />}
              onClick={handleSync}
              disabled={loading || syncing}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            >
              {syncing ? "กำลังซิงค์..." : "ซิงค์ด่วน"}
            </Button>
          </Stack>
        </Box>

        {/* Date Navigation */}
        <Box sx={{ 
          mb: 3, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          bgcolor: 'rgba(255,255,255,0.03)',
          p: 1.5,
          borderRadius: 2,
          border: '1px solid rgba(255,255,255,0.05)'
        }}>
          <IconButton onClick={handlePrevWeek} size="small" sx={{ color: 'text.secondary' }}>
            <ChevronLeft />
          </IconButton>
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main', mb: 0.5 }}>
              สัปดาห์วันที่ {formatDate(currentMonday, false)} - {formatDate(currentSunday, false)}
            </Typography>
            {!isCurrentWeek && (
              <Button 
                variant="text"
                size="small" 
                onClick={handleResetWeek}
                sx={{ fontSize: '10px', height: 18, p: 0, minWidth: 0, textTransform: 'none', color: 'text.secondary' }}
              >
                กลับสู่สัปดาห์ปัจจุบัน
              </Button>
            )}
          </Box>

          <IconButton 
            onClick={handleNextWeek} 
            size="small" 
            sx={{ color: 'text.secondary' }}
            disabled={isCurrentWeek}
          >
            <ChevronRight />
          </IconButton>
        </Box>

        {loading ? renderSkeleton() : (
          <Stack spacing={3}>
            {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

            {/* Weekly Summary Card */}
            <Box sx={{ 
              p: 2.5, 
              borderRadius: 4, 
              background: theme.palette.mode === 'dark' 
                ? 'linear-gradient(135deg, rgba(34, 211, 238, 0.1) 0%, rgba(34, 211, 238, 0.02) 100%)'
                : 'linear-gradient(135deg, rgba(34, 211, 238, 0.05) 0%, rgba(255, 255, 255, 1) 100%)',
              border: '1px solid',
              borderColor: 'rgba(34, 211, 238, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <Box>
                <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                  COMMISSION THIS WEEK
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'text.primary' }}>
                  ${data?.totalThisWeek.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </Typography>
              </Box>
              <Box sx={{ 
                p: 1.5, 
                borderRadius: '50%', 
                bgcolor: 'rgba(34, 211, 238, 0.1)',
                color: 'primary.main'
              }}>
                <TrendingUpIcon fontSize="large" />
              </Box>
            </Box>

            {/* Details Table */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                รายละเอียดการซิงค์ข้อมูล
              </Typography>
              
              <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                <Table size={isMobile ? "small" : "medium"}>
                  <TableHead sx={{ bgcolor: 'action.hover' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Account ID / Email</TableCell>
                      {!isMobile && <TableCell sx={{ fontWeight: 700 }} align="right">วันที่</TableCell>}
                      <TableCell sx={{ fontWeight: 700 }} align="right">ยอดที่หัก</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="center">สถานะ</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data?.trades.map((trade, index) => (
                      <TableRow key={`${trade.accountId}-${index}`} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {trade.accountId.slice(0, 4)}XXXX{trade.accountId.slice(-2)}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                            {trade.email}
                          </Typography>
                        </TableCell>
                        {!isMobile && (
                          <TableCell align="right">
                            <Typography variant="caption">
                              {formatDate(trade.date)}
                            </Typography>
                          </TableCell>
                        )}
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 700, color: trade.status === 'success' ? 'success.main' : 'text.disabled' }}>
                            ${trade.amount.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          {trade.status === 'success' ? (
                            <Tooltip title="ซิงค์สำเร็จ">
                              <SuccessIcon color="success" fontSize="small" />
                            </Tooltip>
                          ) : (
                            <Tooltip title={trade.error ?? "เกิดข้อผิดพลาด"}>
                              <ErrorIcon color="error" fontSize="small" />
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!data?.trades || data.trades.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            ไม่พบข้อมูลการซิงค์ในขณะนี้
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Stack>
        )}
      </CardContent>
      <Divider />
      <Box sx={{ p: 2, bgcolor: 'action.hover' }}>
         <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center', display: 'block' }}>
           ระบบจะทำการซิงค์ข้อมูล Profit Sharing ประจำสัปดาห์โดยอัตโนมัติทุกวันอังคาร
         </Typography>
      </Box>
    </Card>
  );
}
