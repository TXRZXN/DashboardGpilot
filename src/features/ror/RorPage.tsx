"use client";

import React from "react";
import { Box, Container, Grid } from "@mui/material";
import { useRagnarok } from "./hooks/useRagnarok";
import { HeroSection } from "./components/HeroSection";
import { GodsPantheon } from "./components/GodsPantheon";
import { TheAltar } from "./components/TheAltar";
import { LoginSection } from "./components/LoginSection";
import { ValhallaBoard } from "./components/ValhallaBoard";

import { FooterSection } from "./components/FooterSection";

export const RecordOfRagnarok: React.FC = () => {
    const { 
        pledgeData, 
        handlePledgeChange, 
        gods, 
        rankingData, 
        isLoggedIn, 
        authLoading, 
        login,
        workflow,
        setWorkflow,
        tfaProviders,
        verify2faGoogle,
        verify2faSms,
        error,
        setError,
        filteredAccounts
    } = useRagnarok();


    return (
        <Box
            sx={{
                minHeight: "100vh",
                backgroundColor: "#010409",
                backgroundImage: "radial-gradient(circle at 50% 50%, #0d1117 0%, #010409 100%)",
                color: "#fff",
                pb: 10,
                pt: 4,
            }}
        >
            <Container maxWidth="xl">
                {/* HERO SECTION */}
                <Grid container spacing={4} sx={{ mb: 6 }}>
                    <HeroSection />
                </Grid>

                {/* BOTTOM SECTION */}
                <Grid container spacing={4}>
                    {/* GODS PANTHEON GRID */}
                    <GodsPantheon gods={gods} rankingData={rankingData} />

                    {/* ALTAR AND LEADERBOARD */}
                    <Grid size={{ xs: 12, lg: 12 }}>
                        <Grid container spacing={4}>
                            {/* THE ALTAR / LOGIN */}
                            {isLoggedIn ? (
                                <TheAltar
                                    pledgeData={pledgeData}
                                    onPledgeChange={handlePledgeChange}
                                    gods={gods}
                                    accounts={filteredAccounts}
                                />
                            ) : (
                                <LoginSection 
                                    onLogin={login} 
                                    onVerify2fa={verify2faGoogle}
                                    onVerify2faSms={verify2faSms}
                                    isLoading={authLoading} 
                                    workflow={workflow}
                                    onSelectWorkflow={setWorkflow}
                                    tfaProviders={tfaProviders}
                                    error={error}
                                    onClearError={() => setError(null)}
                                />
                            )}


                            {/* LEADERBOARD */}
                            <ValhallaBoard rankingData={rankingData} />
                        </Grid>
                    </Grid>
                </Grid>

                {/* FOOTER */}
                <FooterSection />
            </Container>
        </Box>
    );
};
