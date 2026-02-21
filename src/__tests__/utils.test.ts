// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getThemeMode } from "../utils";

describe("utils/getThemeMode test suite", () => {

    beforeEach(() => {
        document.documentElement.removeAttribute('data-theme-mode');
    });

    afterEach(() => {
        document.documentElement.removeAttribute('data-theme-mode');
    });

    it("should return undefined when no theme mode is set", () => {
        expect(getThemeMode()).toBe(undefined);
    });

    it("should return the theme mode when it is set", () => {
        document.documentElement.setAttribute('data-theme-mode', 'light');
        expect(getThemeMode()).toBe("light");
    });

    it("should return the theme mode when it is set", () => {
        document.documentElement.setAttribute('data-theme-mode', 'dark');
        expect(getThemeMode()).toBe("dark");
    });
});