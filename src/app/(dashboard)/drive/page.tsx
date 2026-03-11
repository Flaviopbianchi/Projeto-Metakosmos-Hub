import { Header } from "@/components/layout/Header";
import { HardDrive, Folder, ExternalLink } from "lucide-react";

const folders = [
  { name: "Marca & Identidade", href: "#" },
  { name: "Projetos", href: "#" },
  { name: "Marketing", href: "#" },
  { name: "Financeiro", href: "#" },
];

export default function DrivePage() {
  return (
    <div className="flex flex-col flex-1">
      <Header title="Google Drive" subtitle="Acesso rápido às pastas" />
      <div className="flex-1 p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {folders.map(({ name, href }) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-4 py-4 bg-white/5 border border-white/10 rounded-xl hover:border-violet-500/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Folder size={18} className="text-violet-400" />
                <span className="text-white/70 text-sm">{name}</span>
              </div>
              <ExternalLink size={14} className="text-white/20" />
            </a>
          ))}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
          <HardDrive size={32} className="text-violet-400 mx-auto mb-3" />
          <p className="text-white/40 text-sm">
            Adicione os links das suas pastas do Google Drive no código para
            acesso direto.
          </p>
        </div>
      </div>
    </div>
  );
}
