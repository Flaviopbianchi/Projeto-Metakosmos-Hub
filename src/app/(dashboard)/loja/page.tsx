import { Header } from "@/components/layout/Header";
import { ShoppingBag } from "lucide-react";

const products = [
  { name: "Camiseta Metakosmos", category: "Roupas", price: "R$ —", emoji: "👕" },
  { name: "Caneca Kosmos", category: "Canecas", price: "R$ —", emoji: "☕" },
  { name: "Adesivo Pack", category: "Adesivos", price: "R$ —", emoji: "🎨" },
  { name: "Prêmio Especial", category: "Prêmios", price: "—", emoji: "🏆" },
];

export default function LojaPage() {
  return (
    <div className="flex flex-col flex-1">
      <Header title="Loja" subtitle="Produtos e prêmios Metakosmos" />
      <div className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map(({ name, category, price, emoji }) => (
            <div
              key={name}
              className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-violet-500/40 transition-colors cursor-pointer"
            >
              <div className="text-4xl mb-3">{emoji}</div>
              <p className="text-white/30 text-xs mb-1">{category}</p>
              <p className="text-white font-medium text-sm">{name}</p>
              <p className="text-violet-400 text-sm mt-1">{price}</p>
            </div>
          ))}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
          <ShoppingBag size={32} className="text-violet-400 mx-auto mb-3" />
          <p className="text-white/40 text-sm">
            Adicione os produtos reais da loja Metakosmos aqui.
          </p>
        </div>
      </div>
    </div>
  );
}
