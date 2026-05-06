import { Box, Tabs, Tab } from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

interface AccountTabsProps {
    activeTab: number;
    onChange: (event: React.SyntheticEvent, newValue: number) => void;
    ports: { mt5Id: number | string; caption?: string }[];
}

export function AccountTabs({ activeTab, onChange, ports }: AccountTabsProps) {
    if (ports.length <= 1) return null;

    return (
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
            <Tabs
                value={activeTab}
                onChange={onChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                    "& .MuiTab-root": {
                        textTransform: "none",
                        fontWeight: 500,
                        fontSize: "0.875rem",
                        minHeight: 48,
                        gap: 1,
                        color: "rgba(255, 255, 255, 0.6)",
                    },
                    "& .Mui-selected": {
                        fontWeight: 700,
                        color: "#fff !important",
                    },
                    "& .MuiTabs-indicator": {
                        backgroundColor: "#fff",
                    }
                }}
            >
                {ports.map((port) => (
                    <Tab
                        key={port.mt5Id}
                        icon={<AccountBalanceWalletIcon sx={{ fontSize: 18 }} />}
                        iconPosition="start"
                        label={`Port: ${port.caption || port.mt5Id}`}
                    />
                ))}
            </Tabs>
        </Box>
    );
}
