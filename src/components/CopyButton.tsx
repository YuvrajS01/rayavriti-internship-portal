"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

export default function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    return (
        <button onClick={handleCopy} className="btn btn-ghost w-full">
            {copied ? (
                <>
                    <Check className="w-5 h-5" />
                    Copied!
                </>
            ) : (
                <>
                    <Share2 className="w-5 h-5" />
                    Copy Share Link
                </>
            )}
        </button>
    );
}
