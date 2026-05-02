"use client";

import { Box, Typography, Grid, Alert } from "@mui/material";
import { useRouter } from "next/navigation";
import { ProductCard } from "./components/ProductCard";
import { useDashboardData } from "./hooks/use-dashboard-data";
import { useAuth } from "@/shared/providers/auth-provider";
import { 
  SERVICE_BASE_GPILOT, 
  SERVICE_BASE_SAFEGROW, 
  SERVICE_BASE_HQULTIMATE, 
  SERVICE_BASE_PPVP, 
  SERVICE_BASE_GOLDENBOY 
} from "@/shared/api/endpoint";

// --- Configuration ---

type AppRole = 'A' | 'B' | 'Admin';

interface ProductInfo {
  id: string;
  title: string;
  initials: string;
  serviceBase: string;
}

const PRODUCTS: Record<string, ProductInfo> = {
  safegrow: { id: 'safegrow', title: 'Safe Grow', initials: 'SG', serviceBase: SERVICE_BASE_SAFEGROW },
  gpilot: { id: 'gpilot', title: 'Gpilot', initials: 'GP', serviceBase: SERVICE_BASE_GPILOT },
  hqultimate: { id: 'hqultimate', title: 'hqultimate', initials: 'HQ', serviceBase: SERVICE_BASE_HQULTIMATE },
  ppvp: { id: 'ppvp', title: 'PPVP', initials: 'PP', serviceBase: SERVICE_BASE_PPVP },
  goldenboy: { id: 'goldenboy', title: 'GoldenBoy', initials: 'GB', serviceBase: SERVICE_BASE_GOLDENBOY },
};

// --- Sub-components ---

function DashboardCard({ 
  product, 
  onCardClick 
}: { 
  product: ProductInfo; 
  onCardClick: (name: string, serviceBase: string) => void;
}) {
  const { loading, error, summary, formatCurrency } = useDashboardData(product.serviceBase);
  
  return (
    <Grid size={{ xs: 12, md: 6 }}>
      {error && (
        <Alert severity="warning" sx={{ mb: 1, py: 0, fontSize: '0.75rem' }}>
          {product.title}: API Offline (Using Mock)
        </Alert>
      )}
      <ProductCard
        title={product.title}
        initials={product.initials}
        avgMonthProfit={summary?.avgProfitMonth ?? 0}
        percentDD={summary?.DD ?? 0}
        loading={loading}
        formatCurrency={formatCurrency}
        onClick={() => onCardClick(product.title, product.serviceBase)}
      />
    </Grid>
  );
}

// --- Main Page ---

export function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  if (!user) return null; // สามารถเพิ่ม Loading Skeleton ที่นี่ได้

  const visibleProducts = user.menu.dashboard
    .map(key => PRODUCTS[key.toLowerCase()])
    .filter(Boolean);

  const handleCardClick = (productName: string, serviceBase: string) => {
    // ส่งข้อมูลไปกับ URL เพื่อให้หน้า Detail ใช้ยิง API ถูกเส้น
    router.push(`/product-detail?name=${encodeURIComponent(productName)}&base=${encodeURIComponent(serviceBase)}`);
  };

  return (
    <Box sx={{ p: { xs: 2, lg: 3 }, flex: 1 }}>
      <Box sx={{ mb: { xs: 2, lg: 3 }, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontFamily: 'var(--font-manrope)',
              fontWeight: 700,
              color: "text.primary",
              fontSize: { xs: "1.25rem", lg: "1.5rem" },
            }}
          >
            Product Dashboard
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
            Select a product to view detailed performance metrics
          </Typography>
        </Box>
        <Typography 
          variant="caption" 
          sx={{ 
            bgcolor: 'primary.main', 
            color: 'white', 
            px: 1.5, 
            py: 0.5, 
            borderRadius: 1, 
            fontWeight: 700,
            textTransform: 'uppercase'
          }}
        >
          Role: {user.role}
        </Typography>
      </Box>

      <Grid container spacing={{ xs: 2, lg: 3 }}>
        {visibleProducts.map((product) => (
          <DashboardCard 
            key={product.id} 
            product={product} 
            onCardClick={handleCardClick} 
          />
        ))}
      </Grid>
    </Box>
  );
}
