"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";

interface AdminSearchBarProps {
    placeholder: string;
    value?: string;
    onChange?: (value: string) => void;
}

export function AdminSearchBar({ placeholder }: AdminSearchBarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const current = searchParams.get('search') ?? '';

    const handleChange = (value: string) => {
        const params = new URLSearchParams(searchParams);
        if (value) {
            params.set('search', value);
        } else {
            params.delete('search');
        }
        router.replace(`?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                    type="search"
                    placeholder={placeholder}
                    defaultValue={current}
                    onChange={(e) => handleChange(e.target.value)}
                    className="pl-9"
                />
            </div>
        </div>
    );
}
