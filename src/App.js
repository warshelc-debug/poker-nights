import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

// ─── Design tokens ───────────────────────────────────────────────────────────
const C = {
  felt: '#1a472a',
  feltDark: '#143520',
  feltLight: '#1f5233',
  gold: '#FFD700',
  goldDim: '#b8980a',
  card: '#1e1e1e',
  cardBorder: '#2e2e2e',
  text: '#f0f0f0',
  textDim: '#a0a0a0',
  red: '#e53e3e',
  green: '#38a169',
  white: '#ffffff',
};

const S = {
  app: {
    minHeight: '100vh',
    background: C.felt,
    color: C.text,
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    display: 'flex',
    flexDirection: 'column',
    maxWidth: 480,
    margin: '0 auto',
    position: 'relative',
  },
  screen: { flex: 1, overflowY: 'auto', paddingBottom: 80 },
  nav: {
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: 480,
    background: C.feltDark,
    borderTop: `2px solid ${C.gold}`,
    display: 'flex',
    zIndex: 100,
  },
  navBtn: (active) => ({
    flex: 1,
    padding: '10px 4px 8px',
    background: 'none',
    border: 'none',
    color: active ? C.gold : C.textDim,
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    fontSize: 10,
    fontWeight: active ? 700 : 400,
    borderTop: active ? `2px solid ${C.gold}` : '2px solid transparent',
    marginTop: -2,
  }),
  navIcon: { fontSize: 20 },
  header: {
    padding: '16px 16px 8px',
    background: C.feltDark,
    borderBottom: `1px solid ${C.cardBorder}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 20, fontWeight: 700, color: C.gold },
  card: {
    background: C.card,
    border: `1px solid ${C.cardBorder}`,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  btn: (variant = 'primary') => ({
    padding: '12px 20px',
    borderRadius: 10,
    border: 'none',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: 15,
    background: variant === 'primary' ? C.gold : variant === 'danger' ? C.red : C.cardBorder,
    color: variant === 'primary' ? '#000' : C.white,
    width: '100%',
    marginTop: 8,
  }),
  input: {
    width: '100%',
    padding: '10px 12px',
    background: '#2a2a2a',
    border: `1px solid ${C.cardBorder}`,
    borderRadius: 8,
    color: C.text,
    fontSize: 15,
    boxSizing: 'border-box',
    marginTop: 6,
  },
  label: { fontSize: 12, color: C.textDim, marginTop: 10, display: 'block' },
  toggleRow: { display: 'flex', gap: 8, marginBottom: 16 },
  toggleBtn: (active) => ({
    flex: 1,
    padding: '8px 0',
    borderRadius: 8,
    border: `1px solid ${active ? C.gold : C.cardBorder}`,
    background: active ? C.gold : 'transparent',
    color: active ? '#000' : C.textDim,
    fontWeight: active ? 700 : 400,
    cursor: 'pointer',
    fontSize: 13,
  }),
  badge: (color) => ({
    background: color,
    color: '#fff',
    borderRadius: 6,
    padding: '2px 8px',
    fontSize: 12,
    fontWeight: 700,
    display: 'inline-block',
  }),
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt$ = (n) => {
  const abs = Math.abs(n);
  const s = abs >= 1000 ? `$${(abs / 1000).toFixed(1)}k` : `$${abs.toFixed(2)}`;
  return n < 0 ? `-${s}` : `+${s}`;
};

const fmtDuration = (ms) => {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const fmtTimer = (ms) => {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const LOCATIONS = ["Jake's House", "AJ's House", "Casino", "Online"];

const POSITIONS = ['BTN', 'CO', 'HJ', 'MP', 'UTG', 'BB', 'SB'];
const RESULTS = ['Won', 'Lost', 'Split'];
const AVATAR_COLORS = ['#e53e3e', '#d69e2e', '#38a169', '#3182ce', '#805ad5', '#dd6b20'];

// ─── Auth screen ─────────────────────────────────────────────────────────────
function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        const { data, error: e } = await supabase.auth.signInWithPassword({ email, password });
        if (e) throw e;
        onAuth(data.user);
      } else {
        const { data, error: e } = await supabase.auth.signUp({ email, password });
        if (e) throw e;
        if (data.user) onAuth(data.user);
        else setError('Check your email to confirm your account.');
      }
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: C.felt, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ fontSize: 48, marginBottom: 8 }}>♠♥♦♣</div>
      <h1 style={{ color: C.gold, fontSize: 32, margin: '0 0 4px' }}>PokerNights</h1>
      <p style={{ color: C.textDim, marginBottom: 32, fontSize: 14 }}>Track your game. Rule the table.</p>

      <div style={{ ...S.card, width: '100%', maxWidth: 380 }}>
        <div style={S.toggleRow}>
          <button style={S.toggleBtn(mode === 'login')} onClick={() => setMode('login')}>Login</button>
          <button style={S.toggleBtn(mode === 'signup')} onClick={() => setMode('signup')}>Sign Up</button>
        </div>

        <label style={S.label}>Email</label>
        <input style={S.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />

        <label style={S.label}>Password</label>
        <input style={S.input} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />

        {error && <p style={{ color: C.red, fontSize: 13, marginTop: 8 }}>{error}</p>}

        <button style={S.btn()} onClick={submit} disabled={loading}>
          {loading ? '...' : mode === 'login' ? 'Login' : 'Create Account'}
        </button>
      </div>
    </div>
  );
}

// ─── Username setup screen ────────────────────────────────────────────────────
function UsernameScreen({ user, onDone }) {
  const [username, setUsername] = useState('');
  const [color, setColor] = useState(AVATAR_COLORS[0]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const save = async () => {
    if (!username.trim()) return setError('Username is required');
    setLoading(true);
    const { error: e } = await supabase.from('profiles').insert({
      id: user.id,
      username: username.trim(),
      avatar_color: color,
    });
    if (e) setError(e.message);
    else onDone({ id: user.id, username: username.trim(), avatar_color: color });
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: C.felt, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ fontSize: 36, marginBottom: 16 }}>♣ Welcome!</div>
      <div style={{ ...S.card, width: '100%', maxWidth: 380 }}>
        <h2 style={{ color: C.gold, marginTop: 0 }}>Set up your profile</h2>
        <label style={S.label}>Username</label>
        <input style={S.input} value={username} onChange={e => setUsername(e.target.value)} placeholder="PokerPro99" />

        <label style={S.label}>Avatar Color</label>
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          {AVATAR_COLORS.map(c => (
            <div
              key={c}
              onClick={() => setColor(c)}
              style={{ width: 32, height: 32, borderRadius: '50%', background: c, cursor: 'pointer', border: color === c ? `3px solid ${C.gold}` : '3px solid transparent' }}
            />
          ))}
        </div>

        {error && <p style={{ color: C.red, fontSize: 13 }}>{error}</p>}
        <button style={S.btn()} onClick={save} disabled={loading}>{loading ? '...' : 'Enter the Game ♠'}</button>
      </div>
    </div>
  );
}

// ─── Avatar chip ─────────────────────────────────────────────────────────────
function Avatar({ profile, size = 36 }) {
  const letter = (profile?.username || '?')[0].toUpperCase();
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: profile?.avatar_color || C.goldDim, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: size * 0.4, color: '#fff', flexShrink: 0 }}>
      {letter}
    </div>
  );
}

// ─── Leaderboard tab ─────────────────────────────────────────────────────────
function LeaderboardTab({ refreshKey }) {
  const [period, setPeriod] = useState('monthly');
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [playerSessions, setPlayerSessions] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    const now = new Date();
    let since;
    if (period === 'monthly') {
      since = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    } else if (period === 'quarterly') {
      const q = Math.floor(now.getMonth() / 3);
      since = new Date(now.getFullYear(), q * 3, 1).toISOString();
    }

    let q = supabase.from('sessions').select('user_id, buyin, profit_loss, start_time, end_time, created_at');
    if (since) q = q.gte('created_at', since);
    const { data: sessions } = await q;

    const { data: profiles } = await supabase.from('profiles').select('*');
    const profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p]));

    const stats = {};
    (sessions || []).forEach(s => {
      if (!stats[s.user_id]) stats[s.user_id] = { totalPL: 0, sessions: 0, wins: 0, totalBuyin: 0, biggestPot: 0 };
      stats[s.user_id].totalPL += s.profit_loss || 0;
      stats[s.user_id].sessions += 1;
      stats[s.user_id].totalBuyin += s.buyin || 0;
      if ((s.profit_loss || 0) > 0) stats[s.user_id].wins += 1;
    });

    const { data: hands } = await supabase.from('hands').select('user_id, pot_size');
    (hands || []).forEach(h => {
      if (stats[h.user_id] && h.pot_size > stats[h.user_id].biggestPot) {
        stats[h.user_id].biggestPot = h.pot_size;
      }
    });

    const ranked = Object.entries(stats)
      .map(([uid, s]) => ({
        uid,
        profile: profileMap[uid],
        ...s,
        winRate: s.sessions > 0 ? Math.round((s.wins / s.sessions) * 100) : 0,
      }))
      .sort((a, b) => b.totalPL - a.totalPL);

    setPlayers(ranked);
    setLoading(false);
  }, [period]);

  useEffect(() => { load(); }, [load, refreshKey]);

  const openPlayer = async (player) => {
    setSelected(player);
    const { data } = await supabase.from('sessions').select('*').eq('user_id', player.uid).order('created_at', { ascending: false });
    setPlayerSessions(data || []);
  };

  if (selected) {
    return (
      <div style={S.screen}>
        <div style={S.header}>
          <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: C.gold, cursor: 'pointer', fontSize: 18 }}>← Back</button>
          <span style={S.headerTitle}>{selected.profile?.username}</span>
          <div style={{ width: 40 }} />
        </div>
        <div style={{ padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <Avatar profile={selected.profile} size={56} />
            <div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{selected.profile?.username}</div>
              <div style={{ color: selected.totalPL >= 0 ? C.green : C.red, fontWeight: 700, fontSize: 18 }}>{fmt$(selected.totalPL)}</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            {[
              ['Sessions', selected.sessions],
              ['Win Rate', `${selected.winRate}%`],
              ['Biggest Pot', `$${selected.biggestPot}`],
              ['Total Buyin', `$${selected.totalBuyin}`],
            ].map(([k, v]) => (
              <div key={k} style={{ ...S.card, margin: 0, textAlign: 'center' }}>
                <div style={{ color: C.textDim, fontSize: 12 }}>{k}</div>
                <div style={{ fontWeight: 700, fontSize: 18, color: C.gold }}>{v}</div>
              </div>
            ))}
          </div>
          <h3 style={{ color: C.gold, marginBottom: 8 }}>Session History</h3>
          {playerSessions.map(s => (
            <div key={s.id} style={{ ...S.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 13 }}>{new Date(s.created_at).toLocaleDateString()}</div>
                <div style={{ color: C.textDim, fontSize: 12 }}>Buyin: ${s.buyin}</div>
              </div>
              <span style={S.badge(s.profit_loss >= 0 ? C.green : C.red)}>{fmt$(s.profit_loss)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={S.screen}>
      <div style={S.header}>
        <span style={S.headerTitle}>♠ Leaderboard</span>
      </div>
      <div style={{ padding: 16 }}>
        <div style={S.toggleRow}>
          {['monthly', 'quarterly', 'alltime'].map(p => (
            <button key={p} style={S.toggleBtn(period === p)} onClick={() => setPeriod(p)}>
              {p === 'monthly' ? 'Month' : p === 'quarterly' ? 'Quarter' : 'All Time'}
            </button>
          ))}
        </div>
        {loading ? <p style={{ color: C.textDim, textAlign: 'center' }}>Loading...</p> : players.length === 0 ? (
          <p style={{ color: C.textDim, textAlign: 'center' }}>No sessions yet this period.</p>
        ) : players.map((p, i) => (
          <div key={p.uid} style={{ ...S.card, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => openPlayer(p)}>
            <div style={{ width: 28, fontWeight: 700, color: i < 3 ? C.gold : C.textDim, fontSize: 18 }}>#{i + 1}</div>
            <Avatar profile={p.profile} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>{p.profile?.username || 'Unknown'}</div>
              <div style={{ color: C.textDim, fontSize: 12 }}>{p.sessions} sessions · {p.winRate}% win rate</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: p.totalPL >= 0 ? C.green : C.red, fontWeight: 700 }}>{fmt$(p.totalPL)}</div>
              <div style={{ color: C.textDim, fontSize: 11 }}>Best: ${p.biggestPot}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── My Stats tab ─────────────────────────────────────────────────────────────
function MyStatsTab({ profile, onDataChanged }) {
  const [sessions, setSessions] = useState([]);
  const [hands, setHands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionHands, setSessionHands] = useState([]);
  const [editingSession, setEditingSession] = useState(null);

  const loadData = useCallback(async () => {
    if (!profile) return;
    const [{ data: s }, { data: h }] = await Promise.all([
      supabase.from('sessions').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }),
      supabase.from('hands').select('*').eq('user_id', profile.id),
    ]);
    setSessions(s || []);
    setHands(h || []);
    setLoading(false);
  }, [profile]);

  useEffect(() => { loadData(); }, [loadData]);

  const totalPL = sessions.reduce((a, s) => a + (s.profit_loss || 0), 0);
  const wins = sessions.filter(s => (s.profit_loss || 0) > 0).length;
  const winRate = sessions.length > 0 ? Math.round((wins / sessions.length) * 100) : 0;
  const totalMs = sessions.reduce((a, s) => {
    if (s.start_time && s.end_time) return a + (new Date(s.end_time) - new Date(s.start_time));
    return a;
  }, 0);
  const vpip = hands.length > 0 ? Math.round((hands.filter(h => h.preflop_action && h.preflop_action !== 'Fold').length / hands.length) * 100) : 0;

  const openSession = async (s) => {
    setSelectedSession(s);
    const { data } = await supabase.from('hands').select('*').eq('session_id', s.id).order('created_at');
    setSessionHands(data || []);
  };

  if (selectedSession) {
    return (
      <div style={S.screen}>
        <div style={S.header}>
          <button onClick={() => setSelectedSession(null)} style={{ background: 'none', border: 'none', color: C.gold, cursor: 'pointer', fontSize: 18 }}>← Back</button>
          <span style={S.headerTitle}>Session Hands</span>
          <div style={{ width: 40 }} />
        </div>
        <div style={{ padding: 16 }}>
          <div style={{ ...S.card, display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 700 }}>{new Date(selectedSession.created_at).toLocaleDateString()}</div>
              <div style={{ color: C.textDim, fontSize: 12 }}>Buyin: ${selectedSession.buyin}</div>
            </div>
            <span style={S.badge(selectedSession.profit_loss >= 0 ? C.green : C.red)}>{fmt$(selectedSession.profit_loss)}</span>
          </div>
          {sessionHands.length === 0 ? <p style={{ color: C.textDim }}>No hands logged.</p> : sessionHands.map(h => (
            <div key={h.id} style={S.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontWeight: 700, letterSpacing: 2 }}>{h.hole_cards || '??'}</span>
                <span style={S.badge(h.result === 'Won' ? C.green : h.result === 'Lost' ? C.red : C.goldDim)}>{h.result}</span>
              </div>
              <div style={{ fontSize: 12, color: C.textDim }}>
                Position: {h.position} · Pot: ${h.pot_size}
              </div>
              {h.preflop_action && <div style={{ fontSize: 12, marginTop: 4 }}>Pre: {h.preflop_action}</div>}
              {h.flop_action && <div style={{ fontSize: 12 }}>Flop: {h.flop_action}</div>}
              {h.turn_action && <div style={{ fontSize: 12 }}>Turn: {h.turn_action}</div>}
              {h.river_action && <div style={{ fontSize: 12 }}>River: {h.river_action}</div>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={S.screen}>
      <div style={S.header}>
        <span style={S.headerTitle}>♥ My Stats</span>
      </div>
      <div style={{ padding: 16 }}>
        {editingSession && (
          <EditSessionModal
            session={editingSession}
            onClose={() => setEditingSession(null)}
            onSaved={() => { loadData(); if (onDataChanged) onDataChanged(); }}
            onDeleted={() => { loadData(); if (onDataChanged) onDataChanged(); }}
          />
        )}
        {loading ? <p style={{ color: C.textDim, textAlign: 'center' }}>Loading...</p> : (
          <>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 42, fontWeight: 700, color: totalPL >= 0 ? C.green : C.red }}>{fmt$(totalPL)}</div>
              <div style={{ color: C.textDim, fontSize: 14 }}>All-time profit / loss</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              {[
                ['Sessions', sessions.length],
                ['Win Rate', `${winRate}%`],
                ['Hours Played', fmtDuration(totalMs)],
                ['VPIP', `${vpip}%`],
              ].map(([k, v]) => (
                <div key={k} style={{ ...S.card, margin: 0, textAlign: 'center' }}>
                  <div style={{ color: C.textDim, fontSize: 12 }}>{k}</div>
                  <div style={{ fontWeight: 700, fontSize: 22, color: C.gold }}>{v}</div>
                </div>
              ))}
            </div>
            <h3 style={{ color: C.gold }}>Recent Sessions</h3>
            {sessions.length === 0 ? <p style={{ color: C.textDim }}>No sessions yet. Start playing!</p> : sessions.map(s => (
              <div key={s.id} style={{ ...S.card, cursor: 'pointer' }} onClick={() => openSession(s)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{new Date(s.created_at).toLocaleDateString()}{s.location ? ` · ${s.location}` : ''}</div>
                    <div style={{ color: C.textDim, fontSize: 12 }}>Buyin: ${s.buyin} · {s.start_time && s.end_time ? fmtDuration(new Date(s.end_time) - new Date(s.start_time)) : '—'}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={S.badge(s.profit_loss >= 0 ? C.green : C.red)}>{fmt$(s.profit_loss)}</span>
                    <button
                      onClick={e => { e.stopPropagation(); setEditingSession(s); }}
                      style={{ background: 'none', border: `1px solid ${C.cardBorder}`, borderRadius: 6, color: C.textDim, cursor: 'pointer', padding: '4px 8px', fontSize: 14, lineHeight: 1 }}
                    >
                      ✏️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Log Hand modal ───────────────────────────────────────────────────────────
function LogHandModal({ sessionId, userId, onClose, onSaved }) {
  const [form, setForm] = useState({
    hole_cards: '',
    position: 'BTN',
    preflop_action: '',
    flop_action: '',
    turn_action: '',
    river_action: '',
    result: 'Won',
    pot_size: '',
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    await supabase.from('hands').insert({
      session_id: sessionId,
      user_id: userId,
      ...form,
      pot_size: parseFloat(form.pot_size) || 0,
    });
    onSaved();
    onClose();
    setSaving(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}>
      <div style={{ background: C.card, borderRadius: '16px 16px 0 0', padding: 20, width: '100%', maxWidth: 480, margin: '0 auto', maxHeight: '85vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, color: C.gold }}>♣ Log Hand</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.textDim, fontSize: 22, cursor: 'pointer' }}>✕</button>
        </div>

        <label style={S.label}>Hole Cards (e.g. A♠ K♥)</label>
        <input style={S.input} value={form.hole_cards} onChange={e => set('hole_cards', e.target.value)} placeholder="A♠ K♥" />

        <label style={S.label}>Position</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
          {POSITIONS.map(p => (
            <button key={p} style={{ ...S.toggleBtn(form.position === p), flex: 'none', padding: '6px 12px' }} onClick={() => set('position', p)}>{p}</button>
          ))}
        </div>

        <label style={S.label}>Preflop Action</label>
        <input style={S.input} value={form.preflop_action} onChange={e => set('preflop_action', e.target.value)} placeholder="Raise 3x, Call, Fold..." />

        <label style={S.label}>Flop Action</label>
        <input style={S.input} value={form.flop_action} onChange={e => set('flop_action', e.target.value)} placeholder="Bet $20, Check..." />

        <label style={S.label}>Turn Action</label>
        <input style={S.input} value={form.turn_action} onChange={e => set('turn_action', e.target.value)} placeholder="Bet $50, Fold..." />

        <label style={S.label}>River Action</label>
        <input style={S.input} value={form.river_action} onChange={e => set('river_action', e.target.value)} placeholder="All-in, Call..." />

        <label style={S.label}>Result</label>
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          {RESULTS.map(r => (
            <button key={r} style={S.toggleBtn(form.result === r)} onClick={() => set('result', r)}>{r}</button>
          ))}
        </div>

        <label style={S.label}>Pot Size ($)</label>
        <input style={S.input} type="number" value={form.pot_size} onChange={e => set('pot_size', e.target.value)} placeholder="0.00" />

        <button style={S.btn()} onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save Hand ♠'}</button>
      </div>
    </div>
  );
}

// ─── Edit Session modal ───────────────────────────────────────────────────────
function EditSessionModal({ session, onClose, onSaved, onDeleted }) {
  const [form, setForm] = useState({
    location: session.location || LOCATIONS[0],
    buyin: String(session.buyin ?? ''),
    small_blind: String(session.small_blind ?? '0.50'),
    big_blind: String(session.big_blind ?? '1.00'),
    cashout: String(session.cashout ?? ''),
    profit_loss: String(session.profit_loss ?? ''),
  });
  const [manualPL, setManualPL] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const set = (k, v) => {
    setForm(f => {
      const next = { ...f, [k]: v };
      if ((k === 'buyin' || k === 'cashout') && !manualPL) {
        const b = parseFloat(k === 'buyin' ? v : next.buyin);
        const c = parseFloat(k === 'cashout' ? v : next.cashout);
        if (!isNaN(b) && !isNaN(c)) next.profit_loss = String((c - b).toFixed(2));
      }
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    await supabase.from('sessions').update({
      location: form.location,
      buyin: parseFloat(form.buyin) || 0,
      small_blind: parseFloat(form.small_blind) || 0,
      big_blind: parseFloat(form.big_blind) || 0,
      cashout: parseFloat(form.cashout) || null,
      profit_loss: parseFloat(form.profit_loss) || 0,
    }).eq('id', session.id);
    onSaved();
    onClose();
    setSaving(false);
  };

  const del = async () => {
    setSaving(true);
    await supabase.from('sessions').delete().eq('id', session.id);
    onDeleted();
    onClose();
    setSaving(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 300, display: 'flex', alignItems: 'flex-end' }}>
      <div style={{ background: C.card, borderRadius: '16px 16px 0 0', padding: 20, width: '100%', maxWidth: 480, margin: '0 auto', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, color: C.gold }}>✏️ Edit Session</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.textDim, fontSize: 22, cursor: 'pointer' }}>✕</button>
        </div>

        <label style={S.label}>Location</label>
        <select style={{ ...S.input, appearance: 'none' }} value={form.location} onChange={e => set('location', e.target.value)}>
          {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
        </select>

        <label style={S.label}>Buy-in ($)</label>
        <input style={S.input} type="number" value={form.buyin} onChange={e => set('buyin', e.target.value)} placeholder="100" />

        <label style={S.label}>Blinds</label>
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: C.textDim, marginBottom: 4 }}>Small</div>
            <input style={{ ...S.input, marginTop: 0 }} type="number" value={form.small_blind} onChange={e => set('small_blind', e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: C.textDim, marginBottom: 4 }}>Big</div>
            <input style={{ ...S.input, marginTop: 0 }} type="number" value={form.big_blind} onChange={e => set('big_blind', e.target.value)} />
          </div>
        </div>

        <label style={S.label}>Cashout ($)</label>
        <input style={S.input} type="number" value={form.cashout} onChange={e => set('cashout', e.target.value)} placeholder="0" />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
          <label style={{ ...S.label, marginTop: 0 }}>Profit / Loss ($)</label>
          <button
            onClick={() => setManualPL(m => !m)}
            style={{ background: 'none', border: 'none', color: manualPL ? C.gold : C.textDim, fontSize: 11, cursor: 'pointer', padding: 0 }}
          >
            {manualPL ? '● manual' : '○ auto'}
          </button>
        </div>
        <input
          style={{ ...S.input, color: parseFloat(form.profit_loss) >= 0 ? C.green : C.red }}
          type="number"
          value={form.profit_loss}
          onChange={e => { setManualPL(true); set('profit_loss', e.target.value); }}
          placeholder="0"
          readOnly={!manualPL}
        />

        <button style={{ ...S.btn(), marginTop: 16 }} onClick={save} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>

        {!confirmDelete ? (
          <button style={{ ...S.btn('danger'), marginTop: 8 }} onClick={() => setConfirmDelete(true)}>
            Delete Session
          </button>
        ) : (
          <div style={{ ...S.card, marginTop: 8, border: `1px solid ${C.red}` }}>
            <div style={{ color: C.red, fontWeight: 700, marginBottom: 10 }}>Delete this session permanently?</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ ...S.btn('secondary'), marginTop: 0 }} onClick={() => setConfirmDelete(false)}>Cancel</button>
              <button style={{ ...S.btn('danger'), marginTop: 0 }} onClick={del} disabled={saving}>Yes, Delete</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Mini modal for Add-On and Update Stack ──────────────────────────────────
function InputModal({ title, placeholder, onConfirm, onClose }) {
  const [val, setVal] = useState('');
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: C.card, borderRadius: 16, padding: 24, width: '100%', maxWidth: 360 }}>
        <h3 style={{ margin: '0 0 12px', color: C.gold }}>{title}</h3>
        <input
          style={S.input}
          type="number"
          placeholder={placeholder}
          value={val}
          onChange={e => setVal(e.target.value)}
          autoFocus
        />
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button style={{ ...S.btn('secondary'), marginTop: 0 }} onClick={onClose}>Cancel</button>
          <button style={{ ...S.btn(), marginTop: 0 }} onClick={() => { if (val) { onConfirm(parseFloat(val)); onClose(); } }}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

// ─── Start Game tab ───────────────────────────────────────────────────────────
function StartGameTab({ profile, onSessionEnd }) {
  // Step 1: setup form state
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [buyin, setBuyin] = useState('');
  const [sb, setSb] = useState('0.50');
  const [bb, setBb] = useState('1.00');

  // Step 2: live session state
  const [session, setSession] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [totalBuyin, setTotalBuyin] = useState(0);
  const [stackHistory, setStackHistory] = useState([]);
  const [cashout, setCashout] = useState('');
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(null); // 'addon' | 'stack'

  // Step 3: summary state
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    if (!session) return;
    const id = setInterval(() => setElapsed(Date.now() - new Date(session.start_time).getTime()), 1000);
    return () => clearInterval(id);
  }, [session]);

  const startSession = async () => {
    if (!buyin || isNaN(buyin)) return;
    const initialBuyin = parseFloat(buyin);
    const start_time = new Date().toISOString();
    const { data, error } = await supabase.from('sessions').insert({
      user_id: profile.id,
      buyin: initialBuyin,
      location,
      small_blind: parseFloat(sb),
      big_blind: parseFloat(bb),
      start_time,
      profit_loss: 0,
    }).select().single();
    if (!error) {
      setSession(data);
      setTotalBuyin(initialBuyin);
      setElapsed(0);
      setStackHistory([]);
    }
  };

  const handleAddOn = (amount) => {
    const newTotal = totalBuyin + amount;
    setTotalBuyin(newTotal);
    supabase.from('sessions').update({ buyin: newTotal }).eq('id', session.id);
  };

  const handleUpdateStack = (stack) => {
    const pl = stack - totalBuyin;
    const entry = { stack, pl, time: new Date().toISOString(), elapsed };
    setStackHistory(h => [...h, entry]);
  };

  const latestStack = stackHistory.length > 0 ? stackHistory[stackHistory.length - 1] : null;
  const currentPL = latestStack ? latestStack.pl : null;

  const endSession = async () => {
    setSaving(true);
    const cashoutAmt = parseFloat(cashout) || (latestStack ? latestStack.stack : totalBuyin);
    const profit_loss = cashoutAmt - totalBuyin;
    const end_time = new Date().toISOString();
    await supabase.from('sessions').update({
      end_time,
      profit_loss,
      cashout: cashoutAmt,
      buyin: totalBuyin,
    }).eq('id', session.id);
    setSummary({
      duration: elapsed,
      totalBuyin,
      cashout: cashoutAmt,
      profit_loss,
      stackUpdates: stackHistory.length,
      location: session.location,
      sb: session.small_blind,
      bb: session.big_blind,
    });
    setSession(null);
    setSaving(false);
  };

  // ── Step 3: Summary ──
  if (summary) {
    return (
      <div style={S.screen}>
        <div style={S.header}>
          <span style={S.headerTitle}>♠ Session Over</span>
        </div>
        <div style={{ padding: 16 }}>
          <div style={{ ...S.card, textAlign: 'center', borderColor: summary.profit_loss >= 0 ? C.green : C.red }}>
            <div style={{ fontSize: 13, color: C.textDim, marginBottom: 4 }}>Final Result</div>
            <div style={{ fontSize: 48, fontWeight: 700, color: summary.profit_loss >= 0 ? C.green : C.red }}>
              {fmt$(summary.profit_loss)}
            </div>
            <div style={{ color: C.textDim, fontSize: 13, marginTop: 4 }}>{summary.location}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            {[
              ['Duration', fmtTimer(summary.duration)],
              ['Total Buyin', `$${summary.totalBuyin.toFixed(2)}`],
              ['Cashout', `$${summary.cashout.toFixed(2)}`],
              ['Stack Updates', summary.stackUpdates],
              ['Blinds', `$${summary.sb}/$${summary.bb}`],
            ].map(([k, v]) => (
              <div key={k} style={{ ...S.card, margin: 0, textAlign: 'center' }}>
                <div style={{ color: C.textDim, fontSize: 11 }}>{k}</div>
                <div style={{ fontWeight: 700, fontSize: 16, color: C.gold }}>{v}</div>
              </div>
            ))}
          </div>

          <button style={S.btn()} onClick={() => {
            setSummary(null);
            setBuyin('');
            setCashout('');
            setStackHistory([]);
            if (onSessionEnd) onSessionEnd();
          }}>
            View Leaderboard ♠
          </button>
        </div>
      </div>
    );
  }

  // ── Step 1: Setup ──
  if (!session) {
    return (
      <div style={S.screen}>
        <div style={S.header}>
          <span style={S.headerTitle}>♦ Start Game</span>
        </div>
        <div style={{ padding: 16 }}>
          <div style={{ fontSize: 48, textAlign: 'center', marginBottom: 4 }}>🃏</div>
          <div style={S.card}>
            <label style={{ ...S.label, marginTop: 0 }}>Location</label>
            <select
              style={{ ...S.input, appearance: 'none' }}
              value={location}
              onChange={e => setLocation(e.target.value)}
            >
              {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>

            <label style={S.label}>Buy-in Amount ($)</label>
            <input style={S.input} type="number" value={buyin} onChange={e => setBuyin(e.target.value)} placeholder="100" />

            <label style={S.label}>Blinds</label>
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: C.textDim, marginBottom: 4 }}>Small Blind</div>
                <input style={{ ...S.input, marginTop: 0 }} type="number" value={sb} onChange={e => setSb(e.target.value)} placeholder="0.50" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: C.textDim, marginBottom: 4 }}>Big Blind</div>
                <input style={{ ...S.input, marginTop: 0 }} type="number" value={bb} onChange={e => setBb(e.target.value)} placeholder="1.00" />
              </div>
            </div>

            <button style={{ ...S.btn(), marginTop: 20 }} onClick={startSession} disabled={!buyin}>
              Start Session ♠
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Step 2: Live session ──
  return (
    <div style={S.screen}>
      <div style={S.header}>
        <span style={S.headerTitle}>♦ Live Session</span>
        <span style={{ background: C.red, color: '#fff', borderRadius: 6, padding: '2px 8px', fontSize: 12, fontWeight: 700 }}>● LIVE</span>
      </div>
      <div style={{ padding: 16 }}>

        {/* Timer card */}
        <div style={{ ...S.card, textAlign: 'center', borderColor: C.gold }}>
          <div style={{ fontSize: 11, color: C.textDim, letterSpacing: 1, textTransform: 'uppercase' }}>Time in Session</div>
          <div style={{ fontSize: 40, fontWeight: 700, color: C.gold, fontVariantNumeric: 'tabular-nums', letterSpacing: 2 }}>
            {fmtTimer(elapsed)}
          </div>
          <div style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>
            {session.location} · ${session.small_blind}/${session.big_blind}
          </div>
        </div>

        {/* Buyin + P/L row */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          <div style={{ ...S.card, flex: 1, margin: 0, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: C.textDim }}>Total Buyin</div>
            <div style={{ fontWeight: 700, fontSize: 20, color: C.text }}>${totalBuyin.toFixed(2)}</div>
          </div>
          <div style={{ ...S.card, flex: 1, margin: 0, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: C.textDim }}>Current P/L</div>
            <div style={{ fontWeight: 700, fontSize: 20, color: currentPL === null ? C.textDim : currentPL >= 0 ? C.green : C.red }}>
              {currentPL === null ? '—' : fmt$(currentPL)}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          <button
            style={{ flex: 1, padding: '12px 0', borderRadius: 10, border: `1px solid ${C.cardBorder}`, background: C.cardBorder, color: C.white, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
            onClick={() => setModal('addon')}
          >
            + Add On
          </button>
          <button
            style={{ flex: 1, padding: '12px 0', borderRadius: 10, border: `1px solid ${C.gold}`, background: 'transparent', color: C.gold, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
            onClick={() => setModal('stack')}
          >
            Update Stack
          </button>
        </div>

        {/* Stack history */}
        {stackHistory.length > 0 && (
          <div style={S.card}>
            <div style={{ fontSize: 12, color: C.textDim, marginBottom: 8, fontWeight: 700 }}>STACK HISTORY</div>
            <div style={{ maxHeight: 160, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[...stackHistory].reverse().map((entry, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                  <span style={{ color: C.textDim }}>{fmtTimer(entry.elapsed)}</span>
                  <span style={{ color: C.text }}>${entry.stack.toFixed(2)}</span>
                  <span style={{ color: entry.pl >= 0 ? C.green : C.red, fontWeight: 700 }}>{fmt$(entry.pl)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cashout + End Session */}
        <div style={S.card}>
          <label style={{ ...S.label, marginTop: 0 }}>Cashout Amount ($)</label>
          <input
            style={S.input}
            type="number"
            value={cashout}
            onChange={e => setCashout(e.target.value)}
            placeholder={latestStack ? String(latestStack.stack.toFixed(2)) : String(totalBuyin.toFixed(2))}
          />
        </div>

        <button style={{ ...S.btn('danger'), marginTop: 4 }} onClick={endSession} disabled={saving}>
          {saving ? 'Saving...' : 'End Session'}
        </button>
      </div>

      {modal === 'addon' && (
        <InputModal
          title="+ Add On"
          placeholder="Amount to add ($)"
          onConfirm={handleAddOn}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'stack' && (
        <InputModal
          title="Update Stack"
          placeholder="Current chip stack ($)"
          onConfirm={handleUpdateStack}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

// ─── Profile tab ─────────────────────────────────────────────────────────────
function ProfileTab({ profile, onSignOut }) {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    if (!profile) return;
    supabase.from('sessions').select('profit_loss').eq('user_id', profile.id).then(({ data }) => setSessions(data || []));
  }, [profile]);

  const totalPL = sessions.reduce((a, s) => a + (s.profit_loss || 0), 0);
  const wins = sessions.filter(s => (s.profit_loss || 0) > 0).length;
  const winRate = sessions.length > 0 ? Math.round((wins / sessions.length) * 100) : 0;

  return (
    <div style={S.screen}>
      <div style={S.header}>
        <span style={S.headerTitle}>♦ Profile</span>
      </div>
      <div style={{ padding: 16 }}>
        <div style={{ ...S.card, display: 'flex', alignItems: 'center', gap: 16 }}>
          <Avatar profile={profile} size={56} />
          <div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{profile?.username}</div>
            <div style={{ color: C.textDim, fontSize: 13 }}>Poker Player</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            ['Total P/L', fmt$(totalPL)],
            ['Sessions', String(sessions.length)],
            ['Win Rate', `${winRate}%`],
          ].map(([k, v]) => (
            <div key={k} style={{ ...S.card, margin: 0, textAlign: 'center' }}>
              <div style={{ color: C.textDim, fontSize: 12 }}>{k}</div>
              <div style={{ fontWeight: 700, fontSize: 18, color: C.gold }}>{v}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 24 }}>
          <button style={S.btn('danger')} onClick={onSignOut}>Sign Out</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('leaderboard');
  const [refreshKey, setRefreshKey] = useState(0);

  const loadProfile = useCallback(async (u) => {
    setUser(u);
    const { data } = await supabase.from('profiles').select('*').eq('id', u.id).single();
    setProfile(data || null);
    setLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) loadProfile(session.user);
      else setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) loadProfile(session.user);
      else { setUser(null); setProfile(null); setLoading(false); }
    });
    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: C.felt, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 48 }}>♠♥♦♣</div>
        <div style={{ color: C.gold, fontSize: 18 }}>PokerNights</div>
      </div>
    );
  }

  if (!user) return <AuthScreen onAuth={(u) => loadProfile(u)} />;
  if (!profile) return <UsernameScreen user={user} onDone={(p) => setProfile(p)} />;

  const TABS = [
    { id: 'leaderboard', icon: '🏆', label: 'Leaderboard' },
    { id: 'mystats', icon: '📊', label: 'My Stats' },
    { id: 'startgame', icon: '🃏', label: 'Start Game' },
    { id: 'profile', icon: '👤', label: 'Profile' },
  ];

  return (
    <div style={S.app}>
      <div style={S.screen}>
        {tab === 'leaderboard' && <LeaderboardTab refreshKey={refreshKey} />}
        {tab === 'mystats' && <MyStatsTab profile={profile} onDataChanged={() => setRefreshKey(k => k + 1)} />}
        {tab === 'startgame' && <StartGameTab profile={profile} onSessionEnd={() => setTab('leaderboard')} />}
        {tab === 'profile' && <ProfileTab profile={profile} onSignOut={handleSignOut} />}
      </div>
      <nav style={S.nav}>
        {TABS.map(t => (
          <button key={t.id} style={S.navBtn(tab === t.id)} onClick={() => setTab(t.id)}>
            <span style={S.navIcon}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
