import { Box } from "@mui/material";
import { Sidebar } from "@/layouts/sidebar";
import { TopBar } from "@/layouts/top-bar"; 
import { BottomNav } from "@/shared/ui/bottom-nav";
import { TradeDataProvider } from "@/shared/providers/trade-data-provider";

export default function GpilotLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <TradeDataProvider>
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar />
        <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", ml: { lg: "256px" }, pb: { xs: "80px", lg: 0 } }}>
          <TopBar />
          <Box component="main" sx={{ flexGrow: 1 }}>
            {children}
          </Box>
        </Box>
        <BottomNav />
      </Box>
    </TradeDataProvider>
  );
}
