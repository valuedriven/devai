import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "link";
    size?: "default" | "sm" | "lg" | "icon";
    loading?: boolean;
}

export const buttonVariants = ({ variant = "primary", size = "default", className }: { variant?: ButtonProps["variant"], size?: ButtonProps["size"], className?: string } = {}) => {
    // semantic classes mapping
    const baseStyles = "btn";

    const variants = {
        primary: "btn-primary",
        secondary: "btn-secondary",
        outline: "btn-outline",
        ghost: "btn-ghost",
        link: "btn-link",
    };

    const sizes = {
        default: "btn-default",
        sm: "btn-sm",
        lg: "btn-lg",
        icon: "btn-icon-size",
    };

    return cn(baseStyles, variants[variant || "primary"], sizes[size || "default"], className);
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
        return (
            <button
                className={buttonVariants({ variant, size, className })}
                ref={ref}
                disabled={disabled || loading}
                {...props}
            >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </button>
        );
    }
);
Button.displayName = "Button";

export { Button };
