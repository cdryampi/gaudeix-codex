import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/lib/config/constants";
import {
  Activity,
  Server,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Zap,
  ChevronRight,
} from "lucide-react";
import { Header } from "@/components/Header";
import { useHealthCheck } from "@/hooks/useHealthCheck";
/**
 * Landing Page - Entry point for the backoffice
 * Shows system status and provides quick access to login
 */
export function LandingPage() {
  const { backendStatus, dbStatus } = useHealthCheck();
  return _jsxs("div", {
    className:
      "flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950",
    children: [
      _jsx(Header, {}),
      _jsx("main", {
        className: "flex flex-1 items-center justify-center px-6 py-12",
        children: _jsxs("div", {
          className:
            "container mx-auto flex flex-col items-center justify-center space-y-12 max-w-5xl",
          children: [
            _jsxs("div", {
              className: "text-center space-y-6 max-w-3xl mx-auto",
              children: [
                _jsxs("div", {
                  className:
                    "inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-5 py-2 text-sm font-medium shadow-sm mx-auto",
                  children: [
                    _jsx(Sparkles, { className: "h-4 w-4 text-primary" }),
                    _jsx("span", {
                      children: "Sistema de Gesti\u00F3n Municipal",
                    }),
                  ],
                }),
                _jsxs("div", {
                  className: "space-y-4",
                  children: [
                    _jsx("h2", {
                      className:
                        "text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent",
                      children: "Panel de Administraci\u00F3n",
                    }),
                    _jsx("p", {
                      className:
                        "mx-auto max-w-2xl text-lg text-muted-foreground",
                      children:
                        "Gestiona tu contenido municipal de forma centralizada, eficiente y segura",
                    }),
                  ],
                }),
              ],
            }),
            _jsxs("div", {
              className:
                "grid w-full gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto",
              children: [
                _jsxs(Card, {
                  className:
                    "group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur transition-all hover:border-green-500/30 hover:shadow-lg hover:shadow-green-500/10 p-6",
                  children: [
                    _jsx("div", {
                      className:
                        "absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100",
                    }),
                    _jsxs(CardHeader, {
                      className: "pb-3",
                      children: [
                        _jsxs("div", {
                          className: "flex items-center justify-between",
                          children: [
                            _jsx("div", {
                              className: "rounded-lg bg-green-500/10 p-2",
                              children: _jsx(Activity, {
                                className:
                                  "h-5 w-5 text-green-600 dark:text-green-400",
                              }),
                            }),
                            _jsxs(Badge, {
                              variant: "outline",
                              className:
                                "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400",
                              children: [
                                _jsxs("span", {
                                  className: "relative flex h-2 w-2 mr-1.5",
                                  children: [
                                    _jsx("span", {
                                      className:
                                        "animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75",
                                    }),
                                    _jsx("span", {
                                      className:
                                        "relative inline-flex rounded-full h-2 w-2 bg-green-500",
                                    }),
                                  ],
                                }),
                                "Online",
                              ],
                            }),
                          ],
                        }),
                        _jsxs("div", {
                          className: "space-y-1 pt-2",
                          children: [
                            _jsx(CardTitle, {
                              className: "text-lg",
                              children: "Frontend",
                            }),
                            _jsx(CardDescription, {
                              className: "text-sm",
                              children: "Sitio p\u00FAblico activo",
                            }),
                          ],
                        }),
                      ],
                    }),
                    _jsx(CardContent, {
                      children: _jsxs("div", {
                        className:
                          "flex items-center text-sm text-muted-foreground",
                        children: [
                          _jsx(Zap, { className: "mr-1.5 h-3.5 w-3.5" }),
                          _jsx("span", { children: "localhost:5173" }),
                        ],
                      }),
                    }),
                  ],
                }),
                _jsxs(Card, {
                  className: `group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur transition-all ${
                    backendStatus === "online"
                      ? "hover:border-green-500/30 hover:shadow-lg hover:shadow-green-500/10"
                      : backendStatus === "checking"
                        ? "hover:border-yellow-500/30 hover:shadow-lg hover:shadow-yellow-500/10"
                        : "hover:border-red-500/30 hover:shadow-lg hover:shadow-red-500/10"
                  }`,
                  children: [
                    _jsx("div", {
                      className: `absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity group-hover:opacity-100 ${
                        backendStatus === "online"
                          ? "from-green-500/5"
                          : backendStatus === "checking"
                            ? "from-yellow-500/5"
                            : "from-red-500/5"
                      } to-transparent`,
                    }),
                    _jsxs(CardHeader, {
                      className: "pb-3",
                      children: [
                        _jsxs("div", {
                          className: "flex items-center justify-between",
                          children: [
                            _jsx("div", {
                              className: `rounded-lg p-2 ${
                                backendStatus === "online"
                                  ? "bg-green-500/10"
                                  : backendStatus === "checking"
                                    ? "bg-yellow-500/10"
                                    : "bg-red-500/10"
                              }`,
                              children: _jsx(Server, {
                                className: `h-5 w-5 ${
                                  backendStatus === "online"
                                    ? "text-green-600 dark:text-green-400"
                                    : backendStatus === "checking"
                                      ? "text-yellow-600 dark:text-yellow-400"
                                      : "text-red-600 dark:text-red-400"
                                }`,
                              }),
                            }),
                            backendStatus === "checking"
                              ? _jsx(Badge, {
                                  variant: "outline",
                                  className:
                                    "border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
                                  children: "Verificando...",
                                })
                              : backendStatus === "online"
                                ? _jsxs(Badge, {
                                    variant: "outline",
                                    className:
                                      "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400",
                                    children: [
                                      _jsxs("span", {
                                        className:
                                          "relative flex h-2 w-2 mr-1.5",
                                        children: [
                                          _jsx("span", {
                                            className:
                                              "animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75",
                                          }),
                                          _jsx("span", {
                                            className:
                                              "relative inline-flex rounded-full h-2 w-2 bg-green-500",
                                          }),
                                        ],
                                      }),
                                      "Online",
                                    ],
                                  })
                                : _jsx(Badge, {
                                    variant: "outline",
                                    className:
                                      "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400",
                                    children: "Offline",
                                  }),
                          ],
                        }),
                        _jsxs("div", {
                          className: "space-y-1 pt-2",
                          children: [
                            _jsx(CardTitle, {
                              className: "text-lg",
                              children: "Backend",
                            }),
                            _jsx(CardDescription, {
                              className: "text-sm",
                              children: "API & Base de datos",
                            }),
                          ],
                        }),
                      ],
                    }),
                    _jsx(CardContent, {
                      children: _jsxs("div", {
                        className: "space-y-2 text-sm",
                        children: [
                          _jsxs("div", {
                            className: "flex items-center justify-between",
                            children: [
                              _jsx("span", {
                                className: "text-muted-foreground",
                                children: "Django API",
                              }),
                              _jsx("span", {
                                className: `font-medium ${
                                  backendStatus === "online"
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-muted-foreground"
                                }`,
                                children:
                                  backendStatus === "online" ? "✓" : "✗",
                              }),
                            ],
                          }),
                          _jsxs("div", {
                            className: "flex items-center justify-between",
                            children: [
                              _jsx("span", {
                                className: "text-muted-foreground",
                                children: "PostgreSQL",
                              }),
                              _jsx("span", {
                                className: `font-medium ${
                                  dbStatus === "ok"
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-muted-foreground"
                                }`,
                                children: dbStatus === "ok" ? "✓" : "✗",
                              }),
                            ],
                          }),
                        ],
                      }),
                    }),
                  ],
                }),
                _jsxs(Card, {
                  className:
                    "group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 sm:col-span-2 lg:col-span-1",
                  children: [
                    _jsx("div", {
                      className:
                        "absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100",
                    }),
                    _jsxs(CardHeader, {
                      className: "pb-3",
                      children: [
                        _jsxs("div", {
                          className: "flex items-center justify-between",
                          children: [
                            _jsx("div", {
                              className: "rounded-lg bg-primary/10 p-2",
                              children: _jsx(ShieldCheck, {
                                className: "h-5 w-5 text-primary",
                              }),
                            }),
                            _jsxs(Badge, {
                              variant: "outline",
                              className:
                                "border-primary/30 bg-primary/10 text-primary",
                              children: [
                                _jsxs("span", {
                                  className: "relative flex h-2 w-2 mr-1.5",
                                  children: [
                                    _jsx("span", {
                                      className:
                                        "animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75",
                                    }),
                                    _jsx("span", {
                                      className:
                                        "relative inline-flex rounded-full h-2 w-2 bg-primary",
                                    }),
                                  ],
                                }),
                                "Activo",
                              ],
                            }),
                          ],
                        }),
                        _jsxs("div", {
                          className: "space-y-1 pt-2",
                          children: [
                            _jsx(CardTitle, {
                              className: "text-lg",
                              children: "Backoffice",
                            }),
                            _jsx(CardDescription, {
                              className: "text-sm",
                              children: "Panel administrativo",
                            }),
                          ],
                        }),
                      ],
                    }),
                    _jsx(CardContent, {
                      children: _jsxs("div", {
                        className:
                          "flex items-center text-sm text-muted-foreground",
                        children: [
                          _jsx(Zap, { className: "mr-1.5 h-3.5 w-3.5" }),
                          _jsx("span", { children: "Sistema de gesti\u00F3n" }),
                        ],
                      }),
                    }),
                  ],
                }),
              ],
            }),
            _jsxs("div", {
              className:
                "flex flex-col items-center justify-center gap-6 sm:flex-row w-full pt-4",
              children: [
                _jsx(Button, {
                  asChild: true,
                  size: "lg",
                  className:
                    "group w-full sm:w-auto min-w-[240px] shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all",
                  children: _jsxs(Link, {
                    to: ROUTES.LOGIN,
                    children: [
                      _jsx(ShieldCheck, { className: "mr-2 h-5 w-5" }),
                      "Acceder al Backoffice",
                      _jsx(ChevronRight, {
                        className:
                          "ml-2 h-4 w-4 transition-transform group-hover:translate-x-1",
                      }),
                    ],
                  }),
                }),
                _jsx(Button, {
                  asChild: true,
                  variant: "outline",
                  size: "lg",
                  className:
                    "group w-full sm:w-auto min-w-[240px] border-border/50 hover:border-primary/30 transition-all",
                  children: _jsxs("a", {
                    href: "http://localhost:5173",
                    target: "_blank",
                    rel: "noopener noreferrer",
                    children: [
                      _jsx(ExternalLink, { className: "mr-2 h-5 w-5" }),
                      "Ver Frontend P\u00FAblico",
                      _jsx(ArrowRight, {
                        className:
                          "ml-2 h-4 w-4 transition-transform group-hover:translate-x-1",
                      }),
                    ],
                  }),
                }),
              ],
            }),
          ],
        }),
      }),
      _jsx("footer", {
        className: "border-t border-border/40 bg-background/50 backdrop-blur",
        children: _jsx("div", {
          className: "container flex h-14 items-center justify-center",
          children: _jsx("p", {
            className: "text-sm text-muted-foreground",
            children:
              "\u00A9 2025 Gaudeix Municipal \u00B7 Sistema de gesti\u00F3n",
          }),
        }),
      }),
    ],
  });
}
