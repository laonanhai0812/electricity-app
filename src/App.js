import { useState } from "react";

// ── Province data: approximate SVG positions + electricity prices ──────────
const PROVINCES = [
  { id:"HLJ", name:"黑龙江", short:"黑", x:582, y:62,  price:0.523, peak:0.892, valley:0.312, trend:"up"     },
  { id:"JL",  name:"吉林",   short:"吉", x:550, y:100, price:0.498, peak:0.848, valley:0.291, trend:"down"   },
  { id:"LN",  name:"辽宁",   short:"辽", x:520, y:132, price:0.512, peak:0.872, valley:0.302, trend:"up"     },
  { id:"NMG", name:"内蒙古", short:"蒙", x:392, y:86,  price:0.445, peak:0.754, valley:0.267, trend:"down"   },
  { id:"BJ",  name:"北京",   short:"京", x:468, y:151, price:0.478, peak:0.818, valley:0.280, trend:"up"     },
  { id:"TJ",  name:"天津",   short:"津", x:487, y:163, price:0.485, peak:0.825, valley:0.286, trend:"stable" },
  { id:"HEB", name:"河北",   short:"冀", x:450, y:160, price:0.467, peak:0.794, valley:0.278, trend:"up"     },
  { id:"SX",  name:"山西",   short:"晋", x:418, y:172, price:0.452, peak:0.768, valley:0.268, trend:"down"   },
  { id:"SD",  name:"山东",   short:"鲁", x:492, y:190, price:0.523, peak:0.888, valley:0.308, trend:"up"     },
  { id:"SHX", name:"陕西",   short:"陕", x:383, y:200, price:0.438, peak:0.744, valley:0.258, trend:"stable" },
  { id:"HN",  name:"河南",   short:"豫", x:446, y:212, price:0.469, peak:0.796, valley:0.279, trend:"up"     },
  { id:"NX",  name:"宁夏",   short:"宁", x:355, y:178, price:0.402, peak:0.682, valley:0.238, trend:"down"   },
  { id:"GS",  name:"甘肃",   short:"甘", x:310, y:168, price:0.395, peak:0.672, valley:0.235, trend:"stable" },
  { id:"XJ",  name:"新疆",   short:"新", x:155, y:122, price:0.368, peak:0.625, valley:0.218, trend:"down"   },
  { id:"QH",  name:"青海",   short:"青", x:258, y:192, price:0.382, peak:0.648, valley:0.226, trend:"stable" },
  { id:"XZ",  name:"西藏",   short:"藏", x:192, y:228, price:0.342, peak:0.581, valley:0.202, trend:"down"   },
  { id:"SC",  name:"四川",   short:"川", x:325, y:248, price:0.478, peak:0.812, valley:0.282, trend:"up"     },
  { id:"CQ",  name:"重庆",   short:"渝", x:376, y:258, price:0.492, peak:0.836, valley:0.290, trend:"up"     },
  { id:"GZ",  name:"贵州",   short:"黔", x:370, y:280, price:0.456, peak:0.775, valley:0.269, trend:"stable" },
  { id:"YN",  name:"云南",   short:"云", x:305, y:302, price:0.432, peak:0.734, valley:0.255, trend:"down"   },
  { id:"HUB", name:"湖北",   short:"鄂", x:432, y:238, price:0.502, peak:0.852, valley:0.296, trend:"up"     },
  { id:"HUN", name:"湖南",   short:"湘", x:422, y:268, price:0.488, peak:0.830, valley:0.288, trend:"stable" },
  { id:"AH",  name:"安徽",   short:"皖", x:478, y:228, price:0.518, peak:0.880, valley:0.306, trend:"up"     },
  { id:"JS",  name:"江苏",   short:"苏", x:500, y:215, price:0.535, peak:0.908, valley:0.315, trend:"up"     },
  { id:"SH",  name:"上海",   short:"沪", x:524, y:232, price:0.612, peak:1.040, valley:0.368, trend:"up"     },
  { id:"ZJ",  name:"浙江",   short:"浙", x:510, y:252, price:0.558, peak:0.948, valley:0.330, trend:"up"     },
  { id:"JX",  name:"江西",   short:"赣", x:456, y:268, price:0.489, peak:0.832, valley:0.288, trend:"stable" },
  { id:"FJ",  name:"福建",   short:"闽", x:494, y:288, price:0.532, peak:0.905, valley:0.316, trend:"up"     },
  { id:"GD",  name:"广东",   short:"粤", x:446, y:318, price:0.578, peak:0.982, valley:0.342, trend:"up"     },
  { id:"GX",  name:"广西",   short:"桂", x:382, y:312, price:0.512, peak:0.870, valley:0.302, trend:"stable" },
  { id:"HI",  name:"海南",   short:"琼", x:422, y:355, price:0.598, peak:1.016, valley:0.352, trend:"up"     },
];

// ── Price → color (light blue → deep blue) ────────────────────────────────
const priceColor = (price) => {
  const t = Math.min(1, Math.max(0, (price - 0.32) / 0.32));
  const r = Math.round(130 - t * 100);
  const g = Math.round(210 - t * 120);
  const b = Math.round(255);
  return `rgba(${r},${g},${b},${0.75 + t * 0.25})`;
};

// ── Trend icon ─────────────────────────────────────────────────────────────
const TrendIcon = ({ trend }) => {
  if (trend === "up")     return <span style={{ color:"#ff6b6b", fontSize:10 }}>▲</span>;
  if (trend === "down")   return <span style={{ color:"#4fc3f7", fontSize:10 }}>▼</span>;
  return <span style={{ color:"#b0bec5", fontSize:10 }}>—</span>;
};

// ── Data page categories ───────────────────────────────────────────────────
const CATEGORIES = [
  { label:"现货价格",   color:"#4fc3f7", icon: (
    <svg viewBox="0 0 40 40" width="44" height="44">
      <defs><linearGradient id="g1" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stopColor="#29b6f6"/><stop offset="100%" stopColor="#b3e5fc"/></linearGradient></defs>
      <rect x="4" y="20" width="6" height="16" rx="2" fill="url(#g1)" opacity="0.7"/>
      <rect x="13" y="13" width="6" height="23" rx="2" fill="url(#g1)" opacity="0.85"/>
      <rect x="22" y="8" width="6" height="28" rx="2" fill="url(#g1)"/>
      <rect x="31" y="3" width="6" height="33" rx="2" fill="#e1f5fe"/>
      <polyline points="7,22 16,15 25,10 34,5" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )},
  { label:"中长期价格", color:"#26c6da", icon: (
    <svg viewBox="0 0 40 40" width="44" height="44">
      <defs><linearGradient id="g2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#26c6da"/><stop offset="100%" stopColor="#b2ebf2"/></linearGradient></defs>
      <rect x="3" y="3" width="34" height="34" rx="5" fill="url(#g2)" opacity="0.25"/>
      <rect x="8" y="3" width="24" height="5" rx="2" fill="#b2ebf2"/>
      <rect x="8" y="11" width="4" height="4" rx="1" fill="#e0f7fa"/>
      <rect x="15" y="11" width="4" height="4" rx="1" fill="#e0f7fa"/>
      <rect x="22" y="11" width="4" height="4" rx="1" fill="#e0f7fa"/>
      <rect x="29" y="11" width="4" height="4" rx="1" fill="#e0f7fa"/>
      <rect x="8" y="18" width="4" height="4" rx="1" fill="#80deea"/>
      <rect x="15" y="18" width="4" height="4" rx="1" fill="#80deea"/>
      <rect x="22" y="18" width="4" height="4" rx="1" fill="#4dd0e1"/>
      <rect x="29" y="18" width="4" height="4" rx="1" fill="#e0f7fa"/>
      <rect x="8" y="25" width="4" height="4" rx="1" fill="#e0f7fa"/>
      <rect x="15" y="25" width="14" height="4" rx="1" fill="#4dd0e1"/>
    </svg>
  )},
  { label:"省间计算器", color:"#5c6bc0", icon: (
    <svg viewBox="0 0 40 40" width="44" height="44">
      <defs><linearGradient id="g3" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#7986cb"/><stop offset="100%" stopColor="#e8eaf6"/></linearGradient></defs>
      <circle cx="15" cy="14" r="9" fill="url(#g3)" opacity="0.85"/>
      <circle cx="27" cy="14" r="9" fill="#b3bef7" opacity="0.6"/>
      <circle cx="15" cy="26" r="9" fill="#9fa8da" opacity="0.7"/>
      <circle cx="27" cy="26" r="9" fill="url(#g3)" opacity="0.5"/>
      <line x1="9" y1="20" x2="31" y2="20" stroke="#fff" strokeWidth="1.2" opacity="0.6"/>
      <line x1="21" y1="8" x2="21" y2="32" stroke="#fff" strokeWidth="1.2" opacity="0.6"/>
    </svg>
  )},
  { label:"增量机制电价", color:"#26a69a", icon: (
    <svg viewBox="0 0 40 40" width="44" height="44">
      <defs><linearGradient id="g4" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#80cbc4"/><stop offset="100%" stopColor="#e0f2f1"/></linearGradient></defs>
      <circle cx="20" cy="20" r="16" fill="url(#g4)" opacity="0.35"/>
      <circle cx="20" cy="20" r="12" fill="url(#g4)" opacity="0.5"/>
      <text x="20" y="25" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#fff" fontFamily="sans-serif">¥</text>
      <circle cx="20" cy="20" r="16" fill="none" stroke="#80cbc4" strokeWidth="1.5"/>
    </svg>
  )},
  { label:"天气",       color:"#42a5f5", icon: (
    <svg viewBox="0 0 40 40" width="44" height="44">
      <defs><linearGradient id="g5" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#64b5f6"/><stop offset="100%" stopColor="#e3f2fd"/></linearGradient></defs>
      <circle cx="20" cy="18" r="8" fill="#ffe082"/>
      <line x1="20" y1="4" x2="20" y2="8" stroke="#ffe082" strokeWidth="2" strokeLinecap="round"/>
      <line x1="20" y1="28" x2="20" y2="32" stroke="#ffe082" strokeWidth="2" strokeLinecap="round"/>
      <line x1="6" y1="18" x2="10" y2="18" stroke="#ffe082" strokeWidth="2" strokeLinecap="round"/>
      <line x1="30" y1="18" x2="34" y2="18" stroke="#ffe082" strokeWidth="2" strokeLinecap="round"/>
      <ellipse cx="18" cy="27" rx="10" ry="7" fill="url(#g5)" opacity="0.9"/>
      <ellipse cx="26" cy="29" rx="9" ry="6" fill="url(#g5)" opacity="0.8"/>
    </svg>
  )},
  { label:"电源结构",   color:"#ef5350", icon: (
    <svg viewBox="0 0 40 40" width="44" height="44">
      <defs><linearGradient id="g6" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#ef9a9a"/><stop offset="100%" stopColor="#e3f2fd"/></linearGradient></defs>
      <circle cx="20" cy="20" r="14" fill="none" stroke="#e3f2fd" strokeWidth="1"/>
      <path d="M20,20 L20,6 A14,14 0 0,1 33.1,27 Z" fill="#64b5f6" opacity="0.9"/>
      <path d="M20,20 L33.1,27 A14,14 0 0,1 6.9,27 Z" fill="#81c784" opacity="0.9"/>
      <path d="M20,20 L6.9,27 A14,14 0 0,1 20,6 Z" fill="#ffb74d" opacity="0.9"/>
      <circle cx="20" cy="20" r="5" fill="#1a237e" opacity="0.7"/>
    </svg>
  )},
];

// ── Minimal China mainland outline (approximate, SVG path in 700×420 space) ──
const CHINA_PATH = `
M628,52 C648,60 668,90 645,135 L610,155 L580,195 L555,200 L548,222
L530,255 L516,278 L500,298 L502,310 L465,335 L450,352 L435,365
L415,372 L395,348 L370,340 L342,330 L308,318 L282,312 L255,296
L228,272 L205,254 L168,238 L138,224 L102,206 L78,188 L70,158
L72,115 L82,88 L104,70 L145,62 L210,60 L272,65 L338,54 L405,44
L472,40 L540,44 L628,52 Z
`;

// ── Legend colors ──────────────────────────────────────────────────────────
const LEGEND = [
  { label:"≤0.40", color:"rgba(160,220,255,0.9)" },
  { label:"0.40-0.48", color:"rgba(80,180,255,0.9)" },
  { label:"0.48-0.55", color:"rgba(30,130,220,0.9)" },
  { label:"≥0.55", color:"rgba(10,80,180,1)" },
];

// ── Styles ─────────────────────────────────────────────────────────────────
const S = {
  phone: {
    width: 390,
    minHeight: 844,
    background: "linear-gradient(160deg, #daeeff 0%, #c5e8ff 30%, #e8f4ff 100%)",
    fontFamily: "'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', sans-serif",
    position: "relative",
    overflow: "hidden",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    background: "linear-gradient(135deg, #1565c0 0%, #1e88e5 60%, #42a5f5 100%)",
    padding: "16px 18px 14px",
    display: "flex",
    alignItems: "center",
    gap: 10,
    boxShadow: "0 2px 16px rgba(21,101,192,0.3)",
    zIndex: 10,
  },
  logo: {
    width: 34, height: 34,
    background: "linear-gradient(135deg,#fff 0%,#b3e5fc 100%)",
    borderRadius: 10,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 18, fontWeight: 900, color: "#1565c0",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    flexShrink: 0,
  },
  headerText: { flex: 1 },
  appName: { fontSize: 17, fontWeight: 700, color: "#fff", letterSpacing: 0.5 },
  subtitle: { fontSize: 11, color: "rgba(255,255,255,0.78)", marginTop: 1 },
  headerIcons: { display: "flex", gap: 6 },
  iconBtn: {
    width: 28, height: 28, borderRadius: 8,
    background: "rgba(255,255,255,0.18)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 13, color: "#fff",
  },
  content: { flex: 1, overflowY: "auto", paddingBottom: 70 },
  // Map page
  mapCard: {
    margin: "12px 12px 8px",
    background: "rgba(255,255,255,0.65)",
    backdropFilter: "blur(12px)",
    borderRadius: 18,
    padding: "12px 10px 10px",
    boxShadow: "0 4px 24px rgba(21,101,192,0.12)",
    border: "1px solid rgba(255,255,255,0.8)",
  },
  mapTitle: {
    fontSize: 13, fontWeight: 600, color: "#1565c0",
    display: "flex", alignItems: "center", gap: 6, marginBottom: 8,
  },
  infoPanel: {
    margin: "0 12px 10px",
    background: "linear-gradient(135deg,rgba(21,101,192,0.92),rgba(30,136,229,0.9))",
    borderRadius: 16,
    padding: "14px 16px",
    boxShadow: "0 4px 20px rgba(21,101,192,0.3)",
    color: "#fff",
    minHeight: 90,
  },
  infoPanelEmpty: {
    margin: "0 12px 10px",
    background: "rgba(255,255,255,0.45)",
    borderRadius: 16,
    padding: "14px 16px",
    textAlign: "center",
    color: "#90a4ae",
    fontSize: 13,
    minHeight: 90,
    display: "flex", alignItems: "center", justifyContent: "center",
    border: "1px solid rgba(255,255,255,0.7)",
  },
  statsRow: {
    margin: "0 12px 10px",
    display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8,
  },
  statCard: {
    background: "rgba(255,255,255,0.7)",
    backdropFilter: "blur(8px)",
    borderRadius: 14,
    padding: "10px 8px",
    textAlign: "center",
    border: "1px solid rgba(255,255,255,0.85)",
    boxShadow: "0 2px 12px rgba(21,101,192,0.08)",
  },
  // Data page
  sectionTitle: {
    fontSize: 13, color: "#546e7a", fontWeight: 500,
    padding: "14px 16px 8px",
  },
  gridWrap: {
    display: "grid", gridTemplateColumns: "1fr 1fr",
    gap: 12, padding: "0 12px",
  },
  gridCard: {
    background: "rgba(255,255,255,0.75)",
    backdropFilter: "blur(10px)",
    borderRadius: 18,
    padding: "20px 12px 16px",
    display: "flex", flexDirection: "column",
    alignItems: "center", gap: 10,
    boxShadow: "0 4px 20px rgba(21,101,192,0.10)",
    border: "1px solid rgba(255,255,255,0.9)",
    cursor: "pointer",
    transition: "transform 0.15s, box-shadow 0.15s",
  },
  cardLabel: {
    fontSize: 14, fontWeight: 600, color: "#1a237e", textAlign: "center",
  },
  // bottom nav
  navBar: {
    position: "fixed", bottom: 0, left: "50%",
    transform: "translateX(-50%)",
    width: 390,
    background: "rgba(255,255,255,0.9)",
    backdropFilter: "blur(16px)",
    borderTop: "1px solid rgba(200,220,255,0.5)",
    display: "flex",
    zIndex: 100,
    boxShadow: "0 -2px 20px rgba(21,101,192,0.12)",
  },
  navItem: {
    flex: 1, display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    padding: "10px 0 8px",
    cursor: "pointer",
    fontSize: 10,
    color: "#90a4ae",
    transition: "color 0.2s",
  },
  navItemActive: {
    color: "#1565c0",
    fontWeight: 600,
  },
};

// ── Map Component ──────────────────────────────────────────────────────────
function ChinaMap({ selected, onSelect }) {
  const VW = 700, VH = 420;
  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" style={{ display:"block" }}>
      <defs>
        <linearGradient id="mapBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e3f2fd"/>
          <stop offset="100%" stopColor="#bbdefb"/>
        </linearGradient>
        <linearGradient id="seaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b3e5fc"/>
          <stop offset="100%" stopColor="#e1f5fe"/>
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#1565c0" floodOpacity="0.25"/>
        </filter>
      </defs>

      {/* Sea background */}
      <rect width={VW} height={VH} fill="url(#seaGrad)" opacity="0.5"/>

      {/* Grid lines */}
      {[100,200,300,400,500,600].map(x=>(
        <line key={x} x1={x} y1={0} x2={x} y2={VH} stroke="#90caf9" strokeWidth="0.4" opacity="0.5"/>
      ))}
      {[80,160,240,320,400].map(y=>(
        <line key={y} x1={0} y1={y} x2={VW} y2={y} stroke="#90caf9" strokeWidth="0.4" opacity="0.5"/>
      ))}

      {/* China mainland fill */}
      <path d={CHINA_PATH}
        fill="url(#mapBg)"
        stroke="#90caf9"
        strokeWidth="1.5"
        filter="url(#shadow)"
      />

      {/* Province dots */}
      {PROVINCES.map(p => {
        const isSelected = selected?.id === p.id;
        const col = priceColor(p.price);
        return (
          <g key={p.id} onClick={() => onSelect(isSelected ? null : p)} style={{ cursor:"pointer" }}>
            {/* Glow ring on select */}
            {isSelected && (
              <circle cx={p.x} cy={p.y} r={14}
                fill="rgba(255,255,255,0.35)"
                stroke="#fff"
                strokeWidth="1.5"
              />
            )}
            {/* Province circle */}
            <circle
              cx={p.x} cy={p.y}
              r={isSelected ? 11 : 9}
              fill={col}
              stroke={isSelected ? "#fff" : "rgba(255,255,255,0.6)"}
              strokeWidth={isSelected ? 2 : 1}
              filter={isSelected ? "url(#glow)" : undefined}
            />
            {/* Label */}
            <text
              x={p.x} y={p.y + 4}
              textAnchor="middle"
              fontSize={p.short.length > 1 ? 5.5 : 7}
              fill="#fff"
              fontWeight="700"
              fontFamily="'PingFang SC',sans-serif"
              pointerEvents="none"
            >
              {p.short}
            </text>
          </g>
        );
      })}

      {/* South China Sea box */}
      <rect x={542} y={295} width={90} height={110} rx={6}
        fill="rgba(227,242,253,0.6)" stroke="#90caf9" strokeWidth="1" strokeDasharray="4,3"/>
      <text x={587} y={348} textAnchor="middle" fontSize={7.5}
        fill="#42a5f5" fontFamily="sans-serif" fontWeight="600">南海诸岛</text>
    </svg>
  );
}

// ── Legend ─────────────────────────────────────────────────────────────────
function Legend() {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", padding:"4px 6px 0" }}>
      <span style={{ fontSize:10, color:"#78909c" }}>电价(元/kWh):</span>
      {LEGEND.map(l => (
        <div key={l.label} style={{ display:"flex", alignItems:"center", gap:3 }}>
          <div style={{ width:10, height:10, borderRadius:"50%", background:l.color }}/>
          <span style={{ fontSize:9, color:"#546e7a" }}>{l.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Info Panel ─────────────────────────────────────────────────────────────
function InfoPanel({ province }) {
  if (!province) return (
    <div style={S.infoPanelEmpty}>
      <div>
        <div style={{ fontSize:22, marginBottom:4 }}>🗺️</div>
        <div>点击省份查看电价数据</div>
      </div>
    </div>
  );
  return (
    <div style={S.infoPanel}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <div style={{ fontSize:16, fontWeight:700 }}>{province.name}</div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.75)", marginTop:2 }}>
            现货均价 <TrendIcon trend={province.trend}/>
          </div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontSize:24, fontWeight:800, letterSpacing:-0.5 }}>
            {province.price.toFixed(3)}
          </div>
          <div style={{ fontSize:10, color:"rgba(255,255,255,0.75)" }}>元/kWh</div>
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginTop:12 }}>
        <div style={{ background:"rgba(255,255,255,0.15)", borderRadius:10, padding:"8px 10px" }}>
          <div style={{ fontSize:10, color:"rgba(255,255,255,0.7)" }}>峰时电价</div>
          <div style={{ fontSize:15, fontWeight:700, marginTop:2 }}>{province.peak.toFixed(3)}</div>
        </div>
        <div style={{ background:"rgba(255,255,255,0.15)", borderRadius:10, padding:"8px 10px" }}>
          <div style={{ fontSize:10, color:"rgba(255,255,255,0.7)" }}>谷时电价</div>
          <div style={{ fontSize:15, fontWeight:700, marginTop:2 }}>{province.valley.toFixed(3)}</div>
        </div>
      </div>
    </div>
  );
}

// ── Stats row ──────────────────────────────────────────────────────────────
function StatsRow() {
  const avg = (PROVINCES.reduce((s,p)=>s+p.price,0)/PROVINCES.length).toFixed(3);
  const max = PROVINCES.reduce((m,p)=>p.price>m.price?p:m,PROVINCES[0]);
  const min = PROVINCES.reduce((m,p)=>p.price<m.price?p:m,PROVINCES[0]);
  return (
    <div style={S.statsRow}>
      {[
        { label:"全国均价", val:avg, unit:"元/kWh", color:"#1565c0" },
        { label:"最高省份", val:max.name, unit:max.price.toFixed(3)+"元", color:"#d32f2f" },
        { label:"最低省份", val:min.name, unit:min.price.toFixed(3)+"元", color:"#388e3c" },
      ].map(s => (
        <div key={s.label} style={S.statCard}>
          <div style={{ fontSize:10, color:"#78909c", marginBottom:3 }}>{s.label}</div>
          <div style={{ fontSize:14, fontWeight:700, color:s.color }}>{s.val}</div>
          <div style={{ fontSize:9, color:"#90a4ae", marginTop:2 }}>{s.unit}</div>
        </div>
      ))}
    </div>
  );
}

// ── Home Page ──────────────────────────────────────────────────────────────
function HomePage() {
  const [selected, setSelected] = useState(null);
  return (
    <div style={S.content}>
      {/* Welcome banner */}
      <div style={{
        margin:"12px 12px 10px",
        background:"linear-gradient(135deg,#1565c0,#42a5f5)",
        borderRadius:18,
        padding:"14px 16px",
        color:"#fff",
        boxShadow:"0 4px 20px rgba(21,101,192,0.25)",
      }}>
        <div style={{ fontSize:12, opacity:0.85, marginBottom:2 }}>
          {new Date().toLocaleDateString("zh-CN",{year:"numeric",month:"long",day:"numeric"})} · 实时数据
        </div>
        <div style={{ fontSize:18, fontWeight:700 }}>全国电力市场价格地图</div>
        <div style={{ fontSize:11, opacity:0.8, marginTop:4 }}>覆盖 {PROVINCES.length} 个省级行政区 · 数据每日更新</div>
      </div>

      <StatsRow/>

      {/* Map card */}
      <div style={S.mapCard}>
        <div style={S.mapTitle}>
          <span style={{
            width:4, height:16, background:"#1565c0", borderRadius:2, display:"inline-block"
          }}/>
          省级现货电价分布图
          <span style={{ marginLeft:"auto", fontSize:10, color:"#90a4ae" }}>点击查看详情</span>
        </div>
        <ChinaMap selected={selected} onSelect={setSelected}/>
        <Legend/>
      </div>

      <InfoPanel province={selected}/>

      {/* Ranking card */}
      <div style={{
        margin:"0 12px 12px",
        background:"rgba(255,255,255,0.65)",
        backdropFilter:"blur(12px)",
        borderRadius:18,
        padding:"14px 16px",
        border:"1px solid rgba(255,255,255,0.85)",
        boxShadow:"0 4px 20px rgba(21,101,192,0.1)",
      }}>
        <div style={{ fontSize:13, fontWeight:600, color:"#1565c0", marginBottom:10,
          display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ width:4, height:16, background:"#1565c0", borderRadius:2, display:"inline-block" }}/>
          价格排行榜 TOP 5
        </div>
        {[...PROVINCES].sort((a,b)=>b.price-a.price).slice(0,5).map((p,i)=>(
          <div key={p.id} style={{
            display:"flex", alignItems:"center",
            padding:"7px 0",
            borderBottom: i<4?"1px solid rgba(200,220,255,0.35)":"none",
          }}>
            <div style={{
              width:22, height:22, borderRadius:8,
              background: i===0?"linear-gradient(135deg,#ff6b6b,#ffa07a)":
                          i===1?"linear-gradient(135deg,#90a4ae,#cfd8dc)":
                          i===2?"linear-gradient(135deg,#ff8f00,#ffd54f)":
                          "rgba(200,220,255,0.4)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:11, fontWeight:700, color: i<3?"#fff":"#78909c",
              marginRight:10, flexShrink:0,
            }}>
              {i+1}
            </div>
            <span style={{ flex:1, fontSize:13, color:"#263238" }}>{p.name}</span>
            <span style={{ fontSize:13, fontWeight:700, color:"#1565c0" }}>{p.price.toFixed(3)}</span>
            <span style={{ fontSize:10, color:"#90a4ae", marginLeft:3 }}>元/kWh</span>
            <span style={{ marginLeft:8 }}><TrendIcon trend={p.trend}/></span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Data Page ──────────────────────────────────────────────────────────────
function DataPage() {
  const [active, setActive] = useState(null);
  return (
    <div style={S.content}>
      <div style={{ padding:"14px 16px 4px" }}>
        <div style={{ fontSize:18, fontWeight:700, color:"#1a237e" }}>查数据</div>
        <div style={{ fontSize:12, color:"#78909c", marginTop:2 }}>电力市场数据中心</div>
      </div>

      {/* Quick tag row */}
      <div style={{ display:"flex", gap:8, padding:"6px 16px 4px", overflowX:"auto" }}>
        {["今日","本周","本月","年度"].map(t=>(
          <div key={t} style={{
            padding:"5px 14px",
            borderRadius:20,
            background: t==="今日"?"linear-gradient(135deg,#1565c0,#1e88e5)":"rgba(255,255,255,0.7)",
            color: t==="今日"?"#fff":"#546e7a",
            fontSize:12,
            fontWeight: t==="今日"?600:400,
            whiteSpace:"nowrap",
            border:"1px solid",
            borderColor: t==="今日"?"transparent":"rgba(200,220,255,0.6)",
            boxShadow: t==="今日"?"0 2px 10px rgba(21,101,192,0.25)":"none",
            cursor:"pointer",
          }}>
            {t}
          </div>
        ))}
      </div>

      <div style={S.sectionTitle}>数据类目</div>

      <div style={S.gridWrap}>
        {CATEGORIES.map((cat, i) => (
          <div
            key={cat.label}
            style={{
              ...S.gridCard,
              transform: active===i?"scale(0.96)":"scale(1)",
              boxShadow: active===i
                ?"0 2px 12px rgba(21,101,192,0.18)"
                :"0 4px 20px rgba(21,101,192,0.10)",
            }}
            onPointerDown={() => setActive(i)}
            onPointerUp={() => setActive(null)}
            onPointerLeave={() => setActive(null)}
          >
            {/* Icon bubble */}
            <div style={{
              width:72, height:72,
              borderRadius:22,
              background:`linear-gradient(145deg,rgba(255,255,255,0.95),rgba(227,242,253,0.85))`,
              display:"flex", alignItems:"center", justifyContent:"center",
              boxShadow:`0 4px 16px ${cat.color}33, inset 0 1px 3px rgba(255,255,255,0.9)`,
              border:`1.5px solid rgba(255,255,255,0.95)`,
            }}>
              {cat.icon}
            </div>
            <div style={S.cardLabel}>{cat.label}</div>
            <div style={{
              fontSize:10, color:"#90a4ae",
              background:"rgba(200,220,255,0.25)",
              borderRadius:10,
              padding:"3px 10px",
            }}>
              点击查看 →
            </div>
          </div>
        ))}
      </div>

      {/* Recent updates */}
      <div style={{
        margin:"14px 12px",
        background:"rgba(255,255,255,0.65)",
        backdropFilter:"blur(10px)",
        borderRadius:18,
        padding:"14px 16px",
        border:"1px solid rgba(255,255,255,0.85)",
        boxShadow:"0 4px 20px rgba(21,101,192,0.08)",
      }}>
        <div style={{ fontSize:13, fontWeight:600, color:"#1565c0", marginBottom:10,
          display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ width:4,height:16,background:"#1565c0",borderRadius:2,display:"inline-block" }}/>
          最近更新
        </div>
        {[
          { title:"广东2025年3月现货价格公示", time:"10分钟前", tag:"现货" },
          { title:"华东地区中长期合同结算完成", time:"1小时前", tag:"中长期" },
          { title:"全国2月份电源结构报告", time:"3小时前", tag:"电源" },
        ].map((item, i) => (
          <div key={i} style={{
            display:"flex", alignItems:"flex-start",
            padding:"8px 0",
            borderBottom: i<2?"1px solid rgba(200,220,255,0.3)":"none",
            gap:10,
          }}>
            <div style={{
              padding:"3px 8px", borderRadius:8,
              background:"linear-gradient(135deg,#1565c0,#1e88e5)",
              color:"#fff", fontSize:9, fontWeight:600,
              whiteSpace:"nowrap", flexShrink:0, marginTop:1,
            }}>
              {item.tag}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:12, color:"#263238", lineHeight:1.4 }}>{item.title}</div>
              <div style={{ fontSize:10, color:"#90a4ae", marginTop:2 }}>{item.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Policy Page (placeholder) ──────────────────────────────────────────────
function PolicyPage() {
  const policies = [
    { title:"关于推进电力现货市场建设的通知", dept:"国家发展改革委", date:"2025-02-28", tag:"现货市场" },
    { title:"省间电力交易规则修订意见稿", dept:"国家能源局", date:"2025-02-15", tag:"省间交易" },
    { title:"新能源参与电力市场交易指导意见", dept:"国家发展改革委", date:"2025-01-20", tag:"新能源" },
    { title:"电力辅助服务市场运营规则", dept:"国家能源局", date:"2025-01-08", tag:"辅助服务" },
    { title:"分布式光伏发电项目管理办法", dept:"国家能源局", date:"2024-12-31", tag:"光伏" },
  ];
  return (
    <div style={S.content}>
      <div style={{ padding:"14px 16px 4px" }}>
        <div style={{ fontSize:18, fontWeight:700, color:"#1a237e" }}>看政策</div>
        <div style={{ fontSize:12, color:"#78909c", marginTop:2 }}>电力市场政策法规动态</div>
      </div>
      <div style={{ padding:"8px 12px" }}>
        {policies.map((p, i) => (
          <div key={i} style={{
            background:"rgba(255,255,255,0.72)",
            backdropFilter:"blur(10px)",
            borderRadius:16,
            padding:"14px 16px",
            marginBottom:10,
            border:"1px solid rgba(255,255,255,0.9)",
            boxShadow:"0 2px 14px rgba(21,101,192,0.08)",
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:7 }}>
              <div style={{
                padding:"3px 9px", borderRadius:8,
                background:"linear-gradient(135deg,#1565c0,#42a5f5)",
                color:"#fff", fontSize:10, fontWeight:600,
              }}>
                {p.tag}
              </div>
              <span style={{ fontSize:10, color:"#90a4ae", marginLeft:"auto" }}>{p.date}</span>
            </div>
            <div style={{ fontSize:13, fontWeight:600, color:"#1a237e", lineHeight:1.5 }}>{p.title}</div>
            <div style={{ fontSize:11, color:"#78909c", marginTop:4 }}>发布单位：{p.dept}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Mine Page (placeholder) ────────────────────────────────────────────────
function MinePage() {
  return (
    <div style={S.content}>
      <div style={{
        background:"linear-gradient(135deg,#1565c0,#42a5f5)",
        padding:"30px 20px 60px",
        position:"relative",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <div style={{
            width:64, height:64, borderRadius:"50%",
            background:"rgba(255,255,255,0.25)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:28, border:"2px solid rgba(255,255,255,0.5)",
          }}>👤</div>
          <div>
            <div style={{ fontSize:18, fontWeight:700, color:"#fff" }}>用户名称</div>
            <div style={{ fontSize:12, color:"rgba(255,255,255,0.8)", marginTop:3 }}>普通用户 · ID: 20250306</div>
          </div>
        </div>
      </div>
      <div style={{ marginTop:-30, padding:"0 12px 12px" }}>
        {[
          ["我的收藏","⭐","已收藏 3 个省份"],
          ["消息通知","🔔","今日 2 条新消息"],
          ["历史记录","📋","最近查询 15 次"],
          ["设置","⚙️","账号与偏好设置"],
          ["联系我们","💬","7×24小时在线"],
          ["关于我们","ℹ️","电力新能源 v2.3.1"],
        ].map(([label, icon, desc], i) => (
          <div key={i} style={{
            background:"rgba(255,255,255,0.75)",
            backdropFilter:"blur(10px)",
            borderRadius:16,
            padding:"14px 16px",
            marginBottom:10,
            display:"flex", alignItems:"center", gap:12,
            border:"1px solid rgba(255,255,255,0.9)",
            boxShadow:"0 2px 14px rgba(21,101,192,0.08)",
            cursor:"pointer",
          }}>
            <div style={{
              width:38, height:38, borderRadius:12,
              background:"linear-gradient(135deg,rgba(21,101,192,0.12),rgba(66,165,245,0.15))",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:18,
            }}>{icon}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:600, color:"#1a237e" }}>{label}</div>
              <div style={{ fontSize:11, color:"#90a4ae", marginTop:2 }}>{desc}</div>
            </div>
            <span style={{ color:"#90a4ae", fontSize:16 }}>›</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Nav icons ─────────────────────────────────────────────────────────────
const NAV_ICONS = {
  active: {
    home: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 12L12 3l9 9" stroke="#1565c0" strokeWidth="2" strokeLinecap="round"/><path d="M5 10V20a1 1 0 001 1h4v-4h4v4h4a1 1 0 001-1V10" stroke="#1565c0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    data: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.5" fill="#1565c0"/><rect x="14" y="3" width="7" height="7" rx="1.5" fill="#1565c0"/><rect x="3" y="14" width="7" height="7" rx="1.5" fill="#1565c0"/><rect x="14" y="14" width="7" height="7" rx="1.5" fill="#1565c0" opacity="0.5"/></svg>,
    policy: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="4" y="2" width="16" height="20" rx="2" stroke="#1565c0" strokeWidth="2"/><line x1="8" y1="8" x2="16" y2="8" stroke="#1565c0" strokeWidth="2" strokeLinecap="round"/><line x1="8" y1="12" x2="16" y2="12" stroke="#1565c0" strokeWidth="2" strokeLinecap="round"/><line x1="8" y1="16" x2="12" y2="16" stroke="#1565c0" strokeWidth="2" strokeLinecap="round"/></svg>,
    mine: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" fill="#1565c0"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#1565c0" strokeWidth="2" strokeLinecap="round"/></svg>,
  },
  inactive: {
    home: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 12L12 3l9 9" stroke="#90a4ae" strokeWidth="2" strokeLinecap="round"/><path d="M5 10V20a1 1 0 001 1h4v-4h4v4h4a1 1 0 001-1V10" stroke="#90a4ae" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    data: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.5" fill="#90a4ae"/><rect x="14" y="3" width="7" height="7" rx="1.5" fill="#90a4ae"/><rect x="3" y="14" width="7" height="7" rx="1.5" fill="#90a4ae"/><rect x="14" y="14" width="7" height="7" rx="1.5" fill="#90a4ae"/></svg>,
    policy: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="4" y="2" width="16" height="20" rx="2" stroke="#90a4ae" strokeWidth="2"/><line x1="8" y1="8" x2="16" y2="8" stroke="#90a4ae" strokeWidth="2" strokeLinecap="round"/><line x1="8" y1="12" x2="16" y2="12" stroke="#90a4ae" strokeWidth="2" strokeLinecap="round"/><line x1="8" y1="16" x2="12" y2="16" stroke="#90a4ae" strokeWidth="2" strokeLinecap="round"/></svg>,
    mine: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="#90a4ae" strokeWidth="2"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#90a4ae" strokeWidth="2" strokeLinecap="round"/></svg>,
  },
};

// ── App ────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("home");
  const TABS = [
    { id:"home",   label:"首页",   page:<HomePage/> },
    { id:"data",   label:"查数据", page:<DataPage/> },
    { id:"policy", label:"看政策", page:<PolicyPage/> },
    { id:"mine",   label:"我的",   page:<MinePage/> },
  ];
  const current = TABS.find(t=>t.id===tab);
  const pageTitles = { home:"电力新能源", data:"查数据", policy:"看政策", mine:"我的" };

  return (
    <div style={{ background:"#e3f2fd", minHeight:"100vh", display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"20px 0" }}>
      <div style={S.phone}>
        {/* Status bar */}
        <div style={{
          background:"linear-gradient(135deg,#1565c0,#1e88e5)",
          padding:"6px 18px 0",
          display:"flex", justifyContent:"space-between",
          fontSize:11, color:"rgba(255,255,255,0.9)", fontWeight:500,
        }}>
          <span>9:41</span>
          <span>📶 🔋</span>
        </div>

        {/* Header */}
        <div style={S.header}>
          <div style={S.logo}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#1565c0" stroke="#1565c0" strokeWidth="0.5" strokeLinejoin="round"/>
            </svg>
          </div>
          <div style={S.headerText}>
            <div style={S.appName}>电力新能源</div>
            <div style={S.subtitle}>{pageTitles[tab]}</div>
          </div>
          <div style={S.headerIcons}>
            <div style={S.iconBtn}>🔍</div>
            <div style={S.iconBtn}>⋯</div>
          </div>
        </div>

        {/* Page */}
        {current.page}

        {/* Bottom nav */}
        <div style={S.navBar}>
          {TABS.map(t => {
            const isActive = tab === t.id;
            return (
              <div
                key={t.id}
                style={{ ...S.navItem, ...(isActive ? S.navItemActive : {}) }}
                onClick={() => setTab(t.id)}
              >
                <div style={{ marginBottom:2 }}>
                  {isActive ? NAV_ICONS.active[t.id] : NAV_ICONS.inactive[t.id]}
                </div>
                {t.label}
                {isActive && (
                  <div style={{
                    width:4, height:4, borderRadius:"50%",
                    background:"#1565c0", marginTop:2,
                  }}/>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
