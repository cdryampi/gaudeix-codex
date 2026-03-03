import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./alert-dialog";

describe("Dialog", () => {
  it("opens by trigger and closes by backdrop click", async () => {
    const user = userEvent.setup();

    render(
      <Dialog>
        <DialogTrigger>Abrir</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modal</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );

    await user.click(screen.getByRole("button", { name: "Abrir" }));
    expect(screen.getByText("Modal")).toBeInTheDocument();

    await user.click(document.querySelector(".fixed.inset-0") as Element);
    expect(screen.queryByText("Modal")).not.toBeInTheDocument();
  });

  it("closes with Escape key", async () => {
    const user = userEvent.setup();

    render(
      <Dialog>
        <DialogTrigger>Abrir Escape</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modal Escape</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );

    await user.click(screen.getByRole("button", { name: "Abrir Escape" }));
    expect(screen.getByText("Modal Escape")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByText("Modal Escape")).not.toBeInTheDocument();
  });
});

describe("AlertDialog", () => {
  it("opens and closes with Escape", async () => {
    const user = userEvent.setup();

    render(
      <AlertDialog>
        <AlertDialogTrigger>Eliminar</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmación</AlertDialogTitle>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>,
    );

    await user.click(screen.getByRole("button", { name: "Eliminar" }));
    expect(screen.getByText("Confirmación")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByText("Confirmación")).not.toBeInTheDocument();
  });
});
