interface SeparatorProps {
  text: string;
}

export default function Separator({ text }: SeparatorProps) {
  return (
    <div className="relative my-6">
      <div className="relative flex items-center">
        <div className="grow border-t border-gray-700"></div>
        <span className="mx-4 text-sm text-gray-400 bg-black/50 px-3 py-1 rounded-full">
          {text}
        </span>
        <div className="grow border-t border-gray-700"></div>
      </div>
    </div>
  );
}
