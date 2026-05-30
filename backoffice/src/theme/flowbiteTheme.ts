import type { CustomFlowbiteTheme } from "flowbite-react";

export const customTheme: CustomFlowbiteTheme = {
  sidebar: {
    root: {
      base: "h-full w-64 bg-surface text-text-primary border-r border-border-soft transition-colors duration-400",
      inner:
        "h-full overflow-y-auto overflow-x-hidden bg-surface px-3 py-4 transition-colors duration-400",
    },
    item: {
      base: "flex items-center justify-between rounded-lg p-2.5 text-sm font-medium text-text-secondary hover:bg-surface-muted hover:text-text-primary transition-all duration-200",
      active:
        "bg-primary/10 text-primary font-bold dark:bg-primary/20 dark:text-primary-300",
      icon: {
        base: "h-5 w-5 flex-shrink-0 text-text-secondary transition duration-75 group-hover:text-text-primary",
        active: "text-primary dark:text-primary-300",
      },
    },
    collapse: {
      button:
        "group flex w-full items-center rounded-lg p-2.5 text-sm font-medium text-text-secondary hover:bg-surface-muted hover:text-text-primary transition-all duration-200",
      icon: {
        base: "h-5 w-5 text-text-secondary transition duration-75 group-hover:text-text-primary",
        open: "text-primary dark:text-primary-300",
      },
    },
  },
  table: {
    root: {
      base: "w-full text-left text-sm text-text-secondary transition-colors duration-400",
      shadow:
        "absolute left-0 top-0 -z-10 h-full w-full rounded-lg bg-surface shadow transition-colors duration-400",
    },
    head: {
      base: "group/clhead text-xs uppercase tracking-wider text-text-secondary bg-surface-muted transition-colors duration-400",
      cell: "px-6 py-3 font-semibold",
    },
    row: {
      base: "group/clrow border-b border-border-soft bg-surface hover:bg-surface-muted/50 transition-colors duration-400",
    },
  },
  modal: {
    content: {
      base: "relative h-full w-full p-4 md:h-auto",
      inner:
        "relative rounded-lg bg-surface shadow dark:bg-surface border border-border-soft transition-colors duration-400 flex flex-col max-h-[90vh]",
    },
    header: {
      base: "flex items-start justify-between rounded-t border-b border-border-soft p-5 transition-colors duration-400",
      title: "text-xl font-bold text-text-primary",
      close: {
        base: "ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-text-secondary hover:bg-surface-muted hover:text-text-primary transition-all duration-200",
      },
    },
    body: {
      base: "p-6 flex-1 overflow-y-auto text-text-secondary",
    },
    footer: {
      base: "flex items-center space-x-2 rounded-b border-t border-border-soft p-6 transition-colors duration-400",
    },
  },
  navbar: {
    root: {
      base: "border-b border-border-soft bg-surface px-2 py-2.5 transition-colors duration-400 sm:px-4",
      inner: "mx-auto flex flex-wrap items-center justify-between",
    },
  },
  button: {
    base: "group flex items-stretch items-center justify-center text-center font-semibold relative focus:z-10 focus:outline-none focus:ring-2 focus:ring-primary-500/20 active:scale-95 transition-all duration-200",
    color: {
      primary:
        "text-white bg-primary hover:bg-primary/90 focus:ring-primary/30",
      secondary:
        "text-white bg-secondary hover:bg-secondary/90 focus:ring-secondary/30",
    },
  },
};
