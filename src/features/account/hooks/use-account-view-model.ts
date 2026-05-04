"use client";

import { useMemo } from "react";
import { useAccountData } from "./use-account-data";
import { useAccountTable, AccountTradeType } from "./use-account-table";

export function useAccountViewModel() {
    const tableState = useAccountTable();

    const tableParams = useMemo(
        () => ({
            page: tableState.page + 1,
            limit: tableState.rowsPerPage,
            symbol: tableState.symbolFilter,
            type: tableState.typeFilter === "ALL" ? null : (tableState.typeFilter as string),
            from_date: tableState.startDate,
            to_date: tableState.endDate,
        }),
        [
            tableState.page,
            tableState.rowsPerPage,
            tableState.symbolFilter,
            tableState.typeFilter,
            tableState.startDate,
            tableState.endDate,
        ]
    );

    const accountData = useAccountData(tableParams);

    const chartData = useMemo(() => {
        if (!accountData.equityCurve || accountData.equityCurve.length === 0) return [];
        return accountData.equityCurve.map((p) => ({
            date: new Date(p.time).toLocaleDateString("en-US", { month: "short", day: "2-digit" }),
            time: p.time,
            balance: p.equity,
        }));
    }, [accountData.equityCurve]);

    const typeOptions = useMemo(
        () => [
            { label: "All Types", value: "ALL" as AccountTradeType },
            { label: "Trade", value: "Trade" as AccountTradeType },
            { label: "Deposit", value: "Deposit" as AccountTradeType },
            { label: "Profit Share", value: "ProfitShare" as AccountTradeType },
            { label: "Withdraw", value: "Withdraw" as AccountTradeType },
        ],
        []
    );

    const growthPercent = useMemo(() => {
        const { realBalance, netProfit } = accountData;
        if (realBalance > 0) {
            return Number(((netProfit / (realBalance - netProfit)) * 100).toFixed(2));
        }
        return 0;
    }, [accountData.realBalance, accountData.netProfit]);

    return {
        ...accountData,
        ...tableState,
        chartData,
        typeOptions,
        growthPercent,
    };
}
