import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    tone?: "neutral" | "success" | "info" | "error" | "warning";
}

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
    const tones = {
        neutral: "badge-neutral",
        success: "badge-success",
        info: "badge-info",
        error: "badge-error",
        warning: "badge-warning",
    };

    return (
        <div className={cn("badge", tones[tone], className)} {...props} />
    );
}
