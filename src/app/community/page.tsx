import Link from "next/link";
import { ArrowLeft, ArrowUpRight, ShieldCheck, Compass, Users, ScanSearch, Vote } from "lucide-react";
import { authClient } from "@/lib/auth/server";
import { communityCopy } from "@/lib/community-copy";
import { communityExtras } from "@/lib/community-extras";
import type { Locale } from "@/lib/i18n";
import { createPost, reportPost, votePoll, votePost } from "./actions";
import "./community.css";

export const dynamic = "force-dynamic";
type Post = { id: string; author_name: string; kind: "observation" | "theory" | "crew"; title: string; body: string; source_url: string | null; source_time: number | null; platform: string | null; language: string | null; spoiler: boolean; created_at: string; community_votes?: { count: number }[] };
const choices = ["vice-city", "keys", "grassrivers"] as const;

export default async function Community({ searchParams }: { searchParams: Promise<{ kind?: string; platform?: string; lang?: string; error?: string }> }) {
  const query = await searchParams;
  const locale: Locale = query.lang === "es" ? "es" : query.lang === "pt-BR" ? "pt-BR" : query.lang === "nl" ? "nl" : "en";
  const t = communityCopy[locale];
  const x = communityExtras[locale];
  const kind = ["observation", "theory", "crew"].includes(query.kind || "") ? query.kind : undefined;
  const platform = ["ps5", "xbox", "pc"].includes(query.platform || "") ? query.platform : undefined;
  const client = await authClient();
  let user = null;
  let posts: Post[] = [];
  let connected = false;
  let pollConnected = false;
  let myVote: string | null = null;
  const totals: Record<string, number> = { "vice-city": 0, keys: 0, grassrivers: 0 };
  if (client) try {
    const auth = await client.auth.getUser();
    if (!auth.error && auth.data.user?.email_confirmed_at) user = auth.data.user;
    let builder = client.from("community_posts").select("id,author_name,kind,title,body,source_url,source_time,platform,language,spoiler,created_at,community_votes(count)").eq("status", "published").order("created_at", { ascending: false }).limit(30);
    if (kind) builder = builder.eq("kind", kind);
    if (kind === "crew" && platform) builder = builder.eq("platform", platform);
    const result = await builder;
    if (!result.error) { posts = result.data as Post[]; connected = true; }
    const poll = await client.rpc("community_poll_results");
    if (!poll.error) {
      pollConnected = true;
      for (const vote of poll.data || []) if (vote.choice in totals) totals[vote.choice] = Number(vote.votes);
    }
    if (user) {
      const own = await client.from("community_poll_votes").select("choice").eq("user_id", user.id).maybeSingle();
      if (!own.error) myVote = own.data?.choice || null;
    }
  } catch { /* Public page still renders if the database is offline. */ }
  const pollTotal = Object.values(totals).reduce((sum, n) => sum + n, 0);
  const boardUrl = (value?: string) => `/community?lang=${locale}${value ? `&kind=${value}` : ""}#board`;

  return <div className="community-page" lang={locale}>
    <header><Link href="/"><ArrowLeft size={15}/>{t.home}</Link><span>VI COMPANION / COMMUNITY</span><nav><Link href="/guide">{locale==="nl"?"GIDS":"GUIDE"}</Link><Link href="/pricing">PRO</Link><div className="community-languages" aria-label={t.language}><Link aria-current={locale === "en" ? "page" : undefined} href="/community?lang=en">EN</Link><Link aria-current={locale === "es" ? "page" : undefined} href="/community?lang=es">ES</Link><Link aria-current={locale === "pt-BR" ? "page" : undefined} href="/community?lang=pt-BR">PT</Link><Link aria-current={locale === "nl" ? "page" : undefined} href="/community?lang=nl">NL</Link></div></nav></header>
    <main>
      <section className="community-hero"><span className="merged-kicker">{t.eyebrow}</span><h1>{x.hero}</h1><p>{x.sub}</p><div className="community-hero-actions"><Link href="#board">{x.explore}<ArrowUpRight size={17}/></Link><Link href="#compose">{x.participate}<ArrowUpRight size={17}/></Link></div><span className="community-trust"><ShieldCheck size={17}/>{x.free} · {t.warning}</span></section>
      <section className="community-channels" aria-label={x.board}><Link href="#board"><ScanSearch/><strong>{x.evidence}</strong><span>{x.evidenceText}</span><ArrowUpRight size={18}/></Link><Link href="#crews"><Users/><strong>{x.crews}</strong><span>{x.crewsText}</span><ArrowUpRight size={18}/></Link><Link href="#poll"><Vote/><strong>{x.poll}</strong><span>{x.pollIntro}</span><ArrowUpRight size={18}/></Link></section>
      <section className="community-missions"><span className="merged-kicker">{x.missions}</span><h2>{x.missionsIntro}</h2><div>{[[x.hunt,x.huntText,boardUrl("observation")],[x.crewMission,x.crewMissionText,"#crews"],[x.caseMission,x.caseMissionText,boardUrl("theory")]].map(([title,desc,href],i)=><Link href={href} key={title}><span>0{i+1} / {locale==="nl"?"MISSIE":locale==="pt-BR"?"MISSÃO":locale==="es"?"MISIÓN":"MISSION"}</span><Compass size={27}/><strong>{title}</strong><p>{desc}</p><ArrowUpRight size={19}/></Link>)}</div></section>
      <section id="crews" className="community-crew-callout"><div><span className="merged-kicker">{x.crews}</span><h2>{x.crewMission}</h2><p>{x.crewsText}</p></div><Link href={boardUrl("crew")}>{x.explore}<ArrowUpRight size={18}/></Link></section>
      <section id="board"><div className="community-section-heading"><span className="merged-kicker">{x.evidence}</span><h2>{x.board}</h2><p>{x.boardIntro}</p></div><div className="community-filter" aria-label={t.filter}>{[["",t.all],["observation",t.observation],["theory",t.theory],["crew",t.crew]].map(([value,label])=><Link key={value} aria-current={(kind||"")===value?"page":undefined} href={boardUrl(value)}>{label}</Link>)}</div>
        {kind === "crew" && <div className="community-platform-filter" aria-label={x.choosePlatform}>{[["",t.all],["ps5",t.platforms.ps5],["xbox",t.platforms.xbox],["pc",t.platforms.pc]].map(([value,label])=><Link key={value} aria-current={(platform||"")===value?"page":undefined} href={`/community?lang=${locale}&kind=crew${value?`&platform=${value}`:""}#board`}>{label}</Link>)}</div>}
        {!connected && <p className="community-empty">{t.unavailable}</p>}{connected && posts.length === 0 && <div className="community-empty community-empty-rich"><span>{x.frequency}</span><h3>{t.empty}</h3><p>{x.emptyDetail}</p><Link href="#compose">{x.participate}<ArrowUpRight size={15}/></Link></div>}
        <div className="community-posts">{posts.map(post=><article key={post.id}><div className="community-post-meta"><span>{t[post.kind]}</span><span>{post.spoiler?"⚠ SPOILER":post.language||""}</span><time dateTime={post.created_at}>{new Intl.DateTimeFormat(locale,{dateStyle:"medium"}).format(new Date(post.created_at))}</time></div>{post.spoiler?<><h2>⚠ SPOILER</h2><Link href={`/community/post/${post.id}?lang=${locale}`}>{t.showSpoiler}<ArrowUpRight size={15}/></Link></>:<><h2>{post.title}</h2><p>{post.body}</p>{post.source_url&&<a href={post.source_url} target="_blank" rel="nofollow noreferrer">{t.open}<ArrowUpRight size={15}/></a>}</>}<div className="community-post-footer"><span>{post.author_name} {post.platform&&post.platform!=="unspecified"?`· ${t.platforms[post.platform as keyof typeof t.platforms]||post.platform}`:""}</span>{user&&<div><form action={votePost}><input type="hidden" name="post_id" value={post.id}/><button type="submit">♡ {t.vote} {post.community_votes?.[0]?.count||0}</button></form><form action={reportPost}><input type="hidden" name="post_id" value={post.id}/><button type="submit">{t.report}</button></form></div>}</div></article>)}</div>
      </section>
      <section id="compose" className="community-compose"><span className="merged-kicker">{t.join}</span><h2>{t.submit}</h2><p>{t.rules}</p>{query.error&&<p role="alert" className="auth-error">{t.error}</p>}{connected&&user?<form action={createPost}><div className="community-form-row"><label>{t.author}<input name="author_name" required minLength={2} maxLength={36}/></label><label>{t.language}<select name="language" defaultValue={locale}><option value="en">English</option><option value="es">Español</option><option value="pt-BR">Português (BR)</option><option value="nl">Nederlands</option></select></label></div><div className="community-form-row"><label>{t.filter}<select name="kind" defaultValue="observation"><option value="observation">{t.observation}</option><option value="theory">{t.theory}</option><option value="crew">{t.crew}</option></select></label><label>{t.platform}<select name="platform"><option value="unspecified">{t.platforms.unspecified}</option><option value="ps5">{t.platforms.ps5}</option><option value="xbox">{t.platforms.xbox}</option><option value="pc">{t.platforms.pc}</option></select></label></div><label>{t.postTitle}<input name="title" required minLength={8} maxLength={140}/></label><label>{t.body}<textarea name="body" required minLength={15} maxLength={2000} rows={6}/></label><div className="community-form-row"><label>{t.source}<input name="source_url" type="url" placeholder="https://" maxLength={500}/></label><label>{t.timestamp}<input name="source_time" type="number" min={0} max={7200}/></label></div><p className="source-hint">{t.sourceHint}</p><label className="spoiler-check"><input type="checkbox" name="spoiler"/>{t.spoiler}</label><button className="community-submit" type="submit">{t.publish}<ArrowUpRight size={16}/></button></form>:<div className="community-pro-lock"><Users size={30}/><p>{connected?t.signin:t.unavailable}</p>{connected&&<Link href="/sign-in">{t.signin}<ArrowUpRight size={15}/></Link>}</div>}</section>
      <section id="poll" className="community-poll"><span className="merged-kicker">{x.poll}</span><h2>{x.poll}</h2><p>{x.pollIntro}</p>{pollConnected?<><div className="community-poll-options">{choices.map(choice=>{const label=choice==="vice-city"?x.city:choice==="keys"?x.keys:x.grassrivers;const percent=pollTotal?Math.round(totals[choice]/pollTotal*100):0;return <form action={votePoll} key={choice}><input type="hidden" name="choice" value={choice}/><button type="submit" disabled={!user} aria-pressed={myVote===choice}><span>{label}{myVote===choice?` · ${x.voted}`:""}</span><strong>{percent}%</strong><i style={{width:`${percent}%`}}/></button></form>})}</div><small>{pollTotal} {x.votes}</small>{!user&&<Link href="/sign-in">{x.pollSignIn}<ArrowUpRight size={15}/></Link>}</>:<p className="community-empty">{t.unavailable}</p>}</section>
      <section className="community-code"><span className="merged-kicker">{x.code}</span><h2>{x.code}</h2><p>{x.codeIntro}</p><ol><li>{x.rule1}</li><li>{x.rule2}</li><li>{x.rule3}</li></ol></section>
    </main>
  </div>;
}
