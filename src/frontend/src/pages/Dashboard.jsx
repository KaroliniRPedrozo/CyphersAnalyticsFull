import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import { getRankImg, getAgenteCard, getAgenteIcone, getMapaImg, getAgenteHabilidades, getAgenteArtwork } from '../services/assets';
import logoValorant from '../assets/logo-valorant.png';
import skullIcon from '../assets/skull-icon.webp';
import bgAgents from '../assets/bg-agents.jpg';


export default function Dashboard() {
  const navigate = useNavigate();
  const gameName = localStorage.getItem('gameName');
  const tagLine  = localStorage.getItem('tagLine');

  const [dados, setDados]         = useState(null);
  const [historico, setHistorico] = useState([]);
  const [estatisticas, setEstat]  = useState(null);
  const [modoAtivo, setModoAtivo] = useState('todos');
  const [modos, setModos]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [erro, setErro]           = useState('');

  useEffect(() => {
    if (!gameName || !tagLine) { navigate('/'); return; }
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      setLoading(true);

      // 1. Primeiro busca novas partidas da Henrik e salva no banco
      await api.get(`/Jogadores/${gameName}/${tagLine}`);

      // 2. Depois busca histórico e estatísticas já atualizados
      const [resHistorico, resEstat, resDados] = await Promise.all([
        api.get(`/Jogadores/${gameName}/${tagLine}/historico?size=10`),
        api.get(`/Jogadores/${gameName}/${tagLine}/estatisticas`),
        api.get(`/Jogadores/${gameName}/${tagLine}`),
      ]);

      setDados(resDados.data);
      setHistorico(resHistorico.data.partidas || []);
      setEstat(resEstat.data);
      const modosUnicos = [...new Set((resHistorico.data.partidas || []).map(p => p.modo))].filter(Boolean);
      setModos(modosUnicos);
    } catch {
      setErro('Erro ao carregar dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  function logout() { localStorage.clear(); navigate('/'); }

  const partidasFiltradas = modoAtivo === 'todos'
    ? historico
    : historico.filter(p => p.modo === modoAtivo);

  const dadosGrafico  = [...partidasFiltradas].reverse().map((p, i) => ({ name: i + 1, kda: p.kda }));
  const melhoresMapas = estatisticas?.porMapa?.slice(0, 3) || [];
  const rankImg       = getRankImg(dados?.rankAtual);
  const agenteCard    = getAgenteCard(dados?.melhorAgente);
  const agenteArtwork = getAgenteArtwork(dados?.melhorAgente);
  const habilidades   = getAgenteHabilidades(dados?.melhorAgente || '');
  const totalKills    = historico.reduce((a, p) => a + p.kills, 0);
  const totalAssists  = historico.reduce((a, p) => a + p.assists, 0);
  const avgACS = historico.length > 0
    ? Math.round(historico.reduce((a, p) => a + Math.round(p.score / 20), 0) / historico.length)
    : 0;

  if (loading) return (
    <div style={s.loadingPage}>
      <img src={logoValorant} alt="" style={{ width: 56, marginBottom: '1rem' }} />
      <p style={{ color: '#ff4655', fontWeight: 700, letterSpacing: 3, fontSize: '0.8rem' }}>CARREGANDO...</p>
    </div>
  );

  if (erro) return (
    <div style={s.loadingPage}>
      <p style={{ color: '#ff4655', marginBottom: '1rem' }}>{erro}</p>
      <button onClick={carregarDados} style={s.btnRetry}>Tentar novamente</button>
    </div>
  );

  return (
    <div style={s.page}>
      {/* Fundo da imagem com overlay */}
      <div style={s.bgLayer} />

      {/* TOPBAR — Ocupa todo espaço superior */}
      <header style={s.topbar}>
        <nav style={s.nav}>
          <button style={modoAtivo === 'todos' ? s.navOn : s.navOff} onClick={() => setModoAtivo('todos')}>TODOS</button>
          {modos.map(m => (
            <button key={m} style={modoAtivo === m ? s.navOn : s.navOff} onClick={() => setModoAtivo(m)}>
              {m.toUpperCase()}
            </button>
          ))}
        </nav>
        <div style={s.playerTag}>
          <span style={s.playerNome}>{gameName} #{tagLine}</span>
          <img src={logoValorant} alt="" style={{ width: 16, opacity: 0.5 }} />
        </div>
      </header>

      {/* Container com sidebar + main */}
      <div style={s.contentWrapper}>
      <aside style={s.sidebar}>
        {/* Topo: logo + temporada — acima do card */}
        <div style={{ ...s.sTop, position:'relative', zIndex:2 }}>
          <img src={logoValorant} alt="Logo" style={s.sLogo} />
          <div style={s.sTemporada}>
            <span>TEMPORADA 2026</span>
            <span>ATO 1</span>
          </div>
        </div>

        {/* Card do agente cobrindo toda a sidebar */}
        <div style={s.sAgenteCard}>
          {agenteCard
            ? <img src={agenteCard} alt={dados?.melhorAgente} style={s.sAgenteImg} />
            : <div style={s.sAgenteVazio}>{dados?.melhorAgente?.[0] || '?'}</div>
          }
        </div>

        {/* Rank e botão sair — sobre o card com fade */}
        <div style={s.sRankBox}>
          {rankImg && <img src={rankImg} alt={dados?.rankAtual} style={s.sRankImg} />}
          <span style={s.sRankNome}>{dados?.rankAtual?.toUpperCase() || 'UNRANKED'}</span>
        </div>
        <button onClick={logout} style={s.sSairBtn}>SAIR</button>
      </aside>

      {/* ══ MAIN ══ */}
      <main style={s.main}>

        {/* LINHA 1: Agente + Resumo */}
        <div style={s.l1}>

          {/* Card Agente */}
          <div style={s.cardAgente}>
            <div style={s.cAgenteImgBox}>
              {agenteArtwork
                ? <img src={agenteArtwork} alt={dados?.melhorAgente} style={s.cAgenteImg} />
                : <div style={s.cAgenteImgVazio} />
              }
            </div>
            <div style={s.cAgenteInfo}>
              <p style={s.cAgenteLabel}>AGENT MAIS USADO</p>
              <p style={s.cAgenteNome}>{dados?.melhorAgente || '—'}</p>
              <p style={s.cAgenteSub}>Taxa de Vitórias | {dados?.taxaVitoria || '0%'}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
                {habilidades.length > 0
                  ? habilidades.map((hab, i) => {
                      // Distribui stats reais entre as habilidades
                      const statsHab = [
                        Math.round((totalKills / (habilidades.length || 1)) * 10) / 10,
                        Math.round((totalAssists / (habilidades.length || 1)) * 10) / 10,
                        Math.round(((totalKills + totalAssists) / (habilidades.length || 1)) * 10) / 10,
                        Math.round((dados?.kdaGeral || 0) * 10) / 10,
                      ];
                      const val = statsHab[i] || 0;
                      const maxVal = Math.max(...statsHab, 1);
                      return (
                        <div key={i} style={s.habRow}>
                          <div style={s.habIconBox}>
                            <img src={hab.img} alt={hab.nome} style={s.habIconImg}
                              onError={e => e.target.style.display = 'none'} />
                          </div>
                          <div style={s.habBarFundo}>
                            <div style={{ ...s.habBarPreen, width: `${Math.min((val / maxVal) * 100, 100)}%` }} />
                          </div>
                          <span style={s.habVal}>{val}</span>
                        </div>
                      );
                    })
                  : [0, 1, 2, 3].map(i => (
                    <div key={i} style={s.habRow}>
                      <div style={s.habIconVazio} />
                      <div style={s.habBarFundo} />
                      <span style={s.habVal}>—</span>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>

          {/* Resumo de Desempenho */}
          <div style={s.cardResumo}>
            <p style={s.secLabel}>RESUMO DE DESEMPENHO</p>
            <div style={s.rTopo}>
              <div style={s.rStat}>
                <img src={skullIcon} alt="skull" style={s.rIcone} />
                <div style={s.rNums}>
                  <span style={s.rNum}>{dados?.kdaGeral || '—'}</span>
                  <span style={s.rLbl}>KDR</span>
                </div>
              </div>
              <div style={s.rDivider} />
              <div style={s.rStat}>
                <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.85 }}>
                  <circle cx="22" cy="22" r="14" stroke="white" strokeWidth="2.5"/>
                  <circle cx="22" cy="22" r="4" stroke="white" strokeWidth="2.5"/>
                  <line x1="22" y1="4" x2="22" y2="10" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                  <line x1="22" y1="34" x2="22" y2="40" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                  <line x1="4" y1="22" x2="10" y2="22" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                  <line x1="34" y1="22" x2="40" y2="22" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
                <div style={s.rNums}>
                  <span style={s.rNum}>{avgACS || '—'}</span>
                  <span style={s.rLbl}>ACS</span>
                </div>
              </div>
            </div>
            <div style={s.rGrid}>
              {[
                { label: 'ASSISTS',      val: totalAssists },
                { label: 'FIRST BLOODS', val: '—' },
                { label: 'HEADSHOT',     val: '—' },
                { label: 'KILLS',        val: totalKills },
              ].map(({ label, val }) => (
                <div key={label} style={s.rCell}>
                  <span style={s.rCellLbl}>{label}</span>
                  <span style={s.rCellVal}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* LINHA 2: Partidas + Gráfico */}
        <div style={s.l2}>

          <div style={s.cardPartidas}>
            <p style={s.secLabel}>ÚLTIMAS PARTIDAS</p>
            {partidasFiltradas.slice(0, 5).map((p, i) => {
              const vitoria = p.resultado === 'Vitoria';
              const mapaImg = getMapaImg(p.mapa);
              const agIcon  = getAgenteIcone(p.agente);
              return (
                <div key={i} style={s.pRow}>
                  {/* Ícone agente */}
                  {agIcon
                    ? <img src={agIcon} alt={p.agente} style={s.pAgIcon} />
                    : <div style={s.pAgVazio}>{p.agente?.[0]}</div>
                  }
                  {/* Nome do mapa */}
                  <span style={s.pMapaNome}>{p.mapa?.toUpperCase()}</span>
                  {/* Miniatura do mapa */}
                  {mapaImg && <img src={mapaImg} alt={p.mapa} style={s.pMapaImg} />}
                  {/* Resultado */}
                  <div style={{ ...s.pTag, background: vitoria ? '#00ff8722' : '#ff465522', borderColor: vitoria ? '#00ff87' : '#ff4655' }}>
                    <span style={{ color: vitoria ? '#00ff87' : '#ff4655', fontWeight: 900, fontSize: '0.72rem', letterSpacing: 1 }}>
                      {vitoria ? 'VITÓRIA' : 'DERROTA'}
                    </span>
                  </div>
                  {/* Stats */}
                  <span style={s.pStats}>ACS: {Math.round(p.score / 20)} | KILL: {p.kills}</span>
                </div>
              );
            })}
          </div>

          <div style={s.cardGrafico}>
            <ResponsiveContainer width="100%" height="80%">
              <AreaChart data={dadosGrafico}>
                <defs>
                  <linearGradient id="gkda" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#ff4655" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#ff4655" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: '#161b22', border: '1px solid #ff4655', borderRadius: 4, fontSize: '0.72rem' }}
                  formatter={v => [v, 'KDA']}
                />
                <Area type="monotone" dataKey="kda" stroke="#ff4655" strokeWidth={2} fill="url(#gkda)" />
              </AreaChart>
            </ResponsiveContainer>
            <p style={{ ...s.secLabel, textAlign: 'center', marginTop: '0.5rem' }}>EVOLUÇÃO DE RANK</p>
          </div>
        </div>

        {/* LINHA 3: Melhores Mapas */}
        <div style={s.cardMapas}>
          <p style={s.secLabel}>MELHORES MAPAS</p>
          {melhoresMapas.map((m, i) => {
            const mapaImg = getMapaImg(m.mapa);
            const pct = parseFloat(m.taxaVitoria) || 0;
            const corBarra = pct >= 60 ? '#00ff87' : pct >= 40 ? '#00e5ff' : '#ff4655';
            return (
              <div key={i} style={s.mRow}>
                {mapaImg && <img src={mapaImg} alt={m.mapa} style={s.mImg} />}
                <span style={s.mNome}>{m.mapa?.toUpperCase()}</span>
                <div style={s.mBarFundo}>
                  <div style={{ ...s.mBarPreen, width: `${pct}%`, background: `linear-gradient(90deg, ${corBarra}aa, ${corBarra})` }} />
                  <span style={s.mWinInline}>WIN {m.taxaVitoria}</span>
                </div>
              </div>
            );
          })}
        </div>
      </main>
      </div>
    </div>
  );
}

const s = {
  page:        { display:'flex', flexDirection:'column', height:'100vh', width:'100vw', color:'#fff', fontFamily:"'Segoe UI',sans-serif", overflow:'hidden', position:'relative', background:'transparent' },
  loadingPage: { display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', height:'100vh', background:'#0a0d14' },
  btnRetry:    { padding:'0.5rem 1.5rem', background:'#ff4655', color:'#fff', border:'none', borderRadius:3, cursor:'pointer', fontWeight:700 },
  bgLayer:     { position:'absolute', inset:0, background:`url(${bgAgents})`, backgroundSize:'cover', backgroundPosition:'center', zIndex:0, pointerEvents:'none' },
  contentWrapper: { display:'flex', flex:1, position:'relative', zIndex:1 },

  // Sidebar
  sidebar:     { width:'240px', minWidth:'240px', background:'linear-gradient(180deg,#0d1117 0%,#080c14 100%)', borderRight:'1px solid rgba(255,70,85,0.08)', display:'flex', flexDirection:'column', alignItems:'center', padding:'1.25rem 1rem 1.5rem', gap:'0.5rem', overflow:'hidden', position:'relative', zIndex:1 },
  sTop:        { display:'flex', flexDirection:'column', alignItems:'center', gap:'0.5rem', width:'100%' },
  sLogo:       { width:42, filter:'drop-shadow(0 0 10px rgba(255,70,85,0.9))' },
  sTemporada:  { display:'flex', flexDirection:'column', alignItems:'center', color:'#9ca3af', fontSize:'0.82rem', fontWeight:700, letterSpacing:1.5, textAlign:'center', lineHeight:1.8 },
  sAgenteCard: { width:'240px', position:'absolute', top:'320px', bottom:'0', left:'0', right:'0', overflow:'hidden', border:'none', background:'transparent', flexShrink:0 },
  sAgenteImg:  { width:'100%', height:'100%', objectFit:'cover', objectPosition:'center top', maskImage:'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 55%, rgba(0,0,0,0) 100%)', WebkitMaskImage:'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 55%, rgba(0,0,0,0) 100%)' },
  sAgenteVazio:{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#374151', fontSize:'2rem', background:'#0f1520' },
  sRankBox:    { display:'flex', flexDirection:'column', alignItems:'center', gap:'0.2rem', position:'relative', zIndex:2, marginTop:'auto' },
  sRankImg:    { width:100 },
  sRankNome:   { color:'#ffffff', fontSize:'0.72rem', fontWeight:900, letterSpacing:3 },
  sSairBtn:    { padding:'0.4rem 1.25rem', background:'transparent', border:'1px solid rgb(255, 70, 86)', color:'#ffffff', borderRadius:2, cursor:'pointer', fontSize:'0.72rem', fontWeight:700, letterSpacing:2, marginTop:'0.5rem', position:'relative', zIndex:2 },

  // Main
  main: { flex:1, overflowY:'auto', padding:'0 1.25rem 1rem', display:'flex', flexDirection:'column', gap:'0.75rem', position:'relative', zIndex:1 },

  // Topbar
  topbar:    { display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid rgba(255,70,85,0.08)', padding:'1.125rem 1.25rem', background:'linear-gradient(180deg,#0d1117 0%,#080c14 100%)', width:'100%', position:'relative', zIndex:1 },
  nav:       { display:'flex', gap:'0.125rem' },
  navOff:    { padding:'0.5rem 1.5rem', background:'transparent', border:'1px solid rgba(255,255,255,0.05)', color:'#ffffff', cursor:'pointer', borderRadius:2, fontSize:'0.85rem', fontWeight:700, letterSpacing:1.5 },
  navOn:     { padding:'0.5rem 1.5rem', background:'rgba(255,70,85,0.1)', border:'1px solid #ff4655', color:'#ff4655', cursor:'pointer', borderRadius:2, fontSize:'0.85rem', fontWeight:700, letterSpacing:1.5 },
  playerTag: { display:'flex', alignItems:'center', gap:'0.5rem' },
  playerNome:{ color:'#ffffff', fontSize:'0.95rem', fontWeight:700 },

  secLabel: { color:'#ffffff', fontSize:'0.8rem', fontWeight:700, letterSpacing:2, textTransform:'uppercase', marginBottom:'0.75rem' },

  // Linha 1
  l1: { display:'flex', gap:'0.75rem' },

  // Card Agente 
  cardAgente:     { flex:1.2, background:'rgba(10,14,22,0.98)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:3, display:'flex', overflow:'hidden', minHeight:'190px' },
  cAgenteImgBox:  { width:'130px', minWidth:'130px', flexShrink:0, overflow:'hidden', background:'#0a0f1a', borderRight:'1px solid rgba(255,255,255,0.04)' },
  cAgenteImg:     { width:'100%', height:'100%', objectFit:'cover', objectPosition:'center top' },
  cAgenteImgVazio:{ width:'100%', height:'100%', background:'#0a0f1a' },
  cAgenteInfo:    { flex:1, padding:'0.875rem 1rem', display:'flex', flexDirection:'column' },
  cAgenteLabel:   { color:'#ffffff', fontSize:'1.00rem', fontWeight:700, letterSpacing:2, textTransform:'uppercase', marginBottom:'0.25rem' },
  cAgenteNome:    { color:'#fff', fontSize:'1.4rem', fontWeight:900, marginBottom:'0.2rem' },
  cAgenteSub:     { color:'#6b7280', fontSize:'0.88rem', marginBottom:'0.1rem' },
  habRow:         { display:'flex', alignItems:'center', gap:'0.6rem' },
  habIconBox:     { width:24, height:24, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' },
  habIconImg:     { width:'100%', height:'100%', objectFit:'contain' },
  habIconVazio:   { width:24, height:24, background:'rgba(255,255,255,0.04)', borderRadius:2 },
  habBarFundo:    { flex:1, height:9, background:'rgba(255,255,255,0.05)', borderRadius:10, overflow:'hidden' },
  habBarPreen:    { height:'100%', background:'linear-gradient(90deg,#00ff87,#00e5ff)', borderRadius:10 },
  habVal:         { color:'#6b7280', fontSize:'0.82rem', minWidth:36, textAlign:'right' },

  // Card Resumo
  cardResumo: { flex:1, background:'rgba(10,14,22,0.98)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:3, padding:'0.875rem 1.125rem' },
  rTopo:      { display:'flex', alignItems:'center', gap:'1.75rem', marginBottom:'0.875rem', paddingBottom:'0.875rem', borderBottom:'1px solid rgba(255,255,255,0.05)' },
  rStat:      { display:'flex', alignItems:'center', gap:'0.75rem' },
  rIcone:     { width:50, height:50, objectFit:'contain', filter:'invert(1) opacity(0.8)' },
  rDivider:   { width:1, height:54, background:'rgba(255,70,85,0.12)', flexShrink:0 },
  rNums:      { display:'flex', flexDirection:'column' },
  rNum:       { color:'#ff4655', fontSize:'2.8rem', fontWeight:900, lineHeight:1 },
  rLbl:       { color:'#4b5563', fontSize:'0.78rem', fontWeight:700, letterSpacing:2, marginTop:'0.2rem' },
  rGrid:      { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.35rem' },
  rCell:      { background:'rgba(255,255,255,0.025)', borderRadius:3, padding:'0.4rem 0.75rem', textAlign:'center' },
  rCellLbl:   { display:'block', color:'#4b5563', fontSize:'0.7rem', fontWeight:700, letterSpacing:1.5, marginBottom:'0.2rem' },
  rCellVal:   { display:'block', color:'#e5e7eb', fontSize:'1.1rem', fontWeight:900 },

  // Linha 2
  l2: { display:'flex', gap:'0.75rem' },

  // Card Partidas 
  cardPartidas: { flex:2, background:'rgba(10,14,22,0.98)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:3, padding:'0.875rem 1rem' },
  pRow:     { display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.5rem 0.5rem', borderBottom:'1px solid rgba(255,255,255,0.04)', borderLeft:'2px solid transparent' },
  pAgIcon:  { width:38, height:38, borderRadius:4, objectFit:'cover', flexShrink:0 },
  pAgVazio: { width:38, height:38, borderRadius:4, background:'#0f1520', display:'flex', alignItems:'center', justifyContent:'center', color:'#374151', fontSize:'0.7rem', flexShrink:0 },
  pMapaNome:{ fontSize:'0.9rem', fontWeight:700, letterSpacing:1, minWidth:80, flexShrink:0 },
  pMapaImg: { width:56, height:34, objectFit:'cover', borderRadius:3, flexShrink:0 },
  pTag:     { padding:'0.3rem 1rem', borderRadius:2, border:'1px solid', textAlign:'center', minWidth:105, flexShrink:0, marginLeft:'auto' },
  pStats:   { color:'#ffffff', fontSize:'0.82rem', whiteSpace:'nowrap', minWidth:140, textAlign:'right', flexShrink:0 },

  // Card Gráfico
  cardGrafico: { flex:1, background:'rgba(10,14,22,0.98)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:3, padding:'0.875rem 1rem', display:'flex', flexDirection:'column' },

  // Mapas 
  cardMapas: { background:'rgba(10,14,22,0.98)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:3, padding:'0.875rem 1rem' },
  mRow:      { display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.3rem 0' },
  mImg:      { width:60, height:36, objectFit:'cover', borderRadius:2, flexShrink:0 },
  mNome:     { fontSize:'0.88rem', fontWeight:700, letterSpacing:1.5, minWidth:75, flexShrink:0 },
  mBarFundo: { flex:1, height:28, background:'rgba(255,255,255,0.04)', borderRadius:3, overflow:'hidden', position:'relative', display:'flex', alignItems:'center' },
  mBarPreen: { position:'absolute', left:0, top:0, bottom:0, borderRadius:3 },
  mWinInline:{ position:'relative', zIndex:1, color:'#fff', fontSize:'0.88rem', fontWeight:700, letterSpacing:1, paddingLeft:'0.875rem' },
};