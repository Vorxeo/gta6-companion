import type { Locale } from "../i18n";
const en = {
  signin: "Sign in", signup: "Create account", forgot: "Recover access", reset: "Choose a new password", signout: "Sign out",
  eyebrow: "YOUR SPACE IN LEONIDA", intro: "One account. Your plans, your progress, your next chapter.",
  email: "Email", password: "Password", newPassword: "New password", show: "Show password", hide: "Hide password",
  language: "Language", home: "Back to the website", plans: "View plans", account: "Your account", working: "Please wait…",
  signinText: "Sign in to join the community or use your Pro tools.", signupText: "Create an account to publish and vote in the community. Personal tools require Pro.",
  forgotText: "Enter your email to request a password reset link.", resetText: "Use a new password with at least 12 characters.",
  hint: "At least 12 characters. Use a unique password.", forgotLink: "Forgot your password?", haveAccount: "Already have an account?", noAccount: "New here?",
  unavailable: "Account access is not available yet. Please check back once registration opens.",
  failed: "We could not complete this request. Check your details and email confirmation, or try again later.", invalid: "Check your email and password requirements.",
  sent: "Check your inbox. If the request is eligible, you will receive a link to continue. Check spam too.",
  updated: "Password updated. You can now open your workspace.", open: "Open my workspace",
  confirmation: "This link is invalid or expired. Request a new link or try signing in.",
  note: "Current tools save data in this browser, separately for each account. Cloud sync is not available yet.",
  protect: "Community participation needs a confirmed account. Personal tools also need Pro.",
};
type Copy = typeof en;
const pt: Copy = {
  signin: "Entrar", signup: "Criar conta", forgot: "Recuperar acesso", reset: "Escolha uma nova senha", signout: "Sair",
  eyebrow: "SEU ESPAÇO EM LEONIDA", intro: "Uma conta. Seus planos, seu progresso, seu próximo capítulo.",
  email: "E-mail", password: "Senha", newPassword: "Nova senha", show: "Mostrar senha", hide: "Ocultar senha",
  language: "Idioma", home: "Voltar ao site", plans: "Ver planos", account: "Sua conta", working: "Aguarde…",
  signinText: "Entre para participar da comunidade ou usar suas ferramentas Pro.", signupText: "Crie uma conta para publicar e votar na comunidade. Ferramentas pessoais exigem Pro.",
  forgotText: "Informe seu e-mail para solicitar um link de recuperação de senha.", resetText: "Use uma nova senha com pelo menos 12 caracteres.",
  hint: "Pelo menos 12 caracteres. Use uma senha exclusiva.", forgotLink: "Esqueceu sua senha?", haveAccount: "Já tem uma conta?", noAccount: "Primeira vez por aqui?",
  unavailable: "O acesso por conta ainda não está disponível. Volte quando os cadastros forem abertos.",
  failed: "Não foi possível concluir. Confira seus dados e a confirmação de e-mail, ou tente novamente mais tarde.", invalid: "Confira o e-mail e os requisitos da senha.",
  sent: "Confira sua caixa de entrada. Se a solicitação puder ser atendida, você receberá um link para continuar. Verifique também o spam.",
  updated: "Senha atualizada. Você já pode abrir seu espaço.", open: "Abrir meu espaço",
  confirmation: "Este link é inválido ou expirou. Solicite outro link ou tente entrar.",
  note: "As ferramentas atuais salvam dados neste navegador, separados por conta. A sincronização na nuvem ainda não está disponível.",
  protect: "Participar da comunidade exige conta confirmada. Ferramentas pessoais também exigem Pro.",
};
const es: Copy = {
  signin: "Iniciar sesión", signup: "Crear cuenta", forgot: "Recuperar acceso", reset: "Elige una contraseña nueva", signout: "Cerrar sesión",
  eyebrow: "TU ESPACIO EN LEONIDA", intro: "Una cuenta. Tus planes, tu progreso, tu próximo capítulo.",
  email: "Correo electrónico", password: "Contraseña", newPassword: "Nueva contraseña", show: "Mostrar contraseña", hide: "Ocultar contraseña",
  language: "Idioma", home: "Volver al sitio", plans: "Ver planes", account: "Tu cuenta", working: "Espera…",
  signinText: "Inicia sesión para participar en la comunidad o usar tus herramientas Pro.", signupText: "Crea una cuenta para publicar y votar en la comunidad. Las herramientas personales requieren Pro.",
  forgotText: "Introduce tu correo para solicitar un enlace de recuperación.", resetText: "Usa una contraseña nueva de al menos 12 caracteres.",
  hint: "Al menos 12 caracteres. Usa una contraseña única.", forgotLink: "¿Olvidaste tu contraseña?", haveAccount: "¿Ya tienes cuenta?", noAccount: "¿Es tu primera visita?",
  unavailable: "El acceso con cuenta aún no está disponible. Vuelve cuando se abran los registros.",
  failed: "No se pudo completar la solicitud. Revisa tus datos y la confirmación de correo, o inténtalo más tarde.", invalid: "Revisa el correo y los requisitos de contraseña.",
  sent: "Revisa tu bandeja de entrada. Si la solicitud es válida, recibirás un enlace para continuar. Comprueba también el spam.",
  updated: "Contraseña actualizada. Ya puedes abrir tu espacio.", open: "Abrir mi espacio",
  confirmation: "Este enlace no es válido o ha caducado. Solicita otro o intenta iniciar sesión.",
  note: "Las herramientas actuales guardan datos en este navegador, separados por cuenta. Aún no hay sincronización en la nube.",
  protect: "Participar en la comunidad requiere una cuenta confirmada. Las herramientas personales también requieren Pro.",
};
const nl:Copy={signin:"Inloggen",signup:"Account maken",forgot:"Toegang herstellen",reset:"Kies een nieuw wachtwoord",signout:"Uitloggen",eyebrow:"JOUW PLEK IN LEONIDA",intro:"Eén account. Jouw plannen, voortgang en volgende hoofdstuk.",email:"E-mail",password:"Wachtwoord",newPassword:"Nieuw wachtwoord",show:"Wachtwoord tonen",hide:"Wachtwoord verbergen",language:"Taal",home:"Terug naar de website",plans:"Bekijk abonnementen",account:"Jouw account",working:"Even geduld…",signinText:"Log in om je persoonlijke tools te openen.",signupText:"Maak een account om deel te nemen aan de gemeenschap. Persoonlijke tools horen bij Pro.",forgotText:"Vul je e-mailadres in om een herstellink aan te vragen.",resetText:"Gebruik een nieuw wachtwoord met minstens 12 tekens.",hint:"Minstens 12 tekens. Gebruik een uniek wachtwoord.",forgotLink:"Wachtwoord vergeten?",haveAccount:"Heb je al een account?",noAccount:"Nieuw hier?",unavailable:"Accounttoegang is nog niet beschikbaar. Kom terug zodra registratie opent.",failed:"De aanvraag is niet gelukt. Controleer je gegevens en e-mailbevestiging of probeer het later opnieuw.",invalid:"Controleer je e-mailadres en wachtwoordvereisten.",sent:"Controleer je inbox. Als de aanvraag in aanmerking komt, ontvang je een link. Kijk ook in spam.",updated:"Wachtwoord bijgewerkt. Je kunt nu je werkruimte openen.",open:"Open mijn werkruimte",confirmation:"Deze link is ongeldig of verlopen. Vraag een nieuwe aan of log in.",note:"Huidige tools bewaren gegevens per account in deze browser. Er is nog geen cloudsynchronisatie.",protect:"Voor de tools is een account nodig. Pro is een apart abonnement."};
export const authCopy: Record<Locale, Copy> = { en, es, "pt-BR": pt, nl };
