import { useState, useEffect, useRef } from "react";
import * as d3 from "d3";

// ── Electricity price data per province ──────────────────────────────────────
const PRICE_DATA = {
  "新疆":   { price:368, peak:588, valley:147, trend:"down" },
  "西藏":   { price:342, peak:547, valley:137, trend:"down" },
  "青海":   { price:382, peak:611, valley:153, trend:"stable" },
  "甘肃":   { price:395, peak:632, valley:158, trend:"stable" },
  "宁夏":   { price:402, peak:643, valley:161, trend:"down" },
  "内蒙古": { price:445, peak:712, valley:178, trend:"down" },
  "陕西":   { price:438, peak:701, valley:175, trend:"stable" },
  "山西":   { price:452, peak:723, valley:181, trend:"down" },
  "河北":   { price:467, peak:747, valley:187, trend:"up" },
  "北京":   { price:478, peak:765, valley:191, trend:"up" },
  "天津":   { price:485, peak:776, valley:194, trend:"stable" },
  "辽宁":   { price:482, peak:771, valley:193, trend:"up" },
  "吉林":   { price:498, peak:797, valley:199, trend:"down" },
  "黑龙江": { price:523, peak:837, valley:209, trend:"up" },
  "山东":   { price:523, peak:837, valley:209, trend:"up" },
  "河南":   { price:469, peak:750, valley:188, trend:"up" },
  "湖北":   { price:502, peak:803, valley:201, trend:"up" },
  "江苏":   { price:535, peak:856, valley:214, trend:"up" },
  "安徽":   { price:518, peak:829, valley:207, trend:"up" },
  "上海":   { price:612, peak:979, valley:245, trend:"up" },
  "浙江":   { price:558, peak:893, valley:223, trend:"up" },
  "江西":   { price:489, peak:782, valley:196, trend:"stable" },
  "福建":   { price:532, peak:851, valley:213, trend:"up" },
  "湖南":   { price:488, peak:781, valley:195, trend:"stable" },
  "贵州":   { price:456, peak:730, valley:182, trend:"stable" },
  "四川":   { price:478, peak:765, valley:191, trend:"up" },
  "重庆":   { price:492, peak:787, valley:197, trend:"up" },
  "云南":   { price:432, peak:691, valley:173, trend:"down" },
  "广西":   { price:512, peak:819, valley:205, trend:"stable" },
  "广东":   { price:578, peak:925, valley:231, trend:"up" },
  "海南":   { price:598, peak:957, valley:239, trend:"up" },
  "台湾":   { price:520, peak:832, valley:208, trend:"stable" },
  "香港":   { price:680, peak:1088, valley:272, trend:"up" },
  "澳门":   { price:660, peak:1056, valley:264, trend:"stable" },
};

const allPrices = Object.values(PRICE_DATA).map(d=>d.price);
const minP = Math.min(...allPrices), maxP = Math.max(...allPrices);

const colorScale = d3.scaleLinear()
  .domain([minP, minP+(maxP-minP)*0.33, minP+(maxP-minP)*0.66, maxP])
  .range(["#c8e8fa", "#7ec8f0", "#2e8bc0", "#0d4a9e"]);

const Trend = ({t,size=10}) => {
  if (t==="up")   return <span style={{color:"#f44336",fontSize:size}}>▲</span>;
  if (t==="down") return <span style={{color:"#26c6da",fontSize:size}}>▼</span>;
  return <span style={{color:"#90a4ae",fontSize:size}}>─</span>;
};

const today = new Date();
const fmtDate = d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const DATES = [0,1,2].map(i=>{const d=new Date(today);d.setDate(d.getDate()-i);return fmtDate(d);});

// ── China Map Component ───────────────────────────────────────────────────────
function ChinaMap({ selected, onSelect }) {
  const svgRef = useRef(null);
  const [geoData, setGeoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paths, setPaths]     = useState([]);

  // Fetch real China GeoJSON
  useEffect(() => {
    fetch("https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json")
      .then(r => r.json())
      .then(data => {
        setGeoData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Build SVG paths when data arrives
  useEffect(() => {
    if (!geoData) return;
    const W = 340, H = 280;
    const proj = d3.geoMercator()
      .center([105, 36])
      .scale(370)
      .translate([W/2, H/2]);
    const path = d3.geoPath().projection(proj);

    const built = geoData.features.map(f => {
      const name = f.properties.name;
      const data = PRICE_DATA[name] || null;
      let centroid = [0,0];
      try { centroid = path.centroid(f); } catch(e){}
      return {
        id: f.properties.adcode || name,
        name,
        d: path(f),
        centroid,
        data,
      };
    });
    setPaths(built);
  }, [geoData]);

  const W = 340, H = 280;

  return (
    <div style={{background:"#deeeff",borderRadius:12,overflow:"hidden",position:"relative"}}>
      {loading && (
        <div style={{height:280,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:8}}>
          <div style={{width:32,height:32,border:"3px solid #e3f2fd",borderTop:"3px solid #1565c0",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
          <div style={{fontSize:12,color:"#78909c"}}>地图加载中...</div>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}
      {!loading && paths.length === 0 && (
        <div style={{height:280,display:"flex",alignItems:"center",justifyContent:"center",color:"#90a4ae",fontSize:12}}>
          地图数据加载失败，请检查网络连接
        </div>
      )}
      {!loading && paths.length > 0 && (
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} width="100%" style={{display:"block"}}>
          <defs>
            <filter id="provShadow">
              <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#1565c0" floodOpacity="0.2"/>
            </filter>
            <filter id="selGlow">
              <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#ffffff" floodOpacity="1"/>
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#1565c0" floodOpacity="0.6"/>
            </filter>
          </defs>

          {/* Sea bg */}
          <rect width={W} height={H} fill="#deeeff"/>

          {paths.map(p => {
            if (!p.d) return null;
            const isSel = selected?.name === p.name;
            const fill  = p.data ? colorScale(p.data.price) : "#e8f4ff";
            const cx = p.centroid[0], cy = p.centroid[1];
            const inBounds = cx>0&&cx<W&&cy>0&&cy<H&&!isNaN(cx)&&!isNaN(cy);
            return (
              <g key={p.id}
                onClick={() => onSelect(isSel ? null : (p.data ? p : null))}
                style={{cursor: p.data ? "pointer" : "default"}}
                filter={isSel ? "url(#selGlow)" : "url(#provShadow)"}
              >
                <path
                  d={p.d}
                  fill={fill}
                  stroke={isSel ? "#fff" : "rgba(255,255,255,0.85)"}
                  strokeWidth={isSel ? 1.5 : 0.5}
                  opacity={isSel ? 1 : 0.9}
                  style={{transition:"all 0.15s"}}
                />
                {/* Province label — only show if has price data and centroid in bounds */}
                {p.data && inBounds && (
                  <text
                    x={cx} y={cy+1.5}
                    textAnchor="middle"
                    fontSize={p.name.length>2 ? 3.8 : 5}
                    fill="#fff"
                    fontWeight="700"
                    fontFamily="'PingFang SC',sans-serif"
                    pointerEvents="none"
                    style={{userSelect:"none",textShadow:"0 0 2px rgba(0,0,0,0.4)"}}
                  >{p.name}</text>
                )}
              </g>
            );
          })}

          {/* South Sea box */}
          <rect x={283} y={212} width={54} height={64} rx={4}
            fill="rgba(222,238,255,0.85)" stroke="#90caf9" strokeWidth={0.7} strokeDasharray="3,2"/>
          <text x={310} y={238} textAnchor="middle" fontSize={5} fill="#42a5f5" fontWeight="600">南海</text>
          <text x={310} y={247} textAnchor="middle" fontSize={5} fill="#42a5f5" fontWeight="600">诸岛</text>
        </svg>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAP PAGE
// ══════════════════════════════════════════════════════════════════════════════
function MapPage() {
  const [selected, setSelected] = useState(null);
  const [tab,      setTab]      = useState(0);
  const [dateIdx,  setDateIdx]  = useState(0);
  const [showAll,  setShowAll]  = useState(false);

  const provList = Object.entries(PRICE_DATA).map(([name,d])=>({name,...d}));
  const maxProv  = provList.reduce((a,b)=>b.price>a.price?b:a);
  const minProv  = provList.reduce((a,b)=>b.price<a.price?b:a);
  const maxDiff  = provList.reduce((a,b)=>(b.peak-b.valley)>(a.peak-a.valley)?b:a);
  const listData = [...provList].sort((a,b)=>b.price-a.price);
  const displayed = showAll ? listData : listData.slice(0,6);

  return (
    <div style={{background:"#f0f6ff",minHeight:"100vh",fontFamily:"'PingFang SC','Microsoft YaHei',sans-serif"}}>

      {/* Status */}
      <div style={{background:"#1565c0",padding:"6px 16px 0",display:"flex",justifyContent:"space-between",fontSize:11,color:"rgba(255,255,255,0.9)",fontWeight:500}}>
        <span>9:41</span><span>📶 🔋</span>
      </div>

      {/* Tab header */}
      <div style={{background:"linear-gradient(135deg,#1565c0,#1e88e5)",padding:"10px 16px 0"}}>
        <div style={{display:"flex"}}>
          {["现货实时均价","现货日前均价"].map((t,i)=>(
            <div key={i} onClick={()=>setTab(i)} style={{flex:1,textAlign:"center",paddingBottom:10,fontSize:13,fontWeight:600,color:tab===i?"#fff":"rgba(255,255,255,0.6)",borderBottom:tab===i?"2px solid #fff":"2px solid transparent",cursor:"pointer"}}>
              {t}
              <div style={{fontSize:10,color:"rgba(255,255,255,0.7)",fontWeight:400,marginTop:1}}>元/MWh</div>
            </div>
          ))}
          <div style={{width:36,display:"flex",alignItems:"center",justifyContent:"center",paddingBottom:10}}>
            <div style={{width:28,height:28,borderRadius:8,background:"rgba(255,255,255,0.18)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:"#fff"}}>⊙</div>
          </div>
        </div>
      </div>

      {/* Date row */}
      <div style={{background:"#fff",padding:"10px 12px",display:"flex",gap:8,boxShadow:"0 1px 6px rgba(0,0,0,0.05)"}}>
        {DATES.map((d,i)=>(
          <div key={d} onClick={()=>setDateIdx(i)} style={{flex:1,textAlign:"center",padding:"7px 4px",borderRadius:20,fontSize:12,fontWeight:600,background:dateIdx===i?"#1565c0":"transparent",color:dateIdx===i?"#fff":"#78909c",border:dateIdx===i?"none":"1px solid #e8eef5",cursor:"pointer",transition:"all 0.2s"}}>{d}</div>
        ))}
      </div>

      {/* Stats */}
      <div style={{background:"#fff",margin:"8px 12px",borderRadius:14,padding:"14px 16px",boxShadow:"0 2px 12px rgba(21,101,192,0.08)"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:0}}>
          {[
            {label:"最高价",icon:"🔺",color:"#f44336",val:maxProv.price.toFixed(2),sub:maxProv.name},
            {label:"最低价",icon:"🔻",color:"#2e7d32",val:minProv.price.toFixed(2),sub:minProv.name},
            {label:"峰谷差最大",icon:"〰️",color:"#5c6bc0",val:(maxDiff.peak-maxDiff.valley).toFixed(0),sub:maxDiff.name},
          ].map((s,i)=>(
            <div key={i} style={{textAlign:"center",padding:"0 4px",borderRight:i<2?"1px solid #f0f4ff":"none"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:4,marginBottom:4}}>
                <span style={{fontSize:11}}>{s.icon}</span>
                <span style={{fontSize:11,color:"#78909c"}}>{s.label}</span>
              </div>
              <div style={{fontSize:20,fontWeight:800,color:"#1a237e",letterSpacing:-0.5}}>{s.val}</div>
              <div style={{fontSize:11,color:s.color,fontWeight:600,marginTop:2}}>{s.sub}</div>
            </div>
          ))}
        </div>
        <div style={{marginTop:12}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#90a4ae",marginBottom:4}}>
            <span>0</span><span>{maxProv.price.toFixed(2)}</span>
          </div>
          <div style={{height:5,background:"#e8f0fe",borderRadius:3,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${(selected?.price||maxProv.price)/maxProv.price*100}%`,background:"linear-gradient(90deg,#42a5f5,#1565c0)",borderRadius:3,transition:"width 0.4s"}}/>
          </div>
        </div>
      </div>

      {/* Map */}
      <div style={{background:"#fff",margin:"0 12px 8px",borderRadius:16,padding:"12px 8px 8px",boxShadow:"0 2px 12px rgba(21,101,192,0.08)"}}>
        <ChinaMap selected={selected} onSelect={setSelected}/>

        {/* Color legend */}
        <div style={{display:"flex",alignItems:"center",gap:6,padding:"6px 2px 0",flexWrap:"wrap"}}>
          <span style={{fontSize:10,color:"#90a4ae"}}>元/MWh:</span>
          {[
            {label:`<${Math.round(minP+(maxP-minP)*0.25)}`,c:"#c8e8fa"},
            {label:`${Math.round(minP+(maxP-minP)*0.25)}-${Math.round(minP+(maxP-minP)*0.5)}`,c:"#7ec8f0"},
            {label:`${Math.round(minP+(maxP-minP)*0.5)}-${Math.round(minP+(maxP-minP)*0.75)}`,c:"#2e8bc0"},
            {label:`>${Math.round(minP+(maxP-minP)*0.75)}`,c:"#0d4a9e"},
          ].map(l=>(
            <div key={l.label} style={{display:"flex",alignItems:"center",gap:3}}>
              <div style={{width:10,height:10,borderRadius:2,background:l.c}}/>
              <span style={{fontSize:9,color:"#546e7a"}}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Province detail */}
      {selected ? (
        <div style={{margin:"0 12px 8px",background:"linear-gradient(135deg,#1565c0,#1976d2)",borderRadius:16,padding:"14px 16px",color:"#fff",boxShadow:"0 4px 20px rgba(21,101,192,0.3)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
            <div>
              <div style={{fontSize:18,fontWeight:800}}>{selected.name}</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.75)",marginTop:2,display:"flex",alignItems:"center",gap:4}}>
                现货均价 <Trend t={selected.trend} size={11}/>
              </div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:28,fontWeight:900,letterSpacing:-1}}>{selected.price.toFixed(2)}</div>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.7)"}}>元/MWh</div>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
            {[{l:"峰时电价",v:selected.peak.toFixed(2)},{l:"谷时电价",v:selected.valley.toFixed(2)},{l:"峰谷差",v:(selected.peak-selected.valley).toFixed(2)}].map(s=>(
              <div key={s.l} style={{background:"rgba(255,255,255,0.15)",borderRadius:10,padding:"8px 10px",textAlign:"center"}}>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.7)",marginBottom:3}}>{s.l}</div>
                <div style={{fontSize:15,fontWeight:700}}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{margin:"0 12px 8px",borderRadius:16,padding:"12px 16px",background:"rgba(255,255,255,0.7)",textAlign:"center",color:"#90a4ae",fontSize:12,border:"1px dashed #c8ddf5"}}>
          点击省份查看详细电价数据 👆
        </div>
      )}

      {/* Notice */}
      <div style={{margin:"0 12px 8px",background:"#fff8e1",borderRadius:12,padding:"9px 12px",display:"flex",gap:8,alignItems:"flex-start"}}>
        <span style={{fontSize:13}}>ℹ️</span>
        <span style={{fontSize:11,color:"#795548",lineHeight:1.5}}>由于部分省份出清数据较晚导致数据尚未更新</span>
      </div>

      {/* Bar chart */}
      <div style={{margin:"0 12px 20px",background:"#fff",borderRadius:16,padding:"14px 16px",boxShadow:"0 2px 12px rgba(21,101,192,0.07)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{width:4,height:16,background:"#1565c0",borderRadius:2,display:"inline-block"}}/>
            <span style={{fontSize:13,fontWeight:600,color:"#1a237e"}}>各省价格排行</span>
          </div>
          <div style={{display:"flex",gap:10,fontSize:10}}>
            {[{c:"#1e88e5",l:"实时均价"},{c:"#4caf50",l:"机制-风"},{c:"#ff9800",l:"机制-光"}].map(x=>(
              <div key={x.l} style={{display:"flex",alignItems:"center",gap:3}}>
                <div style={{width:8,height:3,background:x.c,borderRadius:2}}/>
                <span style={{color:"#78909c"}}>{x.l}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{display:"flex",gap:4,marginBottom:4,paddingLeft:48}}>
          {[0,100,200,300,400,500,600].map(v=>(
            <span key={v} style={{flex:1,fontSize:8,color:"#b0bec5",textAlign:"center"}}>{v}</span>
          ))}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:5}}>
          {displayed.map(p=>{
            const isSel = selected?.name===p.name;
            const pct = p.price/650*100;
            return (
              <div key={p.name} onClick={()=>setSelected(isSel?null:p)} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
                <div style={{width:40,fontSize:11,color:isSel?"#1565c0":"#546e7a",fontWeight:isSel?700:400,textAlign:"right",flexShrink:0}}>{p.name}</div>
                <div style={{flex:1,position:"relative",height:16}}>
                  {[20,40,60,80].map(g=><div key={g} style={{position:"absolute",left:`${g}%`,top:0,bottom:0,width:1,background:"#f0f4ff"}}/>)}
                  <div style={{position:"absolute",left:0,top:2,height:12,width:`${pct}%`,background:isSel?"linear-gradient(90deg,#1565c0,#42a5f5)":"linear-gradient(90deg,#1e88e5,#64b5f6)",borderRadius:"0 4px 4px 0",transition:"width 0.4s"}}/>
                  <div style={{position:"absolute",left:`${p.price*0.82/650*100}%`,top:0,bottom:0,width:2,background:"#4caf50",borderRadius:1}}/>
                  <div style={{position:"absolute",left:`${p.price*0.91/650*100}%`,top:0,bottom:0,width:2,background:"#ff9800",borderRadius:1}}/>
                  <div style={{position:"absolute",left:`${pct}%`,top:1,marginLeft:3,fontSize:10,color:"#1a237e",fontWeight:700,whiteSpace:"nowrap"}}>{p.price.toFixed(2)}</div>
                </div>
              </div>
            );
          })}
        </div>
        {!showAll&&(
          <div onClick={()=>setShowAll(true)} style={{marginTop:10,textAlign:"center",fontSize:12,color:"#1565c0",fontWeight:600,cursor:"pointer",padding:"6px 0",borderTop:"1px solid #f0f4ff"}}>
            查看全部省份 ↓
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// DATA PAGE
// ══════════════════════════════════════════════════════════════════════════════
const CATS = [
  {label:"现货价格",color:"#29b6f6",icon:<svg viewBox="0 0 40 40" width="44" height="44"><defs><linearGradient id="g1" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stopColor="#29b6f6"/><stop offset="100%" stopColor="#b3e5fc"/></linearGradient></defs><rect x="4" y="20" width="6" height="16" rx="2" fill="url(#g1)" opacity="0.7"/><rect x="13" y="13" width="6" height="23" rx="2" fill="url(#g1)" opacity="0.85"/><rect x="22" y="8" width="6" height="28" rx="2" fill="url(#g1)"/><rect x="31" y="3" width="6" height="33" rx="2" fill="#e1f5fe"/><polyline points="7,22 16,15 25,10 34,5" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>},
  {label:"中长期价格",color:"#26c6da",icon:<svg viewBox="0 0 40 40" width="44" height="44"><rect x="3" y="3" width="34" height="34" rx="5" fill="#b2ebf2" opacity="0.3"/><rect x="8" y="3" width="24" height="5" rx="2" fill="#b2ebf2"/><rect x="8" y="11" width="4" height="4" rx="1" fill="#4dd0e1"/><rect x="15" y="11" width="4" height="4" rx="1" fill="#e0f7fa"/><rect x="22" y="11" width="4" height="4" rx="1" fill="#e0f7fa"/><rect x="8" y="18" width="4" height="4" rx="1" fill="#4dd0e1"/><rect x="15" y="18" width="14" height="4" rx="1" fill="#4dd0e1"/><rect x="8" y="25" width="4" height="4" rx="1" fill="#e0f7fa"/><rect x="15" y="25" width="4" height="4" rx="1" fill="#80deea"/></svg>},
  {label:"省间计算器",color:"#5c6bc0",icon:<svg viewBox="0 0 40 40" width="44" height="44"><defs><linearGradient id="g3" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#7986cb"/><stop offset="100%" stopColor="#e8eaf6"/></linearGradient></defs><circle cx="15" cy="14" r="9" fill="url(#g3)" opacity="0.85"/><circle cx="27" cy="14" r="9" fill="#b3bef7" opacity="0.6"/><circle cx="15" cy="26" r="9" fill="#9fa8da" opacity="0.7"/><circle cx="27" cy="26" r="9" fill="url(#g3)" opacity="0.5"/></svg>},
  {label:"增量机制电价",color:"#26a69a",icon:<svg viewBox="0 0 40 40" width="44" height="44"><circle cx="20" cy="20" r="16" fill="#80cbc4" opacity="0.3"/><circle cx="20" cy="20" r="12" fill="#80cbc4" opacity="0.5"/><text x="20" y="25" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#fff" fontFamily="sans-serif">¥</text></svg>},
  {label:"天气",color:"#42a5f5",icon:<svg viewBox="0 0 40 40" width="44" height="44"><circle cx="20" cy="17" r="8" fill="#ffe082"/><line x1="20" y1="3" x2="20" y2="7" stroke="#ffe082" strokeWidth="2" strokeLinecap="round"/><line x1="20" y1="27" x2="20" y2="31" stroke="#ffe082" strokeWidth="2" strokeLinecap="round"/><line x1="6" y1="17" x2="10" y2="17" stroke="#ffe082" strokeWidth="2" strokeLinecap="round"/><line x1="30" y1="17" x2="34" y2="17" stroke="#ffe082" strokeWidth="2" strokeLinecap="round"/><defs><linearGradient id="cg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#64b5f6"/><stop offset="100%" stopColor="#e3f2fd"/></linearGradient></defs><ellipse cx="18" cy="28" rx="10" ry="7" fill="url(#cg)" opacity="0.9"/><ellipse cx="26" cy="30" rx="9" ry="6" fill="url(#cg)" opacity="0.8"/></svg>},
  {label:"电源结构",color:"#ef5350",icon:<svg viewBox="0 0 40 40" width="44" height="44"><path d="M20,20 L20,6 A14,14 0 0,1 33.1,27 Z" fill="#64b5f6" opacity="0.9"/><path d="M20,20 L33.1,27 A14,14 0 0,1 6.9,27 Z" fill="#81c784" opacity="0.9"/><path d="M20,20 L6.9,27 A14,14 0 0,1 20,6 Z" fill="#ffb74d" opacity="0.9"/><circle cx="20" cy="20" r="5" fill="#1a237e" opacity="0.7"/></svg>},
];

function DataPage() {
  return (
    <div style={{background:"#f0f6ff",minHeight:"100vh",fontFamily:"'PingFang SC','Microsoft YaHei',sans-serif"}}>
      <div style={{background:"#1565c0",padding:"6px 16px 0",display:"flex",justifyContent:"space-between",fontSize:11,color:"rgba(255,255,255,0.9)",fontWeight:500}}><span>9:41</span><span>📶 🔋</span></div>
      <div style={{background:"linear-gradient(135deg,#1565c0,#1e88e5)",padding:"10px 16px 14px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{fontSize:17,fontWeight:700,color:"#fff"}}>查数据</div>
        <div style={{width:28,height:28,borderRadius:8,background:"rgba(255,255,255,0.18)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:"#fff"}}>🔍</div>
      </div>
      <div style={{background:"#fff",padding:"10px 14px",display:"flex",gap:8}}>
        {["今日","本周","本月","年度"].map((t,i)=>(
          <div key={t} style={{padding:"5px 14px",borderRadius:20,background:i===0?"linear-gradient(135deg,#1565c0,#1e88e5)":"rgba(240,246,255,0.9)",color:i===0?"#fff":"#546e7a",fontSize:12,fontWeight:i===0?600:400,border:i===0?"none":"1px solid rgba(200,220,255,0.6)",cursor:"pointer"}}>{t}</div>
        ))}
      </div>
      <div style={{padding:"10px 12px 6px",fontSize:12,color:"#78909c",fontWeight:500}}>数据类目</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,padding:"0 12px"}}>
        {CATS.map(cat=>(
          <div key={cat.label} style={{background:"rgba(255,255,255,0.9)",borderRadius:18,padding:"20px 12px 16px",display:"flex",flexDirection:"column",alignItems:"center",gap:10,boxShadow:"0 4px 20px rgba(21,101,192,0.10)",cursor:"pointer"}}>
            <div style={{width:72,height:72,borderRadius:22,background:"linear-gradient(145deg,rgba(255,255,255,0.95),rgba(227,242,253,0.85))",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 4px 16px ${cat.color}33`}}>{cat.icon}</div>
            <div style={{fontSize:14,fontWeight:600,color:"#1a237e",textAlign:"center"}}>{cat.label}</div>
            <div style={{fontSize:10,color:"#90a4ae",background:"rgba(200,220,255,0.25)",borderRadius:10,padding:"3px 10px"}}>点击查看 →</div>
          </div>
        ))}
      </div>
      <div style={{margin:"12px 12px 20px",background:"#fff",borderRadius:18,padding:"14px 16px",boxShadow:"0 2px 12px rgba(21,101,192,0.07)"}}>
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}>
          <span style={{width:4,height:16,background:"#1565c0",borderRadius:2,display:"inline-block"}}/>
          <span style={{fontSize:13,fontWeight:600,color:"#1565c0"}}>最近更新</span>
        </div>
        {[{t:"广东2025年3月现货价格公示",tm:"10分钟前",tag:"现货"},{t:"华东地区中长期合同结算完成",tm:"1小时前",tag:"中长期"},{t:"全国2月份电源结构报告",tm:"3小时前",tag:"电源"}].map((item,i)=>(
          <div key={i} style={{display:"flex",alignItems:"flex-start",padding:"8px 0",borderBottom:i<2?"1px solid rgba(200,220,255,0.3)":"none",gap:10}}>
            <div style={{padding:"3px 8px",borderRadius:8,background:"linear-gradient(135deg,#1565c0,#1e88e5)",color:"#fff",fontSize:9,fontWeight:600,whiteSpace:"nowrap",flexShrink:0,marginTop:1}}>{item.tag}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:12,color:"#263238",lineHeight:1.4}}>{item.t}</div>
              <div style={{fontSize:10,color:"#90a4ae",marginTop:2}}>{item.tm}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// POLICY PAGE
// ══════════════════════════════════════════════════════════════════════════════
function PolicyPage() {
  const policies=[
    {title:"关于推进电力现货市场建设的通知",dept:"国家发展改革委",date:"2025-02-28",tag:"现货市场"},
    {title:"省间电力交易规则修订意见稿",dept:"国家能源局",date:"2025-02-15",tag:"省间交易"},
    {title:"新能源参与电力市场交易指导意见",dept:"国家发展改革委",date:"2025-01-20",tag:"新能源"},
    {title:"电力辅助服务市场运营规则",dept:"国家能源局",date:"2025-01-08",tag:"辅助服务"},
    {title:"分布式光伏发电项目管理办法",dept:"国家能源局",date:"2024-12-31",tag:"光伏"},
  ];
  return (
    <div style={{background:"#f0f6ff",minHeight:"100vh",fontFamily:"'PingFang SC','Microsoft YaHei',sans-serif"}}>
      <div style={{background:"#1565c0",padding:"6px 16px 0",display:"flex",justifyContent:"space-between",fontSize:11,color:"rgba(255,255,255,0.9)",fontWeight:500}}><span>9:41</span><span>📶 🔋</span></div>
      <div style={{background:"linear-gradient(135deg,#1565c0,#1e88e5)",padding:"10px 16px 16px"}}>
        <div style={{fontSize:17,fontWeight:700,color:"#fff"}}>看政策</div>
        <div style={{fontSize:11,color:"rgba(255,255,255,0.75)",marginTop:2}}>电力市场政策法规动态</div>
      </div>
      <div style={{padding:"8px 12px 20px"}}>
        {policies.map((p,i)=>(
          <div key={i} style={{background:"rgba(255,255,255,0.9)",borderRadius:16,padding:"14px 16px",marginBottom:10,boxShadow:"0 2px 14px rgba(21,101,192,0.08)"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}>
              <div style={{padding:"3px 9px",borderRadius:8,background:"linear-gradient(135deg,#1565c0,#42a5f5)",color:"#fff",fontSize:10,fontWeight:600}}>{p.tag}</div>
              <span style={{fontSize:10,color:"#90a4ae",marginLeft:"auto"}}>{p.date}</span>
            </div>
            <div style={{fontSize:13,fontWeight:600,color:"#1a237e",lineHeight:1.5}}>{p.title}</div>
            <div style={{fontSize:11,color:"#78909c",marginTop:4}}>发布单位：{p.dept}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MINE PAGE
// ══════════════════════════════════════════════════════════════════════════════
function MinePage() {
  return (
    <div style={{background:"#f0f6ff",minHeight:"100vh",fontFamily:"'PingFang SC','Microsoft YaHei',sans-serif"}}>
      <div style={{background:"#1565c0",padding:"6px 16px 0",display:"flex",justifyContent:"space-between",fontSize:11,color:"rgba(255,255,255,0.9)",fontWeight:500}}><span>9:41</span><span>📶 🔋</span></div>
      <div style={{background:"linear-gradient(135deg,#1565c0,#42a5f5)",padding:"30px 20px 60px"}}>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <div style={{width:64,height:64,borderRadius:"50%",background:"rgba(255,255,255,0.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,border:"2px solid rgba(255,255,255,0.5)"}}>👤</div>
          <div>
            <div style={{fontSize:18,fontWeight:700,color:"#fff"}}>用户名称</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,0.8)",marginTop:3}}>普通用户 · ID: 20250306</div>
          </div>
        </div>
      </div>
      <div style={{marginTop:-30,padding:"0 12px 20px"}}>
        {[["我的收藏","⭐","已收藏 3 个省份"],["消息通知","🔔","今日 2 条新消息"],["历史记录","📋","最近查询 15 次"],["设置","⚙️","账号与偏好设置"],["联系我们","💬","7×24小时在线"],["关于我们","ℹ️","易能电易查 v2.3.1"]].map(([label,icon,desc],i)=>(
          <div key={i} style={{background:"rgba(255,255,255,0.85)",borderRadius:16,padding:"14px 16px",marginBottom:10,display:"flex",alignItems:"center",gap:12,boxShadow:"0 2px 14px rgba(21,101,192,0.07)",cursor:"pointer"}}>
            <div style={{width:38,height:38,borderRadius:12,background:"linear-gradient(135deg,rgba(21,101,192,0.1),rgba(66,165,245,0.15))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{icon}</div>
            <div style={{flex:1}}><div style={{fontSize:14,fontWeight:600,color:"#1a237e"}}>{label}</div><div style={{fontSize:11,color:"#90a4ae",marginTop:2}}>{desc}</div></div>
            <span style={{color:"#90a4ae",fontSize:16}}>›</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// APP SHELL
// ══════════════════════════════════════════════════════════════════════════════
const NAV_ITEMS = [
  {id:"home",label:"首页",icon:(a)=><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 12L12 3l9 9" stroke={a?"#1565c0":"#90a4ae"} strokeWidth="2" strokeLinecap="round"/><path d="M5 10V20a1 1 0 001 1h4v-4h4v4h4a1 1 0 001-1V10" stroke={a?"#1565c0":"#90a4ae"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>},
  {id:"data",label:"查数据",icon:(a)=><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.5" fill={a?"#1565c0":"#90a4ae"}/><rect x="14" y="3" width="7" height="7" rx="1.5" fill={a?"#1565c0":"#90a4ae"}/><rect x="3" y="14" width="7" height="7" rx="1.5" fill={a?"#1565c0":"#90a4ae"}/><rect x="14" y="14" width="7" height="7" rx="1.5" fill={a?"#1565c0":"#90a4ae"} opacity={a?1:0.5}/></svg>},
  {id:"policy",label:"看政策",icon:(a)=><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="4" y="2" width="16" height="20" rx="2" stroke={a?"#1565c0":"#90a4ae"} strokeWidth="2"/><line x1="8" y1="8" x2="16" y2="8" stroke={a?"#1565c0":"#90a4ae"} strokeWidth="2" strokeLinecap="round"/><line x1="8" y1="12" x2="16" y2="12" stroke={a?"#1565c0":"#90a4ae"} strokeWidth="2" strokeLinecap="round"/><line x1="8" y1="16" x2="12" y2="16" stroke={a?"#1565c0":"#90a4ae"} strokeWidth="2" strokeLinecap="round"/></svg>},
  {id:"mine",label:"我的",icon:(a)=><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" fill={a?"#1565c0":"none"} stroke={a?"#1565c0":"#90a4ae"} strokeWidth="2"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={a?"#1565c0":"#90a4ae"} strokeWidth="2" strokeLinecap="round"/></svg>},
];

const PAGES = {home:<MapPage/>,data:<DataPage/>,policy:<PolicyPage/>,mine:<MinePage/>};

export default function App() {
  const [tab, setTab] = useState("home");
  return (
    <div style={{background:"#c8dff5",minHeight:"100vh",display:"flex",justifyContent:"center"}}>
      <div style={{width:390,minHeight:"100vh",position:"relative",overflowX:"hidden"}}>
        <div style={{paddingBottom:60}}>{PAGES[tab]}</div>
        <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:390,background:"rgba(255,255,255,0.96)",backdropFilter:"blur(16px)",borderTop:"1px solid rgba(200,220,255,0.5)",display:"flex",zIndex:100,boxShadow:"0 -2px 20px rgba(21,101,192,0.12)"}}>
          {NAV_ITEMS.map(n=>{
            const a=tab===n.id;
            return (
              <div key={n.id} onClick={()=>setTab(n.id)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"10px 0 8px",cursor:"pointer",fontSize:10,color:a?"#1565c0":"#90a4ae",fontWeight:a?600:400,transition:"color 0.2s"}}>
                {n.icon(a)}
                <span style={{marginTop:2}}>{n.label}</span>
                {a&&<div style={{width:4,height:4,borderRadius:"50%",background:"#1565c0",marginTop:2}}/>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
