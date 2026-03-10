const quote = (file) => `"${file.replace(/\\/g, "/")}"`;

module.exports = {
  "*.{ts,tsx}": (files) => {
    const normalizedFiles = files.map((file) => file.replace(/\\/g, "/"));
    const commands = [
      `prettier --write ${normalizedFiles.map(quote).join(" ")}`,
    ];

    const frontendFiles = normalizedFiles.filter((file) =>
      file.startsWith("frontend/"),
    );
    const backofficeFiles = normalizedFiles.filter((file) =>
      file.startsWith("backoffice/"),
    );

    if (frontendFiles.length) {
      commands.push(
        `pnpm exec vitest related --run --passWithNoTests --root frontend --config vitest.config.ts ${frontendFiles
          .map((file) => file.replace(/^frontend\//, ""))
          .map(quote)
          .join(" ")}`,
      );
    }

    if (backofficeFiles.length) {
      commands.push(
        `pnpm exec vitest related --run --passWithNoTests --root backoffice --config vitest.config.ts ${backofficeFiles
          .map((file) => file.replace(/^backoffice\//, ""))
          .map(quote)
          .join(" ")}`,
      );
    }

    return commands;
  },
  "*.{js,jsx}": ["prettier --write"],
  "*.{json,md,css}": ["prettier --write"],
};
