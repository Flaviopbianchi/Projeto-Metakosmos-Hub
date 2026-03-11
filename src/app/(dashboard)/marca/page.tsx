import { Header } from "@/components/layout/Header";
import { BookOpen, Palette, Type, Layers } from "lucide-react";

const sections = [
  { label: "Cores", icon: Palette, desc: "Paleta de cores da marca" },
  { label: "Tipografia", icon: Type, desc: "Fontes e hierarquia tipográfica" },
  { label: "Logo", icon: Layers, desc: "Variações e usos do logotipo" },
  { label: "Guia", icon: BookOpen, desc: "Manual completo de marca" },
];

const colors = [
  { name: "Violet", hex: "#7c3aed", class: "bg-violet-600" },
  { name: "Indigo", hex: "#4f46e5", class: "bg-indigo-600" },
  { name: "Dark", hex: "#0d0d14", class: "bg-[#0d0d14] border border-white/10" },
  { name: "White", hex: "#ffffff", class: "bg-white" },
];

export default function MarcaPage() {
  return (
    <div className="flex flex-col flex-1">
      <Header title="Manual de Marca" subtitle="Identidade visual Metakosmos" />
      <div className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {sections.map(({ label, icon: Icon, desc }) => (
            <div
              key={label}
              className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-violet-500/40 transition-colors cursor-pointer"
            >
              <Icon size={20} className="text-violet-400 mb-3" />
              <p className="text-white font-medium text-sm">{label}</p>
              <p className="text-white/30 text-xs mt-1">{desc}</p>
            </div>
          ))}
        </div>

        {/* Cores */}
        <div>
          <h2 className="text-white/50 text-xs uppercase tracking-wider mb-3">
            Paleta de cores
          </h2>
          <div className="flex gap-3">
            {colors.map(({ name, hex, class: cls }) => (
              <div key={name} className="flex flex-col items-center gap-2">
                <div className={`w-12 h-12 rounded-lg ${cls}`} />
                <span className="text-white/40 text-xs">{name}</span>
                <span className="text-white/20 text-xs">{hex}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
