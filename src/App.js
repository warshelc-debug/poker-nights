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
function LeaderboardTab() {
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

  useEffect(() => { load(); }, [load]);

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
function MyStatsTab({ profile }) {
  const [sessions, setSessions] = useState([]);
  const [hands, setHands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionHands, setSessionHands] = useState([]);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const [{ data: s }, { data: h }] = await Promise.all([
        supabase.from('sessions').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }),
        supabase.from('hands').select('*').eq('user_id', profile.id),
      ]);
      setSessions(s || []);
      setHands(h || []);
      setLoading(false);
    })();
  }, [profile]);

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
              <div key={s.id} style={{ ...S.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => openSession(s)}>
                <div>
                  <div style={{ fontWeight: 700 }}>{new Date(s.created_at).toLocaleDateString()}</div>
                  <div style={{ color: C.textDim, fontSize: 12 }}>Buyin: ${s.buyin} · {s.start_time && s.end_time ? fmtDuration(new Date(s.end_time) - new Date(s.start_time)) : '—'}</div>
                </div>
                <span style={S.badge(s.profit_loss >= 0 ? C.green : C.red)}>{fmt$(s.profit_loss)}</span>
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

// ─── Start Game tab ───────────────────────────────────────────────────────────
function StartGameTab({ profile }) {
  const [buyin, setBuyin] = useState('');
  const [session, setSession] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [currentStack, setCurrentStack] = useState('');
  const [showLogHand, setShowLogHand] = useState(false);
  const [handCount, setHandCount] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!session) return;
    const id = setInterval(() => setElapsed(Date.now() - new Date(session.start_time).getTime()), 1000);
    return () => clearInterval(id);
  }, [session]);

  const startSession = async () => {
    if (!buyin || isNaN(buyin)) return;
    const start_time = new Date().toISOString();
    const { data, error } = await supabase.from('sessions').insert({
      user_id: profile.id,
      buyin: parseFloat(buyin),
      start_time,
      profit_loss: 0,
    }).select().single();
    if (!error) {
      setSession(data);
      setElapsed(0);
    }
  };

  const endSession = async () => {
    setSaving(true);
    const stack = parseFloat(currentStack) || parseFloat(session.buyin);
    const profit_loss = stack - parseFloat(session.buyin);
    await supabase.from('sessions').update({
      end_time: new Date().toISOString(),
      profit_loss,
    }).eq('id', session.id);
    setSession(null);
    setBuyin('');
    setCurrentStack('');
    setHandCount(0);
    setSaving(false);
  };

  if (!session) {
    return (
      <div style={S.screen}>
        <div style={S.header}>
          <span style={S.headerTitle}>♦ Start Game</span>
        </div>
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 8 }}>🃏</div>
          <h2 style={{ color: C.gold, marginBottom: 24 }}>Ready to play?</h2>
          <div style={{ ...S.card, width: '100%' }}>
            <label style={{ ...S.label, marginTop: 0 }}>Buy-in Amount ($)</label>
            <input style={S.input} type="number" value={buyin} onChange={e => setBuyin(e.target.value)} placeholder="100" />
            <button style={S.btn()} onClick={startSession} disabled={!buyin}>Start Session ♠</button>
          </div>
        </div>
      </div>
    );
  }

  const plValue = currentStack !== '' ? parseFloat(currentStack) - parseFloat(session.buyin) : null;

  return (
    <div style={S.screen}>
      <div style={S.header}>
        <span style={S.headerTitle}>♦ Live Session</span>
        <span style={{ background: C.red, color: '#fff', borderRadius: 6, padding: '2px 8px', fontSize: 12, fontWeight: 700 }}>LIVE</span>
      </div>
      <div style={{ padding: 16 }}>
        <div style={{ ...S.card, textAlign: 'center', borderColor: C.gold }}>
          <div style={{ fontSize: 12, color: C.textDim }}>TIME IN SESSION</div>
          <div style={{ fontSize: 36, fontWeight: 700, color: C.gold, fontVariantNumeric: 'tabular-nums' }}>{fmtDuration(elapsed)}</div>
          <div style={{ fontSize: 12, color: C.textDim, marginTop: 4 }}>Buy-in: ${session.buyin} · {handCount} hands logged</div>
        </div>

        <div style={S.card}>
          <label style={{ ...S.label, marginTop: 0 }}>Current Stack ($)</label>
          <input style={S.input} type="number" value={currentStack} onChange={e => setCurrentStack(e.target.value)} placeholder={String(session.buyin)} />
          {plValue !== null && (
            <div style={{ marginTop: 8, textAlign: 'center', fontSize: 28, fontWeight: 700, color: plValue >= 0 ? C.green : C.red }}>
              {fmt$(plValue)}
            </div>
          )}
        </div>

        <button style={S.btn('secondary')} onClick={() => setShowLogHand(true)}>
          + Log Hand ♣
        </button>
        <button style={{ ...S.btn('danger'), marginTop: 16 }} onClick={endSession} disabled={saving}>
          {saving ? 'Saving...' : 'End Session'}
        </button>
      </div>

      {showLogHand && (
        <LogHandModal
          sessionId={session.id}
          userId={profile.id}
          onClose={() => setShowLogHand(false)}
          onSaved={() => setHandCount(c => c + 1)}
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
        {tab === 'leaderboard' && <LeaderboardTab />}
        {tab === 'mystats' && <MyStatsTab profile={profile} />}
        {tab === 'startgame' && <StartGameTab profile={profile} />}
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
