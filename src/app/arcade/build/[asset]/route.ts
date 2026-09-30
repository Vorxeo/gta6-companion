import {readFile} from "node:fs/promises";
import path from "node:path";
import {authClient} from "@/lib/auth/server";
import {hasActiveSubscription} from "@/lib/auth/policy";

export const dynamic="force-dynamic";

const types:Record<string,string>={
  "index.html":"text/html; charset=utf-8",
  "index.js":"text/javascript; charset=utf-8",
  "index.wasm":"application/wasm",
  "index.pck":"application/octet-stream",
  "index.png":"image/png",
  "index.icon.png":"image/png",
  "index.apple-touch-icon.png":"image/png",
  "index.audio.worklet.js":"text/javascript; charset=utf-8",
  "index.audio.position.worklet.js":"text/javascript; charset=utf-8",
};

export async function GET(_request:Request,{params}:{params:Promise<{asset:string}>}){
  const {asset}=await params;
  if(!Object.hasOwn(types,asset))return new Response("Not found",{status:404});
  const client=await authClient();
  if(!client)return new Response("Authentication required",{status:401});
  const {data:{user},error:authError}=await client.auth.getUser();
  if(authError||!user?.email_confirmed_at)return new Response("Authentication required",{status:401});
  const {data,error}=await client.from("subscriptions").select("provider,status,current_period_end").eq("user_id",user.id).maybeSingle();
  if(error||!hasActiveSubscription(data))return new Response("Pro subscription required",{status:403});
  const folder=asset==="index.html"||asset==="index.pck"
    ?path.join(process.cwd(),"game","godot","pro-web")
    :path.join(process.cwd(),"public","arcade-godot");
  try{
    const content=await readFile(path.join(folder,asset));
    return new Response(new Uint8Array(content),{headers:{"Content-Type":types[asset],"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff","Cross-Origin-Resource-Policy":"same-origin"}});
  }catch{
    return new Response("Game build unavailable",{status:503});
  }
}
