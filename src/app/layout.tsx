import { Inter, Manrope } from "next/font/google";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ThemeProvider } from "@/shared/ui/theme-provider";
import { ApiHealthProvider } from "@/shared/providers/api-health-provider";
import { QueryProvider } from "@/shared/providers/QueryProvider";
import { AuthProvider } from "@/shared/providers/auth-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata = {
  title: "GPilot Product",
  description: "Advanced Trading Terminal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${manrope.variable} antialiased`}>
        <AppRouterCacheProvider>
          <ThemeProvider>
            <AuthProvider>
              <QueryProvider>
                <ApiHealthProvider>
                  {children}
                </ApiHealthProvider>
              </QueryProvider>
            </AuthProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
