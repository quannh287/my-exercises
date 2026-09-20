import { TabBar } from "@/components/ui/TabBar";

export default function TabsLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh flex-col">
      <div className="flex-1">{children}</div>
      <TabBar />
    </div>
  );
}
