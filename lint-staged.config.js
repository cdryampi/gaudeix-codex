module.exports = {
  "*.{ts,tsx}": [
    "prettier --write",
    "pnpm exec vitest related --run --passWithNoTests",
  ],
  "*.{js,jsx}": ["prettier --write"],
  "*.{json,md,css}": ["prettier --write"],
};
