import { useState } from "react";

export type AccountTradeType = "ALL" | "Trade" | "Deposit" | "ProfitShare" | "Withdraw";

export function useAccountTable() {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [symbolFilter, setSymbolFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState<AccountTradeType>("ALL");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    return {
        page,
        setPage,
        rowsPerPage,
        setRowsPerPage,
        symbolFilter,
        setSymbolFilter,
        typeFilter,
        setTypeFilter,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
    };
}

