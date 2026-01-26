interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}
export declare const RichTextEditor: ({
  value,
  onChange,
  placeholder,
  className,
}: RichTextEditorProps) => import("react/jsx-runtime").JSX.Element | null;
export {};
