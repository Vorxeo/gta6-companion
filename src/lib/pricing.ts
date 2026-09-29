import type { Locale } from "./i18n";
export type Currency = "BRL" | "USD" | "EUR";
export const prices: Record<Currency, { monthly: number; annual: number }> = {
  BRL: { monthly: 1990, annual: 19900 },
  USD: { monthly: 499, annual: 4990 },
  EUR: { monthly: 499, annual: 4990 },
};
export function formatPrice(cents: number, currency: Currency, locale: Locale) {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(cents / 100);
}
const en = {
  nav: "Plans", back: "Back to your companion", language: "Language", currency: "Currency",
  eyebrow: "YOUR NEXT CHAPTER", title: "More adventures.", accent: "A plan that fits.",
  intro: "Start with your own space. Make room for a more connected journey when Pro arrives.",
  monthly: "Monthly", annual: "Yearly", saving: "2 months less", billing: "Billing period",
  notice: "Pro preview · Proposed prices, subject to change. Subscriptions are not on sale yet.",
  free: "Explorer", freeTag: "AVAILABLE NOW", freeDesc: "Your journey starts here. An account is required; no card needed.",
  proTag: "IN DEVELOPMENT", proDesc: "For players who want their plans, progress and people in one place.",
  forever: "Free access", perMonth: "/ month", perYear: "/ year", annualNote: "Proposed yearly total. Equivalent to 10 monthly payments.", monthlyNote: "Proposed monthly price. No charge today.",
  freeCta: "Start exploring free", proCta: "Explore the Pro roadmap", included: "What you can use today", planned: "Everything in Explorer, plus planned features:",
  freeFeatures: ["Personal objectives and progress", "Wishlist garage and favorites", "Session planner and timer", "JSON backup and restore", "English, Spanish and Brazilian Portuguese"],
  proFeatures: ["Sync your journey across devices", "Save and adapt community itineraries", "Private clubs and shared planning", "Personal session history and insights"],
  local: "Your lists are saved in this browser. No cloud sync yet.", proNote: "These Pro features are planned and not yet available. No automatic game or console sync is promised.",
  comparison: "Choose with the full picture.", feature: "Feature", now: "Available", future: "Planned", notIncluded: "Not included",
  rows: ["Objectives, garage and timer", "JSON data export", "Three interface languages", "Cross-device sync", "Advanced shared itineraries", "Private clubs"],
  roadmapEyebrow: "THE PRO DIRECTION", roadmapTitle: "Less setup. More shared stories.",
  benefits: [
    { title: "Pick up where you left off.", text: "Plan on your computer. Open the same saved journey on your phone. Cross-device sync is planned for Pro." },
    { title: "Make a great route your own.", text: "Adapt community itineraries to your time and interests. Advanced itinerary tools are planned; gameplay routes need verified data." },
    { title: "Bring your people together.", text: "Build a private space to organize challenges and plans with friends. Clubs will live on the website, without requiring game integration." },
  ],
  faq: "A few things worth knowing.",
  questions: [
    { q: "Can I subscribe to Pro today?", a: "Not yet. This page previews the proposed offer. There is no checkout, charge or active subscription. You can create an account to use Explorer when registration opens." },
    { q: "Will my current tools become paid?", a: "This proposal keeps today's personal objectives, garage, planner and backups in Explorer. Pro is designed around new connected features." },
    { q: "Why show prices before launch?", a: "So you can assess the proposed value early. Prices and features may change before sales open; final billing terms will be shown before any purchase." },
    { q: "Do I need to own GTA VI?", a: "You can use the personal planning tools without connecting a game account. This fan project does not include GTA VI or access to the game." },
    { q: "What about the community?", a: "The community is being designed. The proposal keeps public discovery and participation accessible, while Pro adds advanced planning and private spaces. None of these community services are live yet." },
  ],
  endTitle: "Your first adventure costs nothing.", endText: "Try the tools. Build your rhythm. Choose more when it is right for you.",
  footer: "Independent fan project. Not affiliated with Rockstar Games.",
};
type Copy = typeof en;
const pt: Copy = {
  nav: "Planos", back: "Voltar ao companion", language: "Idioma", currency: "Moeda",
  eyebrow: "SEU PRÓXIMO CAPÍTULO", title: "Mais aventuras.", accent: "Um plano que combina.",
  intro: "Comece com um espaço só seu. Prepare-se para uma jornada mais conectada quando o Pro chegar.",
  monthly: "Mensal", annual: "Anual", saving: "2 meses a menos", billing: "Período de cobrança",
  notice: "Prévia do Pro · Preços previstos, sujeitos a alteração. Assinaturas ainda não estão à venda.",
  free: "Explorer", freeTag: "DISPONÍVEL AGORA", freeDesc: "Sua jornada começa aqui. É preciso ter conta; sem cartão.",
  proTag: "EM DESENVOLVIMENTO", proDesc: "Para quem quer planos, progresso e sua turma no mesmo lugar.",
  forever: "Acesso gratuito", perMonth: "/ mês", perYear: "/ ano", annualNote: "Total anual previsto. Equivale a 10 mensalidades.", monthlyNote: "Preço mensal previsto. Nenhuma cobrança hoje.",
  freeCta: "Começar a explorar grátis", proCta: "Conhecer o futuro do Pro", included: "O que você pode usar hoje", planned: "Tudo do Explorer, mais os recursos planejados:",
  freeFeatures: ["Objetivos pessoais e progresso", "Garagem de desejos e favoritos", "Planejador de sessões e cronômetro", "Backup e restauração em JSON", "Português brasileiro, inglês e espanhol"],
  proFeatures: ["Sua jornada sincronizada entre dispositivos", "Salvar e adaptar roteiros da comunidade", "Clubes privados e planejamento em grupo", "Histórico e análise das suas sessões"],
  local: "Suas listas ficam neste navegador. Ainda sem sincronização na nuvem.", proNote: "Esses recursos Pro estão planejados e ainda não estão disponíveis. Não há promessa de sincronização automática com o jogo ou console.",
  comparison: "Escolha com tudo às claras.", feature: "Recurso", now: "Disponível", future: "Planejado", notIncluded: "Não incluído",
  rows: ["Objetivos, garagem e cronômetro", "Exportação de dados em JSON", "Interface em três idiomas", "Sincronização entre dispositivos", "Roteiros compartilhados avançados", "Clubes privados"],
  roadmapEyebrow: "O FUTURO DO PRO", roadmapTitle: "Menos preparação. Mais histórias juntos.",
  benefits: [
    { title: "Continue de onde parou.", text: "Planeje no computador. Abra a mesma jornada salva no celular. A sincronização entre dispositivos está prevista para o Pro." },
    { title: "Dê seu toque a um ótimo roteiro.", text: "Adapte roteiros da comunidade ao seu tempo e interesses. As ferramentas avançadas estão planejadas; rotas no jogo dependem de dados verificados." },
    { title: "Reúna sua turma.", text: "Tenha um espaço privado para organizar desafios e planos com amigos. Os clubes funcionarão no site, sem depender de integração com o jogo." },
  ],
  faq: "Algumas coisas que você precisa saber.",
  questions: [
    { q: "Já posso assinar o Pro?", a: "Ainda não. Esta página apresenta a oferta prevista. Não há checkout, cobrança ou assinatura ativa. Você poderá criar uma conta para usar o Explorer quando os cadastros abrirem." },
    { q: "As ferramentas atuais vão se tornar pagas?", a: "Esta proposta mantém objetivos pessoais, garagem, planejador e backups atuais no Explorer. O Pro é voltado a novos recursos conectados." },
    { q: "Por que mostrar preços antes do lançamento?", a: "Para você avaliar a proposta desde já. Preços e recursos podem mudar antes da abertura das vendas; as condições finais aparecerão antes de qualquer compra." },
    { q: "Preciso ter GTA VI?", a: "Você pode usar as ferramentas de planejamento sem conectar uma conta do jogo. Este projeto de fãs não inclui GTA VI nem acesso ao jogo." },
    { q: "E a comunidade?", a: "A comunidade está sendo planejada. A proposta mantém descoberta e participação públicas acessíveis, enquanto o Pro adiciona planejamento avançado e espaços privados. Esses serviços de comunidade ainda não estão ativos." },
  ],
  endTitle: "Sua primeira aventura não custa nada.", endText: "Experimente as ferramentas. Encontre seu ritmo. Escolha mais quando fizer sentido.",
  footer: "Projeto independente de fãs. Sem afiliação com a Rockstar Games.",
};
const es: Copy = {
  nav: "Planes", back: "Volver al companion", language: "Idioma", currency: "Moneda",
  eyebrow: "TU PRÓXIMO CAPÍTULO", title: "Más aventuras.", accent: "Un plan a tu medida.",
  intro: "Empieza con tu propio espacio. Prepárate para un viaje más conectado cuando llegue Pro.",
  monthly: "Mensual", annual: "Anual", saving: "2 meses menos", billing: "Periodo de facturación",
  notice: "Vista previa de Pro · Precios propuestos, sujetos a cambios. Las suscripciones aún no están a la venta.",
  free: "Explorer", freeTag: "DISPONIBLE AHORA", freeDesc: "Tu viaje empieza aquí. Necesitas una cuenta; sin tarjeta.",
  proTag: "EN DESARROLLO", proDesc: "Para quienes quieren sus planes, progreso y amigos en un mismo lugar.",
  forever: "Acceso gratuito", perMonth: "/ mes", perYear: "/ año", annualNote: "Total anual propuesto. Equivale a 10 mensualidades.", monthlyNote: "Precio mensual propuesto. Sin cobros hoy.",
  freeCta: "Empezar a explorar gratis", proCta: "Descubrir el futuro de Pro", included: "Lo que puedes usar hoy", planned: "Todo lo de Explorer, más las funciones previstas:",
  freeFeatures: ["Objetivos personales y progreso", "Garaje de deseos y favoritos", "Planificador de sesiones y temporizador", "Copia y restauración en JSON", "Español, inglés y portugués brasileño"],
  proFeatures: ["Tu viaje sincronizado entre dispositivos", "Guardar y adaptar rutas de la comunidad", "Clubes privados y planificación en grupo", "Historial y análisis de tus sesiones"],
  local: "Tus listas se guardan en este navegador. Aún sin sincronización en la nube.", proNote: "Estas funciones Pro están previstas y aún no están disponibles. No se promete sincronización automática con el juego o la consola.",
  comparison: "Elige con toda la información.", feature: "Función", now: "Disponible", future: "Prevista", notIncluded: "No incluida",
  rows: ["Objetivos, garaje y temporizador", "Exportación de datos en JSON", "Interfaz en tres idiomas", "Sincronización entre dispositivos", "Rutas compartidas avanzadas", "Clubes privados"],
  roadmapEyebrow: "EL FUTURO DE PRO", roadmapTitle: "Menos preparación. Más historias juntos.",
  benefits: [
    { title: "Sigue donde lo dejaste.", text: "Planifica en el ordenador. Abre el mismo viaje guardado en el móvil. La sincronización entre dispositivos está prevista para Pro." },
    { title: "Haz tuya una gran ruta.", text: "Adapta rutas de la comunidad a tu tiempo e intereses. Las herramientas avanzadas están previstas; las rutas del juego necesitan datos verificados." },
    { title: "Reúne a tu gente.", text: "Crea un espacio privado para organizar retos y planes con amigos. Los clubes funcionarán en la web, sin depender de una integración con el juego." },
  ],
  faq: "Algunas cosas que debes saber.",
  questions: [
    { q: "¿Puedo suscribirme a Pro hoy?", a: "Todavía no. Esta página presenta la oferta prevista. No hay pago, cobro ni suscripción activa. Podrás crear una cuenta para usar Explorer cuando se abran los registros." },
    { q: "¿Las herramientas actuales pasarán a ser de pago?", a: "Esta propuesta mantiene los objetivos personales, garaje, planificador y copias actuales en Explorer. Pro se centra en nuevas funciones conectadas." },
    { q: "¿Por qué mostrar precios antes del lanzamiento?", a: "Para que puedas evaluar la propuesta desde ahora. Los precios y funciones pueden cambiar antes de abrir las ventas; las condiciones finales aparecerán antes de cualquier compra." },
    { q: "¿Necesito tener GTA VI?", a: "Puedes usar las herramientas de planificación sin conectar una cuenta del juego. Este proyecto de fans no incluye GTA VI ni acceso al juego." },
    { q: "¿Y la comunidad?", a: "La comunidad está en fase de planificación. La propuesta mantiene el descubrimiento y la participación públicos accesibles, mientras Pro añade planificación avanzada y espacios privados. Estos servicios de comunidad aún no están activos." },
  ],
  endTitle: "Tu primera aventura no cuesta nada.", endText: "Prueba las herramientas. Encuentra tu ritmo. Elige más cuando te convenga.",
  footer: "Proyecto independiente de fans. Sin afiliación con Rockstar Games.",
};
export const pricingCopy: Record<Locale, Copy> = { en, es, "pt-BR": pt };
export const pricingLabels: Record<Locale, string> = { en: "Plans", es: "Planes", "pt-BR": "Planos" };
export const pricingTeaser: Record<Locale, { title: string; text: string; cta: string }> = {
  en: { title: "Your next chapter, connected.", text: "Explore the planned Pro experience. Your personal tools stay free.", cta: "Compare plans" },
  es: { title: "Tu próximo capítulo, conectado.", text: "Descubre la experiencia Pro prevista. Tus herramientas personales siguen siendo gratuitas.", cta: "Comparar planes" },
  "pt-BR": { title: "Seu próximo capítulo, conectado.", text: "Conheça a experiência Pro planejada. Suas ferramentas pessoais continuam gratuitas.", cta: "Comparar planos" },
};
