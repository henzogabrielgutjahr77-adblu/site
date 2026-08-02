"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, {});
  return (
    <div className="mx-auto max-w-sm px-4">
      <form action={action} className="rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Acesso restrito</h1>
        <p className="mt-1 text-sm text-slate-500">
          Entre com a senha de administração para editar o conteúdo do site.
        </p>
        <label className="mt-6 block text-sm font-medium text-slate-700" htmlFor="password">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-orange-500 focus:outline-none"
        />
        {state?.error ? (
          <p className="mt-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="mt-6 w-full rounded-md bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
        >
          {pending ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
