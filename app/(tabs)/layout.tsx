import { BrandBar } from "@/components/ui/BrandBar";
import { TabBar } from "@/components/ui/TabBar";

export default function TabsLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh flex-col">
      <BrandBar />
      <div className="flex-1">{children}</div>
      <TabBar />
    </div>
  );
}
