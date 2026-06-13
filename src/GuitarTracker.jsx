import { useState } from "react";
import { Search, LayoutDashboard, CalendarDays, ChevronLeft, Plus, Trash2, Music2, BookOpen, Target, Clock, ClipboardList, StickyNote, Check, X, AlertTriangle, Guitar, Users, TrendingUp } from "lucide-react";

// ── Constants ────────────────────────────────────────────────────────────────
const SKILLS = [
  "Chord Changes","Strumming Patterns","Fingerpicking",
  "Scales","Music Theory","Sight Reading","Improvisation","Ear Training","Rhythm"
];
const LEVELS = ["Beginner","Intermediate","Advanced","Expert"];
const COLORS = ["#c9a84c","#5b8dd9","#c96b6b","#6baf7e","#a86bcb","#d97b42","#4bbfb8","#e87ca8"];
const DAYS   = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const TIMES  = [
  "8:00 AM","8:30 AM","9:00 AM","9:30 AM","10:00 AM","10:30 AM",
  "11:00 AM","11:30 AM","12:00 PM","12:30 PM","1:00 PM","1:30 PM",
  "2:00 PM","2:30 PM","3:00 PM","3:30 PM","4:00 PM","4:30 PM",
  "5:00 PM","5:30 PM","6:00 PM","6:30 PM","7:00 PM","7:30 PM","8:00 PM"
];
const DURATIONS = ["30 min","45 min","60 min","90 min"];

const LEVEL_STYLE = {
  Beginner:     { bg:"rgba(91,141,217,.18)",  text:"#7aaae0", border:"rgba(91,141,217,.35)"  },
  Intermediate: { bg:"rgba(201,168,76,.16)",  text:"#e8c97a", border:"rgba(201,168,76,.35)"  },
  Advanced:     { bg:"rgba(107,175,126,.16)", text:"#8fd4a3", border:"rgba(107,175,126,.35)" },
  Expert:       { bg:"rgba(201,107,107,.16)", text:"#e08080", border:"rgba(201,107,107,.35)" },
};

const mkStudent = (id, name, color, level="Beginner") => ({
  id, name, color, level,
  avatar: name.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase(),
  joinDate: new Date().toISOString().slice(0,10),
  skills: Object.fromEntries(SKILLS.map(sk=>[sk,0])),
  skillNotes: Object.fromEntries(SKILLS.map(sk=>[sk,""])),
  songs: [], notes: "", sessions: 0, nextLesson: "",
  attendance: [], homework: [], goals: [],
  scheduleDay: "", scheduleTime: "", scheduleDuration: "45 min",
});

const initialStudents = [
  { ...mkStudent(1,"David Shahi Khadgi",  COLORS[0],"Intermediate"),
    sessions:18, songs:["Wonderwall","Nothing Else Matters"],
    skills:{"Chord Changes":70,"Strumming Patterns":65,"Fingerpicking":48,"Scales":55,"Music Theory":42,"Sight Reading":28,"Improvisation":38,"Ear Training":52,"Rhythm":68},
    skillNotes:{"Strumming Patterns":"Practicing Pattern 4 — down-down-up-up-down. Getting better but rushing on beat 3.","Music Theory":"Currently on major scale construction. Understands intervals."},
    scheduleDay:"Tuesday", scheduleTime:"4:00 PM", scheduleDuration:"45 min",
    notes:"Great improvement on barre chords this month. Ready to tackle CAGED system." },
  { ...mkStudent(2,"Prisha Bhuju",         COLORS[1],"Beginner"),
    sessions:7,  songs:["Happy Birthday"],
    skills:{"Chord Changes":30,"Strumming Patterns":42,"Fingerpicking":10,"Scales":18,"Music Theory":12,"Sight Reading":5,"Improvisation":5,"Ear Training":22,"Rhythm":38},
    skillNotes:{"Strumming Patterns":"Learning basic down strum. Tempo is inconsistent, using metronome at 60 BPM."},
    scheduleDay:"Thursday", scheduleTime:"3:00 PM", scheduleDuration:"30 min",
    notes:"Working on keeping steady tempo. Very enthusiastic learner." },
  { ...mkStudent(3,"Safal Raj Manandhar",  COLORS[2],"Advanced"),
    sessions:45, songs:["Blackbird","Hotel California","Stairway to Heaven","Dust in the Wind"],
    skills:{"Chord Changes":88,"Strumming Patterns":82,"Fingerpicking":78,"Scales":85,"Music Theory":72,"Sight Reading":60,"Improvisation":70,"Ear Training":78,"Rhythm":88},
    skillNotes:{"Fingerpicking":"Working on Travis picking. Thumb independence is the current focus.","Improvisation":"Can solo over blues backing tracks. Working on pentatonic position 2.","Music Theory":"Covered modes last week — Dorian and Mixolydian making sense now."},
    scheduleDay:"Tuesday", scheduleTime:"5:00 PM", scheduleDuration:"60 min",
    notes:"Ready for fingerstyle arrangements. Suggested learning 'Classical Gas'." },
  { ...mkStudent(4,"Sashank Sharma",       COLORS[3],"Beginner"),
    sessions:3,  songs:[],
    skills:{"Chord Changes":15,"Strumming Patterns":20,"Fingerpicking":5,"Scales":10,"Music Theory":8,"Sight Reading":0,"Improvisation":0,"Ear Training":12,"Rhythm":25},
    scheduleDay:"Saturday", scheduleTime:"10:00 AM", scheduleDuration:"30 min",
    notes:"Brand new student. Focusing on hand positioning and first three open chords." },
];

const avgSkill = s => {
  const v = Object.values(s.skills);
  return Math.round(v.reduce((a,b)=>a+b,0)/v.length);
};

function buildScheduleMap(students) {
  const map = {};
  students.forEach(s => {
    if (!s.scheduleDay || !s.scheduleTime) return;
    const key = `${s.scheduleDay}||${s.scheduleTime}`;
    if (!map[key]) map[key] = { day: s.scheduleDay, time: s.scheduleTime, students: [] };
    map[key].students.push(s);
  });
  return Object.values(map).sort((a,b) => {
    const di = DAYS.indexOf(a.day) - DAYS.indexOf(b.day);
    if (di !== 0) return di;
    return TIMES.indexOf(a.time) - TIMES.indexOf(b.time);
  });
}

// ── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=IBM+Plex+Mono:wght@300;400;500&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#0d0c0a;
  --surf:#161512;
  --surf2:#1e1c18;
  --surf3:#252320;
  --surf4:#2d2b27;
  --border:#302e28;
  --border2:#3a3830;
  --gold:#c9a84c;
  --gold-l:#e8c97a;
  --gold-d:#9a7e35;
  --gold-glow:rgba(201,168,76,.18);
  --gold-dim:rgba(201,168,76,.08);
  --text:#f2ece0;
  --text2:#c8bfa8;
  --muted:#7a7060;
  --muted2:#5a5448;
  --green:#6baf7e; --green-bg:rgba(107,175,126,.14);
  --red:#c96b6b;   --red-bg:rgba(201,107,107,.14);
  --blue:#5b8dd9;  --blue-bg:rgba(91,141,217,.14);
  --purple:#a86bcb;
  --sb-w:268px;
  --radius:10px;
  --radius-lg:14px;
  --shadow:0 4px 24px rgba(0,0,0,.45);
  --shadow-lg:0 8px 40px rgba(0,0,0,.6);
}

html,body{height:100%;background:var(--bg);color:var(--text);font-family:'IBM Plex Mono',monospace;font-size:13px;line-height:1.6;-webkit-font-smoothing:antialiased}
input,select,textarea,button{font-family:'IBM Plex Mono',monospace}
button{cursor:pointer}
::-webkit-scrollbar{width:3px;height:3px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--border2);border-radius:3px}

/* ══ Layout ══ */
.app{display:flex;height:100vh;overflow:hidden;background:var(--bg)}
.sidebar{
  width:var(--sb-w);min-width:var(--sb-w);
  background:var(--surf);
  border-right:1px solid var(--border);
  display:flex;flex-direction:column;
  height:100vh;overflow-y:auto;flex-shrink:0;
  position:relative;
}
.sidebar::after{
  content:'';position:absolute;top:0;right:-1px;width:1px;height:100%;
  background:linear-gradient(180deg,transparent,var(--gold-d) 30%,var(--gold-d) 70%,transparent);
  opacity:.4;pointer-events:none;
}
.main{flex:1;overflow-y:auto;background:var(--bg)}
.page{padding:28px 32px 72px;max-width:1100px;margin:0 auto}

/* ══ Sidebar ══ */
.sb-logo{
  padding:22px 20px 16px;
  border-bottom:1px solid var(--border);
  background:linear-gradient(180deg,rgba(201,168,76,.06) 0%,transparent 100%);
}
.sb-logo-row{display:flex;align-items:center;gap:10px;margin-bottom:4px}
.sb-logo-icon{
  width:34px;height:34px;border-radius:8px;
  background:linear-gradient(135deg,var(--gold-d),var(--gold));
  display:flex;align-items:center;justify-content:center;flex-shrink:0;
}
.sb-logo h1{font-family:'Cormorant Garamond',serif;font-size:20px;font-weight:700;color:var(--gold);line-height:1.1;letter-spacing:.01em}
.sb-logo p{font-size:9px;color:var(--muted);letter-spacing:.18em;text-transform:uppercase;padding-left:2px}
.sb-search-wrap{padding:10px 12px 4px}
.sb-search{
  display:flex;align-items:center;gap:8px;
  background:var(--surf2);border:1px solid var(--border);border-radius:8px;
  padding:7px 10px;transition:border-color .15s;
}
.sb-search:focus-within{border-color:var(--gold-d)}
.sb-search svg{color:var(--muted);flex-shrink:0;opacity:.7}
.sb-search input{flex:1;background:transparent;border:none;color:var(--text);font-size:11px;outline:none}
.sb-search input::placeholder{color:var(--muted2)}

.sb-sec{padding:12px 18px 5px;font-size:8.5px;letter-spacing:.2em;text-transform:uppercase;color:var(--muted2);display:flex;align-items:center;gap:8px}
.sb-sec::after{content:'';flex:1;height:1px;background:var(--border)}

.sb-nav-item{
  display:flex;align-items:center;gap:10px;padding:9px 14px;
  border-left:2px solid transparent;transition:all .14s;
  cursor:pointer;position:relative;
}
.sb-nav-item:hover{background:var(--surf2);border-left-color:rgba(201,168,76,.4)}
.sb-nav-item.active{background:var(--surf3);border-left-color:var(--gold)}
.sb-nav-item.active::after{
  content:'';position:absolute;right:0;top:50%;transform:translateY(-50%);
  width:3px;height:60%;background:var(--gold);border-radius:3px 0 0 3px;opacity:.4;
}
.sb-nav-icon{
  width:30px;height:30px;border-radius:7px;background:var(--surf3);
  display:flex;align-items:center;justify-content:center;flex-shrink:0;
  color:var(--muted);transition:all .14s;
}
.sb-nav-item.active .sb-nav-icon{background:var(--gold-dim);color:var(--gold)}
.sb-nav-info{flex:1;min-width:0}
.sb-nav-name{font-size:11.5px;color:var(--text2);transition:color .14s;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sb-nav-item.active .sb-nav-name{color:var(--text)}
.sb-nav-sub{font-size:9px;color:var(--muted);margin-top:1px}
.sb-nav-badge{
  font-size:9px;padding:2px 7px;border-radius:99px;
  background:var(--gold-dim);color:var(--gold);
  border:1px solid rgba(201,168,76,.2);
  flex-shrink:0;font-weight:500;
}

.sb-stu-item{
  display:flex;align-items:center;gap:9px;padding:7px 12px;
  border-left:2px solid transparent;transition:all .13s;cursor:pointer;
}
.sb-stu-item:hover{background:var(--surf2);border-left-color:rgba(201,168,76,.3)}
.sb-stu-item.active{background:var(--surf3);border-left-color:var(--gold)}
.sb-stu-av{
  width:30px;height:30px;border-radius:7px;
  display:flex;align-items:center;justify-content:center;
  font-size:10px;font-weight:600;flex-shrink:0;letter-spacing:.03em;
}
.sb-stu-info{flex:1;min-width:0}
.sb-stu-name{font-size:11px;color:var(--text2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sb-stu-sub{font-size:9px;color:var(--muted);margin-top:1px}
.sb-stu-bar{height:2px;background:var(--border);border-radius:99px;overflow:hidden;margin-top:4px}
.sb-stu-fill{height:100%;border-radius:99px;transition:width .4s}
.sb-stu-pct{font-size:10px;color:var(--muted);flex-shrink:0;font-family:'Cormorant Garamond',serif;font-size:14px;font-weight:600}

.sb-footer{padding:10px 12px 14px;border-top:1px solid var(--border);margin-top:auto}
.sb-add{
  width:100%;
  background:linear-gradient(135deg,var(--gold-d),var(--gold));
  color:#0d0c0a;border:none;border-radius:8px;padding:10px;
  font-size:11px;font-weight:500;letter-spacing:.05em;
  transition:opacity .15s;display:flex;align-items:center;justify-content:center;gap:6px;
}
.sb-add:hover{opacity:.88}
.sb-empty{padding:16px 20px;font-size:10px;color:var(--muted);text-align:center;font-style:italic}

/* ══ Page header ══ */
.page-hd{display:flex;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:22px}
.page-title-wrap{}
.page-eyebrow{font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:var(--gold-d);margin-bottom:4px}
.page-title{font-family:'Cormorant Garamond',serif;font-size:32px;font-weight:700;color:var(--text);line-height:1;letter-spacing:.01em}
.page-sub{font-size:10px;color:var(--muted);margin-top:5px;letter-spacing:.06em}
.page-hd-actions{display:flex;gap:8px;flex-wrap:wrap;align-items:center}

/* ══ Summary banner ══ */
.banner{
  display:flex;background:var(--surf);border:1px solid var(--border);
  border-radius:var(--radius-lg);overflow:hidden;margin-bottom:20px;
  box-shadow:0 2px 12px rgba(0,0,0,.3);
}
.ban-item{flex:1;padding:14px 18px;border-right:1px solid var(--border);position:relative;overflow:hidden}
.ban-item:last-child{border-right:none}
.ban-item::before{
  content:'';position:absolute;bottom:0;left:0;right:0;height:2px;
  background:linear-gradient(90deg,var(--gold-d),transparent);
  opacity:0;transition:opacity .2s;
}
.ban-item:hover::before{opacity:1}
.ban-icon-wrap{width:28px;height:28px;border-radius:7px;background:var(--surf3);display:flex;align-items:center;justify-content:center;margin-bottom:8px;color:var(--gold)}
.ban-v{font-family:'Cormorant Garamond',serif;font-size:26px;font-weight:700;line-height:1;color:var(--text)}
.ban-l{font-size:8.5px;text-transform:uppercase;letter-spacing:.12em;color:var(--muted);margin-top:4px}

/* ══ Cards ══ */
.card{
  background:var(--surf);border:1px solid var(--border);
  border-radius:var(--radius-lg);padding:20px;position:relative;overflow:hidden;
}
.card-accent::before{
  content:'';position:absolute;top:0;left:0;right:0;height:2px;
  background:linear-gradient(90deg,var(--gold),rgba(201,168,76,.15));
}
.card-title{
  font-family:'Cormorant Garamond',serif;font-size:17px;font-weight:700;
  color:var(--text);margin-bottom:16px;letter-spacing:.02em;
}
.sec-lbl{
  font-size:8.5px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);
  margin-bottom:14px;display:flex;align-items:center;gap:8px;
}
.sec-lbl::after{content:'';flex:1;height:1px;background:var(--border)}

/* ══ Overview cards ══ */
.ov-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px}
.ov-card{
  background:var(--surf);border:1px solid var(--border);border-radius:var(--radius-lg);
  padding:18px;cursor:pointer;transition:all .2s;position:relative;overflow:hidden;
}
.ov-card::before{
  content:'';position:absolute;top:0;left:0;right:0;height:2px;
  opacity:0;transition:opacity .2s;
}
.ov-card:hover{
  border-color:var(--border2);
  transform:translateY(-2px);
  box-shadow:0 8px 32px rgba(0,0,0,.4);
}
.ov-card:hover::before{opacity:1}
.ov-av-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.ov-av{width:38px;height:38px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600}
.ov-name{font-family:'Cormorant Garamond',serif;font-size:16px;font-weight:700;color:var(--text);margin-bottom:2px;line-height:1.2}
.ov-meta{font-size:9px;color:var(--muted);margin-bottom:12px;display:flex;flex-wrap:wrap;gap:4px;align-items:center}
.ov-sched-chip{font-size:9px;color:var(--gold);background:var(--gold-dim);border:1px solid rgba(201,168,76,.2);border-radius:4px;padding:1px 6px}
.ov-stats{display:flex;gap:16px;margin-bottom:12px;flex-wrap:wrap}
.ov-stat-v{font-family:'Cormorant Garamond',serif;font-size:20px;font-weight:700;line-height:1}
.ov-stat-l{font-size:8px;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);margin-top:2px}
.ov-bar{height:3px;background:var(--surf3);border-radius:99px;overflow:hidden}
.ov-bar-fill{height:100%;border-radius:99px;transition:width .5s}

/* ══ Grids ══ */
.g2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px}
.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}

/* ══ Stat cards ══ */
.stat-card{
  background:var(--surf);border:1px solid var(--border);border-radius:var(--radius);
  padding:15px;transition:border-color .15s;
}
.stat-card:hover{border-color:var(--border2)}
.stat-icon-wrap{
  width:32px;height:32px;border-radius:8px;background:var(--surf3);
  display:flex;align-items:center;justify-content:center;
  color:var(--gold);margin-bottom:10px;
}
.stat-num{font-family:'Cormorant Garamond',serif;font-size:32px;font-weight:700;line-height:1;color:var(--text)}
.stat-lbl{font-size:8.5px;text-transform:uppercase;letter-spacing:.12em;color:var(--muted);margin-top:4px}
.stat-action{margin-top:10px}

/* ══ Student header ══ */
.stu-hd{
  background:var(--surf);border:1px solid var(--border);border-radius:var(--radius-lg);
  padding:20px 24px;margin-bottom:16px;display:flex;align-items:flex-start;gap:16px;flex-wrap:wrap;
  position:relative;overflow:hidden;
  box-shadow:0 2px 16px rgba(0,0,0,.3);
}
.stu-hd::before{
  content:'';position:absolute;top:0;left:0;right:0;height:2px;
  background:linear-gradient(90deg,var(--gold),rgba(201,168,76,.1));
}
.stu-hd-av{
  width:54px;height:54px;border-radius:12px;
  display:flex;align-items:center;justify-content:center;
  font-size:18px;font-weight:700;flex-shrink:0;
  box-shadow:0 4px 12px rgba(0,0,0,.3);
}
.stu-hd-body{flex:1;min-width:180px}
.stu-hd-body h2{font-family:'Cormorant Garamond',serif;font-size:26px;font-weight:700;color:var(--text);line-height:1.1}
.stu-chips{display:flex;gap:6px;margin-top:9px;flex-wrap:wrap}
.chip{
  display:flex;align-items:center;gap:4px;font-size:9px;
  color:var(--muted);background:var(--surf2);border:1px solid var(--border);
  border-radius:6px;padding:4px 9px;
}
.chip b{color:var(--text2)}
.stu-hd-actions{display:flex;gap:6px;flex-wrap:wrap;align-items:flex-start;margin-left:auto;padding-top:2px}

/* ══ Tabs ══ */
.tabs{
  display:flex;gap:1px;padding:3px;
  background:var(--surf);border:1px solid var(--border);border-radius:10px;
  margin-bottom:18px;flex-wrap:wrap;
  box-shadow:0 2px 8px rgba(0,0,0,.2);
}
.tab{
  padding:7px 14px;font-size:10px;cursor:pointer;border-radius:8px;
  border:none;background:transparent;color:var(--muted);
  transition:all .15s;white-space:nowrap;letter-spacing:.03em;
  display:flex;align-items:center;gap:5px;
}
.tab.active{background:var(--surf3);color:var(--text);border:1px solid var(--border2)}
.tab:hover:not(.active){color:var(--text2);background:var(--surf2)}

/* ══ Skill bars ══ */
.skill-row{padding:12px 0;border-bottom:1px solid var(--border)}
.skill-row:last-child{border-bottom:none;padding-bottom:0}
.skill-hd{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}
.skill-name{font-size:11px;color:var(--text2);letter-spacing:.02em}
.skill-pct{font-family:'Cormorant Garamond',serif;font-size:15px;font-weight:700;color:var(--muted)}
.skill-track{height:4px;background:var(--surf3);border-radius:99px;overflow:hidden;margin-bottom:7px}
.skill-fill{height:100%;border-radius:99px;transition:width .6s cubic-bezier(.4,0,.2,1)}
.f-zero{background:var(--border2)}
.f-low{background:linear-gradient(90deg,var(--blue),#7aaae0)}
.f-mid{background:linear-gradient(90deg,var(--gold-d),var(--gold))}
.f-high{background:linear-gradient(90deg,var(--green),#8fd4a3)}
.skill-note-box{
  background:var(--surf2);border-left:2px solid var(--border2);
  border-radius:0 5px 5px 0;padding:6px 10px;
  font-size:10px;color:var(--text2);font-style:italic;line-height:1.5;
  transition:border-color .15s;
}
.skill-note-box.has-note{border-left-color:var(--gold-d);color:var(--text2)}
.skill-note-box.no-note{color:var(--muted2);font-size:9.5px}

/* ══ Slider rows ══ */
.slider-row{padding:12px 0;border-bottom:1px solid var(--border)}
.slider-row:last-child{border-bottom:none}
.slider-row-top{display:flex;align-items:center;gap:10px;margin-bottom:8px}
.slider-lbl{font-size:10px;color:var(--text2);width:140px;flex-shrink:0}
.slider{flex:1;accent-color:var(--gold);cursor:pointer;min-width:0;height:3px}
.slider-val{font-family:'Cormorant Garamond',serif;font-size:16px;font-weight:700;color:var(--gold);width:34px;text-align:right;flex-shrink:0}
.skill-note-inp{
  width:100%;background:var(--surf2);border:1px solid var(--border);
  border-radius:7px;padding:7px 10px;color:var(--text);font-size:10.5px;
  outline:none;transition:border-color .15s;resize:none;line-height:1.5;
}
.skill-note-inp::placeholder{color:var(--muted2);font-style:italic}
.skill-note-inp:focus{border-color:var(--gold-d)}

/* ══ Inputs & forms ══ */
.inp{
  width:100%;background:var(--surf2);border:1px solid var(--border);
  border-radius:8px;padding:9px 12px;color:var(--text);font-size:12px;
  outline:none;transition:border-color .15s,box-shadow .15s;line-height:1.5;
}
.inp:focus{border-color:var(--gold-d);box-shadow:0 0 0 3px rgba(201,168,76,.07)}
.inp::placeholder{color:var(--muted2)}
.sel{
  appearance:none;cursor:pointer;padding-right:30px;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%235a5448'/%3E%3C/svg%3E");
  background-repeat:no-repeat;background-position:right 10px center;
}
.textarea{resize:vertical;min-height:120px;line-height:1.7;font-size:11.5px}
.form-grp{margin-bottom:14px}
.form-lbl{display:block;font-size:8.5px;letter-spacing:.15em;text-transform:uppercase;color:var(--muted);margin-bottom:5px}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.add-row{display:flex;gap:8px;margin-top:12px}
.add-row .inp{flex:1}

/* ══ Buttons ══ */
.btn{padding:8px 16px;border-radius:8px;font-size:11px;font-weight:500;cursor:pointer;border:none;transition:all .14s;letter-spacing:.04em;white-space:nowrap;display:inline-flex;align-items:center;gap:5px}
.btn-gold{background:linear-gradient(135deg,var(--gold-d),var(--gold));color:#0d0c0a}
.btn-gold:hover{opacity:.88}
.btn-ghost{background:transparent;border:1px solid var(--border2);color:var(--muted)}
.btn-ghost:hover{border-color:var(--gold-d);color:var(--gold)}
.btn-danger{background:transparent;border:1px solid var(--red);color:var(--red)}
.btn-danger:hover{background:var(--red-bg)}
.btn-sm{padding:5px 11px;font-size:10px}
.btn-xs{padding:3px 8px;font-size:9px}

/* ══ Level badge ══ */
.lvl-badge{display:inline-flex;align-items:center;padding:3px 9px;border-radius:6px;font-size:9.5px;font-weight:500;letter-spacing:.05em;border:1px solid}

/* ══ Tags / songs ══ */
.tag{display:inline-flex;align-items:center;gap:5px;padding:5px 10px;border-radius:7px;font-size:11px;background:var(--surf2);border:1px solid var(--border);color:var(--text2);margin:2px;transition:border-color .12s}
.tag:hover{border-color:var(--border2)}
.tag-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0}
.tag-x{cursor:pointer;color:var(--muted);font-size:14px;line-height:1;margin-left:2px;transition:color .1s;display:flex;align-items:center}
.tag-x:hover{color:var(--red)}

/* ══ Check items ══ */
.check-item{display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid var(--border)}
.check-item:last-child{border-bottom:none}
.check-box{width:17px;height:17px;border:1.5px solid var(--border2);border-radius:5px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;transition:all .14s}
.check-box:hover{border-color:var(--gold-d)}
.check-box.done{background:var(--green);border-color:var(--green)}
.check-text{flex:1;font-size:11px;line-height:1.55;color:var(--text2)}
.check-text.done{color:var(--muted);text-decoration:line-through}
.check-del{cursor:pointer;color:var(--muted);line-height:1;padding:0 2px;transition:color .1s;display:flex;align-items:center}
.check-del:hover{color:var(--red)}

/* ══ Table ══ */
.tbl{width:100%;border-collapse:collapse;font-size:11px}
.tbl th{text-align:left;font-size:8.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);padding:8px 12px;border-bottom:1px solid var(--border)}
.tbl td{padding:9px 12px;border-bottom:1px solid var(--border);vertical-align:middle}
.tbl tr:last-child td{border-bottom:none}
.tbl tbody tr:hover td{background:var(--surf2)}

/* ══ Modal ══ */
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.82);z-index:300;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(6px);animation:fi .15s;padding:16px}
.modal{background:var(--surf);border:1px solid var(--border2);border-radius:16px;padding:28px;width:460px;max-width:100%;animation:su .2s;max-height:90vh;overflow-y:auto;box-shadow:var(--shadow-lg)}
.modal-title{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:700;margin-bottom:20px;color:var(--text)}
.modal-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:20px;padding-top:16px;border-top:1px solid var(--border)}

/* ══ Empty ══ */
.empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:50px 32px;color:var(--muted);text-align:center}
.empty-icon{color:var(--muted2);margin-bottom:14px;opacity:.5}
.empty-title{font-family:'Cormorant Garamond',serif;font-size:17px;color:var(--text2);margin-bottom:6px}
.empty-sub{font-size:10px;line-height:1.6;max-width:280px}

/* ══ Back btn ══ */
.back-btn{display:inline-flex;align-items:center;gap:6px;background:none;border:none;color:var(--muted);cursor:pointer;font-size:10px;letter-spacing:.07em;padding:0;margin-bottom:18px;transition:color .14s}
.back-btn:hover{color:var(--gold)}

/* ══ Schedule section ══ */
.sched-day-group{margin-bottom:30px}
.sched-day-header{
  display:flex;align-items:center;justify-content:space-between;
  padding-bottom:10px;border-bottom:1px solid var(--border);margin-bottom:12px;
}
.sched-day-label{font-family:'Cormorant Garamond',serif;font-size:20px;font-weight:700;color:var(--text)}
.sched-day-meta{display:flex;align-items:center;gap:8px}
.sched-day-count{font-size:9.5px;color:var(--muted);background:var(--surf2);border:1px solid var(--border);padding:3px 10px;border-radius:5px}

.sched-slot{
  background:var(--surf);border:1px solid var(--border);border-radius:var(--radius);
  padding:16px 18px;margin-bottom:10px;
  display:grid;grid-template-columns:90px 1fr auto;align-items:start;gap:16px;
  transition:border-color .15s,box-shadow .15s;
  position:relative;overflow:hidden;
}
.sched-slot::before{
  content:'';position:absolute;left:0;top:0;bottom:0;width:3px;
  background:linear-gradient(180deg,var(--gold),var(--gold-d));
  opacity:.7;border-radius:0 2px 2px 0;
}
.sched-slot:hover{border-color:var(--border2);box-shadow:0 4px 20px rgba(0,0,0,.3)}
.sched-time-block{padding-left:6px}
.sched-time{font-family:'Cormorant Garamond',serif;font-size:20px;font-weight:700;color:var(--gold);line-height:1.1}
.sched-dur{font-size:9px;color:var(--muted);margin-top:3px}
.sched-student-list{display:flex;flex-wrap:wrap;gap:8px}
.sched-stu-pill{
  display:flex;align-items:center;gap:8px;
  padding:6px 11px;border-radius:8px;
  background:var(--surf2);border:1px solid var(--border);
  cursor:pointer;transition:all .14s;
}
.sched-stu-pill:hover{border-color:var(--gold-d);background:var(--surf3)}
.sched-stu-name{font-size:11px;color:var(--text2)}
.sched-stu-meta{font-size:9px;color:var(--muted);margin-top:1px}
.sched-slot-right{display:flex;flex-direction:column;align-items:flex-end;gap:8px;min-width:100px}
.sched-cap-block{text-align:right}
.sched-cap-num{font-family:'Cormorant Garamond',serif;font-size:26px;font-weight:700;color:var(--text);line-height:1}
.sched-cap-lbl{font-size:8.5px;text-transform:uppercase;letter-spacing:.1em;color:var(--muted)}
.sched-grade-chips{display:flex;flex-wrap:wrap;gap:4px;justify-content:flex-end;margin-top:4px}

/* Individual schedule in profile */
.sched-display-card{
  background:var(--surf2);border:1px solid var(--border);border-radius:10px;
  padding:16px 18px;margin-bottom:18px;
  display:flex;align-items:center;gap:16px;flex-wrap:wrap;
  position:relative;overflow:hidden;
}
.sched-display-card::before{
  content:'';position:absolute;left:0;top:0;bottom:0;width:3px;
  background:linear-gradient(180deg,var(--gold),var(--gold-d));
}
.sched-display-time{font-family:'Cormorant Garamond',serif;font-size:28px;font-weight:700;color:var(--gold);line-height:1;padding-left:6px}
.sched-display-day{font-size:10px;color:var(--text2);margin-top:3px;padding-left:6px}

/* Conflict warning */
.conflict-box{
  padding:10px 14px;border-radius:8px;
  background:rgba(201,168,76,.07);border:1px solid rgba(201,168,76,.25);
  font-size:10.5px;color:var(--gold);display:flex;align-items:flex-start;gap:8px;
  margin-top:12px;
}

/* Unscheduled section */
.unscheduled-wrap{
  background:var(--surf);border:1px dashed var(--border2);border-radius:var(--radius);
  padding:16px 18px;margin-top:20px;
}
.unscheduled-label{font-size:9px;text-transform:uppercase;letter-spacing:.16em;color:var(--muted);margin-bottom:12px;display:flex;align-items:center;gap:8px}
.unscheduled-label::after{content:'';flex:1;height:1px;background:var(--border)}
.unscheduled-pills{display:flex;flex-wrap:wrap;gap:8px}

/* ══ Mobile ══ */
.mob-top{display:none}
.mob-add-fab{display:none}
.mob-nav{display:none}
.mob-drawer{display:none}

@media(max-width:1100px){
  .g4{grid-template-columns:1fr 1fr}
  .banner{flex-wrap:wrap}
  .ban-item{min-width:40%;border-right:none;border-bottom:1px solid var(--border)}
  .ban-item:last-child{border-bottom:none}
  .page{padding:24px 22px 60px}
}
@media(max-width:900px){
  .g3{grid-template-columns:1fr 1fr}
  .form-row{grid-template-columns:1fr}
  .sched-slot{grid-template-columns:80px 1fr}
  .sched-slot-right{display:none}
}
@media(max-width:768px){
  .sidebar{display:none!important}
  .main{padding-bottom:60px}
  .page{padding:14px 14px 32px}
  .mob-top{display:flex!important;align-items:center;justify-content:space-between;padding:12px 16px;background:var(--surf);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:30}
  .mob-top-title{font-family:'Cormorant Garamond',serif;font-size:18px;color:var(--gold);font-weight:700}
  .mob-top-sub{font-size:9px;color:var(--muted);margin-top:1px;letter-spacing:.09em}
  .mob-add-fab{display:flex!important;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,var(--gold-d),var(--gold));border:none;cursor:pointer;color:#0d0c0a;font-weight:700;flex-shrink:0}
  .mob-nav{display:flex!important;position:fixed;bottom:0;left:0;right:0;height:60px;background:var(--surf);border-top:1px solid var(--border);z-index:50;align-items:stretch}
  .mob-nav-tab{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;cursor:pointer;font-size:7.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);transition:color .15s;border:none;background:none;font-family:'IBM Plex Mono',monospace;padding:0}
  .mob-nav-tab.active{color:var(--gold)}
  .mob-drawer{display:block!important;position:fixed;bottom:60px;left:0;right:0;background:var(--surf);border-top:1px solid var(--border);z-index:49;max-height:55vh;overflow-y:auto;animation:su .2s ease}
  .mob-drawer-hd{display:flex;align-items:center;justify-content:space-between;padding:12px 16px 8px;border-bottom:1px solid var(--border)}
  .mob-drawer-lbl{font-size:9px;letter-spacing:.15em;text-transform:uppercase;color:var(--muted)}
  .mob-drawer-close{background:none;border:none;color:var(--muted);cursor:pointer;font-size:18px;line-height:1;padding:0;display:flex;align-items:center}
  .mob-stu-row{display:flex;align-items:center;gap:11px;padding:11px 16px;cursor:pointer;border-bottom:1px solid var(--border);transition:background .12s}
  .mob-stu-row:hover,.mob-stu-row.active{background:var(--surf2)}
  .mob-stu-info{flex:1;min-width:0}
  .mob-stu-name{font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .mob-stu-sub{font-size:9px;color:var(--muted);margin-top:1px}
  .mob-stu-pct{font-family:'Cormorant Garamond',serif;font-size:15px;font-weight:700;color:var(--gold)}
  .g2,.g3,.g4{grid-template-columns:1fr}
  .g4{grid-template-columns:1fr 1fr}
  .ov-grid{grid-template-columns:1fr}
  .banner{flex-direction:row;flex-wrap:nowrap;overflow:hidden;margin-bottom:14px}
  .ban-item{flex:1;padding:10px 10px;border-right:1px solid var(--border);border-bottom:none}
  .ban-item:nth-child(n+4){display:none}
  .ban-icon-wrap{width:22px;height:22px;border-radius:5px;margin-bottom:5px}
  .ban-icon-wrap svg{width:12px;height:12px}
  .ban-v{font-size:18px}
  .ban-l{font-size:7.5px;letter-spacing:.08em}
  .page-title{font-size:26px}
  .stu-hd{padding:14px;gap:12px}
  .stu-hd-av{width:46px;height:46px;font-size:15px}
  .stu-hd-body h2{font-size:22px}
  .stu-hd-actions{margin-left:0;width:100%;padding-top:8px}
  .tabs{overflow-x:auto;flex-wrap:nowrap;gap:0;padding:0;background:transparent;border:none;border-bottom:1px solid var(--border);border-radius:0}
  .tab{border-radius:0;border-bottom:2px solid transparent;padding:8px 12px;flex-shrink:0}
  .tab.active{background:transparent;border:none;border-bottom:2px solid var(--gold);color:var(--gold)}
  .card{padding:14px}
  .slider-lbl{width:108px}
  .sched-slot{grid-template-columns:1fr;gap:10px}
  .sched-slot::before{display:none}
  .form-row{grid-template-columns:1fr}
}
@keyframes fi{from{opacity:0}to{opacity:1}}
@keyframes su{from{transform:translateY(14px);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes pop{0%{transform:scale(.96);opacity:0}100%{transform:scale(1);opacity:1}}
`;

// ── Helpers ───────────────────────────────────────────────────────────────────
function Av({ name, color, size=40, radius=10, fs=13 }) {
  const i = name.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase();
  return (
    <div style={{width:size,height:size,borderRadius:radius,background:color+"28",color,
      display:"flex",alignItems:"center",justifyContent:"center",
      fontSize:fs,fontWeight:700,flexShrink:0,letterSpacing:".03em"}}>{i}</div>
  );
}

function LvlBadge({ level }) {
  const s = LEVEL_STYLE[level] || LEVEL_STYLE.Beginner;
  return (
    <span className="lvl-badge" style={{background:s.bg,color:s.text,borderColor:s.border}}>
      {level}
    </span>
  );
}

function SkillBar({ label, value, note }) {
  const cls = value===0?"f-zero":value>=70?"f-high":value>=35?"f-mid":"f-low";
  const hasNote = note && note.trim().length > 0;
  return (
    <div className="skill-row">
      <div className="skill-hd">
        <span className="skill-name">{label}</span>
        <span className="skill-pct">{value}%</span>
      </div>
      <div className="skill-track">
        <div className={`skill-fill ${cls}`} style={{width:Math.max(value,0)+"%"}} />
      </div>
      <div className={`skill-note-box ${hasNote?"has-note":"no-note"}`}>
        {hasNote ? <>📝 {note}</> : "No notes added"}
      </div>
    </div>
  );
}

function CheckItem({ text, done, onToggle, onDelete }) {
  return (
    <div className="check-item">
      <div className={`check-box${done?" done":""}`} onClick={onToggle}>
        {done && <Check size={10} color="#fff" strokeWidth={3} />}
      </div>
      <div className={`check-text${done?" done":""}`}>{text}</div>
      <span className="check-del" onClick={onDelete}><X size={14} /></span>
    </div>
  );
}

function Modal({ show, onClose, title, children }) {
  if (!show) return null;
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-title">{title}</div>
        {children}
      </div>
    </div>
  );
}

const IcoHome  = () => <LayoutDashboard size={16} />;
const IcoUsers = () => <Users size={16} />;
const IcoCal   = () => <CalendarDays size={16} />;

const fillColor = v => v>=70?"var(--green)":v>=35?"var(--gold)":"var(--blue)";

// ── Main App ──────────────────────────────────────────────────────────────────
export default function GuitarTracker() {
  const [students,   setStudents]   = useState(initialStudents);
  const [selId,      setSelId]      = useState(null);
  const [view,       setView]       = useState("overview");
  const [tab,        setTab]        = useState("progress");
  const [search,     setSearch]     = useState("");
  const [modal,      setModal]      = useState("");
  const [form,       setForm]       = useState({name:"",level:"Beginner"});
  const [songIn,     setSongIn]     = useState("");
  const [hwIn,       setHwIn]       = useState("");
  const [goalIn,     setGoalIn]     = useState("");
  const [attDate,    setAttDate]    = useState(new Date().toISOString().slice(0,10));
  const [attOk,      setAttOk]      = useState(true);
  const [notes,      setNotes]      = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobTab,     setMobTab]     = useState("overview");

  const stu = students.find(s=>s.id===selId);
  const upd = (id,fn) => setStudents(p=>p.map(s=>s.id===id?fn(s):s));

  const attPct = stu && stu.attendance.length
    ? Math.round(stu.attendance.filter(a=>a.present).length/stu.attendance.length*100) : 0;

  const schedMap = buildScheduleMap(students);
  const scheduledCount = students.filter(s=>s.scheduleDay&&s.scheduleTime).length;
  const schedByDay = DAYS.reduce((acc,d)=>{
    const slots = schedMap.filter(sl=>sl.day===d);
    if(slots.length) acc[d]=slots;
    return acc;
  },{});

  function openStu(id) {
    setSelId(id); setNotes(students.find(s=>s.id===id)?.notes||"");
    setTab("progress"); setView("detail"); setDrawerOpen(false); setMobTab("overview");
  }
  function goOverview() { setView("overview"); setSelId(null); setMobTab("overview"); setDrawerOpen(false); }
  function goSchedule() { setView("schedule"); setSelId(null); setDrawerOpen(false); setMobTab("schedule"); }

  function addStudent() {
    if (!form.name.trim()) return;
    const s = {
      ...mkStudent(Date.now(), form.name.trim(), COLORS[students.length % COLORS.length], form.level),
    };
    setStudents(p=>[...p,s]); setForm({name:"",level:"Beginner"}); setModal(""); openStu(s.id);
  }
  function addSong() {
    const t=songIn.trim(); if(!t) return;
    upd(selId,s=>({...s,songs:[...s.songs.filter(x=>x!==t),t]}));
    setSongIn(""); setModal("");
  }
  function addHw() {
    if(!hwIn.trim()) return;
    upd(selId,s=>({...s,homework:[...s.homework,{id:Date.now(),text:hwIn.trim(),done:false}]}));
    setHwIn(""); setModal("");
  }
  function addGoal() {
    if(!goalIn.trim()) return;
    upd(selId,s=>({...s,goals:[...s.goals,{id:Date.now(),text:goalIn.trim(),done:false}]}));
    setGoalIn(""); setModal("");
  }
  function addAtt() {
    upd(selId,s=>({
      ...s,
      sessions: attOk&&!s.attendance.find(a=>a.date===attDate)?s.sessions+1:s.sessions,
      attendance:[...s.attendance.filter(a=>a.date!==attDate),{date:attDate,present:attOk}]
        .sort((a,b)=>b.date.localeCompare(a.date))
    }));
    setModal("");
  }

  const filtered = students.filter(s=>s.name.toLowerCase().includes(search.toLowerCase()));

  // ── Sidebar ──
  const SidebarContent = () => (
    <>
      <div className="sb-logo">
        <div className="sb-logo-row">
          <div className="sb-logo-icon"><Guitar size={18} color="#0d0c0a" /></div>
          <h1>Fretboard<br/>Studio</h1>
        </div>
        <p>Guitar Progress Tracker</p>
      </div>

      <div className="sb-search-wrap">
        <div className="sb-search">
          <Search size={13} />
          <input placeholder="Search students…" value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
      </div>

      <div className="sb-sec">Navigation</div>

      <div className={`sb-nav-item${view==="overview"?" active":""}`} onClick={goOverview}>
        <div className="sb-nav-icon"><LayoutDashboard size={15} /></div>
        <div className="sb-nav-info">
          <div className="sb-nav-name">Dashboard</div>
          <div className="sb-nav-sub">All students overview</div>
        </div>
        <div className="sb-nav-badge">{students.length}</div>
      </div>

      <div className={`sb-nav-item${view==="schedule"?" active":""}`} onClick={goSchedule}>
        <div className="sb-nav-icon"><CalendarDays size={15} /></div>
        <div className="sb-nav-info">
          <div className="sb-nav-name">Class Schedule</div>
          <div className="sb-nav-sub">{scheduledCount} of {students.length} scheduled</div>
        </div>
        <div className="sb-nav-badge">{Object.keys(schedByDay).length}d</div>
      </div>

      <div className="sb-sec">Students</div>

      {filtered.length===0 && search &&
        <div className="sb-empty">No matches for "{search}"</div>
      }
      {filtered.map(s=>{
        const a = avgSkill(s);
        return (
          <div key={s.id} className={`sb-stu-item${selId===s.id&&view==="detail"?" active":""}`} onClick={()=>openStu(s.id)}>
            <div className="sb-stu-av" style={{background:s.color+"22",color:s.color}}>{s.avatar}</div>
            <div className="sb-stu-info">
              <div className="sb-stu-name">{s.name}</div>
              <div className="sb-stu-sub">{s.level}{s.scheduleDay?` · ${s.scheduleDay.slice(0,3)}`:""}</div>
              <div className="sb-stu-bar"><div className="sb-stu-fill" style={{width:a+"%",background:s.color+"cc"}} /></div>
            </div>
            <div className="sb-stu-pct">{a}<span style={{fontSize:9,color:"var(--muted)"}}>%</span></div>
          </div>
        );
      })}
      {students.length===0 && <div className="sb-empty">No students yet. Add one!</div>}

      <div className="sb-footer">
        <button className="sb-add" onClick={()=>setModal("addStu")}>
          <Plus size={14} /> Add Student
        </button>
      </div>
    </>
  );

  // ── Master Schedule View ──
  const ScheduleView = () => (
    <>
      <div className="page-hd">
        <div className="page-title-wrap">
          <div className="page-eyebrow">Master View</div>
          <div className="page-title">Class Schedule</div>
          <div className="page-sub">
            {scheduledCount} student{scheduledCount!==1?"s":""} scheduled · {Object.keys(schedByDay).length} active day{Object.keys(schedByDay).length!==1?"s":""} · {schedMap.length} time slot{schedMap.length!==1?"s":""}
          </div>
        </div>
      </div>

      {/* Summary strip */}
      <div className="banner">
        {[
          { icon:<CalendarDays size={15}/>, v:scheduledCount,               l:"Scheduled" },
          { icon:<TrendingUp size={15}/>,   v:Object.keys(schedByDay).length, l:"Active Days" },
          { icon:<Clock size={15}/>,        v:schedMap.length,               l:"Time Slots" },
          { icon:<Users size={15}/>,        v:students.filter(s=>!s.scheduleDay).length, l:"Unscheduled" },
        ].map(({icon,v,l})=>(
          <div className="ban-item" key={l}>
            <div className="ban-icon-wrap">{icon}</div>
            <div className="ban-v">{v}</div>
            <div className="ban-l">{l}</div>
          </div>
        ))}
      </div>

      {Object.keys(schedByDay).length===0 ? (
        <div className="empty">
          <div className="empty-icon"><CalendarDays size={44} /></div>
          <div className="empty-title">No schedules set yet</div>
          <div className="empty-sub">Open a student profile, go to the Schedule tab, and assign their lesson day and time. They'll appear here.</div>
        </div>
      ) : (
        Object.entries(schedByDay).map(([day, slots])=>{
          const totalInDay = slots.reduce((a,sl)=>a+sl.students.length,0);
          return (
            <div className="sched-day-group" key={day}>
              <div className="sched-day-header">
                <div className="sched-day-label">{day}</div>
                <div className="sched-day-meta">
                  <span className="sched-day-count">{totalInDay} student{totalInDay!==1?"s":""}</span>
                  <span className="sched-day-count">{slots.length} slot{slots.length!==1?"s":""}</span>
                </div>
              </div>

              {slots.map(slot=>{
                const levelCount = slot.students.reduce((acc,s)=>{
                  acc[s.level]=(acc[s.level]||0)+1; return acc;
                },{});
                const durations = [...new Set(slot.students.map(s=>s.scheduleDuration).filter(Boolean))];
                return (
                  <div className="sched-slot" key={slot.time}>
                    {/* Time column */}
                    <div className="sched-time-block">
                      <div className="sched-time">{slot.time}</div>
                      {durations.length>0 && <div className="sched-dur">{durations.join(" / ")}</div>}
                    </div>

                    {/* Students column */}
                    <div>
                      <div className="sched-student-list">
                        {slot.students.map(s=>(
                          <div className="sched-stu-pill" key={s.id} onClick={()=>openStu(s.id)}>
                            <Av name={s.name} color={s.color} size={28} radius={6} fs={9}/>
                            <div>
                              <div className="sched-stu-name">{s.name}</div>
                              <div className="sched-stu-meta">{s.level} · {avgSkill(s)}% avg</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {/* Grade breakdown — always visible */}
                      <div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:10}}>
                        {Object.entries(levelCount).map(([lvl,cnt])=>{
                          const ls = LEVEL_STYLE[lvl]||LEVEL_STYLE.Beginner;
                          return (
                            <span key={lvl} style={{
                              display:"inline-flex",alignItems:"center",gap:4,
                              padding:"3px 9px",borderRadius:6,fontSize:9,fontWeight:500,
                              background:ls.bg,color:ls.text,border:`1px solid ${ls.border}`
                            }}>
                              {cnt}× {lvl}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right: capacity */}
                    <div className="sched-slot-right">
                      <div className="sched-cap-block">
                        <div className="sched-cap-num">{slot.students.length}</div>
                        <div className="sched-cap-lbl">student{slot.students.length!==1?"s":""}</div>
                      </div>
                      <button className="btn btn-ghost btn-xs" onClick={()=>openStu(slot.students[0].id)}>
                        View →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })
      )}

      {/* Unscheduled students */}
      {students.filter(s=>!s.scheduleDay||!s.scheduleTime).length>0 && (
        <div className="unscheduled-wrap">
          <div className="unscheduled-label">
            Unscheduled — {students.filter(s=>!s.scheduleDay||!s.scheduleTime).length} student{students.filter(s=>!s.scheduleDay||!s.scheduleTime).length!==1?"s":""}
          </div>
          <div className="unscheduled-pills">
            {students.filter(s=>!s.scheduleDay||!s.scheduleTime).map(s=>(
              <div className="sched-stu-pill" key={s.id} onClick={()=>openStu(s.id)}>
                <Av name={s.name} color={s.color} size={26} radius={6} fs={9}/>
                <div>
                  <div className="sched-stu-name">{s.name}</div>
                  <div className="sched-stu-meta" style={{color:"var(--red)"}}>No slot set</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );

  // ── Schedule Tab (in student profile) ──
  const ScheduleTab = () => {
    const conflicts = students.filter(s=>s.id!==selId&&s.scheduleDay===stu.scheduleDay&&s.scheduleTime===stu.scheduleTime&&stu.scheduleDay&&stu.scheduleTime);
    return (
      <div className="card card-accent">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <div className="card-title" style={{margin:0}}>Lesson Schedule</div>
          {stu.scheduleDay && stu.scheduleTime && (
            <button className="btn btn-ghost btn-sm" onClick={goSchedule}>
              <CalendarDays size={13}/> Master Schedule →
            </button>
          )}
        </div>

        {/* Current schedule display */}
        {stu.scheduleDay && stu.scheduleTime ? (
          <div className="sched-display-card">
            <div>
              <div className="sched-display-time">{stu.scheduleTime}</div>
              <div className="sched-display-day">{stu.scheduleDay} · {stu.scheduleDuration}</div>
            </div>
            <div style={{marginLeft:"auto"}}><LvlBadge level={stu.level} /></div>
          </div>
        ) : (
          <div style={{padding:"14px 16px",background:"var(--surf2)",borderRadius:8,marginBottom:18,fontSize:11,color:"var(--muted)",fontStyle:"italic",display:"flex",alignItems:"center",gap:8}}>
            <Clock size={14} /> No schedule set yet. Fill in the fields below.
          </div>
        )}

        {/* Edit fields */}
        <div className="form-row" style={{marginBottom:12}}>
          <div className="form-grp" style={{margin:0}}>
            <label className="form-lbl">Day of Week</label>
            <select className="inp sel" value={stu.scheduleDay}
              onChange={e=>upd(selId,s=>({...s,scheduleDay:e.target.value}))}>
              <option value="">— Select day —</option>
              {DAYS.map(d=><option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="form-grp" style={{margin:0}}>
            <label className="form-lbl">Time Slot</label>
            <select className="inp sel" value={stu.scheduleTime}
              onChange={e=>upd(selId,s=>({...s,scheduleTime:e.target.value}))}>
              <option value="">— Select time —</option>
              {TIMES.map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="form-grp">
          <label className="form-lbl">Session Duration</label>
          <select className="inp sel" value={stu.scheduleDuration}
            onChange={e=>upd(selId,s=>({...s,scheduleDuration:e.target.value}))}>
            {DURATIONS.map(d=><option key={d}>{d}</option>)}
          </select>
        </div>

        {/* Conflict warning */}
        {conflicts.length>0 && (
          <div className="conflict-box">
            <AlertTriangle size={15} style={{flexShrink:0,marginTop:1}} />
            <div>Shared slot with: <strong>{conflicts.map(s=>s.name).join(", ")}</strong>. This is allowed (group lessons) — just a heads-up.</div>
          </div>
        )}

        {/* Clear schedule */}
        {(stu.scheduleDay || stu.scheduleTime) && (
          <div style={{marginTop:14,paddingTop:14,borderTop:"1px solid var(--border)"}}>
            <button className="btn btn-danger btn-sm"
              onClick={()=>upd(selId,s=>({...s,scheduleDay:"",scheduleTime:""}))}>
              <X size={12}/> Clear Schedule
            </button>
          </div>
        )}
      </div>
    );
  };

  // ── Progress Tab ──
  const ProgressTab = () => (
    <div className="g2">
      {/* Left: visual skill bars with per-skill notes */}
      <div className="card card-accent">
        <div className="card-title">Skill Overview</div>
        {SKILLS.map(sk=>(
          <SkillBar key={sk} label={sk} value={stu.skills[sk]||0} note={stu.skillNotes?.[sk]||""} />
        ))}
      </div>
      {/* Right: sliders + per-skill note textareas */}
      <div className="card card-accent">
        <div className="card-title">Adjust & Track</div>
        {SKILLS.map(sk=>(
          <div className="slider-row" key={sk}>
            <div className="slider-row-top">
              <div className="slider-lbl">{sk}</div>
              <input type="range" min={0} max={100} value={stu.skills[sk]||0}
                className="slider"
                onChange={e=>upd(selId,s=>({...s,skills:{...s.skills,[sk]:Number(e.target.value)}}))} />
              <div className="slider-val">{stu.skills[sk]||0}</div>
            </div>
            <textarea
              className="skill-note-inp"
              rows={2}
              value={stu.skillNotes?.[sk]||""}
              onChange={e=>upd(selId,s=>({...s,skillNotes:{...s.skillNotes,[sk]:e.target.value}}))}
              placeholder={`Progress notes for ${sk}…`}
            />
          </div>
        ))}
      </div>
    </div>
  );

  // ── Render ──
  return (
    <>
      <style>{CSS}</style>
      <div className="app">

        {/* Desktop Sidebar */}
        <div className="sidebar"><SidebarContent /></div>

        {/* Main area */}
        <div className="main">

          {/* Mobile top bar */}
          <div className="mob-top">
            <div>
              <div className="mob-top-title">Fretboard Studio</div>
              <div className="mob-top-sub">Guitar Progress Tracker</div>
            </div>
            <button className="mob-add-fab" onClick={()=>setModal("addStu")} aria-label="Add student">
              <Plus size={16}/>
            </button>
          </div>

          <div className="page">

            {/* ═══ OVERVIEW ═══ */}
            {view==="overview" && <>
              <div className="page-hd">
                <div className="page-title-wrap">
                  <div className="page-eyebrow">Instructor View</div>
                  <div className="page-title">Dashboard</div>
                  <div className="page-sub">{students.length} student{students.length!==1?"s":""} enrolled</div>
                </div>
                <div className="page-hd-actions">
                  <button className="btn btn-ghost" onClick={goSchedule}><CalendarDays size={13}/> Schedule</button>
                  <button className="btn btn-gold" onClick={()=>setModal("addStu")}><Plus size={13}/> New Student</button>
                </div>
              </div>

              <div className="banner">
                {[
                  { icon:<Users size={14}/>,       v:students.length,         l:"Students" },
                  { icon:<TrendingUp size={14}/>,   v:(students.length?Math.round(students.reduce((a,s)=>a+avgSkill(s),0)/students.length):0)+"%", l:"Avg Progress" },
                  { icon:<CalendarDays size={14}/>, v:scheduledCount,          l:"Scheduled" },
                  { icon:<Guitar size={14}/>,       v:students.reduce((a,s)=>a+s.sessions,0), l:"Total Sessions" },
                  { icon:<Clock size={14}/>,        v:Object.keys(schedByDay).length, l:"Active Days" },
                ].map(({icon,v,l})=>(
                  <div className="ban-item" key={l}>
                    <div className="ban-icon-wrap">{icon}</div>
                    <div className="ban-v">{v}</div>
                    <div className="ban-l">{l}</div>
                  </div>
                ))}
              </div>

              <div className="ov-grid">
                {filtered.map(s=>{
                  const a=avgSkill(s); const fc=fillColor(a);
                  const ap=s.attendance.length?Math.round(s.attendance.filter(x=>x.present).length/s.attendance.length*100):null;
                  const ls = LEVEL_STYLE[s.level]||LEVEL_STYLE.Beginner;
                  return (
                    <div className="ov-card" key={s.id} onClick={()=>openStu(s.id)}
                      style={{"--card-accent":s.color}}>
                      <style>{`.ov-card:hover::before { background: linear-gradient(90deg,${s.color},transparent); }`}</style>
                      <div className="ov-av-row">
                        <div className="ov-av" style={{background:s.color+"28",color:s.color}}>{s.avatar}</div>
                        <LvlBadge level={s.level} />
                      </div>
                      <div className="ov-name">{s.name}</div>
                      <div className="ov-meta">
                        Joined {s.joinDate}
                        {s.scheduleDay && (
                          <span className="ov-sched-chip"><Clock size={9} style={{display:"inline",verticalAlign:"middle",marginRight:2}}/>{s.scheduleDay.slice(0,3)} {s.scheduleTime}</span>
                        )}
                      </div>
                      <div className="ov-stats">
                        {[
                          {v:s.sessions,    l:"Sessions",  c:"var(--text)"},
                          {v:a+"%",         l:"Progress",  c:fc},
                          ...(ap!==null?[{v:ap+"%", l:"Attend.", c:ap>=80?"var(--green)":"var(--red)"}]:[])
                        ].map(({v,l,c})=>(
                          <div key={l}>
                            <div className="ov-stat-v" style={{color:c}}>{v}</div>
                            <div className="ov-stat-l">{l}</div>
                          </div>
                        ))}
                      </div>
                      <div className="ov-bar"><div className="ov-bar-fill" style={{width:a+"%",background:fc}} /></div>
                    </div>
                  );
                })}
              </div>
              {filtered.length===0 && (
                <div className="empty">
                  <div className="empty-icon"><Guitar size={42} /></div>
                  <div className="empty-title">No students found</div>
                  <div className="empty-sub">Try a different search or add a new student to get started.</div>
                </div>
              )}
            </>}

            {/* ═══ SCHEDULE ═══ */}
            {view==="schedule" && <ScheduleView />}

            {/* ═══ DETAIL ═══ */}
            {view==="detail" && stu && <>
              <button className="back-btn" onClick={goOverview}>
                <ChevronLeft size={14}/> Back to Dashboard
              </button>

              {/* Student header */}
              <div className="stu-hd">
                <div className="stu-hd-av" style={{background:stu.color+"28",color:stu.color}}>{stu.avatar}</div>
                <div className="stu-hd-body">
                  <h2>{stu.name}</h2>
                  <div className="stu-chips">
                    <div className="chip"><Guitar size={11}/><b>{stu.sessions}</b> sessions</div>
                    <div className="chip"><Music2 size={11}/><b>{stu.songs.length}</b> songs</div>
                    <div className="chip"><TrendingUp size={11}/><b style={{color:"var(--gold)"}}>{avgSkill(stu)}%</b> avg</div>
                    {stu.attendance.length>0 && (
                      <div className="chip"><ClipboardList size={11}/><b style={{color:attPct>=80?"var(--green)":"var(--red)"}}>{attPct}%</b> attend.</div>
                    )}
                    {stu.scheduleDay && stu.scheduleTime && (
                      <div className="chip"><Clock size={11}/><b>{stu.scheduleDay.slice(0,3)} {stu.scheduleTime}</b></div>
                    )}
                    <div className="chip">Joined <b>{stu.joinDate}</b></div>
                  </div>
                </div>
                <div className="stu-hd-actions">
                  <select className="inp sel btn-sm" value={stu.level} style={{width:"auto",background:"var(--surf2)"}}
                    onChange={e=>upd(selId,s=>({...s,level:e.target.value}))}>
                    {LEVELS.map(l=><option key={l}>{l}</option>)}
                  </select>
                  <button className="btn btn-ghost btn-sm" onClick={()=>setModal("addAtt")}>
                    <ClipboardList size={12}/> Attendance
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={()=>{setStudents(p=>p.filter(s=>s.id!==selId));goOverview();}}>
                    <Trash2 size={12}/> Remove
                  </button>
                </div>
              </div>

              {/* Stat row */}
              <div className="g4" style={{marginBottom:16}}>
                {[
                  { icon:<TrendingUp size={16}/>, num:<>{avgSkill(stu)}<span style={{fontSize:18,color:"var(--muted)"}}>%</span></>, lbl:"Overall Progress" },
                  { icon:<Guitar size={16}/>, num:stu.sessions, lbl:"Sessions",
                    action:<button className="btn btn-ghost btn-sm" onClick={()=>upd(selId,s=>({...s,sessions:s.sessions+1}))}>+ Log</button> },
                  { icon:<Music2 size={16}/>, num:stu.songs.length, lbl:"Repertoire" },
                  { icon:<ClipboardList size={16}/>, num:stu.attendance.length?<span style={{color:attPct>=80?"var(--green)":"var(--red)"}}>{attPct}%</span>:"—", lbl:"Attendance" },
                ].map(({icon,num,lbl,action},i)=>(
                  <div className="stat-card" key={i}>
                    <div className="stat-icon-wrap">{icon}</div>
                    <div className="stat-num">{num}</div>
                    <div className="stat-lbl">{lbl}</div>
                    {action && <div className="stat-action">{action}</div>}
                  </div>
                ))}
              </div>

              {/* Tabs */}
              <div className="tabs">
                {[
                  {k:"progress",   l:"Progress",   icon:<TrendingUp size={12}/>},
                  {k:"songs",      l:"Songs",       icon:<Music2 size={12}/>},
                  {k:"homework",   l:"Homework",    icon:<BookOpen size={12}/>},
                  {k:"goals",      l:"Goals",       icon:<Target size={12}/>},
                  {k:"schedule",   l:"Schedule",    icon:<Clock size={12}/>},
                  {k:"attendance", l:"Attendance",  icon:<ClipboardList size={12}/>},
                  {k:"notes",      l:"Notes",       icon:<StickyNote size={12}/>},
                ].map(({k,l,icon})=>(
                  <button key={k} className={`tab${tab===k?" active":""}`} onClick={()=>setTab(k)}>
                    {icon}{l}
                  </button>
                ))}
              </div>

              {/* ── Progress tab ── */}
              {tab==="progress" && <ProgressTab />}

              {/* ── Songs tab ── */}
              {tab==="songs" && (
                <div className="card card-accent">
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                    <div className="card-title" style={{margin:0}}>Repertoire — {stu.songs.length} song{stu.songs.length!==1?"s":""}</div>
                    <button className="btn btn-gold btn-sm" onClick={()=>setModal("addSong")}><Plus size={12}/> Add</button>
                  </div>
                  {stu.songs.length===0
                    ?<div className="empty"><div className="empty-icon"><Music2 size={38}/></div><div className="empty-title">No songs yet</div><div className="empty-sub">Add songs this student is working on.</div></div>
                    :<div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                      {stu.songs.map(sg=>(
                        <span className="tag" key={sg}>
                          <span className="tag-dot" style={{background:stu.color}}/>
                          {sg}
                          <span className="tag-x" onClick={()=>upd(selId,s=>({...s,songs:s.songs.filter(x=>x!==sg)}))}><X size={13}/></span>
                        </span>
                      ))}
                    </div>
                  }
                </div>
              )}

              {/* ── Homework tab ── */}
              {tab==="homework" && (
                <div className="card card-accent">
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                    <div className="card-title" style={{margin:0}}>Homework — {stu.homework.filter(h=>h.done).length}/{stu.homework.length} done</div>
                    <button className="btn btn-gold btn-sm" onClick={()=>setModal("addHw")}><Plus size={12}/> Assign</button>
                  </div>
                  {stu.homework.length===0
                    ?<div className="empty"><div className="empty-icon"><BookOpen size={38}/></div><div className="empty-title">No homework assigned</div></div>
                    :stu.homework.map(h=><CheckItem key={h.id} text={h.text} done={h.done}
                        onToggle={()=>upd(selId,s=>({...s,homework:s.homework.map(x=>x.id===h.id?{...x,done:!x.done}:x)}))}
                        onDelete={()=>upd(selId,s=>({...s,homework:s.homework.filter(x=>x.id!==h.id)}))} />)
                  }
                  <div className="add-row">
                    <input className="inp" placeholder="e.g. Practice G–C chord change 10 min/day" value={hwIn}
                      onChange={e=>setHwIn(e.target.value)}
                      onKeyDown={e=>{if(e.key==="Enter"&&hwIn.trim()){upd(selId,s=>({...s,homework:[...s.homework,{id:Date.now(),text:hwIn.trim(),done:false}]}));setHwIn("");}}} />
                    <button className="btn btn-gold" onClick={()=>{if(hwIn.trim()){upd(selId,s=>({...s,homework:[...s.homework,{id:Date.now(),text:hwIn.trim(),done:false}]}));setHwIn("");}}}>Add</button>
                  </div>
                </div>
              )}

              {/* ── Goals tab ── */}
              {tab==="goals" && (
                <div className="card card-accent">
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                    <div className="card-title" style={{margin:0}}>Goals — {stu.goals.filter(g=>g.done).length}/{stu.goals.length} achieved</div>
                    <button className="btn btn-gold btn-sm" onClick={()=>setModal("addGoal")}><Plus size={12}/> Set Goal</button>
                  </div>
                  {stu.goals.length===0
                    ?<div className="empty"><div className="empty-icon"><Target size={38}/></div><div className="empty-title">No goals set</div></div>
                    :stu.goals.map(g=><CheckItem key={g.id} text={g.text} done={g.done}
                        onToggle={()=>upd(selId,s=>({...s,goals:s.goals.map(x=>x.id===g.id?{...x,done:!x.done}:x)}))}
                        onDelete={()=>upd(selId,s=>({...s,goals:s.goals.filter(x=>x.id!==g.id)}))} />)
                  }
                  <div className="add-row">
                    <input className="inp" placeholder="e.g. Master F barre chord by end of month" value={goalIn}
                      onChange={e=>setGoalIn(e.target.value)}
                      onKeyDown={e=>{if(e.key==="Enter"&&goalIn.trim()){upd(selId,s=>({...s,goals:[...s.goals,{id:Date.now(),text:goalIn.trim(),done:false}]}));setGoalIn("");}}} />
                    <button className="btn btn-gold" onClick={()=>{if(goalIn.trim()){upd(selId,s=>({...s,goals:[...s.goals,{id:Date.now(),text:goalIn.trim(),done:false}]}));setGoalIn("");}}}>Add</button>
                  </div>
                </div>
              )}

              {/* ── Schedule tab ── */}
              {tab==="schedule" && <ScheduleTab />}

              {/* ── Attendance tab ── */}
              {tab==="attendance" && (
                <div className="card card-accent">
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                    <div className="card-title" style={{margin:0}}>Attendance — {stu.attendance.filter(a=>a.present).length}/{stu.attendance.length} present</div>
                    <button className="btn btn-gold btn-sm" onClick={()=>setModal("addAtt")}><Plus size={12}/> Record</button>
                  </div>
                  {stu.attendance.length===0
                    ?<div className="empty"><div className="empty-icon"><ClipboardList size={38}/></div><div className="empty-title">No records yet</div></div>
                    :<table className="tbl">
                      <thead><tr><th>Date</th><th>Status</th><th>Session #</th></tr></thead>
                      <tbody>
                        {stu.attendance.map((a,i)=>(
                          <tr key={a.date}>
                            <td>{a.date}</td>
                            <td>
                              <span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"3px 9px",borderRadius:6,fontSize:10,fontWeight:500,
                                background:a.present?"var(--green-bg)":"var(--red-bg)",color:a.present?"var(--green)":"var(--red)"}}>
                                {a.present ? <><Check size={10}/>Present</> : <><X size={10}/>Absent</>}
                              </span>
                            </td>
                            <td style={{color:"var(--muted)"}}>{stu.attendance.length-i}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  }
                </div>
              )}

              {/* ── Notes tab ── */}
              {tab==="notes" && (
                <div className="card card-accent">
                  <div className="card-title">Lesson Notes</div>
                  <textarea className="inp textarea" value={notes} onChange={e=>setNotes(e.target.value)}
                    placeholder="Record observations, breakthroughs, areas to improve, things to cover next lesson…" />
                  <div style={{display:"flex",justifyContent:"flex-end",marginTop:14}}>
                    <button className="btn btn-gold" onClick={()=>upd(selId,s=>({...s,notes}))}>
                      <Check size={13}/> Save Notes
                    </button>
                  </div>
                </div>
              )}
            </>}

          </div>
        </div>

        {/* Mobile Bottom Nav */}
        <nav className="mob-nav">
          <button className={`mob-nav-tab${mobTab==="overview"?" active":""}`} onClick={()=>{setMobTab("overview");goOverview();}}>
            <IcoHome />Overview
          </button>
          <button className={`mob-nav-tab${mobTab==="schedule"?" active":""}`} onClick={()=>{setMobTab("schedule");goSchedule();}}>
            <IcoCal />Schedule
          </button>
          <button className={`mob-nav-tab${drawerOpen||mobTab==="students"?" active":""}`} onClick={()=>{setDrawerOpen(d=>!d);setMobTab("students");}}>
            <IcoUsers />Students
          </button>
        </nav>

        {/* Mobile Students Drawer */}
        {drawerOpen && (
          <>
            <div className="mob-drawer">
              <div className="mob-drawer-hd">
                <div className="mob-drawer-lbl">{students.length} Student{students.length!==1?"s":""}</div>
                <button className="mob-drawer-close" onClick={()=>setDrawerOpen(false)}><X size={18}/></button>
              </div>
              {students.map(s=>(
                <div key={s.id} className={`mob-stu-row${selId===s.id?" active":""}`} onClick={()=>openStu(s.id)}>
                  <Av name={s.name} color={s.color} size={36} radius={9} fs={11}/>
                  <div className="mob-stu-info">
                    <div className="mob-stu-name">{s.name}</div>
                    <div className="mob-stu-sub">{s.level}{s.scheduleDay?` · ${s.scheduleDay.slice(0,3)} ${s.scheduleTime}`:""}</div>
                  </div>
                  <div className="mob-stu-pct">{avgSkill(s)}%</div>
                </div>
              ))}
            </div>
            <div style={{position:"fixed",inset:0,zIndex:48}} onClick={()=>setDrawerOpen(false)} />
          </>
        )}

      </div>

      {/* ═══ MODALS ═══ */}

      <Modal show={modal==="addStu"} onClose={()=>setModal("")} title="Add New Student">
        <div className="form-grp">
          <label className="form-lbl">Full Name</label>
          <input className="inp" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}
            placeholder="e.g. Rohan Shrestha" autoFocus onKeyDown={e=>e.key==="Enter"&&addStudent()} />
        </div>
        <div className="form-grp">
          <label className="form-lbl">Starting Level</label>
          <select className="inp sel" value={form.level} onChange={e=>setForm(p=>({...p,level:e.target.value}))}>
            {LEVELS.map(l=><option key={l}>{l}</option>)}
          </select>
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={()=>setModal("")}>Cancel</button>
          <button className="btn btn-gold" onClick={addStudent}><Plus size={12}/> Add Student</button>
        </div>
      </Modal>

      <Modal show={modal==="addSong"} onClose={()=>setModal("")} title="Add Song to Repertoire">
        <div className="form-grp">
          <label className="form-lbl">Song Title</label>
          <input className="inp" value={songIn} onChange={e=>setSongIn(e.target.value)}
            placeholder="e.g. Nothing Else Matters – Metallica" autoFocus onKeyDown={e=>e.key==="Enter"&&addSong()} />
        </div>
        <div style={{fontSize:10,color:"var(--muted)",marginTop:-8,marginBottom:4,fontStyle:"italic"}}>Any song — no restrictions.</div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={()=>{setModal("");setSongIn("");}}>Cancel</button>
          <button className="btn btn-gold" onClick={addSong}>Add Song</button>
        </div>
      </Modal>

      <Modal show={modal==="addHw"} onClose={()=>setModal("")} title="Assign Homework">
        <div className="form-grp">
          <label className="form-lbl">Practice Task</label>
          <input className="inp" value={hwIn} onChange={e=>setHwIn(e.target.value)}
            placeholder="e.g. Practice G–C chord change 10 min/day" autoFocus onKeyDown={e=>e.key==="Enter"&&addHw()} />
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={()=>setModal("")}>Cancel</button>
          <button className="btn btn-gold" onClick={addHw}>Assign</button>
        </div>
      </Modal>

      <Modal show={modal==="addGoal"} onClose={()=>setModal("")} title="Set Learning Goal">
        <div className="form-grp">
          <label className="form-lbl">Goal</label>
          <input className="inp" value={goalIn} onChange={e=>setGoalIn(e.target.value)}
            placeholder="e.g. Master F barre chord by end of month" autoFocus onKeyDown={e=>e.key==="Enter"&&addGoal()} />
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={()=>setModal("")}>Cancel</button>
          <button className="btn btn-gold" onClick={addGoal}>Set Goal</button>
        </div>
      </Modal>

      <Modal show={modal==="addAtt"} onClose={()=>setModal("")} title="Record Attendance">
        <div className="form-grp">
          <label className="form-lbl">Lesson Date</label>
          <input type="date" className="inp" value={attDate} onChange={e=>setAttDate(e.target.value)} />
        </div>
        <div className="form-grp">
          <label className="form-lbl">Status</label>
          <select className="inp sel" value={attOk?"present":"absent"} onChange={e=>setAttOk(e.target.value==="present")}>
            <option value="present">✓ Present</option>
            <option value="absent">✗ Absent</option>
          </select>
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={()=>setModal("")}>Cancel</button>
          <button className="btn btn-gold" onClick={addAtt}><Check size={12}/> Save</button>
        </div>
      </Modal>
    </>
  );
}
