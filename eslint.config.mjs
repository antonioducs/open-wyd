import sharedConfig from "@repo/eslint-config";

export default [
    ...sharedConfig,
    {
        ignores: ["apps/**", "packages/**", "**/node_modules", "**/.turbo", "**/dist", "**/coverage"]
        // We ignore apps/packages/ here because they have their own lint tasks, 
        // and we don't want root 'lint' to double-lint them if we run 'eslint .' from root context
        // BUT 'turbo run lint' runs the scripts in workspaces.
        // If we want 'eslint .' at root to ONLY lint root files, we ignore workspaces.
    }
];
