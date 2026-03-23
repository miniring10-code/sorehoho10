import { useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  useEffect(() => {
    // ===== THEME SYSTEM =====
    const THEMES = [
      'theme-kawaii','theme-pastel','theme-y2k','theme-fairy',
      'theme-iceblue','theme-rainy','theme-pearl',
      'theme-rose','theme-sage','theme-midnight'
    ];
    let currentTheme = localStorage.getItem('sorehoho-theme') || 'theme-iceblue';

    function applyTheme(name) {
      THEMES.forEach(t => document.body.classList.remove(t));
      document.body.classList.add(name);
      currentTheme = name;
      localStorage.setItem('sorehoho-theme', name);
      document.querySelectorAll('.theme-card').forEach(card => {
        card.classList.toggle('selected', card.dataset.theme === name);
      });
    }

    function openThemePanel() {
      document.getElementById('theme-panel-overlay').classList.remove('hidden');
      document.querySelectorAll('.theme-card').forEach(card => {
        card.classList.toggle('selected', card.dataset.theme === currentTheme);
      });
    }
    function closeThemePanel() {
      document.getElementById('theme-panel-overlay').classList.add('hidden');
    }

    // ===== STATE =====
    let nextId = 100;
    const uid = () => nextId++;

    const state = {
      currentTab: 'schedule',
      currentMonth: new Date(2025, 10, 1),
      members: [
        { id: 1, name: 'あいか', isLocal: false },
        { id: 2, name: 'なつみ', isLocal: true  },
        { id: 3, name: 'ゆうな', isLocal: false },
        { id: 4, name: 'りな',   isLocal: true  },
        { id: 5, name: 'さな',   isLocal: false },
      ],
      songs: [
        { id: 1, title: 'Supernova',  artist: 'aespa'    },
        { id: 2, title: 'Magnetic',   artist: 'ILLIT'    },
        { id: 3, title: 'Whiplash',   artist: 'aespa'    },
        { id: 4, title: 'How Sweet',  artist: 'NewJeans' },
        { id: 5, title: 'Armageddon', artist: 'aespa'    },
      ],
      events: [
        { id: 1, date: '2025-11-03', name: '振り付け練習' },
        { id: 2, date: '2025-11-08', name: '衣装合わせ'   },
        { id: 3, date: '2025-11-16', name: '通し練習'     },
        { id: 4, date: '2025-11-22', name: 'ゲネプロ'     },
        { id: 5, date: '2025-11-23', name: '★本番公演★'  },
      ],
      tasks: [
        { id: 10, name: '衣装発注確認',           cat: '衣装',       done: false },
        { id: 11, name: 'SNS投稿スケジュール作成', cat: 'sns',        done: false },
        { id: 12, name: 'チケット販売ページ作成',  cat: 'チケット',   done: false },
        { id: 13, name: 'スタジオ予約確認',        cat: 'スタジオ予約', done: true },
      ],
      taskFilter: 'all',
      news: [
        { id: 20, title: '11月スケジュールについて',   cat: '全体', body: '11月のスケジュールを確認してください。練習日程・衣装合わせ・ゲネプロの日程は変更ありません。', time: '2時間前', isNew: true  },
        { id: 21, title: '衣装打ち合わせ日程のご連絡', cat: '衣装', body: '衣装打ち合わせは11月8日（土）に行います。全員参加必須です。',                               time: '1日前',  isNew: true  },
        { id: 22, title: 'グッズ制作について',          cat: 'グッズ', body: 'グッズのデザイン案が完成しました。共有フォルダをご確認ください。',                         time: '3日前',  isNew: false },
      ],
      openNewsId: null,
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
      songParts: {},
      songNotes: {},
      currentSongId: null,
    };

    const TASK_CATS = ['all','sns','会場','衣装','クリエイティブ','現役連絡','ロゴ','kv','演出','音源','チケット','グッズ','お金','スタジオ予約','スケジュール'];

    // ===== TAB =====
    function switchTab(tabId) {
      state.currentTab = tabId;
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      document.getElementById('tab-' + tabId).classList.add('active');
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tabId));
    }

    // ===== MODAL =====
    function openModal(name) { document.getElementById('overlay-' + name).classList.remove('hidden'); }
    function closeModal(name) { document.getElementById('overlay-' + name).classList.add('hidden'); }

    // ===== CALENDAR =====
    function renderCalendar() {
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
          } else {
            td.classList.add('other-month');
          }
          tr.appendChild(td);
        }
        tbody.appendChild(tr);
      }
    }

    function renderEventList() {
      const ul = document.getElementById('event-list');
      ul.innerHTML = '';
      const sorted = [...state.events].sort((a,b) => a.date.localeCompare(b.date));
      sorted.forEach(ev => {
        const li = document.createElement('li');
        li.className = 'event-item';
        const parts = ev.date.split('-');
        const dl = `${parseInt(parts[1])}/${parseInt(parts[2])}`;
        li.innerHTML = `
          <span class="event-date">${dl}</span>
          <span class="event-name">${ev.name}</span>
          <div class="event-actions"><button class="btn-icon" onclick="window.deleteEvent(${ev.id})">🗑</button></div>
        `;
        ul.appendChild(li);
      });
    }

    function addEvent() {
      const name = document.getElementById('new-event-name').value.trim();
      const date = document.getElementById('new-event-date').value;
      if (!name || !date) return alert('イベント名と日付を入力してください');
      state.events.push({ id: uid(), date, name });
      closeModal('event-add');
      document.getElementById('new-event-name').value = '';
      document.getElementById('new-event-date').value = '';
      renderCalendar(); renderEventList();
    }
    function deleteEvent(id) {
      state.events = state.events.filter(e => e.id !== id);
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
    function renderTasks() {
      const filter = state.taskFilter;
      const filtered = filter === 'all' ? state.tasks : state.tasks.filter(t => t.cat === filter);
      const inc = filtered.filter(t => !t.done);
      const com = filtered.filter(t =>  t.done);
      document.getElementById('incomplete-count').textContent = inc.length;
      document.getElementById('complete-count').textContent   = com.length;
      renderTaskList('task-list-incomplete', inc);
      renderTaskList('task-list-complete',   com);
    }
    function renderTaskList(listId, tasks) {
      const ul = document.getElementById(listId);
      ul.innerHTML = '';
      tasks.forEach(t => {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.innerHTML = `
          <button class="task-toggle ${t.done?'done':''}" onclick="window.toggleTask(${t.id})">${t.done?'✓':''}</button>
          <span class="task-name ${t.done?'done':''}">${t.name}</span>
          <span class="task-cat-badge">${t.cat}</span>
        `;
        ul.appendChild(li);
      });
    }
    function toggleTask(id) {
      const t = state.tasks.find(t => t.id === id);
      if (t) { t.done = !t.done; renderTasks(); }
    }
    function addTask() {
      const name = document.getElementById('new-task-name').value.trim();
      const cat  = document.getElementById('new-task-cat').value;
      if (!name) return alert('タスク名を入力してください');
      state.tasks.push({ id: uid(), name, cat, done: false });
      closeModal('task-add');
      document.getElementById('new-task-name').value = '';
      renderTasks();
    }

    // ===== NEWS =====
    function renderNews() {
      const container = document.getElementById('news-list');
      container.innerHTML = '';
      state.news.forEach(post => {
        const div = document.createElement('div');
        div.className = 'news-item';
        div.dataset.id = post.id;
        const isOpen = state.openNewsId === post.id;
        div.innerHTML = `
          <div class="news-header" onclick="window.toggleAccordion(${post.id})">
            <div class="news-meta">
              <span class="news-cat-badge">${post.cat}</span>
              ${post.isNew ? '<span class="news-new-badge">NEW</span>' : ''}
            </div>
            <div class="news-main">
              <div class="news-title">${post.title}</div>
              <div class="news-time">${post.time}</div>
            </div>
            <span class="accordion-arrow ${isOpen?'open':''}">▼</span>
          </div>
          <div class="news-body ${isOpen?'':'hidden'}">${post.body}</div>
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
      state.news.unshift({ id: uid(), title, body, cat, time: 'たった今', isNew: true });
      closeModal('news-add');
      document.getElementById('new-news-title').value = '';
      document.getElementById('new-news-body').value = '';
      renderNews();
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
      let counts = { present:0, maybe:0, absent:0 };
      state.members.forEach(m => { counts[state.attendance[`${eid}-${m.id}`] || 'absent']++; });
      document.getElementById('count-present').textContent = counts.present;
      document.getElementById('count-maybe').textContent   = counts.maybe;
      document.getElementById('count-absent').textContent  = counts.absent;
      const container = document.getElementById('attend-member-list');
      container.innerHTML = '';
      state.members.forEach(m => {
        const cur = state.attendance[`${eid}-${m.id}`] || 'absent';
        const div = document.createElement('div');
        div.className = 'attend-row';
        div.innerHTML = `
          <div class="attend-row-top">
            <span class="member-name">${m.name}${m.isLocal ? '<span class="local-badge">地方</span>' : ''}</span>
            <div class="attend-btns">
              <button class="attend-btn ${cur==='present'?'active-present':''}" onclick="window.setAttendance(${m.id},'present')">○</button>
              <button class="attend-btn ${cur==='maybe'  ?'active-maybe'  :''}" onclick="window.setAttendance(${m.id},'maybe')">△</button>
              <button class="attend-btn ${cur==='absent' ?'active-absent' :''}" onclick="window.setAttendance(${m.id},'absent')">✕</button>
            </div>
          </div>
          ${m.isLocal ? `<textarea class="memo-field" placeholder="上京メモ（新幹線・宿泊など）" onchange="window.saveMemo(${m.id},this.value)">${state.memos[eid+'-'+m.id]||''}</textarea>` : ''}
        `;
        container.appendChild(div);
      });
    }
    function setAttendance(memberId, value) {
      state.attendance[`${state.currentAttendEvent}-${memberId}`] = value;
      renderAttendance();
    }
    function saveMemo(memberId, value) {
      state.memos[`${state.currentAttendEvent}-${memberId}`] = value;
    }

    // ===== SETLIST =====
    function renderSetlist() {
      const ol = document.getElementById('setlist-list');
      ol.innerHTML = '';
      state.songs.forEach((song, idx) => {
        const li = document.createElement('li');
        li.className = 'setlist-item';
        li.innerHTML = `
          <span class="song-num">${idx+1}</span>
          <div class="song-info">
            <span class="song-title">${song.title}</span>
            <span class="song-artist">${song.artist}</span>
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
      const tbody = document.getElementById('parts-table-body');
      tbody.innerHTML = '';
      state.members.forEach(m => {
        const key = `${songId}-${m.id}`;
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${m.name}</td>
          <td><input type="text" class="parts-input" placeholder="役割を入力" value="${state.songParts[key]||''}" onchange="window.savePart(${songId},${m.id},this.value)" /></td>
        `;
        tbody.appendChild(tr);
      });
      renderNotes(songId);
    }
    function savePart(songId, memberId, value) { state.songParts[`${songId}-${memberId}`] = value; }
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
      input.value = '';
      renderNotes(state.currentSongId);
    }
    function deleteNote(songId, idx) {
      state.songNotes[songId].splice(idx, 1);
      renderNotes(songId);
    }

    // ===== SETTINGS =====
    function renderSettings() { renderMemberSettings(); renderSongSettings(); renderAttendEventSettings(); }
    function renderMemberSettings() {
      const container = document.getElementById('member-settings-list');
      container.innerHTML = '';
      state.members.forEach(m => {
        const div = document.createElement('div');
        div.className = 'settings-row';
        div.innerHTML = `
          <input type="text" class="settings-input" value="${m.name}" data-member-id="${m.id}" />
          <label class="local-toggle-label">
            <input type="checkbox" ${m.isLocal?'checked':''} data-local-id="${m.id}" /> 地方
          </label>
          <button class="btn-icon" onclick="window.deleteMember(${m.id})">🗑</button>
        `;
        container.appendChild(div);
      });
    }
    function addMemberRow() {
      state.members.push({ id: uid(), name: '新メンバー', isLocal: false });
      renderMemberSettings();
    }
    function deleteMember(id) {
      if (state.members.length <= 1) return alert('メンバーが1人以上必要です');
      state.members = state.members.filter(m => m.id !== id);
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
      state.songs.push({ id: uid(), title: '新しい曲', artist: 'アーティスト' });
      renderSongSettings();
    }
    function deleteSong(id) {
      if (state.songs.length <= 1) return alert('曲が1曲以上必要です');
      state.songs = state.songs.filter(s => s.id !== id);
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
      renderCalendar(); renderEventList(); renderTasks(); renderTaskChips();
      renderNews(); renderAttendEventTabs(); renderAttendance(); renderSetlist(); renderSettings();
      alert('変更を適用しました ✓');
    }

    // ===== EXPOSE TO WINDOW =====
    window.switchTab       = switchTab;
    window.openModal       = openModal;
    window.closeModal      = closeModal;
    window.applyTheme      = applyTheme;
    window.openThemePanel  = openThemePanel;
    window.closeThemePanel = closeThemePanel;
    window.addEvent        = addEvent;
    window.deleteEvent     = deleteEvent;
    window.toggleTask      = toggleTask;
    window.addTask         = addTask;
    window.toggleAccordion = toggleAccordion;
    window.addNews         = addNews;
    window.setAttendance   = setAttendance;
    window.saveMemo        = saveMemo;
    window.openSongDetail  = openSongDetail;
    window.closeSongDetail = closeSongDetail;
    window.savePart        = savePart;
    window.addNote         = addNote;
    window.deleteNote      = deleteNote;
    window.applySettings   = applySettings;
    window.addMemberRow    = addMemberRow;
    window.deleteMember    = deleteMember;
    window.moveSong        = moveSong;
    window.addSongRow      = addSongRow;
    window.deleteSong      = deleteSong;
    window.addAttendEventRow  = addAttendEventRow;
    window.deleteAttendEvent  = deleteAttendEvent;

    // ===== INIT =====
    applyTheme(currentTheme);

    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    document.getElementById('cal-prev').addEventListener('click', () => {
      const y = state.currentMonth.getFullYear(), m = state.currentMonth.getMonth();
      state.currentMonth = new Date(y, m - 1, 1);
      renderCalendar(); renderEventList();
    });
    document.getElementById('cal-next').addEventListener('click', () => {
      const y = state.currentMonth.getFullYear(), m = state.currentMonth.getMonth();
      state.currentMonth = new Date(y, m + 1, 1);
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

    // ===== CLEANUP =====
    return () => {
      const fns = [
        'switchTab','openModal','closeModal','applyTheme','openThemePanel','closeThemePanel',
        'addEvent','deleteEvent','toggleTask','addTask','toggleAccordion','addNews',
        'setAttendance','saveMemo','openSongDetail','closeSongDetail','savePart',
        'addNote','deleteNote','applySettings','addMemberRow','deleteMember',
        'moveSong','addSongRow','deleteSong','addAttendEventRow','deleteAttendEvent',
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
        {/* HEADER */}
        <header id="app-header">
          <span className="star-deco">✦</span>
          <span className="star-deco">★</span>
          <span className="star-deco">✦</span>
          <span className="star-deco">★</span>
          <div className="header-title">それからふくらむ可愛い頬を、</div>
          <div className="header-subtitle">✿ 10周年公演 ✿</div>
        </header>

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
            </div>
            <div className="card">
              <div className="card-title-row">
                <span className="card-title">今後の予定</span>
                <button className="btn-primary" onClick={() => window.openModal('event-add')}>＋ 追加</button>
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
              <button className="btn-primary btn-block mt8" onClick={() => window.openModal('task-add')}>＋ タスクを追加</button>
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
                <button className="btn-primary" onClick={() => window.openModal('news-add')}>＋ 投稿</button>
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
              <div className="attend-summary">
                <span>○ <strong id="count-present">0</strong></span>
                <span>△ <strong id="count-maybe">0</strong></span>
                <span>✕ <strong id="count-absent">0</strong></span>
              </div>
              <div className="attend-member-list" id="attend-member-list"></div>
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
          </section>

        </main>
      </div>

      {/* THEME FAB */}
      <button id="theme-fab" onClick={() => window.openThemePanel()}>🎨</button>

      {/* THEME PANEL */}
      <div id="theme-panel-overlay" className="hidden">
        <div id="theme-panel-backdrop" onClick={() => window.closeThemePanel()}></div>
        <div id="theme-panel">
          <div className="theme-panel-header">
            <span className="theme-panel-title">🎨 テーマを選ぶ</span>
            <button className="theme-close-btn" onClick={() => window.closeThemePanel()}>✕</button>
          </div>

          <div className="theme-section-label">🌸 カラフルで可愛い</div>
          <div className="theme-grid">
            <div className="theme-card" data-theme="theme-kawaii" onClick={() => window.applyTheme('theme-kawaii')}>
              <div className="theme-card-name">Kawaii Pink</div>
              <div className="theme-card-sub">ピンク × ラベンダー</div>
              <div className="theme-swatches">
                <div className="swatch" style={{background:'#F4517A'}}></div>
                <div className="swatch" style={{background:'#C084FC'}}></div>
                <div className="swatch" style={{background:'#FFD6E3'}}></div>
              </div>
              <span className="theme-check">✓</span>
            </div>
            <div className="theme-card" data-theme="theme-pastel" onClick={() => window.applyTheme('theme-pastel')}>
              <div className="theme-card-name">Pastel Rainbow</div>
              <div className="theme-card-sub">桃 × 空 × ミント</div>
              <div className="theme-swatches">
                <div className="swatch" style={{background:'#FFB7C5'}}></div>
                <div className="swatch" style={{background:'#BAE6FD'}}></div>
                <div className="swatch" style={{background:'#A7F3D0'}}></div>
              </div>
              <span className="theme-check">✓</span>
            </div>
            <div className="theme-card" data-theme="theme-y2k" onClick={() => window.applyTheme('theme-y2k')}>
              <div className="theme-card-name">Y2K Pop</div>
              <div className="theme-card-sub">ネオン × ブラック</div>
              <div className="theme-swatches">
                <div className="swatch" style={{background:'#FF2D78'}}></div>
                <div className="swatch" style={{background:'#B026FF'}}></div>
                <div className="swatch" style={{background:'#FFE600'}}></div>
              </div>
              <span className="theme-check">✓</span>
            </div>
            <div className="theme-card" data-theme="theme-fairy" onClick={() => window.applyTheme('theme-fairy')}>
              <div className="theme-card-name">Fairy Tale</div>
              <div className="theme-card-sub">桃 × ラベンダー × ゴールド</div>
              <div className="theme-swatches">
                <div className="swatch" style={{background:'#FECACA'}}></div>
                <div className="swatch" style={{background:'#DDD6FE'}}></div>
                <div className="swatch" style={{background:'#FDE68A'}}></div>
              </div>
              <span className="theme-check">✓</span>
            </div>
          </div>

          <div className="theme-section-label">🩵 グレーと水色で可愛い</div>
          <div className="theme-grid">
            <div className="theme-card" data-theme="theme-iceblue" onClick={() => window.applyTheme('theme-iceblue')}>
              <div className="theme-card-name">Ice Blue</div>
              <div className="theme-card-sub">スカイ × シルバー</div>
              <div className="theme-swatches">
                <div className="swatch" style={{background:'#7DD3FC'}}></div>
                <div className="swatch" style={{background:'#CBD5E1'}}></div>
                <div className="swatch" style={{background:'#F0F9FF'}}></div>
              </div>
              <span className="theme-check">✓</span>
            </div>
            <div className="theme-card" data-theme="theme-rainy" onClick={() => window.applyTheme('theme-rainy')}>
              <div className="theme-card-name">Rainy Day</div>
              <div className="theme-card-sub">スレート × グレー</div>
              <div className="theme-swatches">
                <div className="swatch" style={{background:'#94A3B8'}}></div>
                <div className="swatch" style={{background:'#7DD3FC'}}></div>
                <div className="swatch" style={{background:'#E2E8F0'}}></div>
              </div>
              <span className="theme-check">✓</span>
            </div>
            <div className="theme-card" data-theme="theme-pearl" onClick={() => window.applyTheme('theme-pearl')}>
              <div className="theme-card-name">Pearl Sky</div>
              <div className="theme-card-sub">パウダーブルー × パール</div>
              <div className="theme-swatches">
                <div className="swatch" style={{background:'#BFDBFE'}}></div>
                <div className="swatch" style={{background:'#A5B4FC'}}></div>
                <div className="swatch" style={{background:'#F1F5F9'}}></div>
              </div>
              <span className="theme-check">✓</span>
            </div>
          </div>

          <div className="theme-section-label">✨ 落ち着いたおしゃれ系</div>
          <div className="theme-grid">
            <div className="theme-card" data-theme="theme-rose" onClick={() => window.applyTheme('theme-rose')}>
              <div className="theme-card-name">Minimal Rose</div>
              <div className="theme-card-sub">ダスティローズ × オフホワイト</div>
              <div className="theme-swatches">
                <div className="swatch" style={{background:'#C4746A'}}></div>
                <div className="swatch" style={{background:'#FAF9F7'}}></div>
                <div className="swatch" style={{background:'#E8E0D8'}}></div>
              </div>
              <span className="theme-check">✓</span>
            </div>
            <div className="theme-card" data-theme="theme-sage" onClick={() => window.applyTheme('theme-sage')}>
              <div className="theme-card-name">Sage Garden</div>
              <div className="theme-card-sub">セージ × テラコッタ</div>
              <div className="theme-swatches">
                <div className="swatch" style={{background:'#84A98C'}}></div>
                <div className="swatch" style={{background:'#BC6C25'}}></div>
                <div className="swatch" style={{background:'#FEFAE0'}}></div>
              </div>
              <span className="theme-check">✓</span>
            </div>
            <div className="theme-card" data-theme="theme-midnight" onClick={() => window.applyTheme('theme-midnight')}>
              <div className="theme-card-name">Midnight Luxe</div>
              <div className="theme-card-sub">チャコール × ゴールド</div>
              <div className="theme-swatches">
                <div className="swatch" style={{background:'#1C1C2E'}}></div>
                <div className="swatch" style={{background:'#D4AF37'}}></div>
                <div className="swatch" style={{background:'#2D2B55'}}></div>
              </div>
              <span className="theme-check">✓</span>
            </div>
          </div>
        </div>
      </div>

      {/* SETLIST DETAIL SLIDE PANEL */}
      <div id="setlist-detail" className="hidden">
        <div className="slide-header">
          <button id="btn-back-setlist" onClick={() => window.closeSongDetail()}>‹ 戻る</button>
          <span id="detail-song-title"></span>
        </div>
        <div className="card">
          <div className="card-title">パート・フォーメーション</div>
          <table className="parts-table">
            <thead><tr><th>メンバー</th><th>役割</th></tr></thead>
            <tbody id="parts-table-body"></tbody>
          </table>
        </div>
        <div className="card">
          <div className="card-title">連絡事項</div>
          <div className="notes-list" id="notes-list"></div>
          <div className="note-add-row">
            <input type="text" id="note-input" placeholder="連絡事項を追加..." />
            <button className="btn-primary" onClick={() => window.addNote()}>追加</button>
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
          <div className="modal-footer">
            <button className="btn-secondary" onClick={() => window.closeModal('task-add')}>キャンセル</button>
            <button className="btn-primary" onClick={() => window.addTask()}>追加</button>
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
          <div className="modal-footer">
            <button className="btn-secondary" onClick={() => window.closeModal('event-add')}>キャンセル</button>
            <button className="btn-primary" onClick={() => window.addEvent()}>追加</button>
          </div>
        </div>
      </div>
    </>
  );
}
