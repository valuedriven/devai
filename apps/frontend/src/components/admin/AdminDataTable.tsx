import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/Card";

export interface Column<T> {
    header: string;
    accessor?: keyof T;
    cell?: (item: T) => ReactNode;
    className?: string;
    headerClassName?: string;
    align?: "left" | "center" | "right";
}

interface AdminDataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    keyField: keyof T;
}

export function AdminDataTable<T>({ columns, data, keyField }: AdminDataTableProps<T>) {
    return (
        <Card>
            <CardContent className="p-0">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm text-left border-collapse">
                        <thead className="bg-muted/50 border-b">
                            <tr>
                                {columns.map((column, index) => (
                                    <th
                                        key={index}
                                        className={`h-12 px-4 align-middle font-medium text-muted-foreground whitespace-nowrap ${column.align === "right" ? "text-right" :
                                                column.align === "center" ? "text-center" : "text-left"
                                            } ${column.headerClassName || ""}`}
                                    >
                                        {column.header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {data.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} className="p-8 text-center text-muted-foreground">
                                        Nenhum registro encontrado.
                                    </td>
                                </tr>
                            ) : (
                                data.map((item) => (
                                    <tr key={String(item[keyField])} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        {columns.map((column, colIndex) => (
                                            <td
                                                key={colIndex}
                                                className={`p-4 align-middle ${column.align === "right" ? "text-right" :
                                                        column.align === "center" ? "text-center" : "text-left"
                                                    } ${column.className || ""}`}
                                            >
                                                {column.cell ? column.cell(item) : String(item[column.accessor!] || "")}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
