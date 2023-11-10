import { SettingList } from "../components/SettingList";

export default function Settings({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen">
    <SettingList />
    {children}
  </div>
}