import { describe, it, expect } from "vitest";
import { Linkify } from "@/components/Linkify";
import { render, screen } from "@testing-library/react";
import React from "react";

describe("Linkify Component", () => {
    it("renders plain text correctly", () => {
        render(<Linkify text="Hello world" />);
        expect(screen.getByText("Hello world")).toBeDefined();
    });

    it("wraps http URLs in <a> tags", () => {
        render(<Linkify text="Check this: http://example.com" />);
        const link = screen.getByRole("link", { name: "http://example.com" });
        expect(link).toBeDefined();
        expect(link.getAttribute("href")).toBe("http://example.com");
        expect(link.getAttribute("target")).toBe("_blank");
    });

    it("wraps https URLs in <a> tags", () => {
        render(<Linkify text="Visit https://google.com for info" />);
        const link = screen.getByRole("link", { name: "https://google.com" });
        expect(link).toBeDefined();
        expect(link.getAttribute("href")).toBe("https://google.com");
    });

    it("wraps www URLs in <a> tags and adds https://", () => {
        render(<Linkify text="Check www.openai.com" />);
        const link = screen.getByRole("link", { name: "www.openai.com" });
        expect(link).toBeDefined();
        expect(link.getAttribute("href")).toBe("https://www.openai.com");
    });

    it("preserves line breaks", () => {
        const text = "Line 1\nLine 2";
        const { container } = render(<Linkify text={text} />);
        const span = container.querySelector("span");
        expect(span?.className).toContain("whitespace-pre-line");
    });
});
