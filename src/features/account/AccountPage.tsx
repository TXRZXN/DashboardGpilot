"use client";

import { Box, Grid } from "@mui/material";
import { useAccountViewModel } from "./hooks/use-account-view-model";
import { ProfileCard, FinancialSummary, AccountHeader, AccountTabs } from "./components";
import { BalanceChart, DataTable } from "@/shared/ui";
import type { AccountProfile, AccountFinance, GroupedTradesResponse } from "@/shared/types/api";

export interface AccountInitialData {
    profile?: AccountProfile | AccountProfile[] | null;
    finance?: AccountFinance | AccountFinance[] | null;
    tradesData?: GroupedTradesResponse | GroupedTradesResponse[] | null;
}

interface AccountPageProps {
    initialData?: AccountInitialData;
}

export function AccountPage({ initialData }: AccountPageProps) {
    const {
        // State & Loading
        loading,
        tableLoading,
        summary,
        // Financials
        realBalance,
        grossTradeProfit,
        totalDeposits,
        totalWithdrawals,
        totalProfitSharing,
        netProfit,
        growthPercent,
        // Charts & Tables
        chartData,
        trades,
        totalTrades,
        tradesTotals,
        typeOptions,
        // Actions
        refreshData,
        formatCurrency,
        // Multi-Port
        activePortIndex,
        setActivePortIndex,
        profiles,
        // Table State
        page,
        setPage,
        rowsPerPage,
        setRowsPerPage,
        typeFilter,
        setTypeFilter,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
    } = useAccountViewModel(initialData);

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, pb: 8 }}>
            <AccountHeader onRefresh={refreshData} loading={loading} />

            <AccountTabs 
                activeTab={activePortIndex} 
                onChange={(_, val) => setActivePortIndex(val)} 
                ports={profiles}
            />

            <Grid container spacing={3} alignItems="stretch">
                {/* Row 1: Profile & Financial Summary */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <ProfileCard
                        loading={loading}
                        name={summary?.name ?? ""}
                        login={summary?.login ?? 0}
                        server={summary?.server ?? ""}
                        leverage={summary?.leverage ?? 0}
                        currency={summary?.currency ?? ""}
                        sx={{ height: "100%" }}
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 8 }}>
                    <FinancialSummary
                        loading={loading}
                        realBalance={realBalance}
                        grossTradeProfit={grossTradeProfit}
                        totalDeposits={totalDeposits}
                        totalWithdrawals={totalWithdrawals}
                        totalProfitSharing={totalProfitSharing}
                        netProfit={netProfit}
                        formatCurrency={formatCurrency}
                        sx={{ height: "100%" }}
                    />
                </Grid>

                {/* Row 2: Account Growth */}
                <Grid size={{ xs: 12 }}>
                    <BalanceChart
                        loading={loading}
                        data={chartData}
                        currentBalance={realBalance}
                        change={netProfit}
                        changePercent={growthPercent}
                    />
                </Grid>

                {/* Row 3: Trade History Table */}
                <Grid size={{ xs: 12 }}>
                    <DataTable
                        variant="compact"
                        loading={tableLoading}
                        deals={trades}
                        totals={tradesTotals}
                        sortField="time"
                        sortDirection="desc"
                        onSort={() => {}}
                        hideSymbolFilter={true}
                        typeFilter={typeFilter}
                        onTypeFilterChange={setTypeFilter}
                        typeOptions={typeOptions}
                        startDate={startDate}
                        onStartDateChange={setStartDate}
                        endDate={endDate}
                        onEndDateChange={setEndDate}
                        totalCount={totalTrades}
                        page={page}
                        rowsPerPage={rowsPerPage}
                        onPageChange={setPage}
                        onRowsPerPageChange={setRowsPerPage}
                    />
                </Grid>
            </Grid>
        </Box>
    );
}
