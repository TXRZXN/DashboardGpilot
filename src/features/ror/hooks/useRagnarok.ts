import { useState, useEffect, useCallback, useMemo } from "react";
import { RorService } from "@/shared/services/ror-service";
import { useToast } from "@/shared/hooks/use-toast";
import { FingerprintUtils } from "@/shared/utils/fingerprint";

export const useRagnarok = () => {
    const { toast } = useToast();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [authLoading, setAuthLoading] = useState(false);
    const [uuid, setUuid] = useState<string | null>(null);
    const [accounts, setAccounts] = useState<any[]>([]);

    const [pledgeData, setPledgeData] = useState({
        investorId: "",
        god: "",
    });

    const [workflow, setWorkflow] = useState<string | null>(null);
    const [tfaProviders, setTfaProviders] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    const GOD_PORT_MAPPING: Record<string, string> = {
        "THOR": "2121984341",
        "LOKI": "",
        "HEIMDALL": "",
        "ODIN": "",
    };

    const gods = [
        {
            name: "THOR",
            type: "AGGRESSIVE",
            roi: "450%",
            winRate: "72%",
            signature: "Lightning",
            color: "#ef4444",
            image: "/ror/thor.jpg",
        },
        {
            name: "LOKI",
            type: "TACTICAL",
            roi: "389%",
            winRate: "68%",
            signature: "Smoke",
            color: "#22c55e",
            image: "/ror/logi.jpg",
        },
        {
            name: "HEIMDALL",
            type: "BALANCED",
            roi: "290%",
            winRate: "56%",
            signature: "Bifrost Light",
            color: "#38bdf8",
            image: "/ror/humdal.jpg",
        },
        {
            name: "ODIN",
            type: "STRATEGIC",
            roi: "510%",
            winRate: "75%",
            signature: "Runic",
            color: "#a855f7",
            image: "/ror/odin.jpg",
        },
    ];

    const rankingData = [
        { rank: 1, god: "Odin", roi: 510, winRate: 50, followers: 2008, color: "#a855f7", avatar: "/ror/odin.jpg" },
        { rank: 2, god: "Loki", roi: 380, winRate: 68, followers: 333, color: "#22c55e", avatar: "/ror/logi.jpg" },
        {
            rank: 3,
            god: "Heimdall",
            roi: 290,
            winRate: 30,
            followers: 129,
            color: "#38bdf8",
            avatar: "/ror/humdal.jpg",
        },
        { rank: 4, god: "Thor", roi: 236, winRate: 30, followers: 136, color: "#ef4444", avatar: "/ror/thor.jpg" },
    ];

    const handlePledgeChange = (field: string, value: string) => {
        setPledgeData((prev) => {
            const newData = { ...prev, [field]: value };
            // ล้างค่า investorId เมื่อมีการเปลี่ยนเทพ
            if (field === "god") {
                newData.investorId = "";
            }
            return newData;
        });
    };

    const filteredAccounts = useMemo(() => {
        if (!pledgeData.god || !accounts) return [];
        
        const targetPort = GOD_PORT_MAPPING[pledgeData.god];
        if (!targetPort) return [];

        return accounts.filter((acc) => {
            const isPammInvestor = acc.group?.type === "pammInvestor";
            const isMatchingPort = acc.caption === targetPort;
            const hasEnoughBalance = parseFloat(acc.statement?.currentBalance || "0") > 100;
            
            return isPammInvestor && isMatchingPort && hasEnoughBalance;
        });
    }, [pledgeData.god, accounts]);

    const fetchAccounts = useCallback(async () => {
        const res = await RorService.getAccounts();
        if (res.success && res.data) {
            setAccounts(res.data.data);
            console.log("ROR Accounts fetched:", res.data.data);
        }
    }, []);

    const login = useCallback(async (email: string, pass: string) => {
        try {
            setAuthLoading(true);
            setError(null);
            
            // 1. ตรวจสอบว่ามี UUID หรือยัง ถ้าไม่มีให้ลองดึงใหม่
            let currentUuid = uuid;
            if (!currentUuid) {
                const wizardRes = await RorService.getWizard();
                if (wizardRes.success && wizardRes.data) {
                    currentUuid = wizardRes.data.uuid;
                    setUuid(currentUuid);
                } else {
                    throw new Error(wizardRes.error?.message || "Failed to get session ID");
                }
            }

            // 2. Generate Device Fingerprint JWT
            const fingerprintData = FingerprintUtils.collect();
            const fingerprintJwt = await FingerprintUtils.signPayload(fingerprintData);
            const fingerprintJwtMock = "eyJjYW52YXNDb2RlIjoiZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFQQUFBQUNNQ0FZQUFBQkN0U1FvQUFBUUFFbEVRVlI0QWV5ZGI2d2R4WG5HNTVpVU5OQ2lVdjdGbERqSEtXNzVFME5VMFpoK0NGeEtTeUVJVUtuYWtDWVE4eUVHZ1NPYUNrUWtvdnBRaGRaUmFKUUtxREQ1WUVOUUlaVUtnaWpCVUlFdlJHb2h4QktGWUtjdDRWNVE1ZFlHaEFQQmlVM2l6Zk03ZC9mZWUrN2RjODd1N096dTdONjVtdmZPbnQxNTMzbmZaK2M1TXpzN3UyZVo4Znd2TXRGeXlYbVM2eVMzU1I2U1BDdVprcndwMlM4NUdBdmI3T01ZWlNpTERycllXRDQvWE9sMFk1bFF2aUdXYmNvVHdRNFNhVjhpZkU0a0tVZStXV1hXeGpJeHY1NytkaFF0TjFGMG51UTZ5VzJTaHlUUFNxWWtiMHIyU3c3R3dqYjdPRVlaeXFLRExqWUc0dWpiRC8rV0pBTGVFVmdFT0VseWplUSt5WlRPeWk3Sm81S3ZTZFpMTHBhY0llbEtma055cUtRVEM5dnM0eGhsS0lzT3V0allKWnNRZkxmeVNEcllSN1pwdXhjTDVFc0VPNGdPelNZK0o1S1VJMStyRXB0ajJiWlRUTHoxaU9qMTgwK0xkaDl6V2ZTMjJXS2N4aUh6a1BzKzVkZElUakk1L3FKMTBsaUNrZ09peGhUMWdzQ1JpZFpJTmtwZUZISTdKWGRJTHBOQUZHVk9Fd1EvMXFuRjJOZ3p5cjhnT1ZWeXN1VDZ0OHhSVzU4M3g3NTJ2L2sxYzZWMjhEV3pVam5iVzVSUFN1d1QySUFSV1BGOThhSm91Vkd5eHQ1azBHd2FBclVSV0dROVduSzk1RG1COXJUa1Jza3Bra2FsMStYdHJaS1BTTTZVZkZteVF6STBUZXNJNUlYRTUyZ2JRdCtzdkJpWlpjQ0FIUmcrTFJJL0o3bGVjalFIZ3JRWGdjb0pMTUt1bHR3cFNQZEl2aUk1WFZKSEtsVG5DOUsrV2tKWGZvUHkvNVJZSlFqZGsrWjhNck5QdXdva01BWGJQU0x4blpMVkJXd0ZWWThScUl6QWtZa2c3ajNDNG5uSlZSSUdsTXFhbFNEdUZYTDVOTWttQ1JmU3l0d2tpTnVUS1hwbGhKNWFId3NrTUFicjUwWGlleVNCeUFYQTlGRzFkQUpISm1Lb2ZKdUNoN2lYSzI5a2VrTmVmMDRDY2IraHZQUUVtUmxtUTJTRzJNVXJCSHVJZkJ2RC91TG1nZ1VmRUNpVndDTHZOUXJ5ZnlUTUJDdHJadm9udVgyaTVIWko1UWtpOTFSclFtUSs2Mk9CdEg2VmxJbEpXVWdOUjZBVUFrY200bGJRZDRUTkhSSm1mWlUxTC8xUUxsOGd1VmF5VjFKcmdyZzllY0MxTWoweW4vWFJKdTAxeGhEVHg2Vk1qTXBDYWlnQ3pna2NtZWl6d29JNUhkcStOcHVadmk2M21RbmFxdHlyQkhGNzhpZ2hzalp0MHlOU0pFWmkxV1pJRFVUQUtZRWpFekc3Zkpkd1lFR0ZzbVltWnBmWHlmVURFbTlUUW1TRzFnVnVRUkVqc1JLenQ3RUd4NFlpNElUQUl1NEt5Wk9xaFJsUFpjMU1yOHJ0c3lYTUxpdHJSb0xJOU1aTWVMRnQ2VFV4RXpzWVdKb0lhalVnVUpqQUlpNHJmeUR2V1RYNDc2eEtWbEVSd0ZQT0xGWnNpRnRPRUpuclk4dXFpUjBNd01MU1JCUFVXdVZqSVFLTHZPY0pqY2NsTE90VDFzejBtTncrVi9LS3BOR0pIcmluQ0NBeTI5ck1tOEFBTE1Ba3IyNG9YejBDMWdTT1RIU2gzR1dPNTNEbGpVM2ZsdWZuUzk2UnRDWnhUUXlKNlpVdGdnSUxNQUViQy9XZ1VpRUNWZ1FXZWVsNXZ5VS9XZW1qckptSlh1WWl1ZTUwTlpYc2VaSG9nUmxPSXhZT2dRbllnSkdGZWxDcENJSGNCQlo1dWVaOVFQNDFtcnhjNTEycUlHaW95dHFaSUhGUG9URlR6YlkyOHlTd0FTT3d5cU1YeWxhSFFDNENSeVphSWRmdWx6UjYyTXhNNnljVUJFTkZaZTFQa0pjaE5Ybk9hTUVJck1Bc3Ayb29YZ0VDdVFnc2YxZ0czT2dKSzhWZ1dCVE1aQTNiUzBZZ0x5VG0ramhuMEdBRlpqblZRdkVLRU1oTTRHaG1rUVozR1Nwd3E3d3FXTERBN1pMeWF2RFlNaVRtZnZIMi9ENkNHZGpsMXd3YVpTS1FpY0FpTDhzakc3MUlBeEJaTXNpQ0JiYVhyRURpLzFiMEZpUUdPekNVZGtpZUlEQ1d3Q0l2NzF1cTVVRWNseGl4YUwvWUkxRXV2YW5aMXR1YW50b3VPVjZ5S1orczJ4UWQ2R3lLVHU3Y1pUcE5rNXBSTDZYNnNRUldyVitWTkhwdHMvdzNuOWMvMXYwcUN5bEJvS2VOL0xlWmFBdTBDU21IVkRjQ0l3a2NtWWpuZVJ2OVZCRUE4K3dySzA3WURySUFnWjQrNXlmeEJTYnF0dzBwaDFRbkFrTUpISm1JRjZMZFVxZHpMdXJtN1JNM3VURFVaaHVzMk1wUDRsdEVZdHBJbTVIeFByYWhCSmJuR3lTTmZSaGZ2dmNUN2JMMmgvSDdubmo4ajRrdFNEejBGbE9xNzdRTjJranF3YkN6R2dSU0NhemVsNWVmTlg3T2h4ZlFOWDcyclpwMllBd2s1aFpUUGhLdlZ5OU1Xekhocng0RVVna3NWM2hUcXJKbUo5NnIydXdJS3ZZK0lURjU5cXBiMFZheWgrdFh5VVVFam52ZnhpKzhvZmRsMlpoZmNEZkFHOGpMaXEzc3JsNGVldUhzWUxrdXVZakFxb0QzblNscmR1SnRlczJPb0VidklUR1RCOWxkYUVXYlNRL1g3NzBEQkZidnk2d2lyMGp5MitzeDNqSHpmTmVZTXVId0dBVHlUV3J4VTJtMG5URkd3MkhYQ0F3UVdNYjVoYjFHUHlhb0dBeHRMekxocnhBQzlNSk1hcEdQTjBTYm9lMk1MeGxLT0VWZ0lZRS83ZFI2VGNidXJhbmUxbFVMZVNGeHRzQmEwWGF5aGVwUHFWa0NhL2pNZy9xOEp0Z2Y3eXc4NGVGelhrcHRvUnBVMGhEZ3RsSzI2K0hUTlpsRkcwcXpFdmFWaE1Bc2dXWC9UeVZ1VXczV0hxeWh6dFpYeVRVSnZmSDRRRnZSaHNhSDZVK0orUVRtRlVqK2VHYnBDUy9xc2xRTmFzTVFnTHpaZXVGV3RLRmhNUGk0djA5Z0RaOTVaUEFVSHgzTTR4T1BETzdJb3hES1prZUFYcGpoOUdpTlV6U01waTJOTGhXT09rT2dUMkJaKzBOSjQ5TVRqWS9BOHdDeVRXaTFvaTE1ZmlabTNVc0kvTEhaUFEzZStLNVB2cmZSRjRiUzlNU2pZMnRGV3hvZG9qOUhFd0tmNlk5TDlwNDhiYThhTkxNaXdMVXdSQjVldmhWdGFYaDRmaDFacHV2ZjVYS3A4VythL0Q4Rk1icGRxVUJJeFJFQVpFZzgzRkpYMThHMHFlRWx3aEZuQ05BRHQrSnhNQjVlY0laS01EUWFBU2F6SVBMd1VxMW9VOFBEOCtjSUJEN1pIM2ZzUGRscHJ4bzA4eUlBZVVmMXdzYTBvazNsaGFXTzhoRDR4RG9xZGwzblM2NE5CbnVqRWFBWEhsNmlGVzFxZUhqK0hJSEEvRnlLUHg1WmVoSisrc01TT0ZzMWV1SGhNOUt0YUZPMjBGU3BCNEdQcjdMQ3N1cmFWWmJoWUhjNEFzT0gwYTFvVThNRDkrY0lCRDdhSDNmc1BlRVpZSHZ0b0dtRkFMMXcrbEM2RlczS0NwT0tsU0F3Ynhlc3VGcjMxWVUzVDdySE5KUEY5RjY0RlcwcVUvdzFGNExBaDlYc2c1UHE5em14RW96a1JvQWVHQmxVYkVXYkdnekp6MDhRK0ZmOGRDMmZWKy9tS3g1S3UwVGd5VVhHV3RHbUZrWGw0UTRJN0tGYlZidkVPcTdIVk9rL1NqNG51VVR5KzVLVmtpTWw3NVVBRmNJMit6aEdHY3FpZ3k0MnNLWGlTeWt0N29HWFV2UzF4a3FMOUtiektvSkV2cTk4SGp6a0Y1TStxU29oSXBPbWY2THR2NUx3S3ZpSGxYOWZ3aXdOVjljSHRNMWJ0aEMyMmNjeHlsQVdIWFN4Z1Mxc1lwczZxRXZxYlU0UUdKbUxzUlZ0YWk0Y2Y3Y2djQ3N1SDhkZmRQR3luUy9vVEp3cVlhRVFiMEs5WDlzUVVablRoRTFzVXdkMVVTZDE0NFBUaXZ3eE5qaU1ia1diOGdmYzRaNUFZTHFUNFNVYWNpUjkycE9iUzdjcWdvOUllRWpteThycmVPU2ZPcWtiSC9BRm4vQk43clFsRFM3cWFFV2Jhc0twZ2NDdGFFbUROeDU1dE9GcTRYK3NoRi8rOE9rMWQvaUNUL2lHai9ncU41dWVHSFRNRGFOYjBhYWFjRW9nY0NzV01YSGxhUXhrdUVLNG55YlpKT0dhVlptWENkL3dFVit2TURPK2UrbW9qVk90YUZNMmdWZXRBNEZic0l6NGRiUENNQk1NR1pyNGkwajRMTjgvU2d3Tjdyem1Gblcwb0UxVlRVVzcraUJ3d3gva1lhWjNsVG5STUJOc0I0STNXbitwR0taV0dkTWpKbSs4eXU0SXcraVowZzF2VXpOQk5PRS9CRzdvbzdUY25ybEFHRFBUdTdjZEQ2QXlZZDNWL004R3hUU2wyTHJFcUJDYmt1WUkzTkEyMVJTZzUveUV3Rnc0enUxcHhOYlg1U1UvSXJGVitVeHF4U3NnNWdmUlZXemJGR09QV0dkaWJNVC9tWW1zWEcycUVYRjU2dVN5anVtd2RPZ25udnFYNGhZenQveUFJZ3NxNWc3ekVxYnUzTWZtYmVFOFFjejN2S3NZTnlqV0hqSFBQK0R2OXBGYnpWN1Q2YmNwRS83S1I0QWVtRm9hY09PZGVaR3o1U3N6dDhwU0VuZFpVM1kzWTljbzV6Y281aW5GM2dVRHY4Tlo4NGpSdDQ3ZlByYkp1NFRBaC9nZEZDdVl6cEtMVDBtR3AwYS9rSGljODEzRnZrMFlkTUZpT0FaMUgvbWphZU41VzZvYkliZjFKd1EreXExWmw5WjRRT0JjR1h4Rk1qbzEraWNCc2pqZkZRYmJoRVVYVEVaalVkZlJDOTh5SHJlbHVsQVpYbS9SSTd3WG1xdXZvblpLMHYrMjdKNHZlVWN5UHAya0lvMzhnU2ZXZ2VLOC9CK2J1c0ppbXpDWkFKdXhwU3N0QVBhRUVabG9vdEtLbDNCbDlNQ2VnazB2dzQvZFJibE9EeHE1Rkh3b1RJaHp0MkRHZTlTVndtWkZPZ0ZHNDR0WFZVSWVWVlZWcUNkR0FBTEhtejVsWE9kZEtvZlVVUFUvVDJya0Q5VCtXQkhlTGNtVCtpUVdSaDVkRTgvRFhqTnVlWUlKWlcwUmdNQ2VnYzFNNnljVWo0YUsrcDgzclpHQzdwN3FmOFBTcElXLy9lRzBzT3FDbVlXK1F4VXdCL3ZZcE1lWFpiR0hMY2tnc0dlaFhDNS9ORm1qLzJQUzBNT2ZIbnJFNHdONWh0RHp3K2hQYklIWi9KM1ZieS9BUEJDNG9sTUFnVDBDbXdVTHVsMVNNUGkxMHU5SUdwVWdzRTB2VEpCZFliWVo3UGhRdllBMW1GZGZjNmdSQW51Q0Frc0dOem54aFdlRDF6bXhWTEdSd2JkYTVLdDhyYkNiQU1OOGFpNUtneldZdTdBVmJPUkRBQUo3MEFPemFIOTlQcy9IbEw1MnpIRXZEOXYyd0Vrd200VmhGeXlUSGRYa0tWaDcwS2FxaWIzdVdpQnczVDZvL3M5TDNLN0E0N21BK3E4TUZWWTVLZDFxVnhodUJzdjB3MlhzQldPd0xzTjJzRGtlQVE4SXpMT3ZXOGQ3YWxHQ0Y5ZFlxTldud25WdzBkb25oT1ZhTUMxcUtKdCs0ekRPRmxaalNrSGdHb2M3dkgzaXB0TEFvbWZRb0xJMCs5NGEzZ0NtWUZ1dWgyQUx4aW0xMU5pbVVyeHA4UzRJWEdONHZJTmxiNm4xYjVCMVZpb3E4ei9SQXdNSjA3cEZaS1V3WFN0RHJJTXBUL2JlSHBsak9xYlRXU2dDZXZBZGxkb1JVamtJUUdDYVRUbldSMXJsbWUvYlI1WndjWkRaMFZ0Y0dLckNCdjBXM3pnOUI1Vk5DdHRKTUhaZ0s5M0VUZUx1b200K010Rm1GUy96cnBMTWg1UWdBSUdUN1lyenIxUlczeldxNlFLSjl3a0M0NlFMRXZPMWZIZHBHRDhpOGk2NjBKNUhYbW9ua2lBbEkxQVRnZWtaZUJOanlkSE5NLzlWYlI4cThUb2xCTVpKRnlTZUZNYlRZSTFCWjZLcGJ2UFhDNjNOSSsvQ1ErRnppUWhBNEJxK0xlOG9NYVIwMHp6bXBrRmwra0ZmOXhZbE1XZjJadWRZcjFmdk8zQ3pPWVc4MU93cnFxM3lDd0pYSEJDWFRYZFZYT2RNZFo5VmRwWEUyNVQyV0VsUkVrK0NOWmc3aVhxVHlEdXczQ3VGdkU0cUNrWlNFVmkwc3dZQ00wSEoxT2dpWHlyWmNhZHFPVXZpWlJvMjlWT0V4TlBDZXNzV0YrRStKZklPTExnZVFkN1FBN3RBUElNTkNGd3gyUGRtY0t2Y0lyb3lOQjhzdDRyODFvZVJON0ZVaE1RM0Y4YWNOc0tpcThRYk00SzhzMlhDUnZrSVZFeGdIdFRueDczS0QyeFVEU3QwOEp1U3d5WGVwTFRoODBMbmJFazhMY3dud1g2aHdVeWYzMUdweTlUN3pqNTBuSUc4UlI3TFVIVWhaVVVBQWxjSTlvTlovU3E5SEErZlA2QmFPaEl2VXRZWEc5bVMrRWtyN0RYK05wZUt2TFBzejBCZUwrQmNLazVBWUlaSEZjWDdyWXJxU2F0bThiN3p0QXVQYWljeHcrZjV0NURrMThoa1ErSXRSRHJTNnNLRGtQY2lrWGYyeFZzNXlGdjB1YXFGdm9UUFF4Q0F3RU1PdWQ3Tm5ZY2RybzBXdG5laExHeVYxRHFjaHBEeUlWZENwNWREWTFyWVQzSU9NdWt3YkQ1ZjVKMTk5V1dVWTRWVngzUXE3QlF5eGRQYVF2eTBDbUFqSlFmNVJNbjI3YzNURXo4dTlWb210dkwydnZKek51VWxzY2wwRG1nTDU0cThOajN2b3loY0xRQUFDYXBKUkVGVXJHdGhveG9Fa2g2WWsxWnlqZDh0Mlg0eDgxd1RQeVVUbGQ5aVl1V3c2clZPZVVoODk5aHpBQVJuaTd4RnJubWQzTE95eG1PSktTWUVydUNhNVdudm9XVjJtaG05eWhaN2JITUV5VmdTeC9WTWpqd0hMTktBdkhsbW0yUERJYXNMZ1lUQXROc1NmZUFIRUN2bzVCMUZ3R0lQMWkrVnVuYTZKMmV6emp5cjZOaVVoY1RUMHpMRHVWQTJsMWpidkU2OWJ0WkZHbk9hNlZzbHQ2WDBTcGZxM29UQW5Oa1NNWEMrb0w1RVgyZE1zK3hTZDAvTitUTWYzZjZIdUJET3JWVmpzTWtYd3lpN2t3UG40aEVWUFYza2Riazhzb0xSbkx3T3FZOUFuOENkbVZuREVvSGYyYStzYWY5NEFJSVd6dU1Bemw0S0FIbGREWjNUQUIxSDR1bit1ZGdyMVd0RjNJOUxCcWFtb3h5enpiS3hLTVZ0YWRIK3NLTWNCUG9FamsyWDF3dC9hUHZ1dUk1R1pqeFAvSkk4WHk4cGxKaHhMcE84aVhNalNIejVEL3JuWXBXSU8rcDUzc1JTM3R6RENheThJVFNyL0h3QzUvMTFudXlScnZ1UFhlWjVGUjlZVGF2UERVcEh5ZGZiSk5aaDlLUmNkTVpaSmpLbkJTUUdlbnkvNS9GWER4RjVGejJlRkJYc2VXTy93dlZ2REVSVjJYd0NsOWNEbi9yYVlZYTNuOTJqc0doRlRQTjJ0TjNBbERzTVZsalI2MEtvaXVQdHFNNnJlcWIvM1FuMCtHNE8zZlBlaFc1RWJzaUwyUkl2d3pBZlpDRUNzd1R1bEhrZGZOSTdjd3VkYUVWTTgrNlJLN3p4NVhUbERVeVp3dWdwc0NrSjE3M0txa3BBQ3JSQWZLZEl2Qm8va3NwM3ZmMitaSk04Y2tqZXVBMWhOa2hGQ013U09LNnZuRy9RWlFlUGlPM1BaYnh0N25wOWZFN0M3Y2tibGZNTDBjb3FUY2NVcXkwMWpKNXNzcEpZNU5GV0pRbm9nQkFvZ1JSbzhhMWZPWDdnRXgrV3ZUVjd6aU4zNU1WeWVaZGdXQStTaXNEc3lZeVBEcDZFZUdmaHJCTU5mT3N2c3NjeXFJM2ErNktFU1ZLbWZTL1ROc05QWlU0VE5yRk5IZFJGTjBVdnlmVnBrWjVTZHRmMGpOa29XeStLTUppbUNxclNJYWNoWUF5YjJLWU82Z0k2SUZ6RHdUU1JUMGIrbWM1UE8wWi9rVnZ5eXFJcDU4dmZoTDlSQ0F3UXVGUFdNSHBsOUo1UlRnd2M0OTROMDc3M2FhL0lZSFlwZjFUeU5RblR3QmNyUDBOQ0MrYmVEcXN0T3ZxTXNNMCtqbEdHc3VpZ2l3MXNZUlBiMUVGZFVqV1VUMmFJT1E2WitZeEFhbzRiL1pFajdPTllUL3U0dnFXM1JRK1NjRnk3TVUwVlZNVWhxc1lGWE1FbFhNTkZpdU15cmhNQ3dqYjdPRVlaeXFLRExqYXdoVTFzVXdkMXFjcnhDZit1Zk5kRUpaQzNNOU4yeHZzUVNqaEZZSURBc2VWeWV1SFllTzVzdVRSNDJ1QTY1VXdEUDZUOFdRa3QrRTNsK3lVSFkyR2JmUnlqREdYUlFSY2IyRkxSa1FuV1FFNUlqRUJRN0NVa1padDlISU1Ra0hta3dabURWSTBMdUlKTHVJYUxtTU5sWEhjWnhreXRLZi94MlJnaU5BNy8vR296RGdQejNWUWFnZDBQaGFZNlAvY2RpQ1hrMzdzbHhPcSt6WlRnWkJ0TkxpSndQQlJ5ZTBLaXprOGJCMTViSFg1NTJjOGNoN1lsYmpPT3pRWnpXUkJZUk9CWTZlWTRkNU1kWFBhV0cwUEJTbUVFM0orTE1Id3VmRkxzRFF3ak1JczYzUFhDUHp5Y056ellleGswM1NIZzlseE1xL2QxMTA3Y1JibGtMS1VTV0NjRkFydjdadDEvK0J0TEJsSGZBMzN4bUgwT1hYUTdVblBvMkZJeGxVcmdPSGgzMzZ3UG41cjlObEpjZWNoS1FtREh5dkdUV0JtcjFoZDllSGdoSTFabEZSdEtZSjBjZXVFcm5WUzhjN1VUTThHSUF3VGNuWXVlQTIrQ2lZSUlEQ1Z3Yk5kTkwvekttYjhhMnd0WjNRaTRPeGZ1THJIcXhxVEI5WThrY053TEZ4OG12ZkVIUnpZWW8zYTU3dVpjaEZ0SG5yU0trUVNPZlN3K1VmR0xFejVnSG4zZi84ZjJRbFlmQXRPR2MxR3dmbjJ4dTdtMEt1aEhLZW9OTXpxV3dEcFpicTZGSC9qd29vZklHNFpWODkzOXUxTmN2Qmtsa05lamxqQ1d3TEd2WEFzajhVZUw3TEdMRnoxSWJtRWxxQlJCNElHTFdORmR4TUtrdnRDTFgxSVY4U0RvRGlDUWljQTZhZlRDeFliU3V5NDViS0RtOEtGNkJGNzQxQWNLVmxxc0RSU3NQS2d2UmlBVGdWRVRpZW1CN2I5OUQ2eitMZlBJci9ORmdMa2dWU01BOXB3RCszcVp1S0lOMkZzSW1zNFJ5RXpndU9hUjM4QnhtZUhaTnliK2QvakJjS1JVQkRaZTlIWkIrOFhPZmNIS2czbzZBcmtJckY2WUh0UitFdVBCRzM0NzNZMnd0M1FFdm5mMTdCdDJMT3JxeGVmZVFqV29sSWxBTGdMamlFNGt3Mmk3b2RUUFByYmNmT2VJSDJFblNJVUlnRG5ZMjFYSnhGWG9mZTJ3SzEwck40RmpqK2lGNlkzamp6bXl2LzBNTDZESW9SQ0tGa2JBSG5PZU5qcW5jUDNCUUdrSVdCRll2VERraGNUNUhYdjJpOGRLcWVqdERKbndLM25zVFdTZStSdGVyV1hqb3QwNXRxa3A2RmdoWUVWZ2FoS0pHVWJuWDlCKzhOZ1ZadTNFZG13RXFRQ0IzaGxQR21OMStjdDFMK2U0QWlkREZiWUlXQk00cnBBRjdmbFA4djMvY0h5c0g3S3lFZGk0Nlhjc3Fnalh2UmFnMWFGU2lNRHFoWk9oTkhsMi8vZi8zdkhtUzZ2L1BidENLR21GQUJpRGRUNWx6bVVZT3VmRHJMYlNoUWlNMXpHSjgwOTBmR2xMRi8wZ0pTSmdoL0dWOFRuTjdGZ29XQjhDaFFtTTYvRUpYOGwyWnFGbitNd2ZmeTl6K1ZBd0h3SmdDOGI1dE03UnVjeC9TWlN2amxEYUlRSk9DSXcvT3ZINWgxNzMzdnQrODNKNFl5WDRPUlV3dmVlZlA1clRaaUJ2VHNCOEtPNk13QVFqRW05Um5uMW1taG5wdjdoaGgzUkNjb25BdVRmdnpqbnp6TEE1OUx3dXowRkZ0cHdTR0o5RllsYnRaQ2Z4OW8xbm1nZU9ld2JkSUE0UUFNdnBMNjdLWVluYlJYeng1bEFKUlJNRTZzNmRFNWlBY3BQNGsvOTJncG5xT0h0YklqNHNVVGxnd0RKNzhKQ1hMOXpzR3FHa1Z3aVVRbUFpekVWaUhuT2IrUHVYMFF0U0FJRVBicHd5WUpuTkJNUG1RTjVzV0hsYnFqUUNFM0ZNNG16M0ZGKzk4WGZOMm9udm94ZkVBZ0d3QThOc3FreFloV0Z6TnF5OExsVXFnWWxjSkthaFpMdkZkUGUybzgzRFJ6K1BYcEFjQ0lEWjNkdXlybmVHdkdIQ0tnZThQaGN0bmNBRUx4Snppd2tTazdNTFNaT3UrYk5uZnRPODlKN3c0SDhhT21uN3dPcVM3YWVsSFZxd0Qrd0RlUmVBMHZTUGxSQVlrR0lTczJKcjlMZi96ejkwZ2xuOXhDR2ExSEw1R3o2NDBENlo2dXpyWTJWV2pJdHRXZ1VDZVFWQzIxSmxCQWE0bU1SY0U0Kyt6Y1RENXg5K2lGZkFoTWNPQVM1ZEluUG1OMTh5WUpWK1BObkxUUFBLR1B0a1g4aGJna0NsQkFZekdwS0UyYy9SUStwOUZ4MW5Edi9YUGRJSkpCWUlDMUprM24vdkQ4eWVQeDgxZEU1NlhiQmVvQjQrdGdXQnlnbWNBQ2NTOXh1WVBnL3ZqZmRkS2hJL3ZLZUZ3Mm1GYlprWU5oLzNMeStZM1o4YTlZdHhQQTVJcnp2NmNzWFNoYURtRHdLMUVSZ0lJTEdFSG1JRWlkVVRuL0xrajhQRWxoQmp3Z29zUnZlOERKbVphNUJDU0cxSG9GWUNKK0RHSkdaSW5VNWtydk5PL2krenBHOHhjYXRvMVk5T0dISE5TMjlMcjhzWFlnSnR5RnVPZ0JjRUJtT1JtQmVvMGZnZ01zTnJkczhKczlPWHZIYkVrbHpzd1NLTlMxN1Q5VzdxYkROWU1jT01zRDJIV2RocVBRSy9CQUFBLy85QjVyNC9BQUFBQmtsRVFWUURBR0cwaEdOOCs4QnBBQUFBQUVsRlRrU3VRbUNDIiwic3lzdGVtTGFuZyI6ImVuLVVTIiwidXNlckFnZW50IjoiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzE0Ny4wLjAuMCBTYWZhcmkvNTM3LjM2IEVkZy8xNDcuMC4wLjAiLCJ0aW1lem9uZU9mZnNldCI6LTQyMCwid2ViVGltZXpvbmUiOiJBc2lhL0Jhbmdrb2siLCJ3ZWJnbFZlbmRvciI6Ikdvb2dsZSBJbmMuIChOVklESUEpIiwid2ViZ2xSZW5kZXJlciI6IkFOR0xFIChOVklESUEsIE5WSURJQSBHZUZvcmNlIFJUWCA0MDYwICgweDAwMDAyODgyKSBEaXJlY3QzRDExIHZzXzVfMCBwc181XzAsIEQzRDExKSJ9";

            // 3. ยิง Login พร้อม UUID และ Device Fingerprint
            const result = await RorService.login({ 
                email, 
                password: pass, 
                uuid: currentUuid!,
                device_fingerprint: fingerprintJwtMock
            });

            if (result.success && result.data) {
                const { workflow: nextWorkflow, uuid: nextUuid, done, data: authData } = result.data;
                
                // Update UUID if provided
                if (nextUuid) setUuid(nextUuid);

                // Check workflow steps
                if (nextWorkflow === "terminate" || (done && authData?.accessToken)) {
                    if (authData?.accessToken) {
                        localStorage.setItem("ror_auth_token", authData.accessToken.token);
                        if (authData.refreshToken) {
                            localStorage.setItem("ror_refresh_token", authData.refreshToken.token);
                        }
                        setIsLoggedIn(true);
                        setWorkflow(null);
                        
                        // Fetch accounts immediately after successful login
                        fetchAccounts();

                        toast({
                            title: "Welcome to Valhalla",
                            description: "You have successfully authenticated.",
                        });
                    }
                } else if (nextWorkflow === "2fa_google_auth") {
                    setWorkflow("2fa_google_auth");
                } else if (nextWorkflow === "2fa_sms_auth") {
                    setWorkflow("2fa_sms_auth");
                } else if (nextWorkflow === "2fa") {
                    setWorkflow("2fa");
                    if (authData?.tfaProviders) {
                        setTfaProviders(authData.tfaProviders);
                    }
                }
            } else {
                const errorMsg = result.error?.message || "Invalid credentials";
                setError(errorMsg);
                toast({
                    title: "Authentication Failed",
                    description: errorMsg,
                    variant: "destructive",
                });
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : "An unexpected error occurred during login.";
            setError(errorMsg);
            toast({
                title: "Error",
                description: errorMsg,
                variant: "destructive",
            });
        } finally {
            setAuthLoading(false);
        }
    }, [uuid, toast]);

    const verify2faGoogle = useCallback(async (code: string) => {
        try {
            setAuthLoading(true);
            setError(null);
            if (!uuid) throw new Error("Session expired, please login again.");

            const result = await RorService.verify2faGoogle({ 
                code, 
                uuid 
            });

            if (result.success && result.data) {
                if (result.data.done && result.data.data?.accessToken) {
                    localStorage.setItem("ror_auth_token", result.data.data.accessToken.token);
                    if (result.data.data.refreshToken) {
                        localStorage.setItem("ror_refresh_token", result.data.data.refreshToken.token);
                    }
                    setIsLoggedIn(true);
                    setWorkflow(null);

                    // ดึงข้อมูลบัญชีทันทีหลังจาก 2FA สำเร็จ
                    fetchAccounts();

                    toast({
                        title: "Success",
                        description: "2FA Google Verification successful.",
                    });
                } else {
                    throw new Error("Invalid response from server");
                }
            } else {
                toast({
                    title: "Verification Failed",
                    description: result.error?.message || "Invalid 2FA code",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to verify 2FA.",
                variant: "destructive",
            });
        } finally {
            setAuthLoading(false);
        }
    }, [uuid, toast, fetchAccounts]);

    const verify2faSms = useCallback(async (code: string) => {
        try {
            setAuthLoading(true);
            setError(null);
            if (!uuid) throw new Error("Session expired, please login again.");

            const result = await RorService.verify2faSms({ 
                code, 
                uuid 
            });

            if (result.success && result.data) {
                if (result.data.done && result.data.data?.accessToken) {
                    localStorage.setItem("ror_auth_token", result.data.data.accessToken.token);
                    if (result.data.data.refreshToken) {
                        localStorage.setItem("ror_refresh_token", result.data.data.refreshToken.token);
                    }
                    setIsLoggedIn(true);
                    setWorkflow(null);

                    // ดึงข้อมูลบัญชีทันทีหลังจาก 2FA สำเร็จ
                    fetchAccounts();

                    toast({
                        title: "Success",
                        description: "2FA SMS Verification successful.",
                    });
                } else {
                    throw new Error("Invalid response from server");
                }
            } else {
                toast({
                    title: "Verification Failed",
                    description: result.error?.message || "Invalid 2FA code",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to verify 2FA.",
                variant: "destructive",
            });
        } finally {
            setAuthLoading(false);
        }
    }, [uuid, toast, fetchAccounts]);

    useEffect(() => {
        const token = localStorage.getItem("ror_auth_token");
        if (token) {
            setIsLoggedIn(true);
            fetchAccounts();
        }
        
        // ดึง UUID ทันทีที่เข้าหน้าเว็บ
        const initWizard = async () => {
            const res = await RorService.getWizard();
            if (res.success && res.data) {
                setUuid(res.data.uuid);
            }
        };
        initWizard();
    }, []);



    return {
        isLoggedIn,
        authLoading,
        error,
        workflow,
        setWorkflow,
        tfaProviders,
        login,
        verify2faGoogle,
        verify2faSms,
        pledgeData,
        setPledgeData,
        handlePledgeChange,
        gods,
        rankingData,
        uuid,
        setError,
        accounts,
        filteredAccounts,
        fetchAccounts
    };
};
