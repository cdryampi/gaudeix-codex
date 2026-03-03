import { useEffect, useState } from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

describe("Select", () => {
  it("renders DB value label when options arrive asynchronously", async () => {
    function AsyncOptionsSelect() {
      const [options, setOptions] = useState<
        Array<{ id: number; name: string }>
      >([]);
      const [value] = useState<number>(2);

      useEffect(() => {
        const timer = setTimeout(() => {
          setOptions([
            { id: 1, name: "Categoria A" },
            { id: 2, name: "Categoria B" },
          ]);
        }, 0);

        return () => clearTimeout(timer);
      }, []);

      return (
        <Select value={value}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona" />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.id} value={String(option.id)}>
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    render(<AsyncOptionsSelect />);

    expect(screen.getByText("Selecciona")).toBeInTheDocument();
    expect(await screen.findByText("Categoria B")).toBeInTheDocument();
  });

  it("supports uncontrolled mode and updates label on selection", async () => {
    const user = userEvent.setup();

    render(
      <Select defaultValue="a">
        <SelectTrigger>
          <SelectValue placeholder="Selecciona" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Opción A</SelectItem>
          <SelectItem value="b">Opción B</SelectItem>
        </SelectContent>
      </Select>,
    );

    expect(screen.getByText("Opción A")).toBeInTheDocument();
    const trigger = screen.getByRole("button");
    await user.click(trigger);
    await user.click(screen.getAllByText("Opción B")[0]);
    expect(trigger).toHaveTextContent("Opción B");
  });
});
