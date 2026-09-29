import type { Locale } from "./i18n";
export type Currency = "BRL" | "USD" | "EUR";
export const prices: Record<Currency, { monthly: number; annual: number }> = {
  BRL: { monthly: 1990, annual: 19900 }, USD: { monthly: 499, annual: 4990 }, EUR: { monthly: 499, annual: 4990 },
};
export function formatPrice(cents: number, currency: Currency, locale: Locale) {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(cents / 100);
}
const en = {
  nav:"Plans",back:"Back to VI Companion",language:"Language",currency:"Currency",eyebrow:"UNLOCK YOUR WORLD",title:"Your journey.",accent:"Without limits.",
  intro:"Discover Leonida for free. Unlock personal tools and publishing with Companion Pro.",monthly:"Monthly",annual:"Yearly",saving:"2 months free",billing:"Billing period",
  notice:"Pro includes the live tools listed below. Checkout opens when payment setup is complete.",free:"Explorer",freeTag:"FREE",freeDesc:"Take a look around. No card needed.",
  proTag:"UNLOCK PRO",proDesc:"For players who want to plan, create and join the conversation.",forever:"Always free",perMonth:"/ month",perYear:"/ year",
  annualNote:"Billed yearly. Automatically renews each year until canceled.",monthlyNote:"Billed monthly. Automatically renews each month until canceled.",
  freeCta:"Explore free",proCta:"Continue to secure checkout",included:"Included today",planned:"Included with Pro today",
  freeFeatures:["Colorful landing and cinematic scroll","Public guide and discovery","Read community discussions","English, Spanish and Brazilian Portuguese","Account creation without payment"],
  proFeatures:["Personal objectives, garage and planner","JSON backup and restore","Arcade and Creator Lab","Publish posts in the community"],
  local:"Public content stays available without Pro.",proNote:"Personal data is stored in this browser. No game or console sync is included.",
  comparison:"Find your fit.",feature:"Feature",now:"Included",future:"Pro",notIncluded:"Not included",
  rows:["Public guide and discovery","Read community posts","Three interface languages","Personal workspace and backup","Arcade and Creator Lab","Publish community posts"],
  roadmapEyebrow:"WHAT'S NEXT",roadmapTitle:"More shared stories ahead.",benefits:[
    {title:"Cloud sync",text:"A future idea. Current personal data stays in your browser."},
    {title:"Shared routes",text:"Community posts are live; advanced shared itinerary tools are planned."},
    {title:"Private clubs",text:"A planned website feature, without game or console integration."}],
  faq:"Good to know",questions:[
    {q:"What do I get with Pro?",a:"Personal workspace, backups, Arcade, Creator Lab and community publishing. Public guides and reading stay free."},
    {q:"How does billing work?",a:"Choose monthly or yearly billing in EUR or USD. Your plan renews automatically until you cancel. Cancel from Billing; access continues until the paid period ends."},
    {q:"Can I pay in Brazilian reais?",a:"BRL subscriptions are prepared through PayPal. They open after PayPal recurring is enabled and verified on the Mollie profile."},
    {q:"Do I need to own GTA VI?",a:"No. This independent fan project does not include the game or access to it."},
    {q:"What happens if checkout is unavailable?",a:"No charge is made. Checkout requires a configured Mollie account, secure webhook, legal pages and database migration before it can open."}],
  endTitle:"Explore first. Unlock when ready.",endText:"The public guide, community reading and cinematic experience are open to everyone.",footer:"Independent fan project. Not affiliated with Rockstar Games.",
  consent:"I agree to recurring billing at the price and interval shown above and have read the terms and privacy policy.",terms:"Terms",privacy:"Privacy",unavailable:"Secure checkout is being prepared. No payment is taken yet.",brlOnly:"BRL checkout via PayPal is not enabled yet.",brlMethod:"BRL renewals use PayPal, subject to Mollie profile approval.",error:"Checkout could not start. Please try again later.",billingLink:"Manage billing",plannedStatus:"Planned",
};
type Copy = typeof en;
const pt: Copy = {
  nav:"Planos",back:"Voltar ao VI Companion",language:"Idioma",currency:"Moeda",eyebrow:"DESBLOQUEIE SEU MUNDO",title:"Sua jornada.",accent:"Sem limites.",
  intro:"Descubra Leonida gratuitamente. Desbloqueie ferramentas pessoais e publicações com o Companion Pro.",monthly:"Mensal",annual:"Anual",saving:"2 meses grátis",billing:"Período de cobrança",
  notice:"O Pro inclui as ferramentas disponíveis abaixo. O checkout abre após a configuração de pagamentos.",free:"Explorer",freeTag:"GRÁTIS",freeDesc:"Explore sem cartão.",
  proTag:"DESBLOQUEIE O PRO",proDesc:"Para quem quer planejar, criar e participar da conversa.",forever:"Grátis para sempre",perMonth:"/ mês",perYear:"/ ano",
  annualNote:"Cobrança anual. Renova automaticamente a cada ano até você cancelar.",monthlyNote:"Cobrança mensal. Renova automaticamente a cada mês até você cancelar.",
  freeCta:"Explorar grátis",proCta:"Ir ao checkout seguro",included:"Incluído agora",planned:"Incluído no Pro agora",
  freeFeatures:["Landing colorida e cena cinematográfica","Guia público e descobertas","Leitura das discussões da comunidade","Português brasileiro, inglês e espanhol","Criação de conta sem pagamento"],
  proFeatures:["Objetivos pessoais, garagem e planejador","Backup e restauração em JSON","Arcade e Creator Lab","Publicar na comunidade"],
  local:"O conteúdo público continua disponível sem Pro.",proNote:"Dados pessoais ficam neste navegador. Não há sincronização com jogo ou console.",
  comparison:"Escolha seu plano.",feature:"Recurso",now:"Incluído",future:"Pro",notIncluded:"Não incluído",
  rows:["Guia público e descobertas","Leitura da comunidade","Interface em três idiomas","Workspace pessoal e backup","Arcade e Creator Lab","Publicar na comunidade"],
  roadmapEyebrow:"PRÓXIMOS PASSOS",roadmapTitle:"Mais histórias juntos.",benefits:[
    {title:"Sincronização na nuvem",text:"Uma ideia futura. Hoje seus dados pessoais ficam no navegador."},
    {title:"Roteiros compartilhados",text:"Publicações já existem; roteiros colaborativos avançados estão planejados."},
    {title:"Clubes privados",text:"Recurso planejado para o site, sem integração com jogo ou console."}],
  faq:"É bom saber",questions:[
    {q:"O que recebo com o Pro?",a:"Workspace pessoal, backups, Arcade, Creator Lab e publicação na comunidade. Guia e leitura continuam gratuitos."},
    {q:"Como funciona a cobrança?",a:"Escolha cobrança mensal ou anual em EUR ou USD. O plano renova automaticamente até você cancelar. Cancele na página Cobrança; o acesso permanece até o fim do período pago."},
    {q:"Posso pagar em reais?",a:"A assinatura em BRL está preparada via PayPal. Ela abre após habilitar e verificar a recorrência PayPal no perfil Mollie."},
    {q:"Preciso ter GTA VI?",a:"Não. Este projeto independente de fãs não inclui o jogo nem acesso a ele."},
    {q:"E se o checkout estiver indisponível?",a:"Não há cobrança. É preciso configurar a conta Mollie, webhook seguro, páginas legais e migração do banco para abrir o checkout."}],
  endTitle:"Explore primeiro. Desbloqueie quando quiser.",endText:"Guia público, leitura da comunidade e cena cinematográfica estão abertos a todos.",footer:"Projeto independente de fãs. Sem afiliação com a Rockstar Games.",
  consent:"Concordo com a cobrança recorrente pelo preço e período acima e li os termos e a política de privacidade.",terms:"Termos",privacy:"Privacidade",unavailable:"O checkout seguro está sendo preparado. Nenhum pagamento é cobrado agora.",brlOnly:"O checkout em BRL via PayPal ainda não está habilitado.",brlMethod:"A renovação em BRL usa PayPal, sujeita à aprovação do perfil Mollie.",error:"Não foi possível iniciar o checkout. Tente novamente mais tarde.",billingLink:"Gerenciar cobrança",plannedStatus:"Planejado",
};
const es: Copy = {
  nav:"Planes",back:"Volver a VI Companion",language:"Idioma",currency:"Moneda",eyebrow:"DESBLOQUEA TU MUNDO",title:"Tu viaje.",accent:"Sin límites.",
  intro:"Descubre Leonida gratis. Desbloquea herramientas personales y publicaciones con Companion Pro.",monthly:"Mensual",annual:"Anual",saving:"2 meses gratis",billing:"Periodo de facturación",
  notice:"Pro incluye las herramientas disponibles abajo. El pago se habilita tras configurar los cobros.",free:"Explorer",freeTag:"GRATIS",freeDesc:"Explora sin tarjeta.",
  proTag:"DESBLOQUEA PRO",proDesc:"Para quienes quieren planificar, crear y participar en la conversación.",forever:"Gratis siempre",perMonth:"/ mes",perYear:"/ año",
  annualNote:"Cobro anual. Se renueva automáticamente cada año hasta que canceles.",monthlyNote:"Cobro mensual. Se renueva automáticamente cada mes hasta que canceles.",
  freeCta:"Explorar gratis",proCta:"Ir al pago seguro",included:"Incluido ahora",planned:"Incluido con Pro ahora",
  freeFeatures:["Página colorida y escena cinematográfica","Guía pública y descubrimiento","Lectura de la comunidad","Español, inglés y portugués brasileño","Crear cuenta sin pagar"],
  proFeatures:["Objetivos personales, garaje y planificador","Copia y restauración en JSON","Arcade y Creator Lab","Publicar en la comunidad"],
  local:"El contenido público sigue disponible sin Pro.",proNote:"Los datos personales se guardan en este navegador. No hay sincronización con el juego ni consola.",
  comparison:"Elige tu plan.",feature:"Función",now:"Incluido",future:"Pro",notIncluded:"No incluido",
  rows:["Guía pública y descubrimiento","Leer la comunidad","Interfaz en tres idiomas","Workspace personal y copia","Arcade y Creator Lab","Publicar en la comunidad"],
  roadmapEyebrow:"PRÓXIMOS PASOS",roadmapTitle:"Más historias juntos.",benefits:[
    {title:"Sincronización en la nube",text:"Una idea futura. Hoy los datos personales se quedan en tu navegador."},
    {title:"Rutas compartidas",text:"Las publicaciones ya existen; las rutas colaborativas avanzadas están previstas."},
    {title:"Clubes privados",text:"Función prevista para la web, sin integración con juego o consola."}],
  faq:"Conviene saberlo",questions:[
    {q:"¿Qué incluye Pro?",a:"Workspace personal, copias, Arcade, Creator Lab y publicaciones en la comunidad. La guía y la lectura siguen siendo gratis."},
    {q:"¿Cómo funciona el cobro?",a:"Elige cobro mensual o anual en EUR o USD. El plan se renueva automáticamente hasta que lo canceles. Cancela en Facturación; el acceso continúa hasta el fin del periodo pagado."},
    {q:"¿Puedo pagar en reales brasileños?",a:"Las suscripciones en BRL están preparadas mediante PayPal. Se habilitarán tras verificar los cobros recurrentes en el perfil Mollie."},
    {q:"¿Necesito tener GTA VI?",a:"No. Este proyecto independiente de fans no incluye el juego ni acceso a él."},
    {q:"¿Qué pasa si el pago no está disponible?",a:"No se cobra nada. Hay que configurar Mollie, webhook seguro, páginas legales y migración de base de datos antes de habilitarlo."}],
  endTitle:"Explora primero. Desbloquea cuando quieras.",endText:"La guía pública, la lectura de la comunidad y la escena cinematográfica están abiertas a todos.",footer:"Proyecto independiente de fans. Sin afiliación con Rockstar Games.",
  consent:"Acepto los cobros recurrentes por el precio y periodo mostrados y he leído los términos y la política de privacidad.",terms:"Términos",privacy:"Privacidad",unavailable:"El pago seguro se está preparando. No se cobra nada todavía.",brlOnly:"El pago en BRL mediante PayPal aún no está habilitado.",brlMethod:"La renovación en BRL usa PayPal, sujeta a la aprobación del perfil Mollie.",error:"No se pudo iniciar el pago. Inténtalo más tarde.",billingLink:"Gestionar facturación",plannedStatus:"Previsto",
};
export const pricingCopy: Record<Locale, Copy> = {en,es,"pt-BR":pt};
export const pricingLabels: Record<Locale,string> = {en:"Plans",es:"Planes","pt-BR":"Planos"};
export const pricingTeaser: Record<Locale,{title:string;text:string;cta:string}> = {
  en:{title:"Go further with Pro.",text:"Personal tools, Arcade, Creator Lab and community publishing unlock with Pro.",cta:"Compare plans"},
  es:{title:"Ve más lejos con Pro.",text:"Herramientas personales, Arcade, Creator Lab y publicaciones se desbloquean con Pro.",cta:"Comparar planes"},
  "pt-BR":{title:"Vá mais longe com o Pro.",text:"Ferramentas pessoais, Arcade, Creator Lab e publicações são desbloqueados com o Pro.",cta:"Comparar planos"},
};
