type Props = {
  children: React.ReactNode;
};

export function ChatBubble({children}: Props) {
  return <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm border border-gray-100">{children}</div>;
}
