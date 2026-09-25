import Link from "next/link";
import {
  Map,
  CheckSquare,
  CalendarClock,
  TrendingUp,
  Car,
  Zap,
} from "lucide-react";

const features = [
  {
    title: "Mapa Interativo",
    description:
      "Explore Leonida com camadas avançadas, filtros e dados transparentes de origem.",
    href: "/map",
    icon: Map,
    color: "from-sky-500 to-blue-600",
  },
  {
    title: "Tracker 100%",
    description:
      "Acompanhe coletáveis, missões e progresso com spoiler shield inteligente.",
    href: "/tracker",
    icon: CheckSquare,
    color: "from-emerald-500 to-green-600",
  },
  {
    title: "Session Planner",
    description:
      "Defina tempo e objetivos. Receba a rota otimizada e sequência ideal de atividades.",
    href: "/planner",
    icon: CalendarClock,
    color: "from-violet-500 to-purple-600",
  },
  {
    title: "Economy Simulator",
    description:
      "ROI de negócios, veículos e propriedades. Melhor caminho de grind atualizado.",
    href: "/economy",
    icon: TrendingUp,
    color: "from-amber-500 to-orange-600",
  },
  {
    title: "Garage Manager",
    description:
      "Organize veículos, upgrades e valor total da coleção com recomendações.",
    href: "/garage",
    icon: Car,
    color: "from-rose-500 to-pink-600",
  },
  {
    title: "Ferramentas Pro",
    description:
      "Alertas, exports para criadores, analytics pessoais e muito mais.",
    href: "/tools",
    icon: Zap,
    color: "from-cyan-500 to-teal-600",
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Hero */}
      <section className="mb-16 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1.5 text-sm text-sky-300">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-500" />
          </span>
          Lançamento GTA 6 · 19 Nov 2026
        </div>
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
          O companion que{