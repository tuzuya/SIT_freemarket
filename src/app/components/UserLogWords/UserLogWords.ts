"use client";

interface LogEntry {
    label: string;
    img?: string;
    state?: string;
}

export default function UserLogWords(userLog: string): LogEntry[] {
    const userMap: Record<string, LogEntry[]> = {
        "/home": [{ label: "購入する", img: "/cart_green.png", state: "Current" }],
        "/home/search": [{ label: "購入する", img: "/cart_green.png" }, { label: "学部・学科で探す", state: "Current" }]
    };

    return userMap[userLog] || [];
}
