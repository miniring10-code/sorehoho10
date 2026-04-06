import { useEffect } from 'react';
import Head from 'next/head';
import { db } from '../lib/firebase';
import { ref, onValue, set, update } from 'firebase/database';

export default function Home() {
  useEffect(() => {
    // ===== THEME (fixed: iceblue) =====
    document.body.classList.add('theme-iceblue');

    // ===== ADMIN MODE =====
    let isAdmin = sessionStorage.getItem('sorehoho-admin') === 'true';
    function applyAdminMode() {
      const btn = document.getElementById('admin-btn');
      if (isAdmin) {
        document.body.classList.add('app-admin');
        if (btn) { btn.classList.add('active'); btn.innerHTML = '🔒 <span class="admin-badge">管理者モード ON</span>'; }
      } else {
        document.body.classList.remove('app-admin');
        if (btn) { btn.classList.remove('active'); btn.innerHTML = '🔓 管理者ログイン'; }
      }
    }
    function toggleAdmin() {
      if (isAdmin) {
        isAdmin = false;
        sessionStorage.removeItem('sorehoho-admin');
        applyAdminMode();
      } else {
        openModal('pin');
      }
    }
    function submitPin() {
      const input = document.getElementById('pin-input').value.trim();
      if (input === state.adminPin) {
        isAdmin = true;
        sessionStorage.setItem('sorehoho-admin', 'true');
        applyAdminMode();
        closeModal('pin');
        document.getElementById('pin-input').value = '';
      } else {
        alert('PINが違います');
      }
    }

    // ===== COUNTDOWN =====
    let countdownInterval = null;
    let newsTimeInterval = null;
    function startCountdown() {
      if (countdownInterval) clearInterval(countdownInterval);
      function tick() {
        const now = new Date();
        const target = new Date(state.performanceDate + 'T00:00:00');
        const diff = target - now;
        const labelEl = document.getElementById('countdown-label');
        const timerEl = document.getElementById('countdown-timer');
        const msgEl = document.getElementById('countdown-message');
        const dateEl = document.getElementById('countdown-date');
        if (!labelEl) return;
        const parts = state.performanceDate.split('-');
        if (dateEl) dateEl.textContent = `公演日: ${parseInt(parts[0])}年${parseInt(parts[1])}月${parseInt(parts[2])}日`;
        if (diff <= 0) {
          if (labelEl) labelEl.textContent = '';
          if (timerEl) timerEl.style.display = 'none';
          if (msgEl) msgEl.textContent = '✿ 公演当日！ ✿';
          msgEl.style.display = 'block';
        } else {
          const d = Math.floor(diff / (1000 * 60 * 60 * 24));
          const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const s = Math.floor((diff % (1000 * 60)) / 1000);
          if (labelEl) labelEl.textContent = '公演まであと';
          if (timerEl) {
            timerEl.style.display = 'flex';
            document.getElementById('cd-days').textContent   = String(d);
            document.getElementById('cd-hours').textContent  = String(h).padStart(2,'0');
            document.getElementById('cd-mins').textContent   = String(m).padStart(2,'0');
            document.getElementById('cd-secs').textContent   = String(s).padStart(2,'0');
          }
          if (msgEl) msgEl.style.display = 'none';
        }
      }
      tick();
      countdownInterval = setInterval(tick, 1000);
    }

    // ===== STATE =====
    let nextId = 100;
    const uid = () => nextId++;

    const state = {
      currentTab: 'schedule',
      currentMonth: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      selectedDate: null,
      performanceDate: '2025-11-23',
      adminPin: '1010',
      members: [
        { id: 1,  name: 'りーな',   generation: 1, isLocal: false },
        { id: 2,  name: 'ゆりまる', generation: 1, isLocal: false },
        { id: 3,  name: 'さわ',     generation: 1, isLocal: false },
        { id: 4,  name: 'みかめろ', generation: 2, isLocal: false },
        { id: 5,  name: 'まり',     generation: 2, isLocal: false },
        { id: 6,  name: 'みさき',   generation: 2, isLocal: false },
        { id: 7,  name: 'あっきぃ', generation: 3, isLocal: false },
        { id: 8,  name: 'もえ',     generation: 3, isLocal: false },
        { id: 9,  name: 'みく',     generation: 4, isLocal: false },
        { id: 10, name: 'あや',     generation: 5, isLocal: false },
        { id: 11, name: 'おりざ',   generation: 5, isLocal: false },
        { id: 12, name: 'にゃん',   generation: 5, isLocal: false },
        { id: 13, name: 'りんりん', generation: 5, isLocal: false },
        { id: 14, name: 'さな',     generation: 5, isLocal: false },
        { id: 15, name: 'カナメ',   generation: 5, isLocal: false },
        { id: 16, name: 'やなぎ',   generation: 5, isLocal: false },
        { id: 17, name: 'ほの',     generation: 5, isLocal: false },
        { id: 18, name: 'ゆいまる', generation: 6, isLocal: false },
        { id: 19, name: 'すずめ',   generation: 6, isLocal: false },
        { id: 20, name: 'あいら',   generation: 7, isLocal: false },
        { id: 21, name: 'みづき',   generation: 7, isLocal: false },
        { id: 22, name: 'みゅう',   generation: 8, isLocal: false },
        { id: 23, name: 'ゆき',    generation: 8, isLocal: false },
        { id: 24, name: 'めん',    generation: 9, isLocal: false },
        { id: 25, name: 'みあん',  generation: 9, isLocal: false },
        { id: 26, name: 'りな',    generation: 9, isLocal: false },
        { id: 27, name: 'うた',    generation: 9, isLocal: false },
      ],
      songs: [
        { id: 1,  title: 'PARTYが始まるよ',       artist: 'AKB48',            section: 'OP' },
        { id: 2,  title: '超めでたいソング',       artist: 'FRUITS ZIPPER',    section: 'OP' },
        { id: 3,  title: 'パレオはエメラルド',     artist: 'SKE48',            section: 'OP' },
        { id: 4,  title: '倍々FIGHT!',             artist: 'CANDY TUNE',       section: 'わき曲' },
        { id: 5,  title: '盛れ!ミ・アモーレ',     artist: 'Juice=Juice',       section: 'わき曲' },
        { id: 6,  title: 'SHOUT',                  artist: '真っ白なキャンバス', section: 'わき曲' },
        { id: 7,  title: 'ガールズルール',         artist: '乃木坂46',         section: '既存' },
        { id: 8,  title: 'Cheeky Dreamer',         artist: 'Cheeky Parade',    section: '既存' },
        { id: 9,  title: 'バンドワゴン',           artist: 'ラストアイドル',   section: '既存' },
        { id: 10, title: '僕らはここにいる',       artist: 'ベイビーレイズJAPAN', section: '既存' },
        { id: 11, title: 'サヨナラの意味',         artist: '乃木坂46',         section: '既存' },
        { id: 12, title: 'Fantastic Illusion',     artist: 'i☆Ris',            section: '既存' },
        { id: 13, title: '疾走Dreamer',            artist: 'JAMS',             section: '既存' },
        { id: 14, title: 'NEW ERA PUNCH',          artist: 'JAMS',             section: '既存' },
        { id: 15, title: 'まほろばアスタリスク?', artist: '≠ME',              section: '既存' },
        { id: 16, title: 'とくべチュ、して(?)',      artist: '未定',             section: '既存' },
        { id: 17, title: 'A INNOCENCE',            artist: 'ZOC',              section: 'ラスト' },
        { id: 18, title: '＝LOVE',                 artist: '＝LOVE',           section: 'ラスト' },
        { id: 19, title: '名残り桜',               artist: 'AKB48',            section: 'ラスト' },
        { id: 20, title: 'YOZORA',                 artist: 'アイドルカレッジ', section: 'アンコール' },
        { id: 21, title: '47の素敵な街へ',         artist: 'AKB48',            section: 'アンコール' },
      ],
      events: [
        { id: 1, date: '2025-11-03', name: '振り付け練習', time: '', timeEnd: '', place: '', memo: '' },
        { id: 2, date: '2025-11-08', name: '衣装合わせ',   time: '', timeEnd: '', place: '', memo: '' },
        { id: 3, date: '2025-11-16', name: '通し練習',     time: '', timeEnd: '', place: '', memo: '' },
        { id: 4, date: '2025-11-22', name: 'ゲネプロ',     time: '', timeEnd: '', place: '', memo: '' },
        { id: 5, date: '2025-11-23', name: '★本番公演★',  time: '15:00', timeEnd: '', place: '', memo: '' },
      ],
      tasks: [
        { id: 10, name: '衣装発注確認',           cat: '衣装',       done: false, dueDate: '' },
        { id: 11, name: 'SNS投稿スケジュール作成', cat: 'sns',        done: false, dueDate: '' },
        { id: 12, name: 'チケット販売ページ作成',  cat: 'チケット',   done: false, dueDate: '' },
        { id: 13, name: 'スタジオ予約確認',        cat: 'スタジオ予約', done: true,  dueDate: '' },
      ],
      taskFilter: 'all',
      news: [
        { id: 20, title: '11月スケジュールについて',   cat: '全体', body: '11月のスケジュールを確認してください。練習日程・衣装合わせ・ゲネプロの日程は変更ありません。', createdAt: Date.now() - 2*60*60*1000 },
        { id: 21, title: '衣装打ち合わせ日程のご連絡', cat: '衣装', body: '衣装打ち合わせは11月8日（土）に行います。全員参加必須です。',                               createdAt: Date.now() - 24*60*60*1000 },
        { id: 22, title: 'グッズ制作について',          cat: 'グッズ', body: 'グッズのデザイン案が完成しました。共有フォルダをご確認ください。',                         createdAt: Date.now() - 4*24*60*60*1000 },
      ],
      openNewsId: null,
      openRecentNewsId: null,
      attendEvents: [
        { id: 0, name: '本番公演',  date: '11/23 15:00〜'      },
        { id: 1, name: '通し練習',  date: '11/16 13:00〜17:00' },
      ],
      currentAttendEvent: 0,
      attendance: {
        '0-1':'present','0-2':'maybe',  '0-3':'present',
        '0-4':'absent', '0-5':'present',
        '1-1':'present','1-2':'present','1-3':'maybe',
        '1-4':'present','1-5':'absent',
      },
      memos: {},
      lateTime: {},
      attendUpdatedAt: {},
      myMemberId: null,
      songParts: {},
      songNotes: {},
      songLeaders: {},    // { songId: ['name1','name2','name3'] }
      songPerformers: {}, // { songId: [memberId, ...] }
      currentSongId: null,
    };

    state.myMemberId = parseInt(localStorage.getItem('sorehoho_my_member') || '') || null;

    const TASK_CATS = ['all','sns','会場','衣装','クリエイティブ','現役連絡','ロゴ','kv','演出','音源','チケット','グッズ','お金','スタジオ予約','スケジュール'];

    // ===== TIME HELPERS =====
    function formatRelativeTime(ts) {
      if (!ts) return '';
      const diff = Date.now() - ts;
      const mins  = Math.floor(diff / (1000 * 60));
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days  = Math.floor(diff / (1000 * 60 * 60 * 24));
      if (mins < 1)   return 'たった今';
      if (mins < 60)  return `${mins}分前`;
      if (hours < 24) return `${hours}時間前`;
      if (days < 30)  return `${days}日前`;
      return `${Math.floor(days/30)}ヶ月前`;
    }
    function isNewsNew(post) {
      if (post.createdAt) return (Date.now() - post.createdAt) < 3 * 24 * 60 * 60 * 1000;
      return !!post.isNew;
    }
    // テキストの改行・URLリンクを変換（XSS対策済み）
    function formatText(text) {
      if (!text) return '';
      const urlPattern = /(https?:\/\/[^\s]+)/g;
      const parts = text.split(urlPattern);
      return parts.map((part, i) => {
        if (i % 2 === 1) {
          const safe = part.replace(/"/g, '&quot;');
          return `<a href="${safe}" target="_blank" rel="noopener noreferrer" class="text-link">${safe}</a>`;
        }
        return part
          .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
          .replace(/\n/g, '<br>');
      }).join('');
    }

    // ===== HOHO MASCOT =====
    function updateHohoMessage() {
      const msgEl = document.getElementById('hoho-message');
      if (!msgEl) return;
      const now = new Date();
      let msg = '';
      switch (state.currentTab) {
        case 'schedule': {
          const upcoming = state.events
            .filter(e => new Date(e.date + 'T00:00:00') >= now)
            .sort((a, b) => new Date(a.date) - new Date(b.date));
          if (upcoming.length > 0) {
            const next = upcoming[0];
            const d = new Date(next.date + 'T00:00:00');
            msg = `次の予定は「${next.name}」${d.getMonth()+1}月${d.getDate()}日だよ！`;
          } else {
            msg = 'スケジュールは今のところ空だよ！';
          }
          break;
        }
        case 'tasks': {
          const incomplete = state.tasks.filter(t => !t.done);
          if (incomplete.length === 0) {
            msg = 'タスク全部終わってる！すごいね！✨';
          } else {
            msg = `タスクが${incomplete.length}個残ってるよ！`;
          }
          break;
        }
        case 'news': {
          const newCount = state.news.filter(n => n.isNew).length;
          if (newCount > 0) {
            msg = `新しいお知らせが${newCount}件あるよ！`;
          } else {
            msg = 'お知らせをチェックしてね！';
          }
          break;
        }
        case 'attend': {
          const eid = state.currentAttendEvent;
          const present = state.members.filter(m => state.attendance[`${eid}-${m.id}`] === 'present').length;
          msg = `${present}人が参加予定だよ！`;
          break;
        }
        case 'setlist': {
          msg = `全部で${state.songs.length}曲あるよ！がんばろう！🎵`;
          break;
        }
        case 'settings': {
          msg = '設定はここでできるよ！管理よろしくね！';
          break;
        }
        default:
          msg = 'みんなのこと応援してるよ！✿';
      }
      msgEl.textContent = msg;
    }

    // ===== TAB =====
    const VALID_TABS = ['schedule','tasks','news','attend','setlist','settings'];
    function switchTab(tabId) {
      state.currentTab = tabId;
      if (location.hash !== '#' + tabId) location.hash = tabId;
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      document.getElementById('tab-' + tabId).classList.add('active');
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tabId));
      updateHohoMessage();
    }

    // ===== MODAL =====
    function openModal(name) { document.getElementById('overlay-' + name).classList.remove('hidden'); }
    function closeModal(name) { document.getElementById('overlay-' + name).classList.add('hidden'); }

    // ===== CALENDAR =====
    function renderRecentNewsInCalendar() {
      const area = document.getElementById('recent-news-area');
      if (!area) return;
      const recent = [...state.news].sort((a,b) => (b.createdAt||0) - (a.createdAt||0)).slice(0,3);
      if (recent.length === 0) { area.innerHTML = ''; return; }
      area.innerHTML = '<div class="recent-news-title">📢 最新のお知らせ</div>' +
        recent.map(n => {
          const showNew = isNewsNew(n);
          const timeStr = n.createdAt ? formatRelativeTime(n.createdAt) : (n.time || '');
          const isOpen = state.openRecentNewsId === n.id;
          return `<div class="recent-news-item" onclick="window.toggleRecentNews(${n.id})">
            <span class="recent-news-cat">${n.cat}</span>
            ${showNew ? '<span class="news-new-badge">NEW</span>' : ''}
            <span class="recent-news-text">${n.title}</span>
            <span class="recent-news-time">${timeStr}</span>
          </div>
          ${isOpen ? `<div class="recent-news-detail text-formatted">${formatText(n.body)}</div>` : ''}`;
        }).join('');
    }
    function toggleRecentNews(newsId) {
      state.openRecentNewsId = state.openRecentNewsId === newsId ? null : newsId;
      renderRecentNewsInCalendar();
    }
    function renderCalendar() {
      renderRecentNewsInCalendar();
      const year = state.currentMonth.getFullYear();
      const month = state.currentMonth.getMonth();
      document.getElementById('cal-month-label').textContent = `${year}年${month + 1}月`;
      const eventDates = new Set(state.events.map(e => e.date));
      const tbody = document.getElementById('cal-body');
      tbody.innerHTML = '';
      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const today = new Date();
      let cells = [];
      for (let i = 0; i < firstDay; i++) cells.push(null);
      for (let d = 1; d <= daysInMonth; d++) cells.push(d);
      while (cells.length % 7 !== 0) cells.push(null);
      for (let r = 0; r < cells.length / 7; r++) {
        const tr = document.createElement('tr');
        for (let c = 0; c < 7; c++) {
          const d = cells[r * 7 + c];
          const td = document.createElement('td');
          if (c === 0) td.classList.add('sun');
          if (c === 6) td.classList.add('sat');
          if (d) {
            const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
            const numSpan = document.createElement('span');
            numSpan.className = 'day-num';
            numSpan.textContent = d;
            td.appendChild(numSpan);
            if (eventDates.has(dateStr)) {
              const dot = document.createElement('span');
              dot.className = 'dot';
              td.appendChild(dot);
            }
            if (today.getFullYear()===year && today.getMonth()===month && today.getDate()===d) {
              td.classList.add('today');
            }
            if (state.selectedDate === dateStr) {
              td.classList.add('selected-day');
            }
            td.addEventListener('click', () => {
              state.selectedDate = state.selectedDate === dateStr ? null : dateStr;
              renderCalendar();
              renderDateEvents();
            });
          } else {
            td.classList.add('other-month');
          }
          tr.appendChild(td);
        }
        tbody.appendChild(tr);
      }
      renderDateEvents();
    }

    function renderDateEvents() {
      const container = document.getElementById('date-events-panel');
      if (!container) return;
      if (!state.selectedDate) {
        container.classList.add('hidden');
        return;
      }
      container.classList.remove('hidden');
      const parts = state.selectedDate.split('-');
      const label = `${parseInt(parts[1])}月${parseInt(parts[2])}日の予定`;
      document.getElementById('date-events-label').textContent = label;
      const list = document.getElementById('date-events-list');
      list.innerHTML = '';
      const dayEvents = state.events.filter(e => e.date === state.selectedDate).sort((a,b) => (a.time||'').localeCompare(b.time||''));
      if (dayEvents.length === 0) {
        list.innerHTML = '<div class="date-events-empty">予定なし</div>';
      } else {
        dayEvents.forEach(ev => {
          const div = document.createElement('div');
          div.className = 'date-event-item';
          const timeStr = ev.time ? (ev.timeEnd ? `${ev.time}〜${ev.timeEnd}` : ev.time) : '';
          div.innerHTML = `
            <div><span class="date-event-name">${ev.name}</span>${timeStr ? `<span class="date-event-time">${timeStr}</span>` : ''}</div>
            ${ev.place ? `<div class="date-event-memo">📍 ${formatText(ev.place)}</div>` : ''}
            ${ev.memo  ? `<div class="date-event-memo text-formatted">📝 ${formatText(ev.memo)}</div>` : ''}
          `;
          list.appendChild(div);
        });
      }
    }

    function renderEventList() {
      const ul = document.getElementById('event-list');
      ul.innerHTML = '';
      const now = new Date();
      const sorted = [...state.events]
        .filter(ev => new Date(ev.date + 'T23:59:59') >= now)
        .sort((a,b) => a.date.localeCompare(b.date));
      sorted.forEach(ev => {
        const li = document.createElement('li');
        li.className = 'event-item event-collapsible';
        const parts = ev.date.split('-');
        const dl = `${parseInt(parts[1])}/${parseInt(parts[2])}`;
        const timeStr = ev.time ? (ev.timeEnd ? `${ev.time}〜${ev.timeEnd}` : ev.time) : '';
        li.innerHTML = `
          <div class="event-main-row" onclick="this.closest('.event-collapsible').classList.toggle('open')">
            <span class="event-date">${dl}</span>
            <div class="event-info">
              <span class="event-name">${ev.name}</span>
              ${timeStr ? `<span class="event-time">${timeStr}</span>` : ''}
            </div>
            <span class="event-arrow">›</span>
          </div>
          <div class="event-detail-row hidden-detail">
            ${ev.place ? `<div class="event-detail-item">📍 ${formatText(ev.place)}</div>` : ''}
            ${ev.memo  ? `<div class="event-detail-item text-formatted">📝 ${formatText(ev.memo)}</div>` : ''}
            <div class="event-actions admin-only">
              <button class="btn-secondary btn-sm" onclick="window.openEditEvent(${ev.id})">✏️ 編集</button>
              <button class="btn-icon" onclick="window.deleteEvent(${ev.id})">🗑</button>
            </div>
          </div>
        `;
        ul.appendChild(li);
      });
    }

    function addEvent() {
      const name    = document.getElementById('new-event-name').value.trim();
      const date    = document.getElementById('new-event-date').value;
      const time    = document.getElementById('new-event-time').value.trim();
      const timeEnd = document.getElementById('new-event-time-end').value.trim();
      const place   = document.getElementById('new-event-place').value.trim();
      const memo    = document.getElementById('new-event-memo').value.trim();
      if (!name || !date) return alert('イベント名と日付を入力してください');
      state.events.push({ id: uid(), date, name, time: time || '', timeEnd: timeEnd || '', place: place || '', memo: memo || '' });
      saveToFirebase('/events', arrToObj(state.events));
      closeModal('event-add');
      document.getElementById('new-event-name').value = '';
      document.getElementById('new-event-date').value = '';
      document.getElementById('new-event-time').value = '';
      document.getElementById('new-event-time-end').value = '';
      document.getElementById('new-event-place').value = '';
      document.getElementById('new-event-memo').value = '';
      renderCalendar(); renderEventList();
    }
    function openEditEvent(id) {
      const ev = state.events.find(e => e.id === id);
      if (!ev) return;
      document.getElementById('edit-event-id').value    = id;
      document.getElementById('edit-event-name').value  = ev.name;
      document.getElementById('edit-event-date').value  = ev.date;
      document.getElementById('edit-event-time').value  = ev.time || '';
      document.getElementById('edit-event-time-end').value = ev.timeEnd || '';
      document.getElementById('edit-event-place').value = ev.place || '';
      document.getElementById('edit-event-memo').value  = ev.memo || '';
      openModal('event-edit');
    }
    function updateEvent() {
      const id      = parseInt(document.getElementById('edit-event-id').value);
      const ev      = state.events.find(e => e.id === id);
      if (!ev) return;
      ev.name    = document.getElementById('edit-event-name').value.trim() || ev.name;
      ev.date    = document.getElementById('edit-event-date').value || ev.date;
      ev.time    = document.getElementById('edit-event-time').value.trim();
      ev.timeEnd = document.getElementById('edit-event-time-end').value.trim();
      ev.place   = document.getElementById('edit-event-place').value.trim();
      ev.memo    = document.getElementById('edit-event-memo').value.trim();
      saveToFirebase('/events', arrToObj(state.events));
      closeModal('event-edit');
      renderCalendar(); renderEventList();
    }
    function deleteEvent(id) {
      state.events = state.events.filter(e => e.id !== id);
      saveToFirebase('/events', arrToObj(state.events));
      renderCalendar(); renderEventList();
    }

    // ===== TASKS =====
    function renderTaskChips() {
      const row = document.getElementById('task-filter-chips');
      row.innerHTML = '';
      TASK_CATS.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'chip' + (state.taskFilter === cat ? ' active' : '');
        btn.textContent = cat === 'all' ? 'すべて' : cat;
        btn.onclick = () => { state.taskFilter = cat; renderTaskChips(); renderTasks(); };
        row.appendChild(btn);
      });
    }
    function sortTasksByDue(tasks) {
      return [...tasks].sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      });
    }
    function renderTasks() {
      const filter = state.taskFilter;
      const filtered = filter === 'all' ? state.tasks : state.tasks.filter(t => t.cat === filter);
      const inc = sortTasksByDue(filtered.filter(t => !t.done));
      const com = sortTasksByDue(filtered.filter(t =>  t.done));
      document.getElementById('incomplete-count').textContent = inc.length;
      document.getElementById('complete-count').textContent   = com.length;
      renderTaskList('task-list-incomplete', inc);
      renderTaskList('task-list-complete',   com);
    }
    function renderTaskList(listId, tasks) {
      const ul = document.getElementById(listId);
      ul.innerHTML = '';
      const today = new Date().toISOString().slice(0,10);
      tasks.forEach(t => {
        const li = document.createElement('li');
        li.className = 'task-item task-collapsible';
        let dueBadge = '';
        let dueDateText = '期日: 未設定';
        if (t.dueDate) {
          const isOverdue = !t.done && t.dueDate < today;
          const isSoon    = !t.done && !isOverdue && t.dueDate <= new Date(Date.now()+3*86400000).toISOString().slice(0,10);
          const parts = t.dueDate.split('-');
          const label = `${parseInt(parts[1])}/${parseInt(parts[2])}`;
          dueBadge = `<span class="task-due${isOverdue?' overdue':isSoon?' soon':''}">${label}</span>`;
          dueDateText = `📅 期日: ${parseInt(parts[0])}年${parseInt(parts[1])}月${parseInt(parts[2])}日${isOverdue?' ⚠️期限切れ':isSoon?' ⚠️まもなく':''}`;
        }
        li.innerHTML = `
          <div class="task-main-row" onclick="this.closest('.task-collapsible').classList.toggle('open')">
            <button class="task-toggle ${t.done?'done':''} admin-only" onclick="event.stopPropagation();window.toggleTask(${t.id})">${t.done?'✓':''}</button>
            <span class="task-name ${t.done?'done':''}">${t.name}</span>
            ${dueBadge}
            <span class="task-cat-badge">${t.cat}</span>
            <span class="task-arrow">›</span>
          </div>
          <div class="task-detail-row">
            <div class="task-detail-item">${dueDateText}</div>
            <div class="task-detail-item">📂 カテゴリ: ${t.cat}</div>
            <div class="task-actions admin-only">
              <button class="btn-secondary btn-sm" onclick="window.openEditTask(${t.id})">✏️ 編集・削除</button>
            </div>
          </div>
        `;
        ul.appendChild(li);
      });
    }
    function toggleTask(id) {
      const t = state.tasks.find(t => t.id === id);
      if (t) { t.done = !t.done; saveToFirebase('/tasks', arrToObj(state.tasks)); renderTasks(); }
    }
    function addTask() {
      const name    = document.getElementById('new-task-name').value.trim();
      const cat     = document.getElementById('new-task-cat').value;
      const dueDate = document.getElementById('new-task-due').value;
      if (!name) return alert('タスク名を入力してください');
      state.tasks.push({ id: uid(), name, cat, done: false, dueDate: dueDate || '' });
      saveToFirebase('/tasks', arrToObj(state.tasks));
      closeModal('task-add');
      document.getElementById('new-task-name').value = '';
      document.getElementById('new-task-due').value  = '';
      renderTasks();
    }
    function openEditTask(id) {
      const t = state.tasks.find(t => t.id === id);
      if (!t) return;
      document.getElementById('edit-task-id').value      = id;
      document.getElementById('edit-task-name').value    = t.name;
      document.getElementById('edit-task-cat').value     = t.cat;
      document.getElementById('edit-task-due').value     = t.dueDate || '';
      openModal('task-edit');
    }
    function updateTask() {
      const id = parseInt(document.getElementById('edit-task-id').value);
      const t  = state.tasks.find(t => t.id === id);
      if (!t) return;
      t.name    = document.getElementById('edit-task-name').value.trim() || t.name;
      t.cat     = document.getElementById('edit-task-cat').value;
      t.dueDate = document.getElementById('edit-task-due').value;
      saveToFirebase('/tasks', arrToObj(state.tasks));
      closeModal('task-edit');
      renderTasks();
    }
    function deleteTask(id) {
      state.tasks = state.tasks.filter(t => t.id !== id);
      saveToFirebase('/tasks', arrToObj(state.tasks));
      closeModal('task-edit');
      renderTasks();
    }

    // ===== NEWS =====
    function renderNews() {
      const container = document.getElementById('news-list');
      container.innerHTML = '';
      const sorted = [...state.news].sort((a,b) => (b.createdAt||0) - (a.createdAt||0));
      sorted.forEach(post => {
        const div = document.createElement('div');
        div.className = 'news-item';
        div.dataset.id = post.id;
        const isOpen = state.openNewsId === post.id;
        const showNew = isNewsNew(post);
        const timeStr = post.createdAt ? formatRelativeTime(post.createdAt) : (post.time || '');
        div.innerHTML = `
          <div class="news-header" onclick="window.toggleAccordion(${post.id})">
            <div class="news-meta">
              <span class="news-cat-badge">${post.cat}</span>
              ${showNew ? '<span class="news-new-badge">NEW</span>' : ''}
            </div>
            <div class="news-main">
              <div class="news-title">${post.title}</div>
              <div class="news-time">${timeStr}</div>
            </div>
            <div class="news-header-right">
              <button class="btn-icon admin-only" onclick="event.stopPropagation();window.openEditNews(${post.id})">✏️</button>
              <span class="accordion-arrow ${isOpen?'open':''}">▼</span>
            </div>
          </div>
          <div class="news-body text-formatted ${isOpen?'':'hidden'}">${formatText(post.body)}</div>
        `;
        container.appendChild(div);
      });
    }
    function toggleAccordion(newsId) {
      state.openNewsId = state.openNewsId === newsId ? null : newsId;
      renderNews();
    }
    function addNews() {
      const title = document.getElementById('new-news-title').value.trim();
      const body  = document.getElementById('new-news-body').value.trim();
      const cat   = document.getElementById('new-news-cat').value;
      if (!title) return alert('タイトルを入力してください');
      state.news.unshift({ id: uid(), title, body, cat, createdAt: Date.now() });
      saveToFirebase('/news', arrToObj(state.news));
      closeModal('news-add');
      document.getElementById('new-news-title').value = '';
      document.getElementById('new-news-body').value = '';
      renderNews();
      renderRecentNewsInCalendar();
    }
    function openEditNews(id) {
      const post = state.news.find(n => n.id === id);
      if (!post) return;
      document.getElementById('edit-news-id').value    = id;
      document.getElementById('edit-news-title').value = post.title;
      document.getElementById('edit-news-body').value  = post.body || '';
      document.getElementById('edit-news-cat').value   = post.cat;
      openModal('news-edit');
    }
    function updateNews() {
      const id   = parseInt(document.getElementById('edit-news-id').value);
      const post = state.news.find(n => n.id === id);
      if (!post) return;
      post.title = document.getElementById('edit-news-title').value.trim() || post.title;
      post.body  = document.getElementById('edit-news-body').value.trim();
      post.cat   = document.getElementById('edit-news-cat').value;
      saveToFirebase('/news', arrToObj(state.news));
      closeModal('news-edit');
      renderNews();
      renderRecentNewsInCalendar();
    }
    function deleteNews(id) {
      state.news = state.news.filter(n => n.id !== id);
      saveToFirebase('/news', arrToObj(state.news));
      closeModal('news-edit');
      renderNews();
      renderRecentNewsInCalendar();
    }

    // ===== ATTENDANCE =====
    function renderAttendEventTabs() {
      const row = document.getElementById('attend-event-tabs');
      row.innerHTML = '';
      state.attendEvents.forEach(ev => {
        const btn = document.createElement('button');
        btn.className = 'inner-tab' + (state.currentAttendEvent === ev.id ? ' active' : '');
        btn.textContent = `${ev.name} ${ev.date}`;
        btn.onclick = () => { state.currentAttendEvent = ev.id; renderAttendEventTabs(); renderAttendance(); };
        row.appendChild(btn);
      });
    }
    function renderAttendance() {
      const eid = state.currentAttendEvent;
      let counts = { present:0, maybe:0, absent:0, late:0 };
      state.members.forEach(m => {
        const v = state.attendance[`${eid}-${m.id}`] || 'absent';
        if (counts[v] !== undefined) counts[v]++;
        else counts.absent++;
      });
      document.getElementById('count-present').textContent = counts.present;
      document.getElementById('count-maybe').textContent   = counts.maybe;
      document.getElementById('count-absent').textContent  = counts.absent;
      document.getElementById('count-late').textContent    = counts.late;

      // 自分の名前セレクトボックスを更新
      const sel = document.getElementById('my-member-select');
      if (sel) {
        sel.innerHTML = '<option value="">-- 選択してください --</option>' +
          state.members.map(m => `<option value="${m.id}" ${state.myMemberId === m.id ? 'selected' : ''}>${m.name}</option>`).join('');
      }

      const container = document.getElementById('attend-member-list');
      container.innerHTML = '';
      state.members.forEach(m => {
        const cur = state.attendance[`${eid}-${m.id}`] || 'absent';
        const lt  = state.lateTime[`${eid}-${m.id}`] || '';
        const updatedAt = state.attendUpdatedAt[`${eid}-${m.id}`];
        const updatedText = updatedAt ? `<div class="attend-updated-at">更新: ${formatRelativeTime(updatedAt)}</div>` : '';
        const canEdit = isAdmin || state.myMemberId === m.id;
        const dis = canEdit ? '' : 'disabled';
        const ro  = canEdit ? '' : 'btn-readonly';
        const div = document.createElement('div');
        div.className = 'attend-row';
        div.innerHTML = `
          <div class="attend-row-top">
            <span class="member-name"><span class="gen-badge">${m.generation || ''}期</span>${m.name}${m.isLocal ? '<span class="local-badge">地方</span>' : ''}</span>
            <div class="attend-btns">
              <button class="attend-btn ${cur==='present'?'active-present':''} ${ro}" onclick="window.setAttendance(${m.id},'present')" ${dis}>○</button>
              <button class="attend-btn ${cur==='maybe'  ?'active-maybe'  :''} ${ro}" onclick="window.setAttendance(${m.id},'maybe')" ${dis}>△</button>
              <button class="attend-btn ${cur==='absent' ?'active-absent' :''} ${ro}" onclick="window.setAttendance(${m.id},'absent')" ${dis}>✕</button>
              <button class="attend-btn attend-btn-late ${cur==='late'?'active-late':''} ${ro}" onclick="window.setAttendance(${m.id},'late')" ${dis}>遅/早</button>
            </div>
          </div>
          ${updatedText}
          ${cur === 'late' ? `<div class="late-time-row"><input type="text" class="late-time-input" placeholder="例：17:00〜 / 〜19:00早退" value="${lt}" onchange="window.saveLateTime(${m.id},this.value)" ${canEdit ? '' : 'disabled'} /></div>` : ''}
          ${m.isLocal ? `<input type="text" class="memo-field-single" placeholder="上京メモ（新幹線・宿泊など）" value="${(state.memos[eid+'-'+m.id]||'').replace(/"/g,'&quot;')}" onchange="window.saveMemo(${m.id},this.value)" ${canEdit ? '' : 'disabled'} />` : ''}
        `;
        container.appendChild(div);
      });
      renderPracticeAnalysis();
    }
    function renderPracticeAnalysis() {
      const eid  = state.currentAttendEvent;
      const box  = document.getElementById('practice-analysis');
      if (!box) return;

      // ○ / 遅/早 → 出席扱い
      const available = new Set(
        state.members
          .filter(m => { const v = state.attendance[`${eid}-${m.id}`] || 'absent'; return v === 'present' || v === 'late'; })
          .map(m => String(m.id))
      );

      const full = [], partial = [], hard = [], unset = [];
      state.songs.forEach(song => {
        const perf = (state.songPerformers[song.id] || []).map(String).filter(id => state.members.some(m => String(m.id) === id));
        if (!perf.length) { unset.push({ song }); return; }
        const okCount  = perf.filter(id => available.has(id)).length;
        const total    = perf.length;
        const absentNames = perf.filter(id => !available.has(id))
          .map(id => state.members.find(m => String(m.id) === id)?.name || '').filter(Boolean);
        if (okCount === total)        full.push({ song, okCount, total });
        else if (okCount >= total / 2) partial.push({ song, okCount, total, absentNames });
        else                           hard.push({ song, okCount, total, absentNames });
      });

      const evName = (state.attendEvents.find(e => e.id === eid) || {}).name || '';
      let html = `<div class="pa-title">📋 ${evName}で練習できる曲</div>`;

      const row = (item, cls) => `
        <div class="pa-item ${cls}">
          <span class="pa-song">${item.song.title}</span>
          <span class="pa-count">${item.okCount}/${item.total}人</span>
          ${item.absentNames && item.absentNames.length ? `<div class="pa-absent">欠席: ${item.absentNames.join('・')}</div>` : ''}
        </div>`;

      if (full.length) {
        html += `<div class="pa-group ok">🟢 全員揃い（${full.length}曲）</div>`;
        full.forEach(i => { html += row(i, 'ok'); });
      }
      if (partial.length) {
        html += `<div class="pa-group partial">🟡 一部欠席（${partial.length}曲）</div>`;
        partial.forEach(i => { html += row(i, 'partial'); });
      }
      if (hard.length) {
        html += `<div class="pa-group hard">🔴 難しい（${hard.length}曲）</div>`;
        hard.forEach(i => { html += row(i, 'hard'); });
      }
      if (unset.length) {
        html += `<div class="pa-group unset">⚪ メンバー未設定（${unset.length}曲）</div>`;
        unset.forEach(i => { html += `<div class="pa-item unset"><span class="pa-song">${i.song.title}</span></div>`; });
      }
      box.innerHTML = html;
    }
    function setMyMember(id) {
      state.myMemberId = id ? parseInt(id) : null;
      if (id) localStorage.setItem('sorehoho_my_member', id);
      else localStorage.removeItem('sorehoho_my_member');
      renderAttendance();
    }
    function setAttendance(memberId, value) {
      const key = `${state.currentAttendEvent}-${memberId}`;
      state.attendance[key] = value;
      state.attendUpdatedAt[key] = Date.now();
      saveToFirebase('/attendance', state.attendance);
      saveToFirebase('/attendUpdatedAt', state.attendUpdatedAt);
      renderAttendance();
    }
    function saveMemo(memberId, value) {
      state.memos[`${state.currentAttendEvent}-${memberId}`] = value;
      saveToFirebase('/memos', state.memos);
    }
    function saveLateTime(memberId, value) {
      state.lateTime[`${state.currentAttendEvent}-${memberId}`] = value;
      saveToFirebase('/lateTime', state.lateTime);
    }

    // ===== SETLIST =====
    function renderSetlist() {
      const ol = document.getElementById('setlist-list');
      ol.innerHTML = '';
      let lastSection = null;
      state.songs.forEach((song, idx) => {
        if (song.section && song.section !== lastSection) {
          lastSection = song.section;
          const header = document.createElement('div');
          header.className = 'song-section-header';
          header.textContent = song.section;
          ol.appendChild(header);
        }
        const leaders = state.songLeaders[song.id];
        const leadersText = leaders && leaders.filter(l=>l).length > 0
          ? `<span class="song-leaders">担当: ${leaders.filter(l=>l).join(' · ')}</span>`
          : '';
        const li = document.createElement('li');
        li.className = 'setlist-item';
        li.innerHTML = `
          <span class="song-num">${idx+1}</span>
          <div class="song-info">
            <span class="song-title">${song.title}</span>
            <span class="song-artist">${song.artist}</span>
            ${leadersText}
          </div>
          <span class="chevron">›</span>
        `;
        li.onclick = () => openSongDetail(song.id);
        ol.appendChild(li);
      });
    }
    function openSongDetail(songId) {
      state.currentSongId = songId;
      const song = state.songs.find(s => s.id === songId);
      document.getElementById('detail-song-title').textContent = song.title;
      renderSongDetail(songId);
      const panel = document.getElementById('setlist-detail');
      panel.classList.remove('hidden');
      requestAnimationFrame(() => requestAnimationFrame(() => { panel.classList.add('slide-open'); }));
    }
    function closeSongDetail() {
      const panel = document.getElementById('setlist-detail');
      panel.classList.remove('slide-open');
      panel.addEventListener('transitionend', () => { panel.classList.add('hidden'); }, { once: true });
    }
    function renderSongDetail(songId) {
      renderSongLeaders(songId);
      renderPerformers(songId);
      renderParts(songId);
      renderNotes(songId);
    }
    function renderSongLeaders(songId) {
      const container = document.getElementById('leaders-row');
      const leaders = state.songLeaders[songId] || ['', '', ''];
      container.innerHTML = '';
      for (let i = 0; i < 3; i++) {
        const wrap = document.createElement('div');
        wrap.className = 'leader-field';
        const label = document.createElement('span');
        label.className = 'leader-label';
        label.textContent = `担当${i+1}`;
        const sel = document.createElement('select');
        sel.className = 'leader-select';
        sel.innerHTML = '<option value="">（未設定）</option>' +
          state.members.map(m => `<option value="${m.name}" ${(leaders[i]||'')=== m.name?'selected':''}>${m.name}</option>`).join('');
        const idx = i;
        sel.onchange = () => window.saveLeader(songId, idx, sel.value);
        wrap.appendChild(label);
        wrap.appendChild(sel);
        container.appendChild(wrap);
      }
    }
    function renderPerformers(songId) {
      const container = document.getElementById('performers-toggle');
      const performers = state.songPerformers[songId]; // undefined = all
      container.innerHTML = '';
      const gens = [...new Set(state.members.map(m => m.generation))].sort((a,b)=>a-b);
      gens.forEach(gen => {
        const genMembers = state.members.filter(m => m.generation === gen);
        const genDiv = document.createElement('div');
        genDiv.className = 'performer-gen-row';
        const genLabel = document.createElement('span');
        genLabel.className = 'performer-gen-label';
        genLabel.textContent = `${gen}期`;
        genDiv.appendChild(genLabel);
        genMembers.forEach(m => {
          const isSelected = !performers || performers.includes(m.id);
          const label = document.createElement('label');
          label.className = 'performer-check' + (isSelected ? ' selected' : '');
          label.innerHTML = `<input type="checkbox" ${isSelected ? 'checked' : ''} onchange="window.togglePerformer(${songId}, ${m.id})" /> ${m.name}`;
          genDiv.appendChild(label);
        });
        container.appendChild(genDiv);
      });
    }
    function renderParts(songId) {
      const tbody = document.getElementById('parts-table-body');
      tbody.innerHTML = '';
      const performers = state.songPerformers[songId];
      const activeMembers = performers
        ? state.members.filter(m => performers.includes(m.id))
        : state.members;
      activeMembers.forEach(m => {
        const key = `${songId}-${m.id}`;
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><span class="gen-badge">${m.generation || ''}期</span>${m.name}</td>
          <td><input type="text" class="parts-input" placeholder="役割を入力" value="${state.songParts[key]||''}" onchange="window.savePart(${songId},${m.id},this.value)" /></td>
        `;
        tbody.appendChild(tr);
      });
    }
    function savePart(songId, memberId, value) {
      state.songParts[`${songId}-${memberId}`] = value;
      saveToFirebase('/songParts', state.songParts);
    }
    function saveLeader(songId, idx, value) {
      if (!state.songLeaders[songId]) state.songLeaders[songId] = ['', '', ''];
      state.songLeaders[songId][idx] = value;
      saveToFirebase('/songLeaders', state.songLeaders);
      renderSetlist();
    }
    function togglePerformer(songId, memberId) {
      let performers = state.songPerformers[songId];
      if (!performers) performers = state.members.map(m => m.id);
      if (performers.includes(memberId)) {
        performers = performers.filter(id => id !== memberId);
      } else {
        performers = [...performers, memberId];
      }
      state.songPerformers[songId] = performers;
      saveToFirebase('/songPerformers', state.songPerformers);
      renderParts(songId);
      renderPerformers(songId);
    }
    function renderNotes(songId) {
      const container = document.getElementById('notes-list');
      container.innerHTML = '';
      (state.songNotes[songId] || []).forEach((note, idx) => {
        const div = document.createElement('div');
        div.className = 'note-item';
        div.innerHTML = `<span class="note-text">${note}</span><button class="btn-icon" onclick="window.deleteNote(${songId},${idx})">✕</button>`;
        container.appendChild(div);
      });
    }
    function addNote() {
      const input = document.getElementById('note-input');
      const text = input.value.trim();
      if (!text) return;
      if (!state.songNotes[state.currentSongId]) state.songNotes[state.currentSongId] = [];
      state.songNotes[state.currentSongId].push(text);
      saveToFirebase('/songNotes', state.songNotes);
      input.value = '';
      renderNotes(state.currentSongId);
    }
    function deleteNote(songId, idx) {
      state.songNotes[songId].splice(idx, 1);
      saveToFirebase('/songNotes', state.songNotes);
      renderNotes(songId);
    }

    // ===== SETTINGS =====
    function renderSettings() { renderMemberSettings(); renderSongSettings(); renderAttendEventSettings(); renderPerformanceDateSetting(); renderAdminPinSetting(); }
    function renderPerformanceDateSetting() {
      const inp = document.getElementById('setting-performance-date');
      if (inp) inp.value = state.performanceDate;
    }
    function renderAdminPinSetting() {
      const inp = document.getElementById('setting-admin-pin');
      if (inp) inp.value = state.adminPin;
    }
    function renderMemberSettings() {
      const container = document.getElementById('member-settings-list');
      container.innerHTML = '';
      state.members.forEach(m => {
        const div = document.createElement('div');
        div.className = 'settings-row';
        div.innerHTML = `
          <input type="text" class="settings-input" value="${m.name}" data-member-id="${m.id}" />
          <input type="number" class="settings-input sm" value="${m.generation || ''}" placeholder="期" data-member-gen="${m.id}" style="flex:0 0 48px;" />
          <label class="local-toggle-label">
            <input type="checkbox" ${m.isLocal?'checked':''} data-local-id="${m.id}" /> 地方
          </label>
          <button class="btn-icon" onclick="window.deleteMember(${m.id})">🗑</button>
        `;
        container.appendChild(div);
      });
    }
    function addMemberRow() {
      // 入力中の値をstateに反映してから追加
      document.querySelectorAll('[data-member-id]').forEach(inp => {
        const m = state.members.find(m => m.id === parseInt(inp.dataset.memberId));
        if (m) m.name = inp.value.trim() || m.name;
      });
      document.querySelectorAll('[data-member-gen]').forEach(inp => {
        const m = state.members.find(m => m.id === parseInt(inp.dataset.memberGen));
        if (m && inp.value) m.generation = parseInt(inp.value) || m.generation;
      });
      document.querySelectorAll('[data-local-id]').forEach(cb => {
        const m = state.members.find(m => m.id === parseInt(cb.dataset.localId));
        if (m) m.isLocal = cb.checked;
      });
      state.members.push({ id: uid(), name: '新メンバー', generation: 1, isLocal: false });
      renderMemberSettings();
    }
    function deleteMember(id) {
      if (state.members.length <= 1) return alert('メンバーが1人以上必要です');
      state.members = state.members.filter(m => m.id !== id);
      saveToFirebase('/members', arrToObj(state.members));
      renderMemberSettings();
    }
    function renderSongSettings() {
      const container = document.getElementById('setlist-settings-list');
      container.innerHTML = '';
      state.songs.forEach((song, idx) => {
        const div = document.createElement('div');
        div.className = 'settings-row';
        div.innerHTML = `
          <div class="sort-btns">
            <button onclick="window.moveSong(${idx},-1)">▲</button>
            <button onclick="window.moveSong(${idx}, 1)">▼</button>
          </div>
          <input type="text" class="settings-input" value="${song.title}" data-song-title="${song.id}" />
          <input type="text" class="settings-input sm" value="${song.artist}" data-song-artist="${song.id}" />
          <button class="btn-icon" onclick="window.deleteSong(${song.id})">🗑</button>
        `;
        container.appendChild(div);
      });
    }
    function moveSong(idx, dir) {
      const ni = idx + dir;
      if (ni < 0 || ni >= state.songs.length) return;
      [state.songs[idx], state.songs[ni]] = [state.songs[ni], state.songs[idx]];
      renderSongSettings();
    }
    function addSongRow() {
      // 入力中の値をstateに反映してから追加
      document.querySelectorAll('[data-song-title]').forEach(inp => {
        const s = state.songs.find(s => s.id === parseInt(inp.dataset.songTitle));
        if (s) s.title = inp.value.trim() || s.title;
      });
      document.querySelectorAll('[data-song-artist]').forEach(inp => {
        const s = state.songs.find(s => s.id === parseInt(inp.dataset.songArtist));
        if (s) s.artist = inp.value.trim() || s.artist;
      });
      state.songs.push({ id: uid(), title: '新しい曲', artist: 'アーティスト', section: '' });
      renderSongSettings();
    }
    function deleteSong(id) {
      if (state.songs.length <= 1) return alert('曲が1曲以上必要です');
      state.songs = state.songs.filter(s => s.id !== id);
      saveToFirebase('/songs', arrToObj(state.songs));
      renderSongSettings();
    }
    function renderAttendEventSettings() {
      const container = document.getElementById('attend-settings-list');
      container.innerHTML = '';
      state.attendEvents.forEach(ev => {
        const div = document.createElement('div');
        div.className = 'settings-row';
        div.innerHTML = `
          <input type="text" class="settings-input" value="${ev.name}" data-attend-name="${ev.id}" />
          <input type="text" class="settings-input sm" value="${ev.date}" data-attend-date="${ev.id}" />
          <button class="btn-icon" onclick="window.deleteAttendEvent(${ev.id})">🗑</button>
        `;
        container.appendChild(div);
      });
    }
    function addAttendEventRow() {
      state.attendEvents.push({ id: uid(), name: '新イベント', date: '日時未定' });
      renderAttendEventSettings();
    }
    function deleteAttendEvent(id) {
      if (state.attendEvents.length <= 1) return alert('イベントが1つ以上必要です');
      state.attendEvents = state.attendEvents.filter(e => e.id !== id);
      if (state.currentAttendEvent === id) state.currentAttendEvent = state.attendEvents[0].id;
      renderAttendEventSettings();
    }
    function applySettings() {
      document.querySelectorAll('[data-member-id]').forEach(inp => {
        const m = state.members.find(m => m.id === parseInt(inp.dataset.memberId));
        if (m) m.name = inp.value.trim() || m.name;
      });
      document.querySelectorAll('[data-member-gen]').forEach(inp => {
        const m = state.members.find(m => m.id === parseInt(inp.dataset.memberGen));
        if (m) m.generation = parseInt(inp.value) || m.generation;
      });
      document.querySelectorAll('[data-local-id]').forEach(cb => {
        const m = state.members.find(m => m.id === parseInt(cb.dataset.localId));
        if (m) m.isLocal = cb.checked;
      });
      document.querySelectorAll('[data-song-title]').forEach(inp => {
        const s = state.songs.find(s => s.id === parseInt(inp.dataset.songTitle));
        if (s) s.title = inp.value.trim() || s.title;
      });
      document.querySelectorAll('[data-song-artist]').forEach(inp => {
        const s = state.songs.find(s => s.id === parseInt(inp.dataset.songArtist));
        if (s) s.artist = inp.value.trim() || s.artist;
      });
      document.querySelectorAll('[data-attend-name]').forEach(inp => {
        const e = state.attendEvents.find(e => e.id === parseInt(inp.dataset.attendName));
        if (e) e.name = inp.value.trim() || e.name;
      });
      document.querySelectorAll('[data-attend-date]').forEach(inp => {
        const e = state.attendEvents.find(e => e.id === parseInt(inp.dataset.attendDate));
        if (e) e.date = inp.value.trim() || e.date;
      });
      const pdInp = document.getElementById('setting-performance-date');
      if (pdInp && pdInp.value) { state.performanceDate = pdInp.value; startCountdown(); }
      const apInp = document.getElementById('setting-admin-pin');
      if (apInp && apInp.value.trim()) { state.adminPin = apInp.value.trim(); }
      // Firebaseに全データを保存
      saveAllToFirebase();
      renderCalendar(); renderEventList(); renderTasks(); renderTaskChips();
      renderNews(); renderAttendEventTabs(); renderAttendance(); renderSetlist(); renderSettings();
      alert('変更を適用しました ✓');
    }

    // ===== FIREBASE =====
    function arrToObj(arr) {
      const obj = {};
      arr.forEach(item => { obj[String(item.id)] = item; });
      return obj;
    }

    function saveToFirebase(path, data) {
      if (!db) return;
      set(ref(db, path), data);
    }

    function saveAllToFirebase() {
      set(ref(db, '/'), {
        attendance:      state.attendance,
        attendUpdatedAt: state.attendUpdatedAt,
        memos:           state.memos,
        lateTime:        state.lateTime,
        songParts:       state.songParts,
        songNotes:       state.songNotes,
        songLeaders:     state.songLeaders,
        songPerformers:  state.songPerformers,
        events:          arrToObj(state.events),
        tasks:           arrToObj(state.tasks),
        news:            arrToObj(state.news),
        members:         arrToObj(state.members),
        songs:           arrToObj(state.songs),
        attendEvents:    arrToObj(state.attendEvents),
        performanceDate: state.performanceDate,
        adminPin:        state.adminPin,
      });
    }

    if (!db) return; // SSR環境では実行しない
    const dbRef = ref(db, '/');
    const unsubscribe = onValue(dbRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        // 初回：デフォルトデータをFirebaseに書き込む
        saveAllToFirebase();
        startCountdown();
        applyAdminMode();
        return;
      }
      // Firebaseのデータでstateを更新
      if (data.attendance)      state.attendance      = data.attendance;
      if (data.attendUpdatedAt) state.attendUpdatedAt = data.attendUpdatedAt;
      if (data.memos)           state.memos           = data.memos;
      if (data.songParts)       state.songParts       = data.songParts;
      if (data.songNotes) {
        state.songNotes = {};
        Object.entries(data.songNotes).forEach(([sid, notesObj]) => {
          state.songNotes[Number(sid)] = Array.isArray(notesObj) ? notesObj : Object.values(notesObj);
        });
      }
      if (data.songLeaders) {
        state.songLeaders = {};
        Object.entries(data.songLeaders).forEach(([sid, val]) => {
          state.songLeaders[Number(sid)] = Array.isArray(val) ? val : Object.values(val);
        });
      }
      if (data.songPerformers) {
        state.songPerformers = {};
        Object.entries(data.songPerformers).forEach(([sid, val]) => {
          state.songPerformers[Number(sid)] = Array.isArray(val) ? val : Object.values(val);
        });
      }
      if (data.lateTime)        state.lateTime        = data.lateTime;

      // ===== スプレッドシートのセトリデータをシード =====
      const SEED_LEADERS = {
        1:  ['みかめろ','ゆいまる',''],  2:  ['おりざ','',''],
        3:  ['みかめろ','ゆいまる',''],  4:  ['りんりん','',''],
        5:  ['あっきぃ','',''],          6:  ['りんりん','',''],
        7:  ['りーな','',''],            8:  ['りーな','',''],
        9:  ['あっきぃ','',''],          10: ['あっきぃ','',''],
        11: ['みかめろ','',''],          12: ['おりざ','',''],
        15: ['あいら','みづき',''],      17: ['みかめろ','',''],
        19: ['あっきぃ','',''],          20: ['ゆりまる','',''],
        21: ['ゆいまる','みかめろ',''],
      };
      // 確定メンバー（スプレッドシートの「確定メンバー」列）
      // メンバーID: 1:りーな 2:ゆりまる 3:さわ 4:みかめろ 5:まり 6:みさき
      //             7:あっきぃ 8:もえ 9:みく 10:あや 11:おりざ 12:にゃん
      //             13:りんりん 14:さな 15:カナメ 16:やなぎ 17:ほの
      //             18:ゆいまる 19:すずめ 20:あいら 21:みづき 22:みゅう
      const SEED_PERFORMERS = {
        2:  [11,1,5,6,7,8,14],          // 超めでたいソング
        4:  [13,6,20,21,22],            // 倍々FIGHT!
        5:  [7,1,6,4,13,12,11,15,18,19],// 盛れ!ミ・アモーレ
        6:  [13,4,8,17,14,15],          // SHOUT
        7:  [1,2,5,6,7,8,11,12,21,22],  // ガールズルール
        8:  [1,2,5,6,4,12],             // Cheeky Dreamer
        10: [7,4,9,13,20],              // 僕らはここにいる
        11: [4,2,1,5,8,9,11,15,14,12],  // サヨナラの意味
        17: [4,7,13,15,20,22],          // A INNOCENCE
        19: [7,1,2,4,11,15,14,12,18,21],// 名残り桜
        20: [2,1,5,4,7,9,14,16,12,18,22],// YOZORA
      };
      let seeded = false;
      Object.entries(SEED_LEADERS).forEach(([id, leaders]) => {
        const sid = Number(id);
        if (!state.songLeaders[sid] || !state.songLeaders[sid].some(l => l)) {
          state.songLeaders[sid] = leaders; seeded = true;
        }
      });
      Object.entries(SEED_PERFORMERS).forEach(([id, performers]) => {
        const sid = Number(id);
        if (!state.songPerformers[sid] || !state.songPerformers[sid].length) {
          state.songPerformers[sid] = performers; seeded = true;
        }
      });
      if (seeded) {
        saveToFirebase('/songLeaders',    state.songLeaders);
        saveToFirebase('/songPerformers', state.songPerformers);
      }

      // 新メンバー（8〜9期）が未登録なら追加
      const NEW_MEMBERS = [
        { id: 23, name: 'ゆき',   generation: 8, isLocal: false },
        { id: 24, name: 'めん',   generation: 9, isLocal: false },
        { id: 25, name: 'みあん', generation: 9, isLocal: false },
        { id: 26, name: 'りな',   generation: 9, isLocal: false },
        { id: 27, name: 'うた',   generation: 9, isLocal: false },
      ];
      const existingIds = new Set(state.members.map(m => m.id));
      let membersUpdated = false;
      NEW_MEMBERS.forEach(m => {
        if (!existingIds.has(m.id)) { state.members.push(m); membersUpdated = true; }
      });
      if (membersUpdated) {
        state.members.sort((a, b) => a.id - b.id);
        saveToFirebase('/members', arrToObj(state.members));
      }

      // 新メンバーを各曲のパフォーマーに追加（不足分のみ）
      const PERFORMER_ADDITIONS = {
        4:  [25, 26],   // 倍々FIGHT!: みあん・りな
        5:  [26],       // 盛れ!ミ・アモーレ: りな
        6:  [27],       // SHOUT: うた
        7:  [23],       // ガールズルール: ゆき
        11: [27],       // サヨナラの意味: うた
        19: [23, 24],   // 名残り桜: ゆき・めん
      };
      let perfUpdated = false;
      Object.entries(PERFORMER_ADDITIONS).forEach(([id, mids]) => {
        const sid = Number(id);
        if (state.songPerformers[sid]) {
          mids.forEach(mid => {
            if (!state.songPerformers[sid].includes(mid)) {
              state.songPerformers[sid].push(mid); perfUpdated = true;
            }
          });
        }
      });
      if (perfUpdated) saveToFirebase('/songPerformers', state.songPerformers);

      if (data.events)          state.events          = Object.values(data.events).map(e => ({ time: '', timeEnd: '', place: '', memo: '', ...e }));
      if (data.tasks)           state.tasks           = Object.values(data.tasks).map(t => ({ dueDate: '', ...t }));
      if (data.news)            state.news            = Object.values(data.news).map(n => ({ isNew: false, time: '', ...n, createdAt: (n.createdAt != null) ? n.createdAt : (Date.now() - 30*24*60*60*1000) }));
      if (data.members)         state.members         = Object.values(data.members).map(m => ({ generation: 1, ...m }));
      if (data.songs)           state.songs           = Object.values(data.songs).map(s => ({ section: '', ...s }));
      if (data.attendEvents)    state.attendEvents    = Object.values(data.attendEvents);
      if (data.performanceDate) state.performanceDate = data.performanceDate;
      if (data.adminPin)        state.adminPin        = data.adminPin;

      // nextIdをFirebaseの最大IDより大きくする
      const allIds = [
        ...state.events.map(e => e.id),
        ...state.tasks.map(t => t.id),
        ...state.news.map(n => n.id),
        ...state.members.map(m => m.id),
        ...state.songs.map(s => s.id),
        ...state.attendEvents.map(e => e.id),
      ].filter(id => typeof id === 'number');
      if (allIds.length > 0) nextId = Math.max(...allIds) + 1;

      // 画面を再描画
      renderCalendar(); renderEventList();
      renderTaskChips(); renderTasks();
      renderNews();
      renderAttendEventTabs(); renderAttendance();
      renderSetlist();
      renderSettings();
      startCountdown();
      applyAdminMode();
      updateHohoMessage();
    });

    // ===== EXPOSE TO WINDOW =====
    window.switchTab          = switchTab;
    window.openModal          = openModal;
    window.closeModal         = closeModal;
    window.toggleAdmin        = toggleAdmin;
    window.submitPin          = submitPin;
    window.addEvent           = addEvent;
    window.openEditEvent      = openEditEvent;
    window.updateEvent        = updateEvent;
    window.deleteEvent        = deleteEvent;
    window.toggleTask         = toggleTask;
    window.addTask            = addTask;
    window.openEditTask       = openEditTask;
    window.updateTask         = updateTask;
    window.deleteTask         = deleteTask;
    window.toggleAccordion    = toggleAccordion;
    window.addNews            = addNews;
    window.openEditNews       = openEditNews;
    window.updateNews         = updateNews;
    window.deleteNews         = deleteNews;
    window.toggleRecentNews   = toggleRecentNews;
    window.setAttendance      = setAttendance;
    window.setMyMember        = setMyMember;
    window.saveMemo           = saveMemo;
    window.saveLateTime       = saveLateTime;
    window.openSongDetail     = openSongDetail;
    window.closeSongDetail    = closeSongDetail;
    window.savePart           = savePart;
    window.saveLeader         = saveLeader;
    window.togglePerformer    = togglePerformer;
    window.addNote            = addNote;
    window.deleteNote         = deleteNote;
    window.applySettings      = applySettings;
    window.addMemberRow       = addMemberRow;
    window.deleteMember       = deleteMember;
    window.moveSong           = moveSong;
    window.addSongRow         = addSongRow;
    window.deleteSong         = deleteSong;
    window.addAttendEventRow  = addAttendEventRow;
    window.deleteAttendEvent  = deleteAttendEvent;

    // お知らせ経過時間を60秒ごとに更新
    newsTimeInterval = setInterval(() => {
      renderNews();
      renderRecentNewsInCalendar();
    }, 60000);

    // ===== INIT =====
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    document.getElementById('cal-prev').addEventListener('click', () => {
      const y = state.currentMonth.getFullYear(), m = state.currentMonth.getMonth();
      state.currentMonth = new Date(y, m - 1, 1);
      state.selectedDate = null;
      renderCalendar(); renderEventList();
    });
    document.getElementById('cal-next').addEventListener('click', () => {
      const y = state.currentMonth.getFullYear(), m = state.currentMonth.getMonth();
      state.currentMonth = new Date(y, m + 1, 1);
      state.selectedDate = null;
      renderCalendar(); renderEventList();
    });

    renderCalendar();
    renderEventList();
    renderTaskChips();
    renderTasks();
    renderNews();
    renderAttendEventTabs();
    renderAttendance();
    renderSetlist();
    renderSettings();
    startCountdown();
    applyAdminMode();
    updateHohoMessage();

    // ハッシュからタブを復元
    const savedTab = location.hash.slice(1);
    if (VALID_TABS.includes(savedTab)) switchTab(savedTab);

    // ===== CLEANUP =====
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
      if (countdownInterval) clearInterval(countdownInterval);
      if (newsTimeInterval) clearInterval(newsTimeInterval);
      const fns = [
        'switchTab','openModal','closeModal','toggleAdmin','submitPin',
        'addEvent','openEditEvent','updateEvent','deleteEvent',
        'toggleTask','addTask','openEditTask','updateTask','deleteTask',
        'toggleAccordion','addNews','openEditNews','updateNews','deleteNews','toggleRecentNews',
        'setAttendance','saveMemo','saveLateTime','openSongDetail','closeSongDetail','savePart',
        'addNote','deleteNote','applySettings','addMemberRow','deleteMember',
        'moveSong','addSongRow','deleteSong','addAttendEventRow','deleteAttendEvent',
        'saveLeader','togglePerformer',
      ];
      fns.forEach(fn => { delete window[fn]; });
    };
  }, []);

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
        <title>それからふくらむ可愛い頬を、- 10周年公演</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      </Head>

      <div id="app">
        {/* HEADER + COUNTDOWN 統合 */}
        <div className="top-section">
          <header id="app-header">
            <span className="star-deco">✦</span>
            <span className="star-deco">★</span>
            <span className="star-deco">✦</span>
            <span className="star-deco">★</span>
            <div className="header-title">それからふくらむ可愛い頬を、</div>
            <div className="header-subtitle">✿ 10周年公演 ✿</div>
          </header>
          <div className="countdown-section">
            <div className="countdown-title" id="countdown-label">公演まであと</div>
            <div className="countdown-timer" id="countdown-timer">
              <div className="countdown-unit">
                <span className="countdown-num" id="cd-days">0</span>
                <small>日</small>
              </div>
              <span className="countdown-sep">:</span>
              <div className="countdown-unit">
                <span className="countdown-num" id="cd-hours">00</span>
                <small>時間</small>
              </div>
              <span className="countdown-sep">:</span>
              <div className="countdown-unit">
                <span className="countdown-num" id="cd-mins">00</span>
                <small>分</small>
              </div>
              <span className="countdown-sep">:</span>
              <div className="countdown-unit">
                <span className="countdown-num" id="cd-secs">00</span>
                <small>秒</small>
              </div>
            </div>
            <div className="countdown-message" id="countdown-message" style={{display:'none'}}></div>
            <div className="countdown-date" id="countdown-date"></div>
          </div>
        </div>

        {/* TAB NAV */}
        <nav id="tab-nav">
          <button className="tab-btn active" data-tab="schedule">📅 スケジュール</button>
          <button className="tab-btn" data-tab="tasks">✅ タスク</button>
          <button className="tab-btn" data-tab="news">📢 お知らせ</button>
          <button className="tab-btn" data-tab="attend">🌸 出欠</button>
          <button className="tab-btn" data-tab="setlist">🎵 セトリ</button>
          <button className="tab-btn" data-tab="settings">⚙️ 設定</button>
        </nav>

        {/* MAIN CONTENT */}
        <main id="tab-content">

          {/* TAB: SCHEDULE */}
          <section id="tab-schedule" className="tab-panel active">
            <div id="recent-news-area" className="recent-news-area"></div>
            <div className="card">
              <div className="calendar-header">
                <button id="cal-prev">◀</button>
                <span id="cal-month-label">2025年11月</span>
                <button id="cal-next">▶</button>
              </div>
              <table className="calendar-grid">
                <thead>
                  <tr><th>日</th><th>月</th><th>火</th><th>水</th><th>木</th><th>金</th><th>土</th></tr>
                </thead>
                <tbody id="cal-body"></tbody>
              </table>
              {/* Selected date events */}
              <div className="date-events hidden" id="date-events-panel">
                <div className="date-events-label" id="date-events-label"></div>
                <div id="date-events-list"></div>
              </div>
            </div>
            <div className="card">
              <div className="card-title-row">
                <span className="card-title">今後の予定</span>
                <button className="btn-primary admin-only" onClick={() => window.openModal('event-add')}>＋ 追加</button>
              </div>
              <ul className="event-list" id="event-list"></ul>
            </div>
          </section>

          {/* TAB: TASKS */}
          <section id="tab-tasks" className="tab-panel">
            <div className="chip-scroll-wrapper">
              <div className="chip-row" id="task-filter-chips"></div>
            </div>
            <div className="card">
              <div className="card-title">未完了タスク<span className="count-badge" id="incomplete-count">0</span></div>
              <ul className="task-list" id="task-list-incomplete"></ul>
              <button className="btn-primary btn-block mt8 admin-only" onClick={() => window.openModal('task-add')}>＋ タスクを追加</button>
            </div>
            <div className="card card-muted">
              <div className="card-title">完了済み<span className="count-badge" id="complete-count">0</span></div>
              <ul className="task-list" id="task-list-complete"></ul>
            </div>
          </section>

          {/* TAB: NEWS */}
          <section id="tab-news" className="tab-panel">
            <div className="card">
              <div className="card-title-row">
                <span className="card-title">お知らせ一覧</span>
                <button className="btn-primary admin-only" onClick={() => window.openModal('news-add')}>＋ 投稿</button>
              </div>
              <div className="news-list" id="news-list"></div>
            </div>
          </section>

          {/* TAB: ATTEND */}
          <section id="tab-attend" className="tab-panel">
            <div className="card">
              <div className="card-title">イベント選択</div>
              <div className="inner-tab-row" id="attend-event-tabs"></div>
            </div>
            <div className="card">
              <div className="my-member-selector">
                <span className="my-member-label">自分の名前：</span>
                <select id="my-member-select" onChange={(e) => window.setMyMember(e.target.value)}>
                  <option value="">-- 選択してください --</option>
                </select>
              </div>
            </div>
            <div className="card">
              <div className="attend-summary">
                <span>○ <strong id="count-present">0</strong></span>
                <span>△ <strong id="count-maybe">0</strong></span>
                <span>✕ <strong id="count-absent">0</strong></span>
                <span>遅/早 <strong id="count-late">0</strong></span>
              </div>
              <div className="attend-member-list" id="attend-member-list"></div>
            </div>
            <div className="card">
              <div id="practice-analysis"></div>
            </div>
          </section>

          {/* TAB: SETLIST */}
          <section id="tab-setlist" className="tab-panel">
            <div className="card">
              <div className="card-title">セットリスト</div>
              <ol className="setlist-list" id="setlist-list"></ol>
            </div>
          </section>

          {/* TAB: SETTINGS */}
          <section id="tab-settings" className="tab-panel">
            <div className="card admin-login-card">
              <button id="admin-btn" className="admin-lock-btn-full" onClick={() => window.toggleAdmin()}>🔓 管理者ログイン</button>
            </div>
            <div className="admin-only">
            <div className="card">
              <div className="card-title">公演日設定</div>
              <div className="modal-field">
                <label>公演日</label>
                <input type="date" id="setting-performance-date" />
              </div>
            </div>
            <div className="card">
              <div className="card-title">管理者PIN設定</div>
              <div className="modal-field">
                <label>PIN（4桁推奨）</label>
                <input type="text" id="setting-admin-pin" placeholder="例: 1010" />
              </div>
            </div>
            <div className="card">
              <div className="card-title">メンバー管理</div>
              <div className="settings-list" id="member-settings-list"></div>
              <button className="btn-secondary" onClick={() => window.addMemberRow()}>＋ メンバーを追加</button>
            </div>
            <div className="card">
              <div className="card-title">セトリ管理</div>
              <div className="settings-list" id="setlist-settings-list"></div>
              <button className="btn-secondary" onClick={() => window.addSongRow()}>＋ 曲を追加</button>
            </div>
            <div className="card">
              <div className="card-title">出欠イベント管理</div>
              <div className="settings-list" id="attend-settings-list"></div>
              <button className="btn-secondary" onClick={() => window.addAttendEventRow()}>＋ イベントを追加</button>
            </div>
            <button className="btn-primary btn-apply" onClick={() => window.applySettings()}>変更を適用する</button>
            </div>{/* end admin-only */}
          </section>

        </main>
      </div>

      {/* HOHO MASCOT */}
      <div className="hoho-mascot" id="hoho-mascot">
        <div className="hoho-bubble">
          <span id="hoho-message">みんなのこと応援してるよ！✿</span>
        </div>
        <img src="/hoho.png" alt="ほほちゃん" className="hoho-img" />
      </div>

      {/* SETLIST DETAIL SLIDE PANEL */}
      <div id="setlist-detail" className="hidden">
        <div className="slide-header">
          <button id="btn-back-setlist" onClick={() => window.closeSongDetail()}>‹ 戻る</button>
          <span id="detail-song-title"></span>
        </div>
        <div className="card">
          <div className="card-title">曲責任者</div>
          <div id="leaders-row" className="leaders-row"></div>
        </div>
        <div className="card">
          <div className="card-title">連絡事項</div>
          <div className="notes-list" id="notes-list"></div>
          <div className="note-add-row">
            <input type="text" id="note-input" placeholder="連絡事項を追加..." />
            <button className="btn-primary" onClick={() => window.addNote()}>追加</button>
          </div>
        </div>
        <div className="card">
          <div className="card-title">パート・フォーメーション</div>
          <table className="parts-table">
            <thead><tr><th>メンバー</th><th>役割</th></tr></thead>
            <tbody id="parts-table-body"></tbody>
          </table>
        </div>
        <div className="card">
          <div className="card-title">出演メンバー選択</div>
          <div id="performers-toggle" className="performers-toggle"></div>
        </div>
      </div>

      {/* MODAL: PIN */}
      <div id="overlay-pin" className="modal-overlay hidden">
        <div className="modal-backdrop" onClick={() => window.closeModal('pin')}></div>
        <div className="modal-box">
          <div className="modal-header">
            <span className="modal-title">🔒 管理者ログイン</span>
            <button className="modal-close" onClick={() => window.closeModal('pin')}>✕</button>
          </div>
          <div className="modal-field">
            <label>PIN を入力</label>
            <input type="password" id="pin-input" placeholder="PIN" onKeyDown={(e) => { if (e.key === 'Enter') window.submitPin(); }} />
          </div>
          <div className="modal-footer">
            <button className="btn-secondary" onClick={() => window.closeModal('pin')}>キャンセル</button>
            <button className="btn-primary" onClick={() => window.submitPin()}>ログイン</button>
          </div>
        </div>
      </div>

      {/* MODAL: TASK ADD */}
      <div id="overlay-task-add" className="modal-overlay hidden">
        <div className="modal-backdrop" onClick={() => window.closeModal('task-add')}></div>
        <div className="modal-box">
          <div className="modal-header">
            <span className="modal-title">タスクを追加</span>
            <button className="modal-close" onClick={() => window.closeModal('task-add')}>✕</button>
          </div>
          <div className="modal-field">
            <label>タスク名</label>
            <input type="text" id="new-task-name" placeholder="タスク名を入力" />
          </div>
          <div className="modal-field">
            <label>カテゴリ</label>
            <select id="new-task-cat">
              <option>sns</option><option>会場</option><option>衣装</option>
              <option>クリエイティブ</option><option>現役連絡</option><option>ロゴ</option>
              <option>kv</option><option>演出</option><option>音源</option>
              <option>チケット</option><option>グッズ</option><option>お金</option>
              <option>スタジオ予約</option><option>スケジュール</option>
            </select>
          </div>
          <div className="modal-field">
            <label>期日（任意）</label>
            <input type="date" id="new-task-due" />
          </div>
          <div className="modal-footer">
            <button className="btn-secondary" onClick={() => window.closeModal('task-add')}>キャンセル</button>
            <button className="btn-primary" onClick={() => window.addTask()}>追加</button>
          </div>
        </div>
      </div>

      {/* MODAL: TASK EDIT */}
      <div id="overlay-task-edit" className="modal-overlay hidden">
        <div className="modal-backdrop" onClick={() => window.closeModal('task-edit')}></div>
        <div className="modal-box">
          <div className="modal-header">
            <span className="modal-title">タスクを編集</span>
            <button className="modal-close" onClick={() => window.closeModal('task-edit')}>✕</button>
          </div>
          <input type="hidden" id="edit-task-id" />
          <div className="modal-field">
            <label>タスク名</label>
            <input type="text" id="edit-task-name" placeholder="タスク名を入力" />
          </div>
          <div className="modal-field">
            <label>カテゴリ</label>
            <select id="edit-task-cat">
              <option>sns</option><option>会場</option><option>衣装</option>
              <option>クリエイティブ</option><option>現役連絡</option><option>ロゴ</option>
              <option>kv</option><option>演出</option><option>音源</option>
              <option>チケット</option><option>グッズ</option><option>お金</option>
              <option>スタジオ予約</option><option>スケジュール</option>
            </select>
          </div>
          <div className="modal-field">
            <label>期日（任意）</label>
            <input type="date" id="edit-task-due" />
          </div>
          <div className="modal-footer">
            <button className="btn-danger" onClick={() => window.deleteTask(parseInt(document.getElementById('edit-task-id').value))}>🗑 削除</button>
            <button className="btn-secondary" onClick={() => window.closeModal('task-edit')}>キャンセル</button>
            <button className="btn-primary" onClick={() => window.updateTask()}>保存</button>
          </div>
        </div>
      </div>

      {/* MODAL: NEWS ADD */}
      <div id="overlay-news-add" className="modal-overlay hidden">
        <div className="modal-backdrop" onClick={() => window.closeModal('news-add')}></div>
        <div className="modal-box">
          <div className="modal-header">
            <span className="modal-title">お知らせを投稿</span>
            <button className="modal-close" onClick={() => window.closeModal('news-add')}>✕</button>
          </div>
          <div className="modal-field">
            <label>タイトル</label>
            <input type="text" id="new-news-title" placeholder="タイトルを入力" />
          </div>
          <div className="modal-field">
            <label>詳細</label>
            <textarea id="new-news-body" placeholder="本文を入力"></textarea>
          </div>
          <div className="modal-field">
            <label>カテゴリ</label>
            <select id="new-news-cat">
              <option>全体</option><option>衣装</option><option>練習</option>
              <option>会場</option><option>グッズ</option>
            </select>
          </div>
          <div className="modal-footer">
            <button className="btn-secondary" onClick={() => window.closeModal('news-add')}>キャンセル</button>
            <button className="btn-primary" onClick={() => window.addNews()}>投稿</button>
          </div>
        </div>
      </div>

      {/* MODAL: NEWS EDIT */}
      <div id="overlay-news-edit" className="modal-overlay hidden">
        <div className="modal-backdrop" onClick={() => window.closeModal('news-edit')}></div>
        <div className="modal-box">
          <div className="modal-header">
            <span className="modal-title">お知らせを編集</span>
            <button className="modal-close" onClick={() => window.closeModal('news-edit')}>✕</button>
          </div>
          <input type="hidden" id="edit-news-id" />
          <div className="modal-field">
            <label>タイトル</label>
            <input type="text" id="edit-news-title" placeholder="タイトルを入力" />
          </div>
          <div className="modal-field">
            <label>詳細</label>
            <textarea id="edit-news-body" placeholder="本文を入力"></textarea>
          </div>
          <div className="modal-field">
            <label>カテゴリ</label>
            <select id="edit-news-cat">
              <option>全体</option><option>衣装</option><option>練習</option>
              <option>会場</option><option>グッズ</option>
            </select>
          </div>
          <div className="modal-footer">
            <button className="btn-danger" onClick={() => window.deleteNews(parseInt(document.getElementById('edit-news-id').value))}>🗑 削除</button>
            <button className="btn-secondary" onClick={() => window.closeModal('news-edit')}>キャンセル</button>
            <button className="btn-primary" onClick={() => window.updateNews()}>保存</button>
          </div>
        </div>
      </div>

      {/* MODAL: EVENT ADD */}
      <div id="overlay-event-add" className="modal-overlay hidden">
        <div className="modal-backdrop" onClick={() => window.closeModal('event-add')}></div>
        <div className="modal-box">
          <div className="modal-header">
            <span className="modal-title">イベントを追加</span>
            <button className="modal-close" onClick={() => window.closeModal('event-add')}>✕</button>
          </div>
          <div className="modal-field">
            <label>イベント名</label>
            <input type="text" id="new-event-name" placeholder="例：通し練習" />
          </div>
          <div className="modal-field">
            <label>日付</label>
            <input type="date" id="new-event-date" />
          </div>
          <div className="modal-field modal-field-row">
            <div>
              <label>開始時刻（任意）</label>
              <input type="time" id="new-event-time" />
            </div>
            <div>
              <label>終了時刻（任意）</label>
              <input type="time" id="new-event-time-end" />
            </div>
          </div>
          <div className="modal-field">
            <label>場所（任意）</label>
            <input type="text" id="new-event-place" placeholder="例：〇〇スタジオ" />
          </div>
          <div className="modal-field">
            <label>メモ（任意）</label>
            <textarea id="new-event-memo" placeholder="メモを入力"></textarea>
          </div>
          <div className="modal-footer">
            <button className="btn-secondary" onClick={() => window.closeModal('event-add')}>キャンセル</button>
            <button className="btn-primary" onClick={() => window.addEvent()}>追加</button>
          </div>
        </div>
      </div>

      {/* MODAL: EVENT EDIT */}
      <div id="overlay-event-edit" className="modal-overlay hidden">
        <div className="modal-backdrop" onClick={() => window.closeModal('event-edit')}></div>
        <div className="modal-box">
          <div className="modal-header">
            <span className="modal-title">予定を編集</span>
            <button className="modal-close" onClick={() => window.closeModal('event-edit')}>✕</button>
          </div>
          <input type="hidden" id="edit-event-id" />
          <div className="modal-field">
            <label>イベント名</label>
            <input type="text" id="edit-event-name" placeholder="例：通し練習" />
          </div>
          <div className="modal-field">
            <label>日付</label>
            <input type="date" id="edit-event-date" />
          </div>
          <div className="modal-field modal-field-row">
            <div>
              <label>開始時刻（任意）</label>
              <input type="time" id="edit-event-time" />
            </div>
            <div>
              <label>終了時刻（任意）</label>
              <input type="time" id="edit-event-time-end" />
            </div>
          </div>
          <div className="modal-field">
            <label>場所（任意）</label>
            <input type="text" id="edit-event-place" placeholder="例：〇〇スタジオ" />
          </div>
          <div className="modal-field">
            <label>メモ（任意）</label>
            <textarea id="edit-event-memo" placeholder="メモを入力"></textarea>
          </div>
          <div className="modal-footer">
            <button className="btn-secondary" onClick={() => window.closeModal('event-edit')}>キャンセル</button>
            <button className="btn-primary" onClick={() => window.updateEvent()}>保存</button>
          </div>
        </div>
      </div>
    </>
  );
}
