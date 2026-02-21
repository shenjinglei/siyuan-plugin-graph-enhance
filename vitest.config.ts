import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
    resolve: {
        alias: {
            siyuan: path.resolve(__dirname, "src/__mocks__/siyuan.ts"),
        },
    },
    test: {
        environment: "node",
        include: ["src/**/*.test.ts"],
        globals: false,
    },
});
