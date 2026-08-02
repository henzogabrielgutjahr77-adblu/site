import type { Metadata } from "next";
import { isAuthed } from "@/lib/auth";
import LoginForm from "./login-form";
import Dashboard from "./dashboard";

export const metadata: Metadata = {
  title: "Administração",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const authed = await isAuthed();
  return (
    <div className="min-h-screen bg-slate-100 py-10">
      {authed ? <Dashboard /> : <LoginForm />}
    </div>
  );
}
