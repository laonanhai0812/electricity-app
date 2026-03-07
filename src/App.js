import { useState, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════════
// PROVINCE MAP DATA  (800×700 canvas coords from reference code)
// ═══════════════════════════════════════════════════════════════════
const MAP_DATA = {
  黑龙江:{points:[[680,80],[750,80],[780,120],[780,180],[740,220],[680,200],[640,160],[640,100]],center:[710,150]},
  吉林:  {points:[[640,200],[700,200],[720,240],[680,280],[620,260],[620,220]],center:[670,240]},
  辽宁:  {points:[[580,240],[660,240],[680,290],[640,320],[560,300],[540,260]],center:[610,280]},
  内蒙古:{points:[[200,140],[500,140],[580,200],[620,240],[580,300],[300,300],[200,250],[180,180]],center:[390,215]},
  北京:  {points:[[520,280],[560,280],[560,310],[520,310]],center:[540,295]},
  天津:  {points:[[540,300],[570,300],[570,325],[540,325]],center:[555,312]},
  河北:  {points:[[480,280],[560,280],[560,330],[520,350],[460,330],[460,300]],center:[510,315]},
  山西:  {points:[[460,300],[520,300],[520,360],[460,360],[440,330]],center:[485,330]},
  陕西:  {points:[[360,340],[460,340],[460,400],[400,420],[340,390],[340,350]],center:[400,375]},
  宁夏:  {points:[[340,330],[380,330],[380,370],[340,370],[320,350]],center:[355,352]},
  甘肃:  {points:[[180,300],[340,300],[360,380],[300,400],[160,360],[140,320]],center:[260,350]},
  青海:  {points:[[160,360],[280,360],[300,420],[220,440],[140,400]],center:[222,398]},
  新疆:  {points:[[80,300],[200,280],[200,400],[120,450],[60,400],[40,340]],center:[125,368]},
  西藏:  {points:[[80,420],[180,400],[200,480],[140,520],[60,480]],center:[132,462]},
  四川:  {points:[[220,400],[340,390],[380,450],[340,500],[260,490],[200,440]],center:[292,447]},
  重庆:  {points:[[340,420],[400,410],[420,460],[380,480],[340,460]],center:[376,446]},
  贵州:  {points:[[300,480],[380,470],[400,530],[340,540],[280,520]],center:[341,508]},
  云南:  {points:[[220,480],[300,470],[340,540],[300,580],[220,560],[180,520]],center:[262,528]},
  广西:  {points:[[340,520],[420,510],[440,570],[380,590],[320,570]],center:[378,553]},
  湖南:  {points:[[400,460],[480,450],[500,520],[460,550],[400,530]],center:[452,503]},
  湖北:  {points:[[420,380],[500,370],[520,440],[480,470],[420,450]],center:[472,423]},
  河南:  {points:[[480,320],[540,310],[560,370],[520,390],[470,370]],center:[515,352]},
  安徽:  {points:[[520,370],[580,360],[600,420],[560,440],[520,420]],center:[560,402]},
  江苏:  {points:[[560,340],[620,340],[640,390],[600,400],[560,380]],center:[598,370]},
  上海:  {points:[[620,400],[660,400],[660,430],[620,430]],center:[640,415]},
  浙江:  {points:[[580,420],[640,410],[660,470],[600,480],[570,450]],center:[612,447]},
  福建:  {points:[[540,470],[600,460],[620,530],[560,540],[520,510]],center:[570,502]},
  台湾:  {points:[[680,480],[720,470],[720,560],[680,560]],center:[700,515]},
  江西:  {points:[[480,460],[540,450],[560,520],[500,540],[460,510]],center:[510,497]},
  山东:  {points:[[560,300],[640,300],[660,350],[620,370],[560,360]],center:[610,335]},
  广东:  {points:[[380,540],[480,530],[500,600],[420,620],[360,590]],center:[432,577]},
  海南:  {points:[[420,620],[460,610],[470,650],[430,660]],center:[448,637]},
  香港:  {points:[[460,590],[480,585],[485,605],[465,610]],center:[472,597]},
  澳门:  {points:[[458,595],[470,592],[472,605],[460,608]],center:[465,600]},
};

function toPath(points) {
  return points.map(([x,y],i)=>`${i===0?"M":"L"}${x},${y}`).join(" ")+" Z";
}

// ═══════════════════════════════════════════════════════════════════
// DEFAULT ELECTRICITY DATA
// ═══════════════════════════════════════════════════════════════════
const DEFAULT_DATA = {
  北京: {residential:0.4883,commercial:0.78,industrial:0.68,peak:0.92,valley:0.38,spot:478,spotPeak:765,spotValley:191,trend:"up"},
  天津: {residential:0.49,commercial:0.75,industrial:0.65,peak:0.88,valley:0.37,spot:485,spotPeak:776,spotValley:194,trend:"stable"},
  河北: {residential:0.52,commercial:0.73,industrial:0.62,peak:0.86,valley:0.36,spot:467,spotPeak:747,spotValley:187,trend:"up"},
  山西: {residential:0.48,commercial:0.70,industrial:0.55,peak:0.82,valley:0.33,spot:452,spotPeak:723,spotValley:181,trend:"down"},
  内蒙古:{residential:0.45,commercial:0.65,industrial:0.45,peak:0.75,valley:0.28,spot:445,spotPeak:712,spotValley:178,trend:"down"},
  辽宁: {residential:0.50,commercial:0.74,industrial:0.64,peak:0.87,valley:0.36,spot:482,spotPeak:771,spotValley:193,trend:"up"},
  吉林: {residential:0.51,commercial:0.72,industrial:0.63,peak:0.85,valley:0.35,spot:498,spotPeak:797,spotValley:199,trend:"down"},
  黑龙江:{residential:0.51,commercial:0.73,industrial:0.63,peak:0.86,valley:0.35,spot:523,spotPeak:837,spotValley:209,trend:"up"},
  上海: {residential:0.52,commercial:0.82,industrial:0.72,peak:0.95,valley:0.42,spot:612,spotPeak:979,spotValley:245,trend:"up"},
  江苏: {residential:0.53,commercial:0.78,industrial:0.68,peak:0.91,valley:0.40,spot:535,spotPeak:856,spotValley:214,trend:"up"},
  浙江: {residential:0.54,commercial:0.80,industrial:0.70,peak:0.93,valley:0.41,spot:558,spotPeak:893,spotValley:223,trend:"up"},
  安徽: {residential:0.51,commercial:0.75,industrial:0.65,peak:0.88,valley:0.38,spot:518,spotPeak:829,spotValley:207,trend:"up"},
  福建: {residential:0.50,commercial:0.77,industrial:0.67,peak:0.90,valley:0.39,spot:532,spotPeak:851,spotValley:213,trend:"up"},
  江西: {residential:0.51,commercial:0.74,industrial:0.64,peak:0.87,valley:0.37,spot:489,spotPeak:782,spotValley:196,trend:"stable"},
  山东: {residential:0.55,commercial:0.76,industrial:0.66,peak:0.89,valley:0.39,spot:523,spotPeak:837,spotValley:209,trend:"up"},
  河南: {residential:0.50,commercial:0.73,industrial:0.63,peak:0.86,valley:0.36,spot:469,spotPeak:750,spotValley:188,trend:"up"},
  湖北: {residential:0.52,commercial:0.75,industrial:0.65,peak:0.88,valley:0.38,spot:502,spotPeak:803,spotValley:201,trend:"up"},
  湖南: {residential:0.53,commercial:0.74,industrial:0.64,peak:0.87,valley:0.37,spot:488,spotPeak:781,spotValley:195,trend:"stable"},
  广东: {residential:0.52,commercial:0.80,industrial:0.70,peak:0.92,valley:0.42,spot:578,spotPeak:925,spotValley:231,trend:"up"},
  广西: {residential:0.53,commercial:0.74,industrial:0.64,peak:0.87,valley:0.38,spot:512,spotPeak:819,spotValley:205,trend:"stable"},
  海南: {residential:0.58,commercial:0.82,industrial:0.72,peak:0.94,valley:0.43,spot:598,spotPeak:957,spotValley:239,trend:"up"},
  重庆: {residential:0.50,commercial:0.74,industrial:0.64,peak:0.87,valley:0.37,spot:492,spotPeak:787,spotValley:197,trend:"up"},
  四川: {residential:0.52,commercial:0.75,industrial:0.65,peak:0.88,valley:0.38,spot:478,spotPeak:765,spotValley:191,trend:"up"},
  贵州: {residential:0.51,commercial:0.72,industrial:0.62,peak:0.85,valley:0.35,spot:456,spotPeak:730,spotValley:182,trend:"stable"},
  云南: {residential:0.45,commercial:0.68,industrial:0.50,peak:0.78,valley:0.30,spot:432,spotPeak:691,spotValley:173,trend:"down"},
  西藏: {residential:0.42,commercial:0.65,industrial:0.48,peak:0.72,valley:0.26,spot:342,spotPeak:547,spotValley:137,trend:"down"},
  陕西: {residential:0.50,commercial:0.73,industrial:0.63,peak:0.86,valley:0.36,spot:438,spotPeak:701,spotValley:175,trend:"stable"},
  甘肃: {residential:0.48,commercial:0.70,industrial:0.55,peak:0.82,valley:0.32,spot:395,spotPeak:632,spotValley:158,trend:"stable"},
  青海: {residential:0.45,commercial:0.68,industrial:0.50,peak:0.78,valley:0.29,spot:382,spotPeak:611,spotValley:153,trend:"stable"},
  宁夏: {residential:0.47,commercial:0.69,industrial:0.52,peak:0.80,valley:0.31,spot:402,spotPeak:643,spotValley:161,trend:"down"},
  新疆: {residential:0.46,commercial:0.68,industrial:0.50,peak:0.78,valley:0.30,spot:368,spotPeak:588,spotValley:147,trend:"down"},
  台湾: {residential:0.55,commercial:0.80,industrial:0.70,peak:0.92,valley:0.42,spot:520,spotPeak:832,spotValley:208,trend:"stable"},
  香港: {residential:0.92,commercial:1.15,industrial:1.05,peak:1.35,valley:0.75,spot:680,spotPeak:1088,spotValley:272,trend:"up"},
  澳门: {residential:0.80,commercial:1.00,industrial:0.90,peak:1.20,valley:0.65,spot:660,spotPeak:1056,spotValley:264,trend:"stable"},
};

// ═══════════════════════════════════════════════════════════════════
// COLOR HELPERS
// ═══════════════════════════════════════════════════════════════════
function spotColor(spot, min, max) {
  const t = (spot - min) / (max - min);
  if (t < 0.2) return "#c2dff5";
  if (t < 0.4) return "#83bbdf";
  if (t < 0.6) return "#3d86c0";
  if (t < 0.8) return "#1558a0";
  return "#0a3070";
}

function residentialColor(price) {
  if (price <= 0.45) return "#4caf8f";
  if (price <= 0.50) return "#6bc4a0";
  if (price <= 0.55) return "#90d4b5";
  if (price <= 0.60) return "#f0c94a";
  if (price <= 0.65) return "#f4913a";
  if (price <= 0.75) return "#e05530";
  return "#c01c28";
}

const today = new Date();
const fmtDate = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const DATES = [0,1,2].map(i=>{const d=new Date(today);d.setDate(d.getDate()-i);return fmtDate(d);});

const Trend = ({t,s=11}) => {
  if(t==="up")   return <span style={{color:"#f44336",fontSize:s,fontWeight:700}}>▲</span>;
  if(t==="down") return <span style={{color:"#26c6da",fontSize:s,fontWeight:700}}>▼</span>;
  return <span style={{color:"#90a4ae",fontSize:s}}>─</span>;
};

// ═══════════════════════════════════════════════════════════════════
// CHINA MAP SVG COMPONENT
// ═══════════════════════════════════════════════════════════════════
function ChinaMap({ elecData, selected, onSelect, colorMode }) {
  const [hovered, setHovered] = useState(null);
  const spots = Object.values(elecData).map(d=>d.spot);
  const minSpot = Math.min(...spots), maxSpot = Math.max(...spots);

  return (
    <div style={{borderRadius:12,overflow:"hidden",background:"#d6ebff",position:"relative"}}>
      <svg viewBox="0 0 800 700" width="100%" style={{display:"block"}}>
        <defs>
          <filter id="ps" x="-5%" y="-5%" width="110%" height="110%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#084a8c" floodOpacity="0.2"/>
          </filter>
          <filter id="hl" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#ffffff" floodOpacity="0.9"/>
            <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#1565c0" floodOpacity="0.7"/>
          </filter>
          <linearGradient id="seaGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#c8e8fa"/>
            <stop offset="100%" stopColor="#d6ebff"/>
          </linearGradient>
        </defs>

        {/* Sea bg with subtle texture */}
        <rect width="800" height="700" fill="url(#seaGrad)"/>
        {[100,200,300,400,500,600,700].map(x=>(
          <line key={x} x1={x} y1={0} x2={x} y2={700} stroke="#b5d8f0" strokeWidth="0.5" opacity="0.4"/>
        ))}
        {[100,200,300,400,500,600].map(y=>(
          <line key={y} x1={0} y1={y} x2={800} y2={y} stroke="#b5d8f0" strokeWidth="0.5" opacity="0.4"/>
        ))}

        {/* Province shapes */}
        {Object.entries(MAP_DATA).map(([name, geo]) => {
          if (name === "南海") return null;
          const data = elecData[name];
          const isSel = selected?.name === name;
          const isHov = hovered === name;
          const fill = data
            ? (colorMode === "spot" ? spotColor(data.spot, minSpot, maxSpot) : residentialColor(data.residential))
            : "#ddeeff";
          const [cx, cy] = geo.center;

          return (
            <g key={name}
              onClick={() => onSelect(isSel ? null : (data ? {name,...data} : null))}
              onMouseEnter={() => setHovered(name)}
              onMouseLeave={() => setHovered(null)}
              style={{cursor: data ? "pointer" : "default"}}
              filter={isSel ? "url(#hl)" : "url(#ps)"}
            >
              <path
                d={toPath(geo.points)}
                fill={isSel ? "#0d47a1" : isHov ? "#1976d2" : fill}
                stroke={isSel ? "#fff" : "rgba(255,255,255,0.9)"}
                strokeWidth={isSel ? 2 : 0.8}
                style={{transition:"fill 0.15s"}}
              />
              {data && (
                <text x={cx} y={cy+1}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize={name.length > 2 ? 9 : 12}
                  fill="#fff" fontWeight="700"
                  fontFamily="'PingFang SC',sans-serif"
                  pointerEvents="none"
                  style={{userSelect:"none", filter:"drop-shadow(0 0 2px rgba(0,0,0,0.5))"}}>
                  {name}
                </text>
              )}
              {/* Hover price tooltip */}
              {isHov && !isSel && data && (
                <g>
                  <rect x={cx-28} y={cy-26} width={56} height={18} rx={4}
                    fill="rgba(13,71,161,0.9)" stroke="#fff" strokeWidth={0.5}/>
                  <text x={cx} y={cy-15} textAnchor="middle"
                    fontSize={9} fill="#fff" fontWeight="700"
                    fontFamily="'PingFang SC',sans-serif" pointerEvents="none">
                    {colorMode==="spot" ? `${data.spot}元/MWh` : `${data.residential}元/度`}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* South Sea inset box */}
        <rect x={570} y={570} width={180} height={120} rx={6}
          fill="rgba(214,235,255,0.88)" stroke="#90caf9" strokeWidth={1} strokeDasharray="4,3"/>
        <text x={660} y={620} textAnchor="middle" fontSize={14} fill="#42a5f5" fontWeight="700">南海诸岛</text>
      </svg>

      {/* Hovered province quick info */}
      {hovered && elecData[hovered] && !selected && (
        <div style={{
          position:"absolute",bottom:8,left:8,
          background:"rgba(13,71,161,0.92)",color:"#fff",
          borderRadius:8,padding:"6px 12px",fontSize:11,
          backdropFilter:"blur(4px)",pointerEvents:"none",
          boxShadow:"0 2px 12px rgba(0,0,0,0.2)"
        }}>
          <span style={{fontWeight:700,fontSize:13}}>{hovered}</span>
          <span style={{marginLeft:8,opacity:0.85}}>
            {colorMode==="spot" ? `现货 ${elecData[hovered].spot} 元/MWh` : `居民 ${elecData[hovered].residential} 元/度`}
          </span>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// HOME / MAP PAGE
// ═══════════════════════════════════════════════════════════════════
function MapPage({ elecData, setElecData }) {
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState(0);
  const [dateIdx, setDateIdx] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [colorMode, setColorMode] = useState("spot"); // spot | residential

  const provList = Object.entries(elecData).map(([name,d])=>({name,...d}));
  const maxProv = provList.reduce((a,b)=>b.spot>a.spot?b:a);
  const minProv = provList.reduce((a,b)=>b.spot<a.spot?b:a);
  const maxDiff = provList.reduce((a,b)=>(b.spotPeak-b.spotValley)>(a.spotPeak-a.spotValley)?b:a);
  const listData = [...provList].sort((a,b)=>b.spot-a.spot);
  const displayed = showAll ? listData : listData.slice(0,6);

  return (
    <div style={{background:"#f0f6ff",minHeight:"100vh",fontFamily:"'PingFang SC','Microsoft YaHei',sans-serif"}}>
      {/* Status */}
      <div style={{background:"#1565c0",padding:"6px 16px 0",display:"flex",justifyContent:"space-between",fontSize:11,color:"rgba(255,255,255,0.9)",fontWeight:500}}>
        <span>9:41</span><span>📶 🔋</span>
      </div>

      {/* Main tabs */}
      <div style={{background:"linear-gradient(135deg,#1565c0,#1e88e5)",padding:"10px 16px 0"}}>
        <div style={{display:"flex"}}>
          {["现货实时均价","现货日前均价"].map((t,i)=>(
            <div key={i} onClick={()=>setTab(i)} style={{flex:1,textAlign:"center",paddingBottom:10,fontSize:13,fontWeight:600,color:tab===i?"#fff":"rgba(255,255,255,0.55)",borderBottom:tab===i?"2.5px solid #fff":"2.5px solid transparent",cursor:"pointer",transition:"all 0.2s"}}>
              {t}
              <div style={{fontSize:10,color:"rgba(255,255,255,0.65)",fontWeight:400,marginTop:1}}>元/MWh</div>
            </div>
          ))}
          <div style={{width:40,display:"flex",alignItems:"center",justifyContent:"center",paddingBottom:10}}>
            <div style={{width:30,height:30,borderRadius:8,background:"rgba(255,255,255,0.18)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,color:"#fff",cursor:"pointer"}}>⊙</div>
          </div>
        </div>
      </div>

      {/* Date row */}
      <div style={{background:"#fff",padding:"10px 12px",display:"flex",gap:8,boxShadow:"0 1px 6px rgba(0,0,0,0.05)"}}>
        {DATES.map((d,i)=>(
          <div key={d} onClick={()=>setDateIdx(i)} style={{flex:1,textAlign:"center",padding:"7px 4px",borderRadius:20,fontSize:12,fontWeight:600,background:dateIdx===i?"#1565c0":"transparent",color:dateIdx===i?"#fff":"#78909c",border:dateIdx===i?"none":"1px solid #e8eef5",cursor:"pointer",transition:"all 0.2s"}}>{d}</div>
        ))}
      </div>

      {/* Stats card */}
      <div style={{background:"#fff",margin:"8px 12px",borderRadius:16,padding:"14px 16px",boxShadow:"0 2px 16px rgba(21,101,192,0.09)"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:0}}>
          {[
            {label:"最高价",icon:"🔺",color:"#f44336",val:maxProv.spot.toFixed(2),sub:maxProv.name},
            {label:"最低价",icon:"🔻",color:"#26a69a",val:minProv.spot.toFixed(2),sub:minProv.name},
            {label:"峰谷差最大",icon:"〰️",color:"#5c6bc0",val:(maxDiff.spotPeak-maxDiff.spotValley).toFixed(0),sub:maxDiff.name},
          ].map((s,i)=>(
            <div key={i} style={{textAlign:"center",padding:"0 4px",borderRight:i<2?"1px solid #f0f4ff":"none"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:3,marginBottom:5}}>
                <span style={{fontSize:11}}>{s.icon}</span>
                <span style={{fontSize:10,color:"#90a4ae"}}>{s.label}</span>
              </div>
              <div style={{fontSize:21,fontWeight:800,color:"#1a237e",letterSpacing:-0.5}}>{s.val}</div>
              <div style={{fontSize:11,color:s.color,fontWeight:700,marginTop:2}}>{s.sub}</div>
            </div>
          ))}
        </div>
        <div style={{marginTop:12}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#90a4ae",marginBottom:3}}>
            <span>0</span><span>{maxProv.spot.toFixed(2)}</span>
          </div>
          <div style={{height:6,background:"#e8f0fe",borderRadius:3,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${(selected?.spot||maxProv.spot)/maxProv.spot*100}%`,background:"linear-gradient(90deg,#42a5f5,#1565c0)",borderRadius:3,transition:"width 0.4s"}}/>
          </div>
        </div>
      </div>

      {/* Map */}
      <div style={{background:"#fff",margin:"0 12px 8px",borderRadius:16,padding:"10px 8px 8px",boxShadow:"0 2px 16px rgba(21,101,192,0.09)"}}>
        {/* Color mode toggle */}
        <div style={{display:"flex",gap:6,marginBottom:8,paddingLeft:4}}>
          {[{k:"spot",l:"现货均价"},{k:"residential",l:"居民电价"}].map(m=>(
            <div key={m.k} onClick={()=>setColorMode(m.k)} style={{padding:"4px 12px",borderRadius:20,fontSize:11,fontWeight:600,cursor:"pointer",background:colorMode===m.k?"#1565c0":"rgba(200,220,255,0.3)",color:colorMode===m.k?"#fff":"#546e7a",transition:"all 0.2s"}}>
              {m.l}
            </div>
          ))}
        </div>
        <ChinaMap elecData={elecData} selected={selected} onSelect={setSelected} colorMode={colorMode}/>
        {/* Legend */}
        <div style={{display:"flex",alignItems:"center",gap:5,padding:"7px 2px 0",flexWrap:"wrap"}}>
          <span style={{fontSize:9,color:"#90a4ae"}}>
            {colorMode==="spot"?"元/MWh:":"元/度:"}
          </span>
          {colorMode==="spot" ? [
            {l:"低价",c:"#c2dff5"},{l:"中低",c:"#83bbdf"},{l:"中高",c:"#3d86c0"},{l:"高价",c:"#1558a0"},{l:"最高",c:"#0a3070"},
          ] : [
            {l:"≤0.45",c:"#4caf8f"},{l:"0.50",c:"#6bc4a0"},{l:"0.55",c:"#f0c94a"},{l:"0.65",c:"#f4913a"},{l:"≥0.75",c:"#c01c28"},
          ]}
          .map(l=>(
            <div key={l.l} style={{display:"flex",alignItems:"center",gap:2}}>
              <div style={{width:9,height:9,borderRadius:2,background:l.c}}/>
              <span style={{fontSize:8,color:"#546e7a"}}>{l.l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Province detail card */}
      {selected ? (
        <div style={{margin:"0 12px 8px",background:"linear-gradient(135deg,#1565c0,#0d47a1)",borderRadius:16,padding:"15px 16px",color:"#fff",boxShadow:"0 4px 24px rgba(21,101,192,0.35)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
            <div>
              <div style={{fontSize:19,fontWeight:800,letterSpacing:0.5}}>{selected.name}</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.7)",marginTop:3,display:"flex",alignItems:"center",gap:5}}>
                现货均价 <Trend t={selected.trend} s={11}/>
              </div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:30,fontWeight:900,letterSpacing:-1}}>{selected.spot}</div>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.65)"}}>元/MWh</div>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:10}}>
            {[
              {l:"峰时",v:selected.spotPeak},
              {l:"谷时",v:selected.spotValley},
              {l:"峰谷差",v:selected.spotPeak-selected.spotValley},
              {l:"居民电价",v:`${selected.residential}元`},
            ].map(s=>(
              <div key={s.l} style={{background:"rgba(255,255,255,0.14)",borderRadius:10,padding:"7px 6px",textAlign:"center"}}>
                <div style={{fontSize:9,color:"rgba(255,255,255,0.65)",marginBottom:2}}>{s.l}</div>
                <div style={{fontSize:12,fontWeight:700}}>{s.v}</div>
              </div>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
            {[
              {l:"商业电价",v:`${selected.commercial}元/度`},
              {l:"工业电价",v:`${selected.industrial}元/度`},
              {l:"峰谷比",v:`${(selected.peak/selected.valley).toFixed(2)}x`},
            ].map(s=>(
              <div key={s.l} style={{background:"rgba(255,255,255,0.1)",borderRadius:8,padding:"6px 8px",textAlign:"center"}}>
                <div style={{fontSize:9,color:"rgba(255,255,255,0.6)",marginBottom:2}}>{s.l}</div>
                <div style={{fontSize:11,fontWeight:600}}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{margin:"0 12px 8px",borderRadius:14,padding:"11px 16px",background:"rgba(255,255,255,0.7)",textAlign:"center",color:"#90a4ae",fontSize:12,border:"1px dashed #c8ddf5"}}>
          点击地图上的省份查看详细电价数据 👆
        </div>
      )}

      {/* Notice */}
      <div style={{margin:"0 12px 8px",background:"#fff8e1",borderRadius:12,padding:"9px 12px",display:"flex",gap:8,alignItems:"center"}}>
        <span style={{fontSize:14}}>ℹ️</span>
        <span style={{fontSize:11,color:"#795548",lineHeight:1.5}}>由于部分省份出清数据较晚，数据尚未完全更新</span>
      </div>

      {/* Bar chart */}
      <div style={{margin:"0 12px 20px",background:"#fff",borderRadius:16,padding:"14px 16px",boxShadow:"0 2px 14px rgba(21,101,192,0.07)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{width:4,height:16,background:"#1565c0",borderRadius:2,display:"inline-block"}}/>
            <span style={{fontSize:13,fontWeight:700,color:"#1a237e"}}>各省现货价格排行</span>
          </div>
          <div style={{display:"flex",gap:8,fontSize:10}}>
            {[{c:"#1e88e5",l:"现货均价"},{c:"#4caf50",l:"机制-风"},{c:"#ff9800",l:"机制-光"}].map(x=>(
              <div key={x.l} style={{display:"flex",alignItems:"center",gap:2}}>
                <div style={{width:8,height:3,background:x.c,borderRadius:2}}/>
                <span style={{color:"#90a4ae"}}>{x.l}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{display:"flex",gap:3,marginBottom:4,paddingLeft:48}}>
          {[0,150,300,450,600].map(v=><span key={v} style={{flex:1,fontSize:8,color:"#b0bec5",textAlign:"center"}}>{v}</span>)}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:5}}>
          {displayed.map(p=>{
            const isSel=selected?.name===p.name;
            const pct=p.spot/700*100;
            return(
              <div key={p.name} onClick={()=>setSelected(isSel?null:p)} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
                <div style={{width:42,fontSize:11,color:isSel?"#1565c0":"#546e7a",fontWeight:isSel?700:400,textAlign:"right",flexShrink:0}}>{p.name}</div>
                <div style={{flex:1,position:"relative",height:17}}>
                  {[25,50,75].map(g=><div key={g} style={{position:"absolute",left:`${g}%`,top:0,bottom:0,width:1,background:"#f0f4ff"}}/>)}
                  <div style={{position:"absolute",left:0,top:2,height:13,width:`${pct}%`,background:isSel?"linear-gradient(90deg,#0d47a1,#1976d2)":"linear-gradient(90deg,#1565c0,#42a5f5)",borderRadius:"0 4px 4px 0",transition:"width 0.4s"}}/>
                  <div style={{position:"absolute",left:`${p.spot*0.82/700*100}%`,top:0,bottom:0,width:2,background:"#4caf50",borderRadius:1}}/>
                  <div style={{position:"absolute",left:`${p.spot*0.91/700*100}%`,top:0,bottom:0,width:2,background:"#ff9800",borderRadius:1}}/>
                  <div style={{position:"absolute",left:`${pct}%`,top:1,marginLeft:3,fontSize:10,color:"#1a237e",fontWeight:700,whiteSpace:"nowrap"}}>{p.spot}</div>
                </div>
                <div style={{width:16,flexShrink:0,textAlign:"center"}}><Trend t={p.trend} s={10}/></div>
              </div>
            );
          })}
        </div>
        {!showAll&&(
          <div onClick={()=>setShowAll(true)} style={{marginTop:10,textAlign:"center",fontSize:12,color:"#1565c0",fontWeight:600,cursor:"pointer",padding:"6px 0",borderTop:"1px solid #f0f4ff"}}>
            查看全部省份 ({listData.length}) ↓
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// DATA PAGE — 查数据
// ═══════════════════════════════════════════════════════════════════
function DataPage({ elecData, setElecData }) {
  const [priceType, setPriceType] = useState("spot");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("desc");
  const [importMsg, setImportMsg] = useState("");
  const fileRef = useRef(null);

  const TYPES = [
    {k:"spot",      l:"现货均价",  unit:"元/MWh", field:"spot"},
    {k:"residential",l:"居民电价", unit:"元/度",  field:"residential"},
    {k:"commercial", l:"商业电价", unit:"元/度",  field:"commercial"},
    {k:"industrial", l:"工业电价", unit:"元/度",  field:"industrial"},
    {k:"peak",       l:"峰电价",   unit:"元/度",  field:"peak"},
    {k:"valley",     l:"谷电价",   unit:"元/度",  field:"valley"},
  ];
  const cur = TYPES.find(t=>t.k===priceType);

  let list = Object.entries(elecData).map(([name,d])=>({name,...d}));
  if (search) list = list.filter(p=>p.name.includes(search));
  list.sort((a,b)=> sortBy==="desc" ? b[cur.field]-a[cur.field] : a[cur.field]-b[cur.field]);

  const max = Math.max(...list.map(p=>p[cur.field]));
  const min = Math.min(...list.map(p=>p[cur.field]));

  // CSV Import
  const handleCSV = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const lines = ev.target.result.split("\n").filter(l=>l.trim());
        const updated = {...elecData};
        let count = 0;
        lines.forEach((line,i) => {
          if (i === 0) return; // skip header
          const cols = line.split(",").map(c=>c.trim());
          const name = cols[0];
          if (!name || !updated[name]) return;
          if (cols[1]) updated[name] = {...updated[name], spot: parseFloat(cols[1])};
          if (cols[2]) updated[name] = {...updated[name], spotPeak: parseFloat(cols[2])};
          if (cols[3]) updated[name] = {...updated[name], spotValley: parseFloat(cols[3])};
          if (cols[4]) updated[name] = {...updated[name], residential: parseFloat(cols[4])};
          count++;
        });
        setElecData(updated);
        setImportMsg(`✅ 成功更新 ${count} 个省份数据`);
        setTimeout(()=>setImportMsg(""),4000);
      } catch {
        setImportMsg("❌ 文件格式错误，请检查CSV格式");
        setTimeout(()=>setImportMsg(""),4000);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // CSV Template download
  const downloadTemplate = () => {
    const header = "省份,现货均价(元/MWh),峰电价(元/MWh),谷电价(元/MWh),居民电价(元/度)\n";
    const rows = Object.keys(elecData).map(n=>`${n},${elecData[n].spot},${elecData[n].spotPeak},${elecData[n].spotValley},${elecData[n].residential}`).join("\n");
    const blob = new Blob([header+rows], {type:"text/csv;charset=utf-8;"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href=url; a.download="electricity_data.csv"; a.click();
  };

  return (
    <div style={{background:"#f0f6ff",minHeight:"100vh",fontFamily:"'PingFang SC','Microsoft YaHei',sans-serif"}}>
      <div style={{background:"#1565c0",padding:"6px 16px 0",display:"flex",justifyContent:"space-between",fontSize:11,color:"rgba(255,255,255,0.9)",fontWeight:500}}><span>9:41</span><span>📶 🔋</span></div>

      {/* Header */}
      <div style={{background:"linear-gradient(135deg,#1565c0,#1e88e5)",padding:"12px 16px 16px"}}>
        <div style={{fontSize:18,fontWeight:800,color:"#fff",marginBottom:8}}>查数据</div>
        {/* Search */}
        <div style={{background:"rgba(255,255,255,0.18)",borderRadius:24,padding:"8px 14px",display:"flex",alignItems:"center",gap:8}}>
          <span style={{color:"rgba(255,255,255,0.7)",fontSize:14}}>🔍</span>
          <input
            value={search}
            onChange={e=>setSearch(e.target.value)}
            placeholder="搜索省份..."
            style={{background:"none",border:"none",outline:"none",color:"#fff",fontSize:13,flex:1,fontFamily:"'PingFang SC',sans-serif"}}
          />
        </div>
      </div>

      {/* Data import toolbar */}
      <div style={{background:"#fff",padding:"10px 12px",display:"flex",gap:8,alignItems:"center",borderBottom:"1px solid #f0f4ff"}}>
        <input ref={fileRef} type="file" accept=".csv" style={{display:"none"}} onChange={handleCSV}/>
        <div onClick={()=>fileRef.current.click()} style={{padding:"6px 14px",borderRadius:20,background:"linear-gradient(135deg,#1565c0,#1e88e5)",color:"#fff",fontSize:11,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
          <span>📥</span> 导入CSV
        </div>
        <div onClick={downloadTemplate} style={{padding:"6px 14px",borderRadius:20,background:"rgba(200,220,255,0.4)",color:"#1565c0",fontSize:11,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:4,border:"1px solid rgba(21,101,192,0.2)"}}>
          <span>📤</span> 下载模板
        </div>
        {importMsg && <div style={{fontSize:11,color:importMsg.startsWith("✅")?"#2e7d32":"#c62828",fontWeight:600}}>{importMsg}</div>}
      </div>

      {/* Price type tabs */}
      <div style={{background:"#fff",padding:"0 12px",overflowX:"auto",display:"flex",gap:0,borderBottom:"1px solid #f0f4ff"}}>
        {TYPES.map(t=>(
          <div key={t.k} onClick={()=>setPriceType(t.k)} style={{padding:"10px 12px",fontSize:12,fontWeight:600,color:priceType===t.k?"#1565c0":"#90a4ae",borderBottom:priceType===t.k?"2.5px solid #1565c0":"2.5px solid transparent",whiteSpace:"nowrap",cursor:"pointer",transition:"all 0.2s"}}>
            {t.l}
          </div>
        ))}
      </div>

      {/* Sort toggle */}
      <div style={{padding:"8px 12px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <span style={{fontSize:12,color:"#78909c"}}>共 {list.length} 个地区 · 单位：{cur.unit}</span>
        <div onClick={()=>setSortBy(s=>s==="desc"?"asc":"desc")} style={{fontSize:11,color:"#1565c0",fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:3}}>
          <span>{sortBy==="desc"?"从高到低":"从低到高"}</span>
          <span>{sortBy==="desc"?"↓":"↑"}</span>
        </div>
      </div>

      {/* Province list */}
      <div style={{padding:"0 12px 20px",display:"flex",flexDirection:"column",gap:8}}>
        {list.map((p,i)=>{
          const val = p[cur.field];
          const pct = (val-min)/(max-min)*100;
          const isTop = i < 3;
          return (
            <div key={p.name} style={{background:"rgba(255,255,255,0.92)",borderRadius:14,padding:"12px 14px",boxShadow:"0 2px 10px rgba(21,101,192,0.07)",border:isTop?"1px solid rgba(21,101,192,0.12)":"1px solid transparent"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  {/* Rank badge */}
                  <div style={{width:22,height:22,borderRadius:"50%",background:i===0?"#f44336":i===1?"#ff9800":i===2?"#ffd740":"#e8f0fe",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:i<3?"#fff":"#90a4ae"}}>
                    {i+1}
                  </div>
                  <span style={{fontSize:14,fontWeight:700,color:"#1a237e"}}>{p.name}</span>
                  <Trend t={p.trend} s={11}/>
                </div>
                <div style={{textAlign:"right"}}>
                  <span style={{fontSize:18,fontWeight:800,color:"#1565c0"}}>{val}</span>
                  <span style={{fontSize:10,color:"#90a4ae",marginLeft:3}}>{cur.unit}</span>
                </div>
              </div>
              {/* Progress bar */}
              <div style={{height:5,background:"#e8f0fe",borderRadius:3,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${pct}%`,background:"linear-gradient(90deg,#42a5f5,#1565c0)",borderRadius:3}}/>
              </div>
              {/* Extra info */}
              {priceType==="spot" && (
                <div style={{display:"flex",gap:12,marginTop:6}}>
                  <span style={{fontSize:10,color:"#f44336"}}>峰 {p.spotPeak}</span>
                  <span style={{fontSize:10,color:"#26c6da"}}>谷 {p.spotValley}</span>
                  <span style={{fontSize:10,color:"#78909c"}}>差 {p.spotPeak-p.spotValley}</span>
                </div>
              )}
              {priceType!=="spot" && (
                <div style={{display:"flex",gap:12,marginTop:6}}>
                  <span style={{fontSize:10,color:"#78909c"}}>峰 {p.peak}元/度</span>
                  <span style={{fontSize:10,color:"#78909c"}}>谷 {p.valley}元/度</span>
                  <span style={{fontSize:10,color:"#78909c"}}>峰谷差 {(p.peak-p.valley).toFixed(2)}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// POLICY PAGE — 看政策
// ═══════════════════════════════════════════════════════════════════
const POLICIES = {
  "现货市场":[
    {title:"关于深化电力体制改革进一步推进电力现货市场建设的通知",dept:"国家发展改革委 国家能源局",date:"2024-02-18",tag:"现货市场",hot:true,summary:"要求各省加快推进电力现货市场从试运行转为正式运行，完善价格形成机制，有序扩大市场化交易规模。"},
    {title:"2025年电力现货市场运营规则修订版（征求意见稿）",dept:"国家能源局",date:"2025-01-10",tag:"现货市场",hot:true,summary:"对现货市场出清机制、报价规则、结算周期等进行系统性修订，重点优化中长期与现货衔接机制。"},
    {title:"关于印发电力现货市场基本规则（试行）的通知",dept:"国家发展改革委",date:"2023-09-01",tag:"现货市场",hot:false,summary:"明确全国统一电力现货市场建设的基本框架，规定市场主体准入条件及出清价格上下限规则。"},
  ],
  "价格政策":[
    {title:"关于2025年完善输配电价执行政策的通知",dept:"国家发展改革委",date:"2025-02-01",tag:"价格政策",hot:true,summary:"明确调整省间、省内输电价格执行机制，促进跨省跨区电力资源优化配置。"},
    {title:"工商业电价市场化改革实施方案",dept:"国家发展改革委",date:"2024-10-15",tag:"价格政策",hot:false,summary:"进一步扩大工商业用户参与市场化交易比例，推动目录电价向市场价格过渡。"},
    {title:"居民阶梯电价调整标准（2025年版）",dept:"国家发展改革委",date:"2025-01-20",tag:"价格政策",hot:false,summary:"根据居民用电量结构变化及CPI情况，对阶梯电价分档标准进行动态调整。"},
  ],
  "新能源":[
    {title:"可再生能源电力消纳保障机制实施办法（修订）",dept:"国家发展改革委 国家能源局",date:"2024-12-05",tag:"新能源",hot:true,summary:"提高各省最低可再生能源电力消纳责任权重，明确新能源大比例接入下的电网支撑技术要求。"},
    {title:"分布式光伏并网管理办法（2025版）",dept:"国家能源局",date:"2025-01-08",tag:"新能源",hot:false,summary:"规范分布式光伏并网流程，扩大申请上限，建立跨区域分布式电力交易机制。"},
    {title:"新能源参与中长期电力交易指导意见",dept:"国家能源局",date:"2024-08-30",tag:"新能源",hot:false,summary:"引导风电光伏通过双边协商、集中竞价等方式签订中长期合同，增强市场收益确定性。"},
  ],
  "辅助服务":[
    {title:"电力辅助服务管理办法（2023年修订版）",dept:"国家能源局",date:"2023-11-10",tag:"辅助服务",hot:false,summary:"扩大辅助服务提供主体范围至储能、虚拟电厂，完善调频、调峰、备用等补偿机制。"},
    {title:"独立储能参与电力市场及调频试点方案",dept:"国家能源局",date:"2024-05-20",tag:"辅助服务",hot:true,summary:"明确独立储能作为独立市场主体参与现货市场及辅助服务市场的规则框架与价格机制。"},
  ],
  "省间交易":[
    {title:"跨省跨区电力中长期交易规则（修订）",dept:"国家能源局",date:"2024-06-01",tag:"省间交易",hot:false,summary:"完善省间双边交易机制，优化集中竞价流程，推进西电东送通道利用率提升。"},
    {title:"关于推进省间现货交易试点工作的通知",dept:"国家发展改革委",date:"2025-01-30",tag:"省间交易",hot:true,summary:"选取5个省（区）开展省间现货交易试点，建立省间现货市场与省内市场的协调机制。"},
  ],
};

function PolicyPage() {
  const [cat, setCat] = useState("现货市场");
  const [expanded, setExpanded] = useState(null);
  const cats = Object.keys(POLICIES);

  return (
    <div style={{background:"#f0f6ff",minHeight:"100vh",fontFamily:"'PingFang SC','Microsoft YaHei',sans-serif"}}>
      <div style={{background:"#1565c0",padding:"6px 16px 0",display:"flex",justifyContent:"space-between",fontSize:11,color:"rgba(255,255,255,0.9)",fontWeight:500}}><span>9:41</span><span>📶 🔋</span></div>
      <div style={{background:"linear-gradient(135deg,#1565c0,#1e88e5)",padding:"12px 16px 0"}}>
        <div style={{fontSize:18,fontWeight:800,color:"#fff",marginBottom:10}}>看政策</div>
        <div style={{display:"flex",gap:0,overflowX:"auto",paddingBottom:0}}>
          {cats.map(c=>(
            <div key={c} onClick={()=>setCat(c)} style={{padding:"8px 14px",fontSize:12,fontWeight:600,color:cat===c?"#fff":"rgba(255,255,255,0.6)",borderBottom:cat===c?"2.5px solid #fff":"2.5px solid transparent",whiteSpace:"nowrap",cursor:"pointer",transition:"all 0.2s"}}>
              {c}
              {POLICIES[c].some(p=>p.hot) && <span style={{marginLeft:4,fontSize:9,background:"#f44336",color:"#fff",borderRadius:4,padding:"1px 4px"}}>热</span>}
            </div>
          ))}
        </div>
      </div>

      <div style={{padding:"10px 12px 20px"}}>
        {/* Stats bar */}
        <div style={{background:"#fff",borderRadius:14,padding:"10px 14px",marginBottom:10,display:"flex",gap:16,boxShadow:"0 2px 8px rgba(21,101,192,0.06)"}}>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:18,fontWeight:800,color:"#1565c0"}}>{POLICIES[cat].length}</div>
            <div style={{fontSize:10,color:"#90a4ae"}}>相关政策</div>
          </div>
          <div style={{width:1,background:"#f0f4ff"}}/>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:18,fontWeight:800,color:"#f44336"}}>{POLICIES[cat].filter(p=>p.hot).length}</div>
            <div style={{fontSize:10,color:"#90a4ae"}}>近期热点</div>
          </div>
          <div style={{width:1,background:"#f0f4ff"}}/>
          <div style={{flex:1,display:"flex",alignItems:"center"}}>
            <div style={{fontSize:11,color:"#78909c",lineHeight:1.5}}>
              最新：{[...POLICIES[cat]].sort((a,b)=>b.date.localeCompare(a.date))[0]?.date}
            </div>
          </div>
        </div>

        {POLICIES[cat].map((p,i)=>(
          <div key={i} onClick={()=>setExpanded(expanded===i?null:i)}
            style={{background:"rgba(255,255,255,0.93)",borderRadius:16,padding:"14px 16px",marginBottom:10,boxShadow:"0 2px 14px rgba(21,101,192,0.08)",border:p.hot?"1px solid rgba(21,101,192,0.18)":"1px solid transparent",cursor:"pointer"}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:8}}>
              <div style={{display:"flex",gap:6,flexShrink:0,flexDirection:"column",alignItems:"flex-start"}}>
                <div style={{padding:"3px 9px",borderRadius:8,background:"linear-gradient(135deg,#1565c0,#42a5f5)",color:"#fff",fontSize:10,fontWeight:700}}>
                  {p.tag}
                </div>
                {p.hot && <div style={{padding:"2px 7px",borderRadius:6,background:"#fff0f0",color:"#f44336",fontSize:9,fontWeight:700,border:"1px solid #ffcdd2"}}>热点</div>}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:"#1a237e",lineHeight:1.5}}>{p.title}</div>
                <div style={{fontSize:11,color:"#78909c",marginTop:4}}>
                  {p.dept} · {p.date}
                </div>
              </div>
              <span style={{color:"#90a4ae",fontSize:16,flexShrink:0,marginTop:2}}>{expanded===i?"▲":"▼"}</span>
            </div>
            {expanded===i && (
              <div style={{background:"#f8faff",borderRadius:10,padding:"10px 12px",fontSize:12,color:"#455a64",lineHeight:1.7,borderLeft:"3px solid #1565c0"}}>
                {p.summary}
                <div style={{marginTop:8,display:"flex",gap:8}}>
                  <div style={{padding:"4px 14px",borderRadius:20,background:"linear-gradient(135deg,#1565c0,#1e88e5)",color:"#fff",fontSize:11,fontWeight:600,cursor:"pointer"}}>
                    查看全文
                  </div>
                  <div style={{padding:"4px 14px",borderRadius:20,background:"rgba(200,220,255,0.4)",color:"#1565c0",fontSize:11,fontWeight:600,cursor:"pointer",border:"1px solid rgba(21,101,192,0.2)"}}>
                    收藏
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MINE PAGE
// ═══════════════════════════════════════════════════════════════════
function MinePage() {
  const [notif, setNotif] = useState(true);
  return (
    <div style={{background:"#f0f6ff",minHeight:"100vh",fontFamily:"'PingFang SC','Microsoft YaHei',sans-serif"}}>
      <div style={{background:"#1565c0",padding:"6px 16px 0",display:"flex",justifyContent:"space-between",fontSize:11,color:"rgba(255,255,255,0.9)",fontWeight:500}}><span>9:41</span><span>📶 🔋</span></div>
      <div style={{background:"linear-gradient(160deg,#1565c0,#0d47a1)",padding:"28px 20px 60px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-30,right:-20,width:120,height:120,borderRadius:"50%",background:"rgba(255,255,255,0.05)"}}/>
        <div style={{position:"absolute",top:40,right:30,width:60,height:60,borderRadius:"50%",background:"rgba(255,255,255,0.06)"}}/>
        <div style={{display:"flex",alignItems:"center",gap:16,position:"relative"}}>
          <div style={{width:66,height:66,borderRadius:"50%",background:"linear-gradient(135deg,rgba(255,255,255,0.3),rgba(255,255,255,0.1))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,border:"2px solid rgba(255,255,255,0.4)",boxShadow:"0 4px 16px rgba(0,0,0,0.2)"}}>👤</div>
          <div>
            <div style={{fontSize:19,fontWeight:800,color:"#fff"}}>用户名称</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,0.75)",marginTop:3}}>
              普通会员 · ID: 20250306
            </div>
            <div style={{marginTop:6,display:"flex",gap:10}}>
              {[{l:"收藏",v:3},{l:"历史",v:15},{l:"提醒",v:2}].map(s=>(
                <div key={s.l} style={{textAlign:"center"}}>
                  <div style={{fontSize:15,fontWeight:700,color:"#fff"}}>{s.v}</div>
                  <div style={{fontSize:9,color:"rgba(255,255,255,0.65)"}}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{marginTop:-28,padding:"0 12px 20px"}}>
        {/* Quick actions */}
        <div style={{background:"rgba(255,255,255,0.95)",borderRadius:16,padding:"14px 16px",marginBottom:10,display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,boxShadow:"0 4px 20px rgba(21,101,192,0.12)"}}>
          {[{icon:"⭐",l:"我的收藏"},{icon:"🔔",l:"价格提醒"},{icon:"📊",l:"分析报告"},{icon:"📋",l:"历史记录"}].map(s=>(
            <div key={s.l} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,cursor:"pointer",padding:"6px 4px"}}>
              <div style={{width:40,height:40,borderRadius:14,background:"linear-gradient(135deg,rgba(21,101,192,0.1),rgba(66,165,245,0.12))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:19}}>{s.icon}</div>
              <div style={{fontSize:10,color:"#546e7a",fontWeight:600}}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Settings */}
        {[
          {icon:"🔔",label:"消息通知",desc:"价格变动实时推送",right:<div onClick={()=>setNotif(!notif)} style={{width:40,height:22,borderRadius:11,background:notif?"#1565c0":"#ccc",position:"relative",cursor:"pointer",transition:"background 0.2s"}}><div style={{position:"absolute",top:2,left:notif?20:2,width:18,height:18,borderRadius:"50%",background:"#fff",transition:"left 0.2s",boxShadow:"0 1px 4px rgba(0,0,0,0.2)"}}/></div>},
          {icon:"📈",label:"数据订阅",desc:"定制省份价格推送"},
          {icon:"🗺️",label:"关注省份",desc:"已关注 3 个省份"},
          {icon:"⚙️",label:"偏好设置",desc:"单位、主题、语言"},
          {icon:"💬",label:"联系我们",desc:"7×24小时在线客服"},
          {icon:"ℹ️",label:"关于我们",desc:"易能电易查 v3.0.0"},
        ].map(({icon,label,desc,right},i)=>(
          <div key={i} style={{background:"rgba(255,255,255,0.88)",borderRadius:14,padding:"12px 16px",marginBottom:8,display:"flex",alignItems:"center",gap:12,boxShadow:"0 2px 10px rgba(21,101,192,0.06)",cursor:"pointer"}}>
            <div style={{width:40,height:40,borderRadius:12,background:"linear-gradient(135deg,rgba(21,101,192,0.1),rgba(66,165,245,0.14))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{icon}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:600,color:"#1a237e"}}>{label}</div>
              <div style={{fontSize:11,color:"#90a4ae",marginTop:1}}>{desc}</div>
            </div>
            {right || <span style={{color:"#b0bec5",fontSize:18}}>›</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// APP SHELL
// ═══════════════════════════════════════════════════════════════════
const NAV = [
  {id:"home",  label:"首页",   icon:a=><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 12L12 3l9 9" stroke={a?"#1565c0":"#90a4ae"} strokeWidth="2" strokeLinecap="round"/><path d="M5 10V20a1 1 0 001 1h4v-4h4v4h4a1 1 0 001-1V10" stroke={a?"#1565c0":"#90a4ae"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>},
  {id:"data",  label:"查数据", icon:a=><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.5" fill={a?"#1565c0":"#90a4ae"}/><rect x="14" y="3" width="7" height="7" rx="1.5" fill={a?"#1565c0":"#90a4ae"}/><rect x="3" y="14" width="7" height="7" rx="1.5" fill={a?"#1565c0":"#90a4ae"}/><rect x="14" y="14" width="7" height="7" rx="1.5" fill={a?"#1565c0":"#90a4ae"} opacity={a?1:0.5}/></svg>},
  {id:"policy",label:"看政策", icon:a=><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="4" y="2" width="16" height="20" rx="2" stroke={a?"#1565c0":"#90a4ae"} strokeWidth="2"/><line x1="8" y1="8" x2="16" y2="8" stroke={a?"#1565c0":"#90a4ae"} strokeWidth="2" strokeLinecap="round"/><line x1="8" y1="12" x2="16" y2="12" stroke={a?"#1565c0":"#90a4ae"} strokeWidth="2" strokeLinecap="round"/><line x1="8" y1="16" x2="12" y2="16" stroke={a?"#1565c0":"#90a4ae"} strokeWidth="2" strokeLinecap="round"/></svg>},
  {id:"mine",  label:"我的",   icon:a=><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" fill={a?"#1565c0":"none"} stroke={a?"#1565c0":"#90a4ae"} strokeWidth="2"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={a?"#1565c0":"#90a4ae"} strokeWidth="2" strokeLinecap="round"/></svg>},
];

export default function App() {
  const [tab, setTab] = useState("home");
  const [elecData, setElecData] = useState(DEFAULT_DATA);

  const pages = {
    home:   <MapPage    elecData={elecData} setElecData={setElecData}/>,
    data:   <DataPage   elecData={elecData} setElecData={setElecData}/>,
    policy: <PolicyPage/>,
    mine:   <MinePage/>,
  };

  return (
    <div style={{background:"#b8d4f0",minHeight:"100vh",display:"flex",justifyContent:"center"}}>
      <div style={{width:390,minHeight:"100vh",position:"relative",overflowX:"hidden"}}>
        <div style={{paddingBottom:62}}>{pages[tab]}</div>

        {/* Bottom nav */}
        <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:390,background:"rgba(255,255,255,0.97)",backdropFilter:"blur(20px)",borderTop:"1px solid rgba(200,220,255,0.6)",display:"flex",zIndex:100,boxShadow:"0 -3px 24px rgba(21,101,192,0.14)"}}>
          {NAV.map(n=>{
            const a = tab===n.id;
            return(
              <div key={n.id} onClick={()=>setTab(n.id)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"10px 0 8px",cursor:"pointer",fontSize:10,color:a?"#1565c0":"#90a4ae",fontWeight:a?700:400,transition:"color 0.2s"}}>
                {n.icon(a)}
                <span style={{marginTop:3}}>{n.label}</span>
                {a&&<div style={{width:4,height:4,borderRadius:"50%",background:"#1565c0",marginTop:3}}/>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
