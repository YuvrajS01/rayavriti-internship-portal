"use client";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body>
                <div style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#1e293b",
                    padding: "1rem",
                }}>
                    <div style={{
                        textAlign: "center",
                        maxWidth: "400px",
                    }}>
                        <div style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "64px",
                            height: "64px",
                            borderRadius: "50%",
                            backgroundColor: "rgba(239, 68, 68, 0.2)",
                            marginBottom: "1.5rem",
                        }}>
                            <svg
                                width="32"
                                height="32"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#f87171"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>

                        <h1 style={{
                            fontSize: "1.5rem",
                            fontWeight: "bold",
                            color: "white",
                            marginBottom: "0.5rem",
                        }}>
                            Critical Error
                        </h1>

                        <p style={{
                            color: "#94a3b8",
                            marginBottom: "1.5rem",
                        }}>
                            Something went seriously wrong. Please refresh the page or try again later.
                        </p>

                        {error.digest && (
                            <p style={{
                                fontSize: "0.75rem",
                                color: "#64748b",
                                marginBottom: "1.5rem",
                                fontFamily: "monospace",
                            }}>
                                Error ID: {error.digest}
                            </p>
                        )}

                        <button
                            onClick={reset}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "0.5rem 1rem",
                                fontSize: "0.875rem",
                                fontWeight: "500",
                                color: "white",
                                backgroundColor: "#2563eb",
                                border: "none",
                                borderRadius: "0.5rem",
                                cursor: "pointer",
                            }}
                        >
                            Try again
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
