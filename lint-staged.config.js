module.exports = {
    "*.{ts,tsx}": [
        "eslint --fix",
        "pnpm exec vitest related --run --passWithNoTests",
    ],
    "*.{js,jsx}": ["eslint --fix"],
    "*.{json,md,css}": ["prettier --write"],
};
