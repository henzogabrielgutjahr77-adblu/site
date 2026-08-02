"use client";

import { useState } from "react";

interface WhatsAppFormProps {
  whatsappUrl: string;
}

const TIPOS = [
  "Pedido de Oração",
  "Pedido de Visita",
  "Aconselhamento",
  "Outro",
];

export default function WhatsAppForm({ whatsappUrl }: WhatsAppFormProps) {
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [tipo, setTipo] = useState(TIPOS[0]);
  const [mensagem, setMensagem] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const texto = [
      "Pedido enviado pelo site:",
      "",
      `Nome: ${nome}`,
      `WhatsApp: ${whatsapp}`,
      email ? `E-mail: ${email}` : "",
      `Assunto: ${tipo}`,
      "",
      `Mensagem: ${mensagem}`,
    ]
      .filter(Boolean)
      .join("\n");
    window.open(`${whatsappUrl}?text=${encodeURIComponent(texto)}`, "_blank");
  }

  const inputClass =
    "w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30";

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 className="text-xl font-semibold text-navy-900">
        Envie seu pedido
      </h2>
      <p className="text-sm text-slate-600">
        Preencha o formulário. Ao enviar, seu pedido será aberto no WhatsApp do
        pastor.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="nome" className="mb-1 block text-sm font-medium">
            Nome *
          </label>
          <input
            id="nome"
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="whatsapp" className="mb-1 block text-sm font-medium">
            WhatsApp *
          </label>
          <input
            id="whatsapp"
            required
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="WhatsApp"
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            E-mail (opcional)
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="tipo" className="mb-1 block text-sm font-medium">
            Assunto *
          </label>
          <select
            id="tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className={inputClass}
          >
            {TIPOS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="mensagem" className="mb-1 block text-sm font-medium">
          Mensagem *
        </label>
        <textarea
          id="mensagem"
          required
          rows={4}
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          placeholder="Mensagem"
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        className="w-full rounded bg-accent px-5 py-2.5 font-medium text-white transition-colors hover:bg-orange-600 sm:w-auto"
      >
        Enviar pelo WhatsApp
      </button>
    </form>
  );
}
