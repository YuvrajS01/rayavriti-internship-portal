import React from "react";

interface LinkifyProps {
    text: string;
    className?: string;
}

/**
 * A component that detects URLs in a string and wraps them in <a> tags.
 * It also preserves line breaks using whitespace-pre-line.
 */
export function Linkify({ text, className = "" }: LinkifyProps) {
    if (!text) return null;

    // Regular expression to detect URLs (http, https, and www)
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;

    // Split text by URLs and map parts to either text or <a> tags
    const parts = text.split(urlRegex);
    const matches = text.match(urlRegex);

    return (
        <span className={`whitespace-pre-line ${className}`}>
            {parts.map((part, index) => {
                // If this is a match (URL), wrap it in an <a> tag
                if (matches && index < matches.length && part === "") {
                    // This case handles when the split result has an empty string before a match
                    // However, split with capturing groups or matching is better.
                    // Let's use a simpler approach for mapping.
                }

                // Actually, let's use a more robust way to render parts
                const urlMatch = matches?.find((m) => m === part);
                if (urlMatch) {
                    const href = urlMatch.startsWith("http") ? urlMatch : `https://${urlMatch}`;
                    return (
                        <a
                            key={index}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent-primary hover:underline"
                        >
                            {urlMatch}
                        </a>
                    );
                }

                return <React.Fragment key={index}>{part}</React.Fragment>;
            })}
        </span>
    );
}
