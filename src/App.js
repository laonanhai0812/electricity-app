import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════
//  ELECTRICITY DATA
// ═══════════════════════════════════════════════════════════════
const DEFAULT_DATA = {
  北京:  {residential:0.4883,commercial:0.78,industrial:0.68,peak:0.92,valley:0.38,spot:478,spotPeak:765,spotValley:191,trend:"up"},
  天津:  {residential:0.49,  commercial:0.75,industrial:0.65,peak:0.88,valley:0.37,spot:485,spotPeak:776,spotValley:194,trend:"stable"},
  河北:  {residential:0.52,  commercial:0.73,industrial:0.62,peak:0.86,valley:0.36,spot:467,spotPeak:747,spotValley:187,trend:"up"},
  山西:  {residential:0.48,  commercial:0.70,industrial:0.55,peak:0.82,valley:0.33,spot:452,spotPeak:723,spotValley:181,trend:"down"},
  内蒙古:{residential:0.45,  commercial:0.65,industrial:0.45,peak:0.75,valley:0.28,spot:445,spotPeak:712,spotValley:178,trend:"down"},
  辽宁:  {residential:0.50,  commercial:0.74,industrial:0.64,peak:0.87,valley:0.36,spot:482,spotPeak:771,spotValley:193,trend:"up"},
  吉林:  {residential:0.51,  commercial:0.72,industrial:0.63,peak:0.85,valley:0.35,spot:498,spotPeak:797,spotValley:199,trend:"down"},
  黑龙江:{residential:0.51,  commercial:0.73,industrial:0.63,peak:0.86,valley:0.35,spot:523,spotPeak:837,spotValley:209,trend:"up"},
  上海:  {residential:0.52,  commercial:0.82,industrial:0.72,peak:0.95,valley:0.42,spot:612,spotPeak:979,spotValley:245,trend:"up"},
  江苏:  {residential:0.53,  commercial:0.78,industrial:0.68,peak:0.91,valley:0.40,spot:535,spotPeak:856,spotValley:214,trend:"up"},
  浙江:  {residential:0.54,  commercial:0.80,industrial:0.70,peak:0.93,valley:0.41,spot:558,spotPeak:893,spotValley:223,trend:"up"},
  安徽:  {residential:0.51,  commercial:0.75,industrial:0.65,peak:0.88,valley:0.38,spot:518,spotPeak:829,spotValley:207,trend:"up"},
  福建:  {residential:0.50,  commercial:0.77,industrial:0.67,peak:0.90,valley:0.39,spot:532,spotPeak:851,spotValley:213,trend:"up"},
  江西:  {residential:0.51,  commercial:0.74,industrial:0.64,peak:0.87,valley:0.37,spot:489,spotPeak:782,spotValley:196,trend:"stable"},
  山东:  {residential:0.55,  commercial:0.76,industrial:0.66,peak:0.89,valley:0.39,spot:523,spotPeak:837,spotValley:209,trend:"up"},
  河南:  {residential:0.50,  commercial:0.73,industrial:0.63,peak:0.86,valley:0.36,spot:469,spotPeak:750,spotValley:188,trend:"up"},
  湖北:  {residential:0.52,  commercial:0.75,industrial:0.65,peak:0.88,valley:0.38,spot:502,spotPeak:803,spotValley:201,trend:"up"},
  湖南:  {residential:0.53,  commercial:0.74,industrial:0.64,peak:0.87,valley:0.37,spot:488,spotPeak:781,spotValley:195,trend:"stable"},
  广东:  {residential:0.52,  commercial:0.80,industrial:0.70,peak:0.92,valley:0.42,spot:578,spotPeak:925,spotValley:231,trend:"up"},
  广西:  {residential:0.53,  commercial:0.74,industrial:0.64,peak:0.87,valley:0.38,spot:512,spotPeak:819,spotValley:205,trend:"stable"},
  海南:  {residential:0.58,  commercial:0.82,industrial:0.72,peak:0.94,valley:0.43,spot:598,spotPeak:957,spotValley:239,trend:"up"},
  重庆:  {residential:0.50,  commercial:0.74,industrial:0.64,peak:0.87,valley:0.37,spot:492,spotPeak:787,spotValley:197,trend:"up"},
  四川:  {residential:0.52,  commercial:0.75,industrial:0.65,peak:0.88,valley:0.38,spot:478,spotPeak:765,spotValley:191,trend:"up"},
  贵州:  {residential:0.51,  commercial:0.72,industrial:0.62,peak:0.85,valley:0.35,spot:456,spotPeak:730,spotValley:182,trend:"stable"},
  云南:  {residential:0.45,  commercial:0.68,industrial:0.50,peak:0.78,valley:0.30,spot:432,spotPeak:691,spotValley:173,trend:"down"},
  西藏:  {residential:0.42,  commercial:0.65,industrial:0.48,peak:0.72,valley:0.26,spot:342,spotPeak:547,spotValley:137,trend:"down"},
  陕西:  {residential:0.50,  commercial:0.73,industrial:0.63,peak:0.86,valley:0.36,spot:438,spotPeak:701,spotValley:175,trend:"stable"},
  甘肃:  {residential:0.48,  commercial:0.70,industrial:0.55,peak:0.82,valley:0.32,spot:395,spotPeak:632,spotValley:158,trend:"stable"},
  青海:  {residential:0.45,  commercial:0.68,industrial:0.50,peak:0.78,valley:0.29,spot:382,spotPeak:611,spotValley:153,trend:"stable"},
  宁夏:  {residential:0.47,  commercial:0.69,industrial:0.52,peak:0.80,valley:0.31,spot:402,spotPeak:643,spotValley:161,trend:"down"},
  新疆:  {residential:0.46,  commercial:0.68,industrial:0.50,peak:0.78,valley:0.30,spot:368,spotPeak:588,spotValley:147,trend:"down"},
  台湾:  {residential:0.55,  commercial:0.80,industrial:0.70,peak:0.92,valley:0.42,spot:520,spotPeak:832,spotValley:208,trend:"stable"},
};

// Province name normalization (GeoJSON may use full names)
const NAME_MAP = {
  "黑龙江省":"黑龙江","吉林省":"吉林","辽宁省":"辽宁","内蒙古自治区":"内蒙古",
  "河北省":"河北","北京市":"北京","天津市":"天津","山西省":"山西",
  "山东省":"山东","河南省":"河南","陕西省":"陕西","宁夏回族自治区":"宁夏",
  "甘肃省":"甘肃","青海省":"青海","新疆维吾尔自治区":"新疆","西藏自治区":"西藏",
  "四川省":"四川","重庆市":"重庆","云南省":"云南","贵州省":"贵州",
  "广西壮族自治区":"广西","广东省":"广东","湖南省":"湖南","湖北省":"湖北",
  "江西省":"江西","安徽省":"安徽","浙江省":"浙江","上海市":"上海",
  "江苏省":"江苏","福建省":"福建","台湾省":"台湾","海南省":"海南",
};
function normName(raw) { return NAME_MAP[raw] || raw; }

// ═══════════════════════════════════════════════════════════════
//  MERCATOR PROJECTION  (viewBox 0 0 800 600)
// ═══════════════════════════════════════════════════════════════
const VW = 800, VH = 600;
const LON0 = 73, LON1 = 136;
const LAT0 = 53.5, LAT1 = 17.5;

function mercY(lat) {
  var r = lat * Math.PI / 180;
  return Math.log(Math.tan(Math.PI / 4 + r / 2));
}
var MY0 = mercY(LAT0), MY1 = mercY(LAT1);

function project(lon, lat) {
  var x = (lon - LON0) / (LON1 - LON0) * VW;
  var y = (MY0 - mercY(lat)) / (MY0 - MY1) * VH;
  return [x, y];
}

function coordsToPath(coords) {
  // coords = array of [lon,lat] or nested rings
  var pts = coords.map(function(c) { return project(c[0], c[1]); });
  return pts.map(function(p, i) { return (i === 0 ? "M" : "L") + p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" ") + " Z";
}

function featureToPath(feature) {
  var geom = feature.geometry;
  var paths = [];
  if (geom.type === "Polygon") {
    geom.coordinates.forEach(function(ring) { paths.push(coordsToPath(ring)); });
  } else if (geom.type === "MultiPolygon") {
    geom.coordinates.forEach(function(poly) {
      poly.forEach(function(ring) { paths.push(coordsToPath(ring)); });
    });
  }
  return paths.join(" ");
}

function featureCentroid(feature) {
  var geom = feature.geometry;
  var allPts = [];
  var addRing = function(ring) { ring.forEach(function(c) { allPts.push(project(c[0], c[1])); }); };
  if (geom.type === "Polygon") { geom.coordinates.forEach(addRing); }
  else if (geom.type === "MultiPolygon") { geom.coordinates.forEach(function(p) { p.forEach(addRing); }); }
  if (!allPts.length) return [0, 0];
  var xs = allPts.map(function(p) { return p[0]; });
  var ys = allPts.map(function(p) { return p[1]; });
  return [(Math.min.apply(null,xs)+Math.max.apply(null,xs))/2, (Math.min.apply(null,ys)+Math.max.apply(null,ys))/2];
}

// ═══════════════════════════════════════════════════════════════
//  COLOR HELPERS
// ═══════════════════════════════════════════════════════════════
function spotColor(spot, min, max) {
  var t = (spot - min) / (max - min);
  if (t < 0.15) return "#c2e0f7";
  if (t < 0.30) return "#93c4eb";
  if (t < 0.50) return "#5aa0d8";
  if (t < 0.70) return "#2e70b8";
  if (t < 0.85) return "#1550a0";
  return "#0b3278";
}
function resColor(price) {
  if (price <= 0.45) return "#4db88a";
  if (price <= 0.50) return "#7ecba8";
  if (price <= 0.55) return "#b8e0c8";
  if (price <= 0.60) return "#f5d75a";
  if (price <= 0.65) return "#f4a03a";
  if (price <= 0.75) return "#e05530";
  return "#c01c28";
}

// ═══════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════
var today = new Date();
function fmtDate(d) { return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0"); }
var DATES = [0,1,2].map(function(i){ var d=new Date(today); d.setDate(d.getDate()-i); return fmtDate(d); });

function TrendIcon(props) {
  if (props.t==="up")   return <span style={{color:"#f44336",fontSize:props.s||11,fontWeight:700}}>▲</span>;
  if (props.t==="down") return <span style={{color:"#26c6da",fontSize:props.s||11,fontWeight:700}}>▼</span>;
  return <span style={{color:"#90a4ae",fontSize:props.s||11}}>─</span>;
}

// ═══════════════════════════════════════════════════════════════
//  CHINA MAP — loads real GeoJSON from Alibaba DataV API
// ═══════════════════════════════════════════════════════════════
function ChinaMap(props) {
  var elecData = props.elecData;
  var selected = props.selected;
  var onSelect = props.onSelect;
  var colorMode = props.colorMode;

  var [features, setFeatures]   = useState([]);
  var [loading,  setLoading]    = useState(true);
  var [error,    setError]      = useState(null);
  var [hovered,  setHovered]    = useState(null);

  useEffect(function() {
    // Alibaba DataV: full province boundaries with sub-boundaries
    fetch("https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json")
      .then(function(r) { return r.json(); })
      .then(function(data) {
        setFeatures(data.features || []);
        setLoading(false);
      })
      .catch(function() {
        // Fallback: try alternative source
        fetch("https://geojson.cn/api/china.json")
          .then(function(r) { return r.json(); })
          .then(function(data) {
            setFeatures(data.features || []);
            setLoading(false);
          })
          .catch(function(e) {
            setError("地图加载失败");
            setLoading(false);
          });
      });
  }, []);

  var spots = Object.values(elecData).map(function(d) { return d.spot; });
  var minSpot = Math.min.apply(null, spots);
  var maxSpot = Math.max.apply(null, spots);

  if (loading) return (
    <div style={{height:320,display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(145deg,#c0ddfa,#d5edff)",borderRadius:14}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:24,marginBottom:8}}>🗺️</div>
        <div style={{fontSize:12,color:"#1565c0",fontWeight:600}}>地图加载中...</div>
      </div>
    </div>
  );

  if (error) return (
    <div style={{height:200,display:"flex",alignItems:"center",justifyContent:"center",background:"#f5f5f5",borderRadius:14}}>
      <div style={{fontSize:12,color:"#999"}}>{error}</div>
    </div>
  );

  return (
    <div style={{borderRadius:14,overflow:"hidden",position:"relative"}}>
      <svg viewBox={"0 0 "+VW+" "+VH} width="100%"
        style={{display:"block",background:"linear-gradient(145deg,#bfdbf7 0%,#cce8ff 60%,#d8f0ff 100%)"}}>
        <defs>
          <filter id="ps" x="-5%" y="-5%" width="110%" height="110%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#084a8c" floodOpacity="0.22"/>
          </filter>
          <filter id="gl" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#fff" floodOpacity="1"/>
            <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#1565c0" floodOpacity="0.8"/>
          </filter>
          <pattern id="sea" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <line x1="0" y1="40" x2="40" y2="0" stroke="#a8d4f0" strokeWidth="0.4" opacity="0.4"/>
          </pattern>
        </defs>

        {/* Sea background pattern */}
        <rect width={VW} height={VH} fill="url(#sea)"/>

        {features.map(function(feat) {
          var rawName = feat.properties && (feat.properties.name || feat.properties.NL_NAME_1 || feat.properties.NAME_1 || "");
          var name = normName(rawName);
          var data = elecData[name];
          var isSel = selected && selected.name === name;
          var isHov = hovered === name;
          var fill = data
            ? (colorMode === "spot" ? spotColor(data.spot, minSpot, maxSpot) : resColor(data.residential))
            : "#cde4f5";
          var d = featureToPath(feat);
          var cen = featureCentroid(feat);
          var fontSize = name.length > 2 ? 9 : 12;

          return (
            <g key={name + (feat.properties&&feat.properties.adcode||"")}
              onClick={function() { onSelect(isSel ? null : (data ? Object.assign({name:name}, data) : null)); }}
              onMouseEnter={function() { setHovered(name); }}
              onMouseLeave={function() { setHovered(null); }}
              style={{cursor: data ? "pointer" : "default"}}
              filter={isSel ? "url(#gl)" : "url(#ps)"}
            >
              <path d={d}
                fill={isSel ? "#0d47a1" : (isHov && data ? "#1976d2" : fill)}
                stroke={isSel ? "#fff" : "rgba(255,255,255,0.9)"}
                strokeWidth={isSel ? 1.5 : 0.6}
                style={{transition:"fill 0.12s"}}
              />
              {data && (
                <text
                  x={cen[0]} y={cen[1]+1}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize={fontSize} fill="#fff" fontWeight="700"
                  fontFamily="'PingFang SC','Microsoft YaHei',sans-serif"
                  pointerEvents="none"
                  style={{userSelect:"none",filter:"drop-shadow(0 0 2px rgba(0,0,0,0.6))"}}>
                  {name}
                </text>
              )}
              {isHov && !isSel && data && (
                <g>
                  <rect x={cen[0]-38} y={cen[1]-26} width={76} height={20} rx={4}
                    fill="rgba(13,71,161,0.93)" stroke="#fff" strokeWidth={0.5}/>
                  <text x={cen[0]} y={cen[1]-14} textAnchor="middle" dominantBaseline="middle"
                    fontSize={9.5} fill="#fff" fontWeight="700"
                    fontFamily="'PingFang SC',sans-serif" pointerEvents="none">
                    {colorMode==="spot" ? data.spot+"元/MWh" : data.residential+"元/度"}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* South Sea inset */}
        <rect x={644} y={430} width={148} height={160} rx={6}
          fill="rgba(205,235,255,0.88)" stroke="#90caf9" strokeWidth={1} strokeDasharray="5,3"/>
        <text x={718} y={490} textAnchor="middle" fontSize={14} fill="#42a5f5" fontWeight="700"
          fontFamily="'PingFang SC',sans-serif">南海</text>
        <text x={718} y={508} textAnchor="middle" fontSize={14} fill="#42a5f5" fontWeight="700"
          fontFamily="'PingFang SC',sans-serif">诸岛</text>
        {[[668,535],[692,548],[716,560],[740,545],[712,530]].map(function(pt,i){
          return <circle key={i} cx={pt[0]} cy={pt[1]} r={4} fill="#90caf9" opacity={0.7}/>;
        })}

        {/* Status bar */}
        {hovered && elecData[hovered] && !selected && (
          <g>
            <rect x={6} y={572} width={310} height={22} rx={6} fill="rgba(13,71,161,0.9)"/>
            <text x={14} y={585} fontSize={12} fill="#fff" fontWeight="700"
              fontFamily="'PingFang SC',sans-serif">{hovered}</text>
            <text x={66} y={585} fontSize={10.5} fill="rgba(255,255,255,0.88)"
              fontFamily="'PingFang SC',sans-serif">
              {elecData[hovered].spot} 元/MWh · 居民 {elecData[hovered].residential} 元/度
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

// Legend
var SPOT_LEGEND = [{l:"低价",c:"#c2e0f7"},{l:"中低",c:"#93c4eb"},{l:"中高",c:"#5aa0d8"},{l:"高价",c:"#2e70b8"},{l:"最高",c:"#0b3278"}];
var RES_LEGEND  = [{l:"≤0.45",c:"#4db88a"},{l:"0.50",c:"#7ecba8"},{l:"0.55",c:"#f5d75a"},{l:"0.65",c:"#f4a03a"},{l:"≥0.75",c:"#c01c28"}];
function MapLegend(props) {
  var items = props.colorMode==="spot" ? SPOT_LEGEND : RES_LEGEND;
  return (
    <div style={{display:"flex",alignItems:"center",gap:6,padding:"7px 4px 0",flexWrap:"wrap"}}>
      <span style={{fontSize:10,color:"#78909c"}}>{props.colorMode==="spot"?"元/MWh:":"元/度:"}</span>
      {items.map(function(e){
        return <div key={e.l} style={{display:"flex",alignItems:"center",gap:3}}>
          <div style={{width:10,height:10,borderRadius:2,background:e.c,boxShadow:"0 0 2px rgba(0,0,0,0.12)"}}/>
          <span style={{fontSize:9,color:"#546e7a"}}>{e.l}</span>
        </div>;
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MAP PAGE
// ═══════════════════════════════════════════════════════════════
function MapPage(props) {
  var elecData = props.elecData;
  var [selected,  setSelected]  = useState(null);
  var [tab,       setTab]       = useState(0);
  var [dateIdx,   setDateIdx]   = useState(0);
  var [showAll,   setShowAll]   = useState(false);
  var [colorMode, setColorMode] = useState("spot");

  var provList = Object.entries(elecData).map(function(e){ return Object.assign({name:e[0]},e[1]); });
  var maxProv = provList.reduce(function(a,b){ return b.spot>a.spot?b:a; });
  var minProv = provList.reduce(function(a,b){ return b.spot<a.spot?b:a; });
  var maxDiff = provList.reduce(function(a,b){ return (b.spotPeak-b.spotValley)>(a.spotPeak-a.spotValley)?b:a; });
  var listData = provList.slice().sort(function(a,b){ return b.spot-a.spot; });
  var displayed = showAll ? listData : listData.slice(0,6);

  return (
    <div style={{background:"#f0f6ff",minHeight:"100vh",fontFamily:"'PingFang SC','Microsoft YaHei',sans-serif"}}>
      {/* Status bar */}
      <div style={{background:"#1565c0",padding:"6px 16px 0",display:"flex",justifyContent:"space-between",fontSize:11,color:"rgba(255,255,255,0.9)",fontWeight:500}}>
        <span>9:41</span><span>📶 🔋</span>
      </div>
      {/* Tab bar */}
      <div style={{background:"linear-gradient(135deg,#1565c0,#1e88e5)",padding:"10px 16px 0"}}>
        <div style={{display:"flex"}}>
          {["现货实时均价","现货日前均价"].map(function(t,i){
            return <div key={i} onClick={function(){setTab(i);}} style={{flex:1,textAlign:"center",paddingBottom:10,fontSize:13,fontWeight:600,color:tab===i?"#fff":"rgba(255,255,255,0.55)",borderBottom:tab===i?"2.5px solid #fff":"2.5px solid transparent",cursor:"pointer"}}>
              {t}<div style={{fontSize:10,color:"rgba(255,255,255,0.65)",fontWeight:400,marginTop:1}}>元/MWh</div>
            </div>;
          })}
          <div style={{width:40,display:"flex",alignItems:"center",justifyContent:"center",paddingBottom:10}}>
            <div style={{width:30,height:30,borderRadius:8,background:"rgba(255,255,255,0.18)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff"}}>⊙</div>
          </div>
        </div>
      </div>
      {/* Date selector */}
      <div style={{background:"#fff",padding:"10px 12px",display:"flex",gap:8,boxShadow:"0 1px 6px rgba(0,0,0,0.05)"}}>
        {DATES.map(function(d,i){
          return <div key={d} onClick={function(){setDateIdx(i);}} style={{flex:1,textAlign:"center",padding:"7px 4px",borderRadius:20,fontSize:12,fontWeight:600,background:dateIdx===i?"#1565c0":"transparent",color:dateIdx===i?"#fff":"#78909c",border:dateIdx===i?"none":"1px solid #e8eef5",cursor:"pointer",transition:"all 0.2s"}}>{d}</div>;
        })}
      </div>
      {/* Stats */}
      <div style={{background:"#fff",margin:"8px 12px",borderRadius:16,padding:"14px 16px",boxShadow:"0 2px 16px rgba(21,101,192,0.09)"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr"}}>
          {[
            {label:"最高价",icon:"🔺",color:"#f44336",val:maxProv.spot.toFixed(2),sub:maxProv.name},
            {label:"最低价",icon:"🔻",color:"#26a69a",val:minProv.spot.toFixed(2),sub:minProv.name},
            {label:"峰谷差最大",icon:"〰",color:"#5c6bc0",val:(maxDiff.spotPeak-maxDiff.spotValley).toFixed(0),sub:maxDiff.name},
          ].map(function(s,i){
            return <div key={i} style={{textAlign:"center",padding:"0 4px",borderRight:i<2?"1px solid #f0f4ff":"none"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:3,marginBottom:4}}>
                <span style={{fontSize:11}}>{s.icon}</span><span style={{fontSize:10,color:"#90a4ae"}}>{s.label}</span>
              </div>
              <div style={{fontSize:21,fontWeight:800,color:"#1a237e",letterSpacing:-0.5}}>{s.val}</div>
              <div style={{fontSize:11,color:s.color,fontWeight:700,marginTop:2}}>{s.sub}</div>
            </div>;
          })}
        </div>
        <div style={{marginTop:12}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#90a4ae",marginBottom:3}}><span>0</span><span>{maxProv.spot}</span></div>
          <div style={{height:6,background:"#e8f0fe",borderRadius:3,overflow:"hidden"}}>
            <div style={{height:"100%",width:((selected?selected.spot:maxProv.spot)/maxProv.spot*100)+"%",background:"linear-gradient(90deg,#42a5f5,#1565c0)",borderRadius:3,transition:"width 0.4s"}}/>
          </div>
        </div>
      </div>
      {/* Map */}
      <div style={{background:"#fff",margin:"0 12px 8px",borderRadius:18,padding:"10px",boxShadow:"0 4px 20px rgba(21,101,192,0.1)"}}>
        <div style={{display:"flex",gap:6,marginBottom:8}}>
          {[{k:"spot",l:"现货均价"},{k:"residential",l:"居民电价"}].map(function(m){
            return <div key={m.k} onClick={function(){setColorMode(m.k);}} style={{padding:"4px 14px",borderRadius:20,fontSize:11,fontWeight:600,cursor:"pointer",background:colorMode===m.k?"#1565c0":"rgba(200,220,255,0.35)",color:colorMode===m.k?"#fff":"#546e7a",transition:"all 0.2s"}}>{m.l}</div>;
          })}
        </div>
        <ChinaMap elecData={elecData} selected={selected} onSelect={setSelected} colorMode={colorMode}/>
        <MapLegend colorMode={colorMode}/>
      </div>
      {/* Province detail */}
      {selected ? (
        <div style={{margin:"0 12px 8px",background:"linear-gradient(135deg,#1565c0,#0d47a1)",borderRadius:18,padding:"15px 16px",color:"#fff",boxShadow:"0 6px 28px rgba(21,101,192,0.35)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
            <div>
              <div style={{fontSize:20,fontWeight:800}}>{selected.name}</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.7)",marginTop:2,display:"flex",alignItems:"center",gap:5}}>现货均价 <TrendIcon t={selected.trend} s={11}/></div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:32,fontWeight:900,letterSpacing:-1}}>{selected.spot}</div>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.65)"}}>元/MWh</div>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:8}}>
            {[{l:"峰时价",v:selected.spotPeak},{l:"谷时价",v:selected.spotValley},{l:"峰谷差",v:selected.spotPeak-selected.spotValley},{l:"居民电价",v:selected.residential+"元"}].map(function(s){
              return <div key={s.l} style={{background:"rgba(255,255,255,0.14)",borderRadius:10,padding:"7px 5px",textAlign:"center"}}>
                <div style={{fontSize:9,color:"rgba(255,255,255,0.65)",marginBottom:2}}>{s.l}</div>
                <div style={{fontSize:12,fontWeight:700}}>{s.v}</div>
              </div>;
            })}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
            {[{l:"商业电价",v:selected.commercial+"元/度"},{l:"工业电价",v:selected.industrial+"元/度"},{l:"峰谷比",v:(selected.peak/selected.valley).toFixed(2)+"x"}].map(function(s){
              return <div key={s.l} style={{background:"rgba(255,255,255,0.10)",borderRadius:8,padding:"6px 8px",textAlign:"center"}}>
                <div style={{fontSize:9,color:"rgba(255,255,255,0.6)",marginBottom:2}}>{s.l}</div>
                <div style={{fontSize:11,fontWeight:600}}>{s.v}</div>
              </div>;
            })}
          </div>
        </div>
      ) : (
        <div style={{margin:"0 12px 8px",borderRadius:14,padding:"11px 16px",background:"rgba(255,255,255,0.7)",textAlign:"center",color:"#90a4ae",fontSize:12,border:"1px dashed #c8ddf5"}}>点击地图上的省份查看详细电价数据 👆</div>
      )}
      {/* Notice */}
      <div style={{margin:"0 12px 8px",background:"#fff8e1",borderRadius:12,padding:"9px 12px",display:"flex",gap:8,alignItems:"center"}}>
        <span style={{fontSize:14}}>ℹ️</span>
        <span style={{fontSize:11,color:"#795548",lineHeight:1.5}}>由于部分省份出清数据较晚，数据尚未完全更新</span>
      </div>
      {/* Ranking */}
      <div style={{margin:"0 12px 20px",background:"#fff",borderRadius:18,padding:"14px 16px",boxShadow:"0 2px 14px rgba(21,101,192,0.07)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{width:4,height:16,background:"#1565c0",borderRadius:2,display:"inline-block"}}/>
            <span style={{fontSize:13,fontWeight:700,color:"#1a237e"}}>各省现货价格排行</span>
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {displayed.map(function(p){
            var isSel = selected && selected.name===p.name;
            var pct = p.spot/700*100;
            return (
              <div key={p.name} onClick={function(){setSelected(isSel?null:p);}} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
                <div style={{width:42,fontSize:11,color:isSel?"#1565c0":"#546e7a",fontWeight:isSel?700:400,textAlign:"right",flexShrink:0}}>{p.name}</div>
                <div style={{flex:1,position:"relative",height:18}}>
                  {[25,50,75].map(function(g){ return <div key={g} style={{position:"absolute",left:g+"%",top:0,bottom:0,width:1,background:"#f0f4ff"}}/>; })}
                  <div style={{position:"absolute",left:0,top:2,height:14,width:pct+"%",background:isSel?"linear-gradient(90deg,#0d47a1,#1976d2)":"linear-gradient(90deg,#1565c0,#42a5f5)",borderRadius:"0 5px 5px 0",transition:"width 0.4s"}}/>
                  <div style={{position:"absolute",left:pct+"%",top:1,marginLeft:3,fontSize:10,color:"#1a237e",fontWeight:700,whiteSpace:"nowrap"}}>{p.spot}</div>
                </div>
                <div style={{width:16,flexShrink:0,textAlign:"center"}}><TrendIcon t={p.trend} s={10}/></div>
              </div>
            );
          })}
        </div>
        {!showAll && <div onClick={function(){setShowAll(true);}} style={{marginTop:10,textAlign:"center",fontSize:12,color:"#1565c0",fontWeight:600,cursor:"pointer",padding:"6px 0",borderTop:"1px solid #f0f4ff"}}>查看全部省份 ({listData.length}) ↓</div>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  DATA PAGE
// ═══════════════════════════════════════════════════════════════
var PRICE_TYPES = [
  {k:"spot",l:"现货均价",unit:"元/MWh"},{k:"residential",l:"居民电价",unit:"元/度"},
  {k:"commercial",l:"商业电价",unit:"元/度"},{k:"industrial",l:"工业电价",unit:"元/度"},
  {k:"peak",l:"峰电价",unit:"元/度"},{k:"valley",l:"谷电价",unit:"元/度"},
];

function DataPage(props) {
  var elecData=props.elecData, setElecData=props.setElecData;
  var [priceType,setPriceType]=useState("spot");
  var [search,setSearch]=useState("");
  var [sortAsc,setSortAsc]=useState(false);
  var [importMsg,setImportMsg]=useState("");
  var fileRef=useRef(null);
  var cur=PRICE_TYPES.find(function(t){ return t.k===priceType; });
  var list=Object.entries(elecData).map(function(e){ return Object.assign({name:e[0]},e[1]); });
  if(search) list=list.filter(function(p){ return p.name.indexOf(search)>=0; });
  list.sort(function(a,b){ return sortAsc?a[cur.k]-b[cur.k]:b[cur.k]-a[cur.k]; });
  var vals=list.map(function(p){ return p[cur.k]; });
  var maxV=Math.max.apply(null,vals), minV=Math.min.apply(null,vals);

  function handleCSV(e) {
    var file=e.target.files[0]; if(!file) return;
    var r=new FileReader();
    r.onload=function(ev){
      try {
        var lines=ev.target.result.split("\n").filter(function(l){ return l.trim(); });
        var updated=Object.assign({},elecData), count=0;
        lines.forEach(function(line,i){
          if(i===0) return;
          var cols=line.split(",").map(function(c){ return c.trim(); });
          var nm=cols[0]; if(!nm||!updated[nm]) return;
          if(cols[1]) updated[nm]=Object.assign({},updated[nm],{spot:parseFloat(cols[1])});
          if(cols[2]) updated[nm]=Object.assign({},updated[nm],{spotPeak:parseFloat(cols[2])});
          if(cols[3]) updated[nm]=Object.assign({},updated[nm],{spotValley:parseFloat(cols[3])});
          if(cols[4]) updated[nm]=Object.assign({},updated[nm],{residential:parseFloat(cols[4])});
          count++;
        });
        setElecData(updated);
        setImportMsg("✅ 已更新 "+count+" 省份");
        setTimeout(function(){ setImportMsg(""); },4000);
      } catch(_){ setImportMsg("❌ 格式错误"); setTimeout(function(){ setImportMsg(""); },4000); }
    };
    r.readAsText(file); e.target.value="";
  }
  function dlTemplate(){
    var h="省份,现货均价(元/MWh),峰电价(元/MWh),谷电价(元/MWh),居民电价(元/度)\n";
    var rows=Object.keys(elecData).map(function(n){ var d=elecData[n]; return n+","+d.spot+","+d.spotPeak+","+d.spotValley+","+d.residential; }).join("\n");
    var a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([h+rows],{type:"text/csv"})); a.download="electricity_data.csv"; a.click();
  }

  return (
    <div style={{background:"#f0f6ff",minHeight:"100vh",fontFamily:"'PingFang SC','Microsoft YaHei',sans-serif"}}>
      <div style={{background:"#1565c0",padding:"6px 16px 0",display:"flex",justifyContent:"space-between",fontSize:11,color:"rgba(255,255,255,0.9)",fontWeight:500}}><span>9:41</span><span>📶 🔋</span></div>
      <div style={{background:"linear-gradient(135deg,#1565c0,#1e88e5)",padding:"12px 16px 14px"}}>
        <div style={{fontSize:18,fontWeight:800,color:"#fff",marginBottom:8}}>查数据</div>
        <div style={{background:"rgba(255,255,255,0.18)",borderRadius:24,padding:"8px 14px",display:"flex",alignItems:"center",gap:8}}>
          <span style={{color:"rgba(255,255,255,0.7)"}}>🔍</span>
          <input value={search} onChange={function(e){setSearch(e.target.value);}} placeholder="搜索省份..." style={{background:"none",border:"none",outline:"none",color:"#fff",fontSize:13,flex:1,fontFamily:"'PingFang SC',sans-serif"}}/>
        </div>
      </div>
      <div style={{background:"#fff",padding:"10px 12px",display:"flex",gap:8,alignItems:"center",borderBottom:"1px solid #f0f4ff",flexWrap:"wrap"}}>
        <input ref={fileRef} type="file" accept=".csv" style={{display:"none"}} onChange={handleCSV}/>
        <div onClick={function(){fileRef.current.click();}} style={{padding:"6px 14px",borderRadius:20,background:"linear-gradient(135deg,#1565c0,#1e88e5)",color:"#fff",fontSize:11,fontWeight:600,cursor:"pointer"}}>📥 导入CSV</div>
        <div onClick={dlTemplate} style={{padding:"6px 14px",borderRadius:20,background:"rgba(200,220,255,0.4)",color:"#1565c0",fontSize:11,fontWeight:600,cursor:"pointer",border:"1px solid rgba(21,101,192,0.2)"}}>📤 下载模板</div>
        {importMsg&&<div style={{fontSize:11,color:importMsg.indexOf("✅")>=0?"#2e7d32":"#c62828",fontWeight:600}}>{importMsg}</div>}
      </div>
      <div style={{background:"#fff",overflowX:"auto",display:"flex",borderBottom:"1px solid #f0f4ff"}}>
        {PRICE_TYPES.map(function(t){
          return <div key={t.k} onClick={function(){setPriceType(t.k);}} style={{padding:"10px 12px",fontSize:12,fontWeight:600,color:priceType===t.k?"#1565c0":"#90a4ae",borderBottom:priceType===t.k?"2.5px solid #1565c0":"2.5px solid transparent",whiteSpace:"nowrap",cursor:"pointer"}}>{t.l}</div>;
        })}
      </div>
      <div style={{padding:"8px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:12,color:"#78909c"}}>共 {list.length} 地区 · {cur.unit}</span>
        <div onClick={function(){setSortAsc(function(s){return !s;});}} style={{fontSize:11,color:"#1565c0",fontWeight:600,cursor:"pointer"}}>{sortAsc?"↑ 低→高":"↓ 高→低"}</div>
      </div>
      <div style={{padding:"0 12px 20px",display:"flex",flexDirection:"column",gap:8}}>
        {list.map(function(p,i){
          var val=p[cur.k], pct=maxV>minV?(val-minV)/(maxV-minV)*100:50;
          return (
            <div key={p.name} style={{background:"rgba(255,255,255,0.92)",borderRadius:14,padding:"12px 14px",boxShadow:"0 2px 10px rgba(21,101,192,0.07)"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:22,height:22,borderRadius:"50%",background:i===0?"#f44336":i===1?"#ff9800":i===2?"#ffd740":"#e8f0fe",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:i<3?"#fff":"#90a4ae",flexShrink:0}}>{i+1}</div>
                  <span style={{fontSize:14,fontWeight:700,color:"#1a237e"}}>{p.name}</span>
                  <TrendIcon t={p.trend} s={11}/>
                </div>
                <div><span style={{fontSize:18,fontWeight:800,color:"#1565c0"}}>{val}</span><span style={{fontSize:10,color:"#90a4ae",marginLeft:3}}>{cur.unit}</span></div>
              </div>
              <div style={{height:5,background:"#e8f0fe",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:pct+"%",background:"linear-gradient(90deg,#42a5f5,#1565c0)",borderRadius:3}}/></div>
              <div style={{fontSize:10,color:"#90a4ae",marginTop:5}}>
                {priceType==="spot"?("峰 "+p.spotPeak+" · 谷 "+p.spotValley+" · 差 "+(p.spotPeak-p.spotValley)):("峰 "+p.peak+"元 · 谷 "+p.valley+"元")}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  POLICY PAGE
// ═══════════════════════════════════════════════════════════════
var POLICIES = {
  "现货市场":[
    {title:"关于深化电力体制改革进一步推进电力现货市场建设的通知",dept:"国家发展改革委 国家能源局",date:"2024-02-18",hot:true,summary:"要求各省加快推进电力现货市场从试运行转为正式运行，完善价格形成机制，有序扩大市场化交易规模。"},
    {title:"2025年电力现货市场运营规则修订版（征求意见稿）",dept:"国家能源局",date:"2025-01-10",hot:true,summary:"对现货市场出清机制、报价规则、结算周期等进行系统性修订，重点优化中长期与现货衔接机制。"},
    {title:"关于印发电力现货市场基本规则（试行）的通知",dept:"国家发展改革委",date:"2023-09-01",hot:false,summary:"明确全国统一电力现货市场建设的基本框架，规定市场主体准入条件及出清价格上下限规则。"},
  ],
  "价格政策":[
    {title:"关于2025年完善输配电价执行政策的通知",dept:"国家发展改革委",date:"2025-02-01",hot:true,summary:"明确调整省间、省内输电价格执行机制，促进跨省跨区电力资源优化配置。"},
    {title:"工商业电价市场化改革实施方案",dept:"国家发展改革委",date:"2024-10-15",hot:false,summary:"进一步扩大工商业用户参与市场化交易比例，推动目录电价向市场价格过渡。"},
  ],
  "新能源":[
    {title:"可再生能源电力消纳保障机制实施办法（修订）",dept:"国家发展改革委 国家能源局",date:"2024-12-05",hot:true,summary:"提高各省最低可再生能源电力消纳责任权重，明确新能源大比例接入下的电网支撑技术要求。"},
    {title:"分布式光伏并网管理办法（2025版）",dept:"国家能源局",date:"2025-01-08",hot:false,summary:"规范分布式光伏并网流程，扩大申请上限，建立跨区域分布式电力交易机制。"},
  ],
  "辅助服务":[
    {title:"独立储能参与电力市场及调频试点方案",dept:"国家能源局",date:"2024-05-20",hot:true,summary:"明确独立储能作为独立市场主体参与现货市场及辅助服务市场的规则框架与价格机制。"},
  ],
  "省间交易":[
    {title:"关于推进省间现货交易试点工作的通知",dept:"国家发展改革委",date:"2025-01-30",hot:true,summary:"选取5个省（区）开展省间现货交易试点，建立省间现货市场与省内市场的协调机制。"},
  ],
};

function PolicyPage() {
  var [cat,setCat]=useState("现货市场");
  var [expanded,setExpanded]=useState(null);
  return (
    <div style={{background:"#f0f6ff",minHeight:"100vh",fontFamily:"'PingFang SC','Microsoft YaHei',sans-serif"}}>
      <div style={{background:"#1565c0",padding:"6px 16px 0",display:"flex",justifyContent:"space-between",fontSize:11,color:"rgba(255,255,255,0.9)",fontWeight:500}}><span>9:41</span><span>📶 🔋</span></div>
      <div style={{background:"linear-gradient(135deg,#1565c0,#1e88e5)",padding:"12px 16px 0"}}>
        <div style={{fontSize:18,fontWeight:800,color:"#fff",marginBottom:10}}>看政策</div>
        <div style={{display:"flex",overflowX:"auto"}}>
          {Object.keys(POLICIES).map(function(c){
            var hasHot=POLICIES[c].some(function(p){ return p.hot; });
            return <div key={c} onClick={function(){setCat(c);setExpanded(null);}} style={{padding:"8px 14px",fontSize:12,fontWeight:600,color:cat===c?"#fff":"rgba(255,255,255,0.6)",borderBottom:cat===c?"2.5px solid #fff":"2.5px solid transparent",whiteSpace:"nowrap",cursor:"pointer"}}>
              {c}{hasHot&&<span style={{marginLeft:4,fontSize:9,background:"#f44336",color:"#fff",borderRadius:4,padding:"1px 4px"}}>热</span>}
            </div>;
          })}
        </div>
      </div>
      <div style={{padding:"10px 12px 20px"}}>
        {POLICIES[cat].map(function(p,i){
          return (
            <div key={i} onClick={function(){setExpanded(expanded===i?null:i);}} style={{background:"rgba(255,255,255,0.93)",borderRadius:16,padding:"14px 16px",marginBottom:10,boxShadow:"0 2px 14px rgba(21,101,192,0.08)",cursor:"pointer",border:p.hot?"1px solid rgba(21,101,192,0.15)":"1px solid transparent"}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:8}}>
                <div style={{flexShrink:0}}>
                  <div style={{padding:"3px 9px",borderRadius:8,background:"linear-gradient(135deg,#1565c0,#42a5f5)",color:"#fff",fontSize:10,fontWeight:700,marginBottom:4}}>{cat}</div>
                  {p.hot&&<div style={{padding:"2px 7px",borderRadius:6,background:"#fff0f0",color:"#f44336",fontSize:9,fontWeight:700,border:"1px solid #ffcdd2",textAlign:"center"}}>热点</div>}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:700,color:"#1a237e",lineHeight:1.5}}>{p.title}</div>
                  <div style={{fontSize:11,color:"#78909c",marginTop:4}}>{p.dept} · {p.date}</div>
                </div>
                <span style={{color:"#90a4ae",fontSize:16,flexShrink:0}}>{expanded===i?"▲":"▼"}</span>
              </div>
              {expanded===i&&<div style={{background:"#f8faff",borderRadius:10,padding:"10px 12px",marginTop:8,fontSize:12,color:"#455a64",lineHeight:1.7,borderLeft:"3px solid #1565c0"}}>
                {p.summary}
                <div style={{marginTop:8,display:"flex",gap:8}}>
                  <div style={{padding:"4px 14px",borderRadius:20,background:"linear-gradient(135deg,#1565c0,#1e88e5)",color:"#fff",fontSize:11,fontWeight:600,cursor:"pointer"}}>查看全文</div>
                  <div style={{padding:"4px 14px",borderRadius:20,background:"rgba(200,220,255,0.4)",color:"#1565c0",fontSize:11,fontWeight:600,cursor:"pointer",border:"1px solid rgba(21,101,192,0.2)"}}>收藏</div>
                </div>
              </div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MINE PAGE
// ═══════════════════════════════════════════════════════════════
function MinePage() {
  var [notif,setNotif]=useState(true);
  return (
    <div style={{background:"#f0f6ff",minHeight:"100vh",fontFamily:"'PingFang SC','Microsoft YaHei',sans-serif"}}>
      <div style={{background:"#1565c0",padding:"6px 16px 0",display:"flex",justifyContent:"space-between",fontSize:11,color:"rgba(255,255,255,0.9)",fontWeight:500}}><span>9:41</span><span>📶 🔋</span></div>
      <div style={{background:"linear-gradient(160deg,#1565c0,#0d47a1)",padding:"28px 20px 60px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-30,right:-20,width:130,height:130,borderRadius:"50%",background:"rgba(255,255,255,0.05)"}}/>
        <div style={{display:"flex",alignItems:"center",gap:16,position:"relative"}}>
          <div style={{width:66,height:66,borderRadius:"50%",background:"linear-gradient(135deg,rgba(255,255,255,0.3),rgba(255,255,255,0.1))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,border:"2px solid rgba(255,255,255,0.4)"}}>👤</div>
          <div>
            <div style={{fontSize:19,fontWeight:800,color:"#fff"}}>用户名称</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,0.75)",marginTop:3}}>普通会员 · ID: 20250307</div>
            <div style={{marginTop:8,display:"flex",gap:16}}>
              {[{l:"收藏",v:3},{l:"历史",v:15},{l:"提醒",v:2}].map(function(s){ return <div key={s.l} style={{textAlign:"center"}}><div style={{fontSize:16,fontWeight:700,color:"#fff"}}>{s.v}</div><div style={{fontSize:9,color:"rgba(255,255,255,0.65)"}}>{s.l}</div></div>; })}
            </div>
          </div>
        </div>
      </div>
      <div style={{marginTop:-28,padding:"0 12px 20px"}}>
        <div style={{background:"rgba(255,255,255,0.95)",borderRadius:16,padding:"14px 16px",marginBottom:10,display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,boxShadow:"0 4px 20px rgba(21,101,192,0.12)"}}>
          {[{icon:"⭐",l:"我的收藏"},{icon:"🔔",l:"价格提醒"},{icon:"📊",l:"分析报告"},{icon:"📋",l:"历史记录"}].map(function(s){
            return <div key={s.l} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,cursor:"pointer",padding:"6px 4px"}}>
              <div style={{width:40,height:40,borderRadius:14,background:"linear-gradient(135deg,rgba(21,101,192,0.1),rgba(66,165,245,0.12))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:19}}>{s.icon}</div>
              <div style={{fontSize:10,color:"#546e7a",fontWeight:600}}>{s.l}</div>
            </div>;
          })}
        </div>
        {[
          {icon:"🔔",label:"消息通知",desc:"价格变动实时推送",right:<div onClick={function(){setNotif(function(n){return !n;});}} style={{width:40,height:22,borderRadius:11,background:notif?"#1565c0":"#ccc",position:"relative",cursor:"pointer",transition:"background 0.2s"}}><div style={{position:"absolute",top:2,left:notif?20:2,width:18,height:18,borderRadius:"50%",background:"#fff",transition:"left 0.2s",boxShadow:"0 1px 4px rgba(0,0,0,0.2)"}}/></div>},
          {icon:"📈",label:"数据订阅",desc:"定制省份价格推送"},
          {icon:"🗺️",label:"关注省份",desc:"已关注 3 个省份"},
          {icon:"⚙️",label:"偏好设置",desc:"单位、主题、语言"},
          {icon:"💬",label:"联系我们",desc:"7×24小时在线客服"},
          {icon:"ℹ️",label:"关于我们",desc:"易能电易查 v4.0.0"},
        ].map(function(item,i){
          return <div key={i} style={{background:"rgba(255,255,255,0.88)",borderRadius:14,padding:"12px 16px",marginBottom:8,display:"flex",alignItems:"center",gap:12,boxShadow:"0 2px 10px rgba(21,101,192,0.06)",cursor:"pointer"}}>
            <div style={{width:40,height:40,borderRadius:12,background:"linear-gradient(135deg,rgba(21,101,192,0.1),rgba(66,165,245,0.14))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{item.icon}</div>
            <div style={{flex:1}}><div style={{fontSize:14,fontWeight:600,color:"#1a237e"}}>{item.label}</div><div style={{fontSize:11,color:"#90a4ae",marginTop:1}}>{item.desc}</div></div>
            {item.right||<span style={{color:"#b0bec5",fontSize:18}}>›</span>}
          </div>;
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  APP SHELL
// ═══════════════════════════════════════════════════════════════
var NAV = [
  {id:"home",  label:"首页",   icon:function(a){ return <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 12L12 3l9 9" stroke={a?"#1565c0":"#90a4ae"} strokeWidth="2" strokeLinecap="round"/><path d="M5 10V20a1 1 0 001 1h4v-4h4v4h4a1 1 0 001-1V10" stroke={a?"#1565c0":"#90a4ae"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>; }},
  {id:"data",  label:"查数据", icon:function(a){ return <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.5" fill={a?"#1565c0":"#90a4ae"}/><rect x="14" y="3" width="7" height="7" rx="1.5" fill={a?"#1565c0":"#90a4ae"}/><rect x="3" y="14" width="7" height="7" rx="1.5" fill={a?"#1565c0":"#90a4ae"}/><rect x="14" y="14" width="7" height="7" rx="1.5" fill={a?"#1565c0":"#90a4ae"} opacity={a?1:0.5}/></svg>; }},
  {id:"policy",label:"看政策", icon:function(a){ return <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="4" y="2" width="16" height="20" rx="2" stroke={a?"#1565c0":"#90a4ae"} strokeWidth="2"/><line x1="8" y1="8" x2="16" y2="8" stroke={a?"#1565c0":"#90a4ae"} strokeWidth="2" strokeLinecap="round"/><line x1="8" y1="12" x2="16" y2="12" stroke={a?"#1565c0":"#90a4ae"} strokeWidth="2" strokeLinecap="round"/><line x1="8" y1="16" x2="12" y2="16" stroke={a?"#1565c0":"#90a4ae"} strokeWidth="2" strokeLinecap="round"/></svg>; }},
  {id:"mine",  label:"我的",   icon:function(a){ return <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" fill={a?"#1565c0":"none"} stroke={a?"#1565c0":"#90a4ae"} strokeWidth="2"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={a?"#1565c0":"#90a4ae"} strokeWidth="2" strokeLinecap="round"/></svg>; }},
];

export default function App() {
  var [tab,setTab]=useState("home");
  var [elecData,setElecData]=useState(DEFAULT_DATA);
  var pages={
    home:<MapPage elecData={elecData} setElecData={setElecData}/>,
    data:<DataPage elecData={elecData} setElecData={setElecData}/>,
    policy:<PolicyPage/>,
    mine:<MinePage/>,
  };
  return (
    <div style={{background:"#b4d0ec",minHeight:"100vh",display:"flex",justifyContent:"center"}}>
      <div style={{width:390,minHeight:"100vh",position:"relative",overflowX:"hidden"}}>
        <div style={{paddingBottom:62}}>{pages[tab]}</div>
        <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:390,background:"rgba(255,255,255,0.97)",backdropFilter:"blur(20px)",borderTop:"1px solid rgba(200,220,255,0.6)",display:"flex",zIndex:100,boxShadow:"0 -3px 24px rgba(21,101,192,0.14)"}}>
          {NAV.map(function(n){
            var a=tab===n.id;
            return <div key={n.id} onClick={function(){setTab(n.id);}} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"10px 0 8px",cursor:"pointer",fontSize:10,color:a?"#1565c0":"#90a4ae",fontWeight:a?700:400,transition:"color 0.2s"}}>
              {n.icon(a)}<span style={{marginTop:3}}>{n.label}</span>
              {a&&<div style={{width:4,height:4,borderRadius:"50%",background:"#1565c0",marginTop:3}}/>}
            </div>;
          })}
        </div>
      </div>
    </div>
  );
}
