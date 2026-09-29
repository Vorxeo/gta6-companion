export type Scenario={crew:number;heat:number;route:"quiet"|"coast"|"downtown"};
export function simulate(s:Scenario){
  const route={quiet:{risk:-12,reward:.8,time:34},coast:{risk:2,reward:1,time:23},downtown:{risk:18,reward:1.4,time:17}}[s.route];
  return {chance:Math.max(12,Math.min(96,Math.round(82+s.crew*4-s.heat*.48-route.risk))),payout:Math.round((1600+s.crew*700)*(1+s.heat/160)*route.reward/50)*50,minutes:Math.max(9,Math.round(route.time-s.crew*1.4+s.heat*.13))};
}
