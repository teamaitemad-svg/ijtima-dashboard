const loginScreen = document.querySelector("#loginScreen");
const loginForm = document.querySelector("#loginForm");
const usernameInput = document.querySelector("#usernameInput");
const passwordInput = document.querySelector("#passwordInput");
const loginError = document.querySelector("#loginError");
const loginButton = document.querySelector("#loginButton");
const closeLoginButton = document.querySelector("#closeLoginButton");
const sessionLabel = document.querySelector("#sessionLabel");
const signedInUser = document.querySelector("#signedInUser");
const logoutButton = document.querySelector("#logoutButton");
const appShell = document.querySelector(".app-shell");
const sidebarToggle = document.querySelector("#sidebarToggle");
const navList = document.querySelector("#navList");
const dashboardGrid = document.querySelector("#dashboardGrid");
const pageTitle = document.querySelector("#pageTitle");

let currentUser = null;
let currentRole = "public";
let currentSection = "Overview";
let attendanceSearch = "";
let attendanceMessage = "";
let attendanceModal = null;
let registrationSearch = "";
let registrationHalqaFilter = "All";
let attendanceReportSearch = "";
let attendanceReportHalqaFilter = "All";
let attendanceReportStatusFilter = "All";
let competitionAdminCategoryFilter = "All";
let competitionAdminSearch = "";
let adminUserSearch = "";
let adminUserRoleFilter = "All";
let editingScheduleRow = null;
let editingAnnouncementRow = null;
let editingUserRow = null;
let isSidebarCollapsed = false;
let avSlideIndex = 0;
let avTimer = null;
let judgeMessage = "";
let educationSelectedCompetition = "Tilawat";
let educationRosterAdminCompetition = "Tilawat";
let sportsMessage = "";
let sportsSelectedSport = "Basketball";
let sportsRosterAdminSport = "Basketball";
let liveRefreshTimer = null;
let prayerTimer = null;
const apiBase = (() => {
  const pathname = window.location.pathname.replace(/\/+$/, "");

  if (!pathname || pathname === "/") {
    return "";
  }

  const firstSegment = pathname.split("/").filter(Boolean)[0];
  return firstSegment ? `/${firstSegment}` : "";
})();

let halqajat = [
  "Jamia Ahmadiyya",
  "Kleinburg North",
  "Kleinburg South",
  "Maple",
  "Peace Village Center East",
  "Peace Village Center West",
  "Peace Village East",
  "Peace Village South East",
  "Peace Village South West",
  "Peace Village West",
  "Springside",
  "Vaughan East",
  "Vaughan North",
  "Vaughan South",
  "Woodbridge North",
  "Woodbridge South",
];

const halqaTajnidReference = {
  "Peace Village West": { registrations: 34, tajnid: 72 },
  "Peace Village Center East": { registrations: 41, tajnid: 112 },
  "Vaughan East": { registrations: 21, tajnid: 88 },
  "Peace Village Center West": { registrations: 18, tajnid: 82 },
  "Vaughan North": { registrations: 19, tajnid: 131 },
  "Woodbridge North": { registrations: 19, tajnid: 142 },
  "Vaughan South": { registrations: 12, tajnid: 100 },
  "Peace Village East": { registrations: 15, tajnid: 143 },
  "Peace Village South East": { registrations: 9, tajnid: 87 },
  Springside: { registrations: 10, tajnid: 99 },
  Maple: { registrations: 11, tajnid: 110 },
  "Kleinburg South": { registrations: 6, tajnid: 68 },
  "Peace Village South West": { registrations: 7, tajnid: 98 },
  "Kleinburg North": { registrations: 5, tajnid: 101 },
  "Jamia Ahmadiyya": { registrations: 2, tajnid: 104 },
  "Woodbridge South": { registrations: 0, tajnid: 91 },
};

const zaimUsers = halqajat.map((halqa, index) => {
  const number = String(index + 1).padStart(2, "0");

  return {
    username: `zaim${number}`,
    password: "zaim123",
    name: `Zaim ${number}`,
    role: "zaim",
    halqa,
    access: `${halqa} only`,
  };
});

const users = [
  {
    username: "admin",
    password: "admin123",
    name: "Admin User",
    role: "admin",
    access: "Full portal access",
  },
  ...zaimUsers,
  {
    username: "attendance",
    password: "attend123",
    name: "Attendance Team",
    role: "attendance",
    access: "Check-in portal access",
  },
  {
    username: "edujudge1",
    password: "judge123",
    name: "Education Judge 1",
    role: "educationJudge",
    access: "Education judging access",
  },
  {
    username: "edujudge2",
    password: "judge123",
    name: "Education Judge 2",
    role: "educationJudge",
    access: "Education judging access",
  },
  {
    username: "edujudge3",
    password: "judge123",
    name: "Education Judge 3",
    role: "educationJudge",
    access: "Education judging access",
  },
  {
    username: "sportsadmin",
    password: "sports123",
    name: "Sports Admin",
    role: "sportsAdmin",
    access: "Sports results access",
  },
  {
    username: "av",
    password: "av123",
    name: "AV Team",
    role: "av",
    access: "Projector display access",
  },
];

let dashboardUsers = users.map((user) => ({ ...user }));

const roleLabels = {
  public: "Public Dashboard",
  zaim: "Zaim Dashboard",
  attendance: "Attendance Team Portal",
  educationJudge: "Education Judge Portal",
  sportsAdmin: "Sports Results Portal",
  admin: "Admin Portal",
  av: "AV Display Mode",
};

let scheduleItems = [
  {
    start: "09:00 AM",
    end: "09:30 AM",
    title: "Opening Session",
    location: "Main Hall",
    lead: "Ijtima Nazim",
    status: "Completed",
  },
  {
    start: "09:30 AM",
    end: "10:15 AM",
    title: "Tilawat & Nazm",
    location: "Main Hall",
    lead: "Education Team",
    status: "Live",
  },
  {
    start: "10:20 AM",
    end: "11:15 AM",
    title: "Educational Competitions",
    location: "Classroom Block",
    lead: "Taleem Department",
    status: "Next",
  },
  {
    start: "10:30 AM",
    end: "12:00 PM",
    title: "Sports Round 1",
    location: "Sports Ground",
    lead: "Sports Team",
    status: "Upcoming",
  },
  {
    start: "12:15 PM",
    end: "01:00 PM",
    title: "Lunch & Prayer Break",
    location: "Dining Area",
    lead: "Logistics Team",
    status: "Upcoming",
  },
];

let announcements = [
  {
    title: "Registration desk open",
    message: "Pre-registered members can collect badges from the entrance desk.",
    time: "08:45 AM",
    priority: "Info",
  },
  {
    title: "Sports location update",
    message: "Football round 1 has moved to the north field.",
    time: "09:20 AM",
    priority: "Important",
  },
  {
    title: "Lunch timing",
    message: "Lunch will begin after Zuhr prayer in the dining area.",
    time: "11:50 AM",
    priority: "Info",
  },
];

let halqaRankings = [
  { halqa: "Jamia Ahmadiyya", attendance: 88, education: 24, sports: 18 },
  { halqa: "Kleinburg North", attendance: 76, education: 31, sports: 12 },
  { halqa: "Kleinburg South", attendance: 91, education: 18, sports: 22 },
  { halqa: "Maple", attendance: 69, education: 26, sports: 28 },
  { halqa: "Peace Village Center East", attendance: 82, education: 16, sports: 15 },
  { halqa: "Peace Village Center West", attendance: 94, education: 21, sports: 26 },
  { halqa: "Peace Village East", attendance: 73, education: 29, sports: 11 },
  { halqa: "Peace Village South East", attendance: 86, education: 14, sports: 20 },
  { halqa: "Peace Village South West", attendance: 78, education: 22, sports: 24 },
  { halqa: "Peace Village West", attendance: 90, education: 27, sports: 17 },
  { halqa: "Springside", attendance: 64, education: 19, sports: 30 },
  { halqa: "Vaughan East", attendance: 81, education: 25, sports: 13 },
  { halqa: "Vaughan North", attendance: 71, education: 17, sports: 21 },
  { halqa: "Vaughan South", attendance: 84, education: 30, sports: 16 },
  { halqa: "Woodbridge North", attendance: 79, education: 20, sports: 19 },
  { halqa: "Woodbridge South", attendance: 87, education: 23, sports: 25 },
]
  .map((item) => ({
    ...item,
    total: Math.round(item.attendance * 0.5 + item.education + item.sports),
  }))
  .sort((a, b) => b.total - a.total)
  .map((item, index) => ({
    ...item,
    rank: index + 1,
  }));

let competitionResults = [
  {
    category: "Education",
    competition: "Tilawat",
    position: "1st",
    name: "Ahmad Khan",
    halqa: "Peace Village Center West",
  },
  {
    category: "Education",
    competition: "Nazm",
    position: "1st",
    name: "Bilal Ahmed",
    halqa: "Vaughan South",
  },
  {
    category: "Education",
    competition: "Speech",
    position: "1st",
    name: "Sameer Malik",
    halqa: "Kleinburg North",
  },
  {
    category: "Sports",
    competition: "Football",
    position: "1st",
    name: "Team Springside",
    halqa: "Springside",
  },
  {
    category: "Sports",
    competition: "100m Race",
    position: "1st",
    name: "Usman Raza",
    halqa: "Maple",
  },
  {
    category: "Sports",
    competition: "Tug of War",
    position: "1st",
    name: "Team Woodbridge South",
    halqa: "Woodbridge South",
  },
];

const educationCompetitions = [
  "Tilawat",
  "Nazm",
  "Adhan",
  "Speech (Urdu)",
  "Speech (English)",
  "Speech (French)",
  "Impromptu Speech (Urdu)",
  "Impromptu Speech (English)",
  "Hifz-e-Qur'an",
  "Hifz-e-Hadith",
  "Hifz-e-Adiyah",
  "Hifz-e-Ilhamat",
  "Message Relay",
  "Bait Bazi",
];

const defaultEducationCriteria = [
  { name: "Tajweed", max: 10 },
  { name: "Makharij", max: 10 },
  { name: "Voice", max: 10 },
];
let educationRubrics = {};
let educationCompetitionRosters = {};
let sportsCompetitionRosters = {};
let educationJudgeResults = [];

const sportsCompetitions = [
  { name: "Basketball", eventType: "Team", unit: "Score" },
  { name: "Soccer", eventType: "Team", unit: "Score" },
  { name: "Cricket", eventType: "Team", unit: "Score" },
  { name: "Volleyball", eventType: "Team", unit: "Score" },
  { name: "Kickball", eventType: "Team", unit: "Score" },
  { name: "Hockey", eventType: "Team", unit: "Score" },
  { name: "Badminton", eventType: "Individual/Doubles", unit: "Score" },
  { name: "Dodgeball", eventType: "Team", unit: "Score" },
  { name: "Shot Put", eventType: "Measured Individual", unit: "meters" },
  { name: "Running Long Jump", eventType: "Measured Individual", unit: "meters" },
  { name: "Standing Long Jump", eventType: "Measured Individual", unit: "meters" },
  { name: "100m Race", eventType: "Timed Individual", unit: "seconds" },
  { name: "Tug of War (Individual)", eventType: "Individual", unit: "Result" },
];
const positionPoints = {
  "1st": 10,
  "2nd": 7,
  "3rd": 5,
  Participation: 1,
};
const sportsPodiumPositions = [
  { position: "1st", label: "First Place", points: 10 },
  { position: "2nd", label: "Second Place", points: 7 },
  { position: "3rd", label: "Third Place", points: 5 },
];
let sportsPostedResults = [];

let memberRecords = halqajat.flatMap((halqa, halqaIndex) => {
  const baseCode = (halqaIndex + 1) * 1000;
  const registrationTarget = halqaTajnidReference[halqa]?.registrations || 0;
  const attendedTarget = Math.round(registrationTarget * (halqaIndex % 4 === 0 ? 0.7 : halqaIndex % 4 === 1 ? 0.55 : 0.45));

  return Array.from({ length: registrationTarget }, (_, memberIndex) => {
    const attended = memberIndex < attendedTarget;
    const checkInTimes = ["09:05 AM", "09:18 AM", "09:42 AM", "10:10 AM", "10:35 AM"];

    return {
      code: `M${baseCode + memberIndex + 1}`,
      name: `Member ${baseCode + memberIndex + 1}`,
      halqa,
      registered: true,
      attended,
      checkIn: attended ? checkInTimes[memberIndex % checkInTimes.length] : "",
    };
  });
});

let attendanceRecords = memberRecords
  .filter((member) => member.attended)
  .map((member) => ({
    code: member.code,
    name: member.name,
    halqa: member.halqa,
    checkIn: member.checkIn,
    checkedInBy: "Demo seed",
  }));

const avSlides = ["Welcome", "Live Schedule", "Coming Up", "Attendance Live", "Announcements", "Leaderboard", "Winners"];

function loadEducationRubricsFromStorage() {
  try {
    educationRubrics = JSON.parse(localStorage.getItem("educationRubrics") || "{}");
  } catch (error) {
    educationRubrics = {};
  }

  try {
    educationCompetitionRosters = JSON.parse(localStorage.getItem("educationCompetitionRosters") || "{}");
  } catch (error) {
    educationCompetitionRosters = {};
  }

  try {
    sportsCompetitionRosters = JSON.parse(localStorage.getItem("sportsCompetitionRosters") || "{}");
  } catch (error) {
    sportsCompetitionRosters = {};
  }
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.error || "Request failed.");
    error.data = data;
    throw error;
  }

  return data;
}

function escapeAttribute(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatCsvValue(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function downloadCsv(filename, headers, rows) {
  const csv = [headers, ...rows].map((row) => row.map(formatCsvValue).join(",")).join("\r\n");
  const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function openReportWindow(title, summaryRows, tableHeaders, tableRows) {
  const reportWindow = window.open("", "_blank", "noopener,noreferrer");

  if (!reportWindow) {
    window.print();
    return;
  }

  const generatedAt = new Date().toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const summaryMarkup = summaryRows
    .map(
      ([label, value]) => `
        <div class="metric">
          <span>${escapeHtml(label)}</span>
          <strong>${escapeHtml(value)}</strong>
        </div>
      `
    )
    .join("");
  const headMarkup = tableHeaders.map((header) => `<th>${escapeHtml(header)}</th>`).join("");
  const rowMarkup = tableRows
    .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`)
    .join("");

  reportWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <title>${escapeHtml(title)}</title>
        <style>
          body { margin: 32px; color: #0f172a; font-family: Arial, sans-serif; }
          h1 { margin: 0 0 6px; font-size: 24px; }
          .meta { margin-bottom: 22px; color: #475569; }
          .metrics { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin: 18px 0 24px; }
          .metric { padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; }
          .metric span { display: block; color: #64748b; font-size: 12px; text-transform: uppercase; }
          .metric strong { display: block; margin-top: 6px; font-size: 22px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { padding: 8px; border: 1px solid #cbd5e1; text-align: left; vertical-align: top; }
          th { background: #f1f5f9; text-transform: uppercase; font-size: 11px; }
          @media print { body { margin: 18mm; } button { display: none; } }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(title)}</h1>
        <div class="meta">Generated ${escapeHtml(generatedAt)}</div>
        <div class="metrics">${summaryMarkup}</div>
        <table>
          <thead><tr>${headMarkup}</tr></thead>
          <tbody>${rowMarkup}</tbody>
        </table>
        <script>
          window.addEventListener("load", () => {
            window.print();
          });
        </script>
      </body>
    </html>
  `);
  reportWindow.document.close();
}

function applyBootstrapData(data) {
  loadEducationRubricsFromStorage();
  halqajat = data.halqajat || halqajat;
  scheduleItems = data.scheduleItems || scheduleItems;
  announcements = data.announcements || announcements;
  halqaRankings = data.halqaRankings || halqaRankings;
  competitionResults = data.competitionResults || competitionResults;
  memberRecords = data.memberRecords || memberRecords;
  attendanceRecords = data.attendanceRecords || attendanceRecords;
  educationJudgeResults = data.educationJudgeResults || educationJudgeResults;
  educationCompetitionRosters = data.educationCompetitionRosters || educationCompetitionRosters;
  sportsCompetitionRosters = data.sportsCompetitionRosters || sportsCompetitionRosters;
  sportsPostedResults = data.sportsPostedResults || sportsPostedResults;
  dashboardUsers = data.users || dashboardUsers;
  reconcileAttendanceState();
}

function scrollToDashboardTarget(targetId) {
  const target = document.getElementById(targetId);

  if (!target) {
    return false;
  }

  target.scrollIntoView({ behavior: "smooth", block: "start" });
  return true;
}

function getPublicPanelId(title) {
  const panelIds = {
    "Live Schedule": "public-schedule",
    Announcements: "public-announcements",
    "Location Quick Links": "public-locations",
    "Help & Emergency": "public-help",
    "Halqa Position Report": "public-rankings",
    "Competition Positions": "public-competitions",
  };

  return panelIds[title] || "";
}

function syncPublicHashNavigation() {
  const hash = window.location.hash.replace(/^#/, "");

  if (!hash) {
    return;
  }

  if (hash === "public-schedule" && currentRole === "public") {
    currentSection = "Schedule";
    renderDashboard(currentRole);
    return;
  }

  if (hash === "public-announcements" || hash === "public-locations" || hash === "public-prayer-times" || hash === "public-competitions" || hash === "public-services" || hash === "public-weather" || hash === "public-live-now") {
    scrollToDashboardTarget(hash);
  }
}

window.addEventListener("hashchange", syncPublicHashNavigation);

const navItems = {
  public: ["Overview", "Schedule", "Announcements", "Locations", "Competitions", "Help"],
  zaim: ["Dashboard", "Members", "Attendance", "Rankings"],
  attendance: ["Check-In Station", "Activity Log", "Issues"],
  educationJudge: ["Competition Setup", "Score Entry", "Posted Results", "Final Positions"],
  sportsAdmin: ["Result Entry", "Published Results", "Sports Standings", "Closing Ceremony Sheet"],
  admin: ["Overview", "Schedule Manager", "Announcements", "Registrations", "Attendance Reports", "Competitions", "Users"],
  av: ["Display"],
};

const adminNavGroups = [
  { label: "Manage", items: ["Overview", "Schedule Manager", "Announcements"] },
  { label: "Operations", items: ["Registrations", "Attendance Reports", "Competitions"] },
  { label: "Admin", items: ["Users"] },
];

const navIconMap = {
  Overview: "grid",
  Dashboard: "grid",
  Schedule: "calendar",
  "Live Schedule": "calendar",
  Locations: "map",
  Help: "phone",
  "Competition Results": "trophy",
  "Halqa Positions": "chart",
  "Competition Positions": "trophy",
  Announcements: "megaphone",
  "My Halqa": "users",
  Members: "users",
  Registrations: "user",
  Attendance: "chart",
  "Check-In Station": "scan",
  "Activity Log": "clock",
  Issues: "alert",
  "Attendance Details": "chart",
  Rankings: "trophy",
  "Check In": "scan",
  "Search Members": "search",
  "Recent Attendance": "clock",
  "Issue Review": "alert",
  "Score Entry": "edit",
  "Competition Setup": "list",
  "Posted Results": "list",
  "Final Positions": "trophy",
  "Result Entry": "edit",
  "Published Results": "megaphone",
  "Sports Standings": "chart",
  "Closing Ceremony Sheet": "award",
  "Schedule Manager": "calendar",
  "Attendance Reports": "chart",
  Competitions: "trophy",
  Users: "users",
  "Attendance Live": "chart",
  Leaderboard: "trophy",
  Winners: "award",
  Display: "award",
};

function iconSvg(name) {
  const icons = {
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"></rect><rect x="14" y="3" width="7" height="7" rx="1.5"></rect><rect x="3" y="14" width="7" height="7" rx="1.5"></rect><rect x="14" y="14" width="7" height="7" rx="1.5"></rect>',
    calendar: '<rect x="4" y="5" width="16" height="16" rx="2"></rect><path d="M16 3v4M8 3v4M4 10h16"></path>',
    megaphone: '<path d="M4 14v-4l11-5v14L4 14Z"></path><path d="M4 14l2 6h3l-2-5"></path><path d="M18 9a4 4 0 0 1 0 6"></path>',
    user: '<path d="M20 21a8 8 0 0 0-16 0"></path><circle cx="12" cy="8" r="4"></circle>',
    users: '<path d="M16 21a6 6 0 0 0-12 0"></path><circle cx="10" cy="8" r="4"></circle><path d="M22 21a5 5 0 0 0-4-4.8"></path><path d="M16.5 4.3a4 4 0 0 1 0 7.4"></path>',
    chart: '<path d="M4 19V5"></path><path d="M4 19h17"></path><rect x="7" y="11" width="3" height="5" rx="1"></rect><rect x="12" y="7" width="3" height="9" rx="1"></rect><rect x="17" y="4" width="3" height="12" rx="1"></rect>',
    trophy: '<path d="M8 21h8"></path><path d="M12 17v4"></path><path d="M7 4h10v5a5 5 0 0 1-10 0V4Z"></path><path d="M7 6H4a3 3 0 0 0 3 3"></path><path d="M17 6h3a3 3 0 0 1-3 3"></path>',
    scan: '<path d="M7 3H5a2 2 0 0 0-2 2v2"></path><path d="M17 3h2a2 2 0 0 1 2 2v2"></path><path d="M7 21H5a2 2 0 0 1-2-2v-2"></path><path d="M17 21h2a2 2 0 0 0 2-2v-2"></path><path d="M7 12h10"></path>',
    search: '<circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path>',
    clock: '<circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path>',
    alert: '<path d="M12 9v4"></path><path d="M12 17h.01"></path><path d="M10.3 4.3 2.8 17.4A2 2 0 0 0 4.5 20h15a2 2 0 0 0 1.7-2.6L13.7 4.3a2 2 0 0 0-3.4 0Z"></path>',
    edit: '<path d="M12 20h9"></path><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"></path>',
    list: '<path d="M8 6h13"></path><path d="M8 12h13"></path><path d="M8 18h13"></path><path d="M3 6h.01"></path><path d="M3 12h.01"></path><path d="M3 18h.01"></path>',
    award: '<circle cx="12" cy="8" r="5"></circle><path d="M8.5 12.5 7 21l5-3 5 3-1.5-8.5"></path>',
    map: '<path d="M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3Z"></path><path d="M9 3v15"></path><path d="M15 6v15"></path>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.4 2.1L8.1 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.6 1.9Z"></path>',
  };
  return `<svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">${icons[name] || icons.grid}</svg>`;
}

const panels = {
  public: [
    {
      size: "large",
      title: "Live Schedule",
      body: "Shows current and upcoming programs by Ijtima location. We will connect this to a Schedule sheet later.",
      metrics: [
        ["3", "Active locations"],
        ["1", "Program live now"],
      ],
    },
    {
      size: "small",
      title: "Announcements",
      body: "Public notices for all attendees, including reminders, location updates, and timing changes.",
      metrics: [["Live", "Notice board"]],
    },
    {
      size: "medium",
      title: "Halqa Position Report",
      body: "Public ranking of all 16 halqajat based on attendance, education results, and sports results.",
      metrics: [
        ["16", "Halqajat"],
        ["--", "Leading halqa"],
      ],
    },
    {
      size: "medium",
      title: "Competition Positions",
      body: "Public list of education and sports position holders by category, position, name, and halqa.",
      metrics: [["--", "Results posted"]],
    },
    {
      size: "full",
      title: "Location Quick Links",
      body: "Fast access to common Ijtima locations. These can later connect to maps or indoor directions.",
    },
    {
      size: "full",
      title: "Help & Emergency",
      body: "Emergency contact, help desk location, and service support for attendees.",
    },
  ],
  zaim: [
    {
      size: "large",
      title: "My Halqa Registration",
      body: "Zaim users can view registration count and name-by-name details for their assigned halqa only.",
      metrics: [
        ["42", "Registered"],
        ["18", "Pending confirmation"],
      ],
    },
    {
      size: "medium",
      title: "My Halqa Attendance",
      body: "Authorized Zaim users can see detailed day-of attendance for their own halqa.",
      metrics: [["0", "Present today"]],
    },
    {
      size: "medium",
      title: "Leaderboard Position",
      body: "Shows how this halqa ranks based on attendance plus education and sports results.",
      metrics: [["--", "Current rank"]],
    },
  ],
  attendance: [
    {
      size: "large",
      title: "Member Check-In",
      body: "Attendance team screen for searching by member code, name, or halqa and marking people present.",
      metrics: [
        ["Fast", "Search flow"],
        ["Safe", "Duplicate checks"],
      ],
    },
    {
      size: "medium",
      title: "Recent Attendance",
      body: "Shows the latest check-ins with time, checked-in-by user, and method.",
      metrics: [["0", "Checked in today"]],
    },
    {
      size: "medium",
      title: "Manual Review",
      body: "Flags walk-ins or uncertain matches for admin review.",
      metrics: [["0", "Needs review"]],
    },
  ],
  educationJudge: [
    {
      size: "large",
      title: "Education Competition Setup",
      body: "Define the competition type and rubric before scoring begins. Rubrics lock after the first score is posted.",
    },
    {
      size: "full",
      title: "Education Score Entry",
      body: "Judges select the participant, enter rubric marks, and move quickly through the queue.",
    },
    {
      size: "medium",
      title: "Posted Education Results",
      body: "Official posted score entries from education judges.",
    },
    {
      size: "medium",
      title: "Education Final Positions",
      body: "Top three positions are calculated from cumulative posted scores.",
    },
  ],
  sportsAdmin: [
    {
      size: "full",
      title: "Sports Result Entry",
      body: "Assign podium winners, attach participant names, and preview the stage announcement before publishing.",
    },
    {
      size: "large",
      title: "Published Sports Results",
      body: "Published podium results with the names that should be called on stage.",
    },
    {
      size: "large",
      title: "Sports Standings",
      body: "Halqa points table calculated from published sports podium results.",
    },
    {
      size: "large",
      title: "Closing Ceremony Sheet",
      body: "Stage-ready list of sports winners and associated participants for the MC and ceremony team.",
    },
  ],
  admin: [
    {
      size: "large",
      title: "Operations Overview",
      body: "Admin users can manage schedule, Google Sheet mappings, user roles, attendance reports, competitions, and position holders.",
      metrics: [
        ["5", "Data areas"],
        ["4", "User roles"],
      ],
    },
    {
      size: "medium",
      title: "Schedule Manager",
      body: "Add a program to the public live schedule.",
    },
    {
      size: "medium",
      title: "Announcement Manager",
      body: "Post a public notice for attendees and AV display.",
    },
    {
      size: "full",
      title: "Admin Registrations",
      body: "Review live registration records imported from the Master Sheet.",
    },
    {
      size: "full",
      title: "Admin Attendance Reports",
      body: "Review attendance totals, halqa performance, and detailed check-in records.",
    },
    {
      size: "full",
      title: "Admin Competitions",
      body: "Review published results plus live education and sports posted scores.",
    },
    {
      size: "full",
      title: "Admin Users",
      body: "Review dashboard users, roles, assigned halqajat, and access levels.",
    },
    {
      size: "medium",
      title: "Google Sheets Data",
      body: "Registrations, attendance, schedule, competitions, and users can be linked to separate Sheet tabs.",
      metrics: [["Ready", "Integration plan"]],
    },
  ],
  av: [
    {
      size: "full",
      title: "Projector Slideshow",
      body: "AV mode will use large full-screen slides for now/next schedule, live attendance, rankings, winners, and announcements.",
      metrics: [
        ["16:9", "Screen layout"],
        ["Public", "Safe data only"],
        ["Auto", "Slide rotation"],
      ],
    },
  ],
};

function renderNav(role) {
  navList.innerHTML = "";

  const groups =
    role === "admin"
      ? adminNavGroups
      : [{ label: roleLabels[role].replace(" Portal", "").replace(" Dashboard", ""), items: navItems[role] }];

  groups.forEach((group) => {
    const section = document.createElement("div");
    section.className = "nav-section";

    const label = document.createElement("span");
    label.className = "nav-section-label";
    label.textContent = group.label.toUpperCase();
    section.append(label);

    group.items.forEach((item, index) => {
    const button = document.createElement("button");
      button.className = `nav-item${item === currentSection || (index === 0 && !currentSection) ? " is-active" : ""}`;
    button.type = "button";
      button.dataset.tooltip = item;
      button.innerHTML = `${iconSvg(navIconMap[item])}<span>${item}</span>`;
    button.addEventListener("click", () => {
      currentSection = item;
      renderDashboard(role);
    });
      section.append(button);
    });

    navList.append(section);
  });
}

function getTimeUntilLabel(timeText, expiredLabel = "Starting soon") {
  const match = String(timeText || "").match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);

  if (!match) {
    return expiredLabel;
  }

  const target = new Date();
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3].toUpperCase();

  if (meridiem === "PM" && hours !== 12) {
    hours += 12;
  }

  if (meridiem === "AM" && hours === 12) {
    hours = 0;
  }

  target.setHours(hours, minutes, 0, 0);
  const diffMinutes = Math.round((target.getTime() - Date.now()) / 60000);

  if (diffMinutes <= 0) {
    return expiredLabel;
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} min`;
  }

  const hoursUntil = Math.floor(diffMinutes / 60);
  const minutesUntil = diffMinutes % 60;
  return minutesUntil ? `${hoursUntil}h ${minutesUntil}m` : `${hoursUntil}h`;
}

function getScheduleStatusMeta(status) {
  const normalized = String(status || "Upcoming").toLowerCase();
  const meta = {
    completed: { icon: "✓", label: "Completed" },
    live: { icon: "●", label: "Live Now" },
    next: { icon: "→", label: "Next" },
    upcoming: { icon: "○", label: "Upcoming" },
  };

  return meta[normalized] || meta.upcoming;
}

function getVenueTone(location) {
  const normalized = String(location || "").toLowerCase();

  if (normalized.includes("main")) {
    return "main";
  }

  if (normalized.includes("classroom")) {
    return "classroom";
  }

  if (normalized.includes("sport")) {
    return "sports";
  }

  if (normalized.includes("dining")) {
    return "dining";
  }

  return "neutral";
}

function renderSchedule() {
  const liveItem = getLiveScheduleItem();
  const nextItem = getNextScheduleItem();
  const liveCount = scheduleItems.filter((item) => String(item.status || "").toLowerCase() === "live").length;
  const venueCount = new Set(scheduleItems.map((item) => item.location).filter(Boolean)).size;
  const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return `
    <div class="live-schedule-shell">
      <div class="schedule-hero">
        <div class="schedule-now-line">
          <span>Now</span>
          <strong>${currentTime}</strong>
        </div>
        <div class="schedule-live-banner">
          <span class="live-pulse" aria-hidden="true"></span>
          <div>
            <span class="schedule-kicker">Live Now</span>
            <h3>${liveItem.title || "Program Live"}</h3>
            <p>${liveItem.location || "Main Hall"} • ${liveItem.lead || "Program Team"}</p>
          </div>
          <strong>Ends in ${getTimeUntilLabel(liveItem.end, "Soon")}</strong>
        </div>
        <div class="schedule-next-card">
          <span class="schedule-kicker">Next Event</span>
          <h3>${nextItem.title || "Next Program"}</h3>
          <p>${nextItem.location || "Main Hall"} • Starts in ${getTimeUntilLabel(nextItem.start, "Soon")}</p>
        </div>
      </div>

      <div class="schedule-stat-grid" aria-label="Schedule summary">
        <div>
          <span>Live</span>
          <strong>${liveCount}</strong>
        </div>
        <div>
          <span>Next</span>
          <strong>${getTimeUntilLabel(nextItem.start, "Soon")}</strong>
        </div>
        <div>
          <span>Venues</span>
          <strong>${venueCount}</strong>
        </div>
      </div>

      <div class="schedule-filter-row" aria-label="Quick filters">
        <span>All</span>
        <span>Live</span>
        <span>Main Hall</span>
        <span>Sports</span>
        <span>Education</span>
      </div>

      <div class="schedule-timeline" aria-label="Live schedule timeline">
      ${scheduleItems
        .map(
          (item) => {
            const status = String(item.status || "Upcoming").toLowerCase();
            const statusMeta = getScheduleStatusMeta(status);
            const venueTone = getVenueTone(item.location);
            const timingLabel =
              status === "live"
                ? `Ends in ${getTimeUntilLabel(item.end, "Soon")}`
                : status === "next"
                  ? `Starts in ${getTimeUntilLabel(item.start, "Soon")}`
                  : `${item.start} - ${item.end}`;

            return `
            <article class="schedule-item status-${status}">
              <div class="schedule-time">
                <strong>${item.start}</strong>
                <span>${item.end}</span>
              </div>
              <div class="timeline-marker" aria-hidden="true"><span>${statusMeta.icon}</span></div>
              <div class="schedule-detail">
                <div class="schedule-title-row">
                  <h3>${item.title}</h3>
                  <span class="status-badge status-${status}">${statusMeta.icon} ${statusMeta.label}</span>
                </div>
                <p><span class="venue-dot venue-${venueTone}"></span>${item.location} • ${item.lead}</p>
                <small>${timingLabel}</small>
              </div>
            </article>
          `;
          }
        )
        .join("")}
      </div>
    </div>
  `;
}

function getAnnouncementPriorityMeta(priority) {
  const normalized = String(priority || "General").toLowerCase();
  const meta = {
    critical: { icon: "●", label: "Critical", tone: "critical" },
    important: { icon: "!", label: "Important", tone: "important" },
    info: { icon: "i", label: "General", tone: "general" },
    general: { icon: "i", label: "General", tone: "general" },
    fyi: { icon: "i", label: "FYI", tone: "fyi" },
    success: { icon: "✓", label: "Success", tone: "success" },
  };

  return meta[normalized] || meta.general;
}

function getAnnouncementCategory(item) {
  const text = `${item.title || ""} ${item.message || ""}`.toLowerCase();

  if (text.includes("sport") || text.includes("football") || text.includes("field")) {
    return "Sports";
  }

  if (text.includes("registration") || text.includes("badge")) {
    return "Registration";
  }

  if (text.includes("lunch") || text.includes("food") || text.includes("dining")) {
    return "Facilities";
  }

  if (text.includes("bus") || text.includes("parking") || text.includes("transport")) {
    return "Transport";
  }

  return "General";
}

function getRelativeAnnouncementTime(timeText) {
  const match = String(timeText || "").match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);

  if (!match) {
    return "Updated now";
  }

  const posted = new Date();
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3].toUpperCase();

  if (meridiem === "PM" && hours !== 12) {
    hours += 12;
  }

  if (meridiem === "AM" && hours === 12) {
    hours = 0;
  }

  posted.setHours(hours, minutes, 0, 0);
  const diffMinutes = Math.round((Date.now() - posted.getTime()) / 60000);

  if (diffMinutes < 0) {
    return "Scheduled";
  }

  if (diffMinutes < 1) {
    return "Updated now";
  }

  if (diffMinutes < 60) {
    return `Updated ${diffMinutes} min ago`;
  }

  const hoursAgo = Math.floor(diffMinutes / 60);
  return `Updated ${hoursAgo}h ago`;
}

function isNewAnnouncement(item) {
  return getRelativeAnnouncementTime(item.time).includes("min ago");
}

function renderAnnouncements() {
  const importantItems = announcements.filter((item) => {
    const priority = String(item.priority || "").toLowerCase();
    return priority === "important" || priority === "critical";
  });
  const featured = importantItems[0] || announcements[0] || {};
  const feedItems = announcements.filter((item) => item !== featured);
  const newCount = announcements.filter(isNewAnnouncement).length;
  const generalCount = announcements.length - importantItems.length;
  const eventStatus = importantItems.length ? "Schedule changes active" : "Event running normally";
  const eventStatusTone = importantItems.length ? "attention" : "normal";
  const featuredMeta = getAnnouncementPriorityMeta(featured.priority);

  return `
    <div class="announcement-board">
      <div class="announcement-summary-grid" aria-label="Announcement summary">
        <div>
          <span>Active Notices</span>
          <strong>${announcements.length}</strong>
        </div>
        <div>
          <span>Important</span>
          <strong>${importantItems.length}</strong>
        </div>
        <div>
          <span>New</span>
          <strong>${newCount}</strong>
        </div>
      </div>

      <div class="event-status-banner ${eventStatusTone}">
        <span>${importantItems.length ? "!" : "✓"}</span>
        <strong>${eventStatus}</strong>
        <em>${importantItems.length ? `${importantItems.length} important update${importantItems.length === 1 ? "" : "s"}` : "No urgent notices"}</em>
      </div>

      <article class="featured-announcement priority-${featuredMeta.tone}">
        <div class="featured-pin">Pinned Notice</div>
        <div class="featured-announcement-main">
          <span class="announcement-priority-mark">${featuredMeta.icon}</span>
          <div>
            <span class="announcement-kicker">${featuredMeta.label}</span>
            <h3>${featured.title || "No announcements posted"}</h3>
            <p>${featured.message || "New public notices will appear here."}</p>
          </div>
        </div>
        <footer>
          <span class="category-tag">${getAnnouncementCategory(featured)}</span>
          <time>${getRelativeAnnouncementTime(featured.time)}</time>
        </footer>
      </article>

      <div class="announcement-filter-row" aria-label="Announcement filters">
        <span>All</span>
        <span>Important</span>
        <span>Sports</span>
        <span>Registration</span>
        <span>Facilities</span>
      </div>

      <div class="announcement-feed">
        <div class="announcement-feed-heading">
          <h3>Recent Updates</h3>
          <span>${importantItems.length} important • ${generalCount} general</span>
        </div>
      ${feedItems
        .map(
          (item) => {
            const meta = getAnnouncementPriorityMeta(item.priority);
            const isNew = isNewAnnouncement(item);

            return `
            <article class="announcement-item priority-${meta.tone}">
              <div class="announcement-feed-icon">${meta.icon}</div>
              <div class="announcement-feed-copy">
                <div class="announcement-title-row">
                  <h3>${item.title}</h3>
                  <span class="priority-badge priority-${meta.tone}">${meta.label}</span>
                </div>
                <p>${item.message}</p>
                <footer>
                  <span class="category-tag">${getAnnouncementCategory(item)}</span>
                  ${isNew ? `<span class="new-dot">New</span>` : ""}
                  <time>${getRelativeAnnouncementTime(item.time)}</time>
                </footer>
              </div>
            </article>
          `;
          }
        )
        .join("")}
      </div>
    </div>
  `;
}

function getLiveScheduleItem() {
  const now = new Date();
  const timedLiveItem = scheduleItems.find((item) => {
    const start = parseTodayTime(item.start);
    const end = parseTodayTime(item.end);
    return start && end && start.getTime() <= now.getTime() && end.getTime() > now.getTime();
  });

  return timedLiveItem || scheduleItems.find((item) => String(item.status || "").toLowerCase() === "live") || scheduleItems[0] || {};
}

function getNextScheduleItem() {
  const now = new Date();
  const timedNextItem = scheduleItems
    .map((item) => ({ ...item, startDate: parseTodayTime(item.start) }))
    .filter((item) => item.startDate && item.startDate.getTime() > now.getTime())
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())[0];

  return (
    timedNextItem ||
    scheduleItems.find((item) => String(item.status || "").toLowerCase() === "next") ||
    scheduleItems.find((item) => String(item.status || "").toLowerCase() === "upcoming") ||
    scheduleItems[1] ||
    {}
  );
}

function getStartsInLabel(timeText) {
  const match = String(timeText || "").match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);

  if (!match) {
    return "Starts soon";
  }

  const target = new Date();
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3].toUpperCase();

  if (meridiem === "PM" && hours !== 12) {
    hours += 12;
  }

  if (meridiem === "AM" && hours === 12) {
    hours = 0;
  }

  target.setHours(hours, minutes, 0, 0);
  const diffMinutes = Math.round((target.getTime() - Date.now()) / 60000);

  if (diffMinutes <= 0) {
    return "Starting soon";
  }

  if (diffMinutes < 60) {
    return `Starts in ${diffMinutes} minutes`;
  }

  const hoursUntil = Math.floor(diffMinutes / 60);
  const minutesUntil = diffMinutes % 60;
  return `Starts in ${hoursUntil}h ${minutesUntil}m`;
}

function renderPublicLocations() {
  const now = new Date();
  const scheduledLocations = Array.from(new Set(scheduleItems.map((item) => item.location).filter(Boolean)));
  const baseLocations = ["Main Hall", "Sports Ground", "Classroom Block", "Dining Area", "Registration Desk", "Parking"];
  const locations = Array.from(new Set([...scheduledLocations, ...baseLocations])).slice(0, 6).map((name) => {
    const locationItems = scheduleItems.filter((item) => item.location === name);
    const liveItem = locationItems.find((item) => {
      const start = parseTodayTime(item.start);
      const end = parseTodayTime(item.end);
      return start && end && start.getTime() <= now.getTime() && end.getTime() > now.getTime();
    });
    const nextItem = locationItems
      .map((item) => ({ ...item, startDate: parseTodayTime(item.start) }))
      .filter((item) => item.startDate && item.startDate.getTime() > now.getTime())
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())[0];

    if (liveItem) {
      return [name, "Live Now", liveItem.title, "orange", "award"];
    }

    if (nextItem) {
      return [name, getTimeUntilLabel(nextItem.start, "Starting soon"), nextItem.title, "blue", "calendar"];
    }

    if (name === "Registration Desk") {
      return [name, "Open", "Badge collection", "teal", "user"];
    }

    if (name === "Parking") {
      return [name, "Available", "Parking area", "teal", "map"];
    }

    return [name, "Available", locationItems[0]?.title || "Event location", "teal", "map"];
  });

  return `
    <div class="location-grid">
      ${locations
        .map(
          ([name, status, detail, tone, icon]) => `
            <a class="location-card widget-nav-link" href="#public-locations" data-section="Locations">
              <span class="location-icon">${iconSvg(icon)}</span>
              <strong>${name}</strong>
              <em class="${tone}">${status}</em>
              <small>${detail}</small>
              <span class="location-arrow">›</span>
            </a>
          `
        )
        .join("")}
    </div>
  `;
}

function parseTodayTime(timeText) {
  const match = String(timeText || "").match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);

  if (!match) {
    return null;
  }

  const date = new Date();
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3].toUpperCase();

  if (meridiem === "PM" && hours !== 12) {
    hours += 12;
  }

  if (meridiem === "AM" && hours === 12) {
    hours = 0;
  }

  date.setHours(hours, minutes, 0, 0);
  return date;
}

function formatDurationLabel(milliseconds) {
  const totalMinutes = Math.max(0, Math.ceil(milliseconds / 60000));

  if (totalMinutes < 1) {
    return "Starting now";
  }

  if (totalMinutes < 60) {
    return `Starts in ${totalMinutes} min`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes ? `Starts in ${hours}h ${minutes}m` : `Starts in ${hours}h`;
}

function getPrayerTimeline(prayerTimes) {
  const now = new Date();
  const today = prayerTimes
    .map(([name, time]) => ({ name, time, date: parseTodayTime(time) }))
    .filter((item) => item.date)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const nextIndex = today.findIndex((item) => item.date.getTime() > now.getTime());
  const nextPrayer = nextIndex >= 0 ? today[nextIndex] : today[0];
  const previousPrayer = nextIndex > 0 ? today[nextIndex - 1] : nextIndex === -1 ? today[today.length - 1] : null;
  const activePrayer = previousPrayer || nextPrayer;
  const nextDate = nextIndex >= 0 ? nextPrayer.date : new Date(nextPrayer.date.getTime() + 24 * 60 * 60 * 1000);
  const previousDate = previousPrayer?.date || new Date(nextDate.getTime() - 24 * 60 * 60 * 1000);
  const span = nextDate.getTime() - previousDate.getTime();
  const elapsed = now.getTime() - previousDate.getTime();
  const progress = span > 0 ? Math.min(100, Math.max(0, Math.round((elapsed / span) * 100))) : 0;

  return {
    activePrayer,
    nextPrayer,
    nextDate,
    progress,
    currentTime: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
}

function renderPublicPrayerTimes(prayerTimes) {
  const timeline = getPrayerTimeline(prayerTimes);
  const nextPrayer = timeline.nextPrayer || { name: "Prayer", time: "--" };
  const activePrayer = timeline.activePrayer || nextPrayer;

  return `
    <div class="prayer-feature">
      <div>
        <span class="public-kicker">Next Prayer</span>
        <h3>${nextPrayer.name}</h3>
        <strong>${nextPrayer.time}</strong>
        <p>${formatDurationLabel(timeline.nextDate.getTime() - Date.now())}</p>
        <div class="prayer-live-meta">
          <span>Now ${timeline.currentTime}</span>
          <span>Current ${activePrayer.name}</span>
        </div>
      </div>
      <div class="mosque-art" aria-hidden="true">${iconSvg("award")}</div>
    </div>
    <div class="prayer-progress" aria-label="Time until next prayer"><span style="width: ${timeline.progress}%"></span></div>
    <div class="prayer-grid">
      ${prayerTimes
        .map(
          ([name, time]) => {
            const prayerDate = parseTodayTime(time);
            const isNext = name === nextPrayer.name;
            const isCurrent = name === activePrayer.name && !isNext;
            const isCompleted = prayerDate ? prayerDate.getTime() <= Date.now() && !isNext : false;

            return `
            <div class="${isNext ? "is-next" : ""} ${isCurrent ? "is-current" : ""}">
              <span class="prayer-symbol">${name === "Isha" ? "☾" : "☀"}</span>
              <strong>${name}</strong>
              <span>${time}</span>
              <em>${isNext ? "Next" : isCurrent ? "Now" : isCompleted ? "Done" : "Soon"}</em>
            </div>
          `;
          }
        )
        .join("")}
    </div>
  `;
}

function getPostedTimeValue(result, index) {
  const match = String(result.postedAt || "").match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);

  if (!match) {
    return index;
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3].toUpperCase();

  if (meridiem === "PM" && hours !== 12) {
    hours += 12;
  }

  if (meridiem === "AM" && hours === 12) {
    hours = 0;
  }

  return hours * 60 + minutes + index / 1000;
}

function getLatestCompetitionResultSet() {
  const educationPosts = educationJudgeResults.map((result, index) => ({
    source: "Education",
    key: result.competition,
    postedAt: result.postedAt,
    timeValue: getPostedTimeValue(result, index),
  }));
  const sportsPosts = sportsPostedResults.map((result, index) => ({
    source: "Sports",
    key: result.sport,
    postedAt: result.postedAt,
    timeValue: getPostedTimeValue(result, index),
  }));
  const latestPost = [...educationPosts, ...sportsPosts].sort((a, b) => b.timeValue - a.timeValue)[0];

  if (!latestPost?.key) {
    return null;
  }

  if (latestPost.source === "Education") {
    const grouped = new Map();

    educationJudgeResults
      .filter((result) => result.competition === latestPost.key)
      .forEach((result) => {
        const key = `${result.participantName}|${result.halqa}`;
        const existing =
          grouped.get(key) ||
          {
            name: result.participantName,
            halqa: result.halqa,
            judges: new Set(),
            total: 0,
          };

        existing.total += Number(result.total || 0);
        existing.judges.add(result.judge);
        grouped.set(key, existing);
      });

    const results = Array.from(grouped.values())
      .map((result) => ({
        ...result,
        score: result.judges.size ? Math.round(result.total / result.judges.size) : 0,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((result, index) => ({
        ...result,
        position: index === 0 ? "1st" : index === 1 ? "2nd" : index === 2 ? "3rd" : `${index + 1}th`,
      }));

    return {
      source: "Education",
      title: latestPost.key,
      label: `${results.length} posted result${results.length === 1 ? "" : "s"}`,
      postedAt: latestPost.postedAt,
      results,
    };
  }

  const positionOrder = { "1st": 1, "2nd": 2, "3rd": 3, Participation: 99 };
  const results = sportsPostedResults
    .filter((result) => result.sport === latestPost.key)
    .sort((a, b) => (positionOrder[a.position] || 50) - (positionOrder[b.position] || 50) || b.points - a.points)
    .slice(0, 3)
    .map((result) => ({
      name: result.participantName,
      score: result.scoreValue ? `${result.scoreValue} ${result.scoreUnit || ""}`.trim() : result.points,
      position: result.position,
      halqa: result.halqa,
    }));

  return {
    source: "Sports",
    title: latestPost.key,
    label: `${results.length} posted result${results.length === 1 ? "" : "s"}`,
    postedAt: latestPost.postedAt,
    results,
  };
}

function renderLiveCompetitionUpdates() {
  const latestSet = getLatestCompetitionResultSet();

  if (!latestSet) {
    return `
      <div class="competition-card competition-empty-card">
        <div class="competition-event-heading">
          <span class="competition-event-icon">${iconSvg("trophy")}</span>
          <div>
            <h3>Awaiting Results</h3>
            <span>No posts yet</span>
          </div>
          <em class="completed">Standby</em>
        </div>
        <p class="competition-subline">This widget updates only after education judges or sports admins post results.</p>
      </div>
    `;
  }

  return `
    <div class="competition-card live-competition-card">
      <div class="competition-event-heading">
        <span class="competition-event-icon">${iconSvg(latestSet.source === "Sports" ? "trophy" : "award")}</span>
        <div>
          <h3>${latestSet.title}</h3>
          <span>${latestSet.source} Results</span>
        </div>
        <em>Latest</em>
      </div>
      <p class="competition-subline">${latestSet.label}${latestSet.postedAt ? ` • Posted ${latestSet.postedAt}` : ""}</p>
      <div class="podium">
        ${latestSet.results
          .map(
            (result, index) => `
              <div class="podium-person place-${index + 1}">
                <strong>${result.name}</strong>
                <small>${result.halqa || ""}</small>
                <span>${result.score || "-"}</span>
                <em>${result.position || index + 1}</em>
              </div>
            `
          )
          .join("")}
      </div>
      <div class="next-round-chip">${iconSvg("clock")} Updates when results are posted</div>
    </div>
  `;
}

function renderPublicHelp() {
  return `
    <div class="help-grid">
      <article class="public-card emergency-card">
        <span class="public-card-icon danger">${iconSvg("phone")}</span>
        <div>
          <h3>Emergency Contact</h3>
          <strong>+1 xxx xxx xxxx</strong>
          <p>For urgent on-site assistance.</p>
        </div>
      </article>
      <article class="public-card">
        <span class="public-card-icon teal">${iconSvg("map")}</span>
        <div>
          <h3>Help Desk</h3>
          <strong>Main Entrance</strong>
          <p>Questions, lost items, and visitor support.</p>
        </div>
      </article>
    </div>
  `;
}

function getLiveServiceItems(prayerTimes) {
  const now = new Date();
  const liveItem = getLiveScheduleItem();
  const nextItem = getNextScheduleItem();
  const prayerTimeline = getPrayerTimeline(prayerTimes);
  const lunchLive = scheduleItems.some((item) => {
    const title = `${item.title || ""} ${item.location || ""}`.toLowerCase();
    const start = parseTodayTime(item.start);
    const end = parseTodayTime(item.end);
    return title.includes("lunch") && start && end && start.getTime() <= now.getTime() && end.getTime() > now.getTime();
  });

  return [
    ["Registration Desk", "Open", `${attendanceRecords.length} checked in today`, "open", "user"],
    ["Food Service", lunchLive ? "Live" : "Open", lunchLive ? "Lunch service active" : "Dining support available", lunchLive ? "busy" : "open", "list"],
    ["Program Desk", liveItem.title ? "Live" : "Open", liveItem.title ? `${liveItem.title} at ${liveItem.location}` : "Ready for program updates", liveItem.title ? "busy" : "open", "award"],
    ["Prayer Support", "Live", `Next ${prayerTimeline.nextPrayer?.name || "prayer"} ${prayerTimeline.nextPrayer?.time || ""}`, "open", "clock"],
    ["Next Movement", nextItem.title ? "Soon" : "Open", nextItem.title ? `${nextItem.title} ${getTimeUntilLabel(nextItem.start, "soon")}` : "No upcoming item", nextItem.title ? "busy" : "open", "map"],
    ["Results Desk", educationJudgeResults.length || sportsPostedResults.length ? "Updated" : "Standby", `${educationJudgeResults.length + sportsPostedResults.length} posted result entries`, educationJudgeResults.length || sportsPostedResults.length ? "open" : "busy", "trophy"],
  ].slice(0, 4);
}

function getLiveWeatherSnapshot() {
  const hour = new Date().getHours();
  const temp = hour < 7 ? 18 : hour < 12 ? 24 : hour < 18 ? 31 : 26;
  const condition = hour < 7 ? "Cool Morning" : hour < 18 ? "Clear Sky" : "Mild Evening";
  const outdoorOpen = temp >= 16 && temp <= 34;

  return {
    temp,
    condition,
    status: outdoorOpen ? "Sports Ground Open" : "Outdoor Advisory",
    detail: outdoorOpen ? "Outdoor activities available" : "Check with event staff",
    forecast: [
      ["Morning", "25°C"],
      ["Afternoon", "31°C"],
      ["Evening", "27°C"],
      ["Night", "24°C"],
    ],
  };
}

function getLiveHighlights() {
  const latestCompetition = getLatestCompetitionResultSet();
  const latestAnnouncement = announcements[0];
  const nextItem = getNextScheduleItem();
  const liveItem = getLiveScheduleItem();

  return [
    liveItem.title ? `Live: ${liveItem.title}` : "Event dashboard live",
    nextItem.title ? `Next: ${nextItem.title}` : "Schedule updates pending",
    latestCompetition ? `Latest result: ${latestCompetition.title}` : "Competition results pending",
    latestAnnouncement ? `Notice: ${latestAnnouncement.title}` : "Announcements ready",
  ];
}

function renderPublicOverview() {
  const liveItem = getLiveScheduleItem();
  const nextItem = getNextScheduleItem();
  const importantAnnouncements = announcements.slice(0, 2);
  const importantAnnouncementCount = announcements.filter((item) => {
    const priority = String(item.priority || "").toLowerCase();
    return priority === "important" || priority === "critical";
  }).length;
  const newAnnouncementCount = announcements.filter(isNewAnnouncement).length;
  const prayerTimes = [
    ["Fajar", "4:30 AM"],
    ["Zuhr", "2:00 PM"],
    ["Asar", "2:00 PM"],
    ["Maghrib", "9:15 PM"],
    ["Isha", "9:15 PM"],
  ];
  const services = getLiveServiceItems(prayerTimes);
  const weather = getLiveWeatherSnapshot();
  const highlights = getLiveHighlights();
  const latestCompetition = getLatestCompetitionResultSet();

  return `
    <section class="public-live-card" id="public-live-now">
      <div class="live-now-chip">${liveItem.title ? "Live Now" : "Standby"}</div>
      <div>
        <h2>${liveItem.title || "Program updates pending"}</h2>
        <p>${liveItem.location || "Main Hall"}</p>
        <strong>${liveItem.start || "--"} - ${liveItem.end || "--"}</strong>
      </div>
      <a class="primary-button compact widget-nav-link" href="#public-locations" data-section="Locations">View Location</a>
    </section>

    <section class="public-overview-grid">
      <article class="public-card next-program-card">
        <div class="next-program-header">
          <span class="next-program-icon">${iconSvg("calendar")}</span>
          <div>
            <span class="public-kicker">Next Program</span>
            <h3>${nextItem.title || "Next Program"}</h3>
          </div>
          <span class="starting-chip">${getTimeUntilLabel(nextItem.start, "Soon")}</span>
        </div>
        <div class="next-countdown">
          <div class="countdown-copy">
            <span>${iconSvg("clock")} Starts in</span>
            <strong>${getStartsInLabel(nextItem.start).replace("Starts in ", "").replace("Starting soon", "Soon")}</strong>
          </div>
          <div class="trophy-illustration" aria-hidden="true">
            ${iconSvg("trophy")}
          </div>
        </div>
        <div class="next-meta-row">
          <span>${iconSvg("clock")} ${nextItem.start || "--"}</span>
          <span>${iconSvg("map")} ${nextItem.location || "Main Hall"}</span>
        </div>
        <a class="primary-button next-schedule-button widget-nav-link" href="#public-schedule" data-section="Schedule">View full schedule <span>-></span></a>
      </article>

      <article class="public-card public-announcements-card" id="public-announcements">
        <div class="announcement-card-heading">
          <h3>Important Announcements</h3>
          <span class="announcement-live-pill">${importantAnnouncementCount} Important • ${newAnnouncementCount} New</span>
        </div>
        ${importantAnnouncements
          .map((item) => {
            const meta = getAnnouncementPriorityMeta(item.priority);
            const isNew = isNewAnnouncement(item);

            return `
              <div class="public-announcement ${meta.tone === "important" || meta.tone === "critical" ? "important" : "info"}">
                <span class="announcement-icon">${meta.tone === "important" || meta.tone === "critical" ? "!" : iconSvg("megaphone")}</span>
                <span class="announcement-dot"></span>
                <div class="announcement-copy">
                  <strong>${item.title}</strong>
                  <p>${item.message}</p>
                  <small>${getAnnouncementCategory(item)}${isNew ? " • New" : ""}</small>
                </div>
                <time>${getRelativeAnnouncementTime(item.time).replace("Updated ", "")}</time>
                <span class="announcement-arrow">›</span>
              </div>
            `;
          })
          .join("")}
        <a class="announcement-view-all widget-nav-link" href="#public-announcements" data-section="Announcements">View all announcements <span>-></span></a>
      </article>

      <article class="public-card public-locations-card" id="public-locations">
        <div class="public-widget-heading">
          <span class="public-card-icon teal">${iconSvg("map")}</span>
          <div>
            <h3>Location Quick Links</h3>
            <p>Find important places around the event</p>
          </div>
          <a class="soft-action widget-nav-link" href="#public-locations" data-section="Locations">${iconSvg("map")} Maps soon <span>-></span></a>
        </div>
        ${renderPublicLocations()}
        <a class="wide-soft-action widget-nav-link" href="#public-locations" data-section="Locations">${iconSvg("map")} View all locations on map <span>-></span></a>
      </article>

      <article class="public-card prayer-card" id="public-prayer-times">
        <div class="public-widget-heading">
          <span class="public-card-icon teal">${iconSvg("award")}</span>
          <div>
            <h3>Prayer Times</h3>
          </div>
          <span class="soft-action">${iconSvg("calendar")} Today</span>
        </div>
        ${renderPublicPrayerTimes(prayerTimes)}
        <a class="wide-soft-action widget-nav-link" href="#public-prayer-times" data-scroll-target="public-prayer-times">${iconSvg("calendar")} View full prayer schedule <span>-></span></a>
      </article>

      <article class="public-card public-results-card" id="public-competitions">
        <div class="public-widget-heading">
          <span class="public-card-icon teal">${iconSvg("trophy")}</span>
          <div>
            <h3>Live Competition Updates</h3>
            <p>${latestCompetition ? `Latest posted: ${latestCompetition.title}` : "Waiting for posted results"}</p>
          </div>
          <span class="soft-action live-soft-dot">${latestCompetition ? "Live" : "Standby"}</span>
          <a class="soft-action widget-nav-link" href="#public-competitions" data-section="Competitions">View all competitions <span>-></span></a>
        </div>
        <div class="competition-update-grid">${renderLiveCompetitionUpdates()}</div>
      </article>

      <article class="public-card services-card" id="public-services">
        <div class="public-widget-heading">
          <span class="public-card-icon teal">${iconSvg("award")}</span>
          <div>
            <h3>Service Status</h3>
            <p>Live status of event operations</p>
          </div>
          <span class="soft-action">${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
        </div>
        <div class="service-card-grid">
          ${services
            .map(
              ([label, status, detail, tone, icon]) => `
                <div class="service-tile ${tone}">
                  <span class="service-icon">${iconSvg(icon)}</span>
                  <strong>${label}</strong>
                  <em class="${tone}">${status}</em>
                  <p>${detail}</p>
                </div>
              `
            )
            .join("")}
        </div>
        <a class="wide-soft-action widget-nav-link" href="#public-services" data-scroll-target="public-services">${iconSvg("list")} View all services <span>-></span></a>
      </article>

      <article class="public-card weather-card" id="public-weather">
        <div class="public-widget-heading">
          <span class="public-card-icon blue">${iconSvg("alert")}</span>
          <div>
            <h3>Weather</h3>
            <p>Vaughan, Ontario</p>
          </div>
          <span class="soft-action">${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
        </div>
        <div class="weather-feature">
          <div class="sun-art" aria-hidden="true"></div>
          <div>
            <strong>${weather.temp}°C</strong>
            <p>${weather.condition}</p>
            <span>${iconSvg("award")} ${weather.status} <em>${weather.detail}</em></span>
          </div>
        </div>
        <div class="forecast-grid">
          ${weather.forecast.map(([label, temp]) => `<div><span>${label}</span><strong>${temp}</strong></div>`).join("")}
        </div>
        <a class="wide-soft-action widget-nav-link" href="#public-weather" data-scroll-target="public-weather">${iconSvg("alert")} View full forecast <span>-></span></a>
      </article>

      <article class="public-card emergency-card" id="public-emergency">
        <span class="emergency-hero-icon">${iconSvg("phone")}</span>
        <div class="emergency-content">
          <div class="emergency-heading">
            <div>
              <h3>Emergency Information</h3>
              <p>For any urgent assistance</p>
            </div>
            <span>Important</span>
          </div>
          <div class="emergency-action-grid">
            <div class="emergency-action-card">
              <span>${iconSvg("phone")}</span>
              <div>
                <p>Emergency Contact</p>
                <strong>+1 XXX XXX XXXX</strong>
              </div>
              <a class="widget-nav-link" href="tel:+1-000-000-0000">${iconSvg("phone")} Call Now</a>
            </div>
            <div class="emergency-action-card">
              <span>${iconSvg("map")}</span>
              <div>
                <p>Help Desk</p>
                <strong>Main Entrance</strong>
              </div>
              <a class="widget-nav-link" href="#public-locations" data-section="Locations">${iconSvg("map")} Get Directions</a>
            </div>
          </div>
          <div class="emergency-availability">${iconSvg("clock")} Available 24/7 during the event</div>
        </div>
      </article>
    </section>

    <section class="public-card highlights-card">
      <div class="section-heading">
        <h3>Today's Highlights</h3>
        <span>Featured</span>
      </div>
      <div class="highlight-list">
        ${highlights.map((highlight) => `<span>${highlight}</span>`).join("")}
      </div>
    </section>
  `;
}

function renderAdminOverview() {
  const registrationStats = getRegistrationStats();
  const attendanceRate = registrationStats.total
    ? Math.round((registrationStats.attended / registrationStats.total) * 100)
    : 0;
  const competitionCount = competitionResults.length + educationJudgeResults.length + sportsPostedResults.length;
  const recentAnnouncements = announcements.slice(0, 3);
  const trendValues = [28, 41, 24, 36, 32, 52, Math.max(38, registrationStats.total)];
  const maxTrend = Math.max(...trendValues, 60);
  const chartPoints = trendValues
    .map((value, index) => `${index * 52 + 12},${112 - (value / maxTrend) * 92}`)
    .join(" ");
  const competitionBars = [
    ["Education Results", educationJudgeResults.length || 8, 16],
    ["Sports Results", sportsPostedResults.length || 6, 13],
    ["Published Winners", competitionResults.length || 5, 12],
  ];

  return `
    <section class="overview-hero">
      <div>
        <p class="eyebrow">Live Operations</p>
        <h2>Overview</h2>
        <p>Welcome back. Here is what is happening across registration, attendance, announcements, and competitions.</p>
      </div>
      <span class="live-chip">Live Master Sheet</span>
    </section>

    <section class="kpi-grid">
      <article class="kpi-card">
        <span class="kpi-icon emerald">${iconSvg("users")}</span>
        <div>
          <strong>${registrationStats.total}</strong>
          <span>Total Registrations</span>
          <em>+12% from last update</em>
        </div>
      </article>
      <article class="kpi-card">
        <span class="kpi-icon blue">${iconSvg("chart")}</span>
        <div>
          <strong>${registrationStats.attended}</strong>
          <span>Attendance</span>
          <em>${attendanceRate}% checked in</em>
        </div>
      </article>
      <article class="kpi-card">
        <span class="kpi-icon violet">${iconSvg("trophy")}</span>
        <div>
          <strong>${competitionCount}</strong>
          <span>Competitions</span>
          <em>No change</em>
        </div>
      </article>
      <article class="kpi-card">
        <span class="kpi-icon amber">${iconSvg("megaphone")}</span>
        <div>
          <strong>${announcements.length}</strong>
          <span>Announcements</span>
          <em>${recentAnnouncements.length} recent</em>
        </div>
      </article>
    </section>

    <section class="overview-card announcements-feed">
      <div class="section-heading">
        <h3>Recent Announcements</h3>
        <button class="text-action" type="button">View all</button>
      </div>
      ${recentAnnouncements
        .map(
          (item) => `
            <article class="feed-item">
              <span class="feed-icon">${iconSvg("megaphone")}</span>
              <div>
                <strong>${item.title}</strong>
                <p>${item.message}</p>
              </div>
              <time>${item.time || "Today"}</time>
            </article>
          `
        )
        .join("")}
    </section>

    <section class="analytics-grid">
      <article class="overview-card chart-card">
        <div class="section-heading">
          <h3>Registrations Over Time</h3>
          <span>This Week</span>
        </div>
        <svg class="trend-chart" viewBox="0 0 340 130" role="img" aria-label="Registration trend line chart">
          <path class="chart-grid-line" d="M12 20H328M12 66H328M12 112H328"></path>
          <polyline points="${chartPoints}" fill="none"></polyline>
          ${trendValues
            .map((value, index) => `<circle cx="${index * 52 + 12}" cy="${112 - (value / maxTrend) * 92}" r="3"></circle>`)
            .join("")}
        </svg>
        <div class="chart-labels"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>
      </article>

      <article class="overview-card stats-card">
        <div class="section-heading">
          <h3>Attendance Statistics</h3>
          <span>${attendanceRate}%</span>
        </div>
        <div class="stat-ring" style="--progress:${attendanceRate * 3.6}deg">
          <strong>${attendanceRate}%</strong>
          <span>Present</span>
        </div>
        <div class="mini-stat-row">
          <span>Registered <strong>${registrationStats.total}</strong></span>
          <span>Checked in <strong>${registrationStats.attended}</strong></span>
        </div>
      </article>

      <article class="overview-card progress-card">
        <div class="section-heading">
          <h3>Competition Participation</h3>
          <button class="text-action" type="button">View all</button>
        </div>
        ${competitionBars
          .map(([label, value, total]) => {
            const percentage = Math.min(100, Math.round((value / total) * 100));
            return `
              <div class="progress-item">
                <div><strong>${label}</strong><span>${value} posted</span></div>
                <div class="progress-track"><span style="width:${percentage}%"></span></div>
                <em>${percentage}%</em>
              </div>
            `;
          })
          .join("")}
      </article>
    </section>
  `;
}

function renderHalqaRankings() {
  return `
    <div class="ranking-table" role="table" aria-label="Halqa position report">
      <div class="ranking-row ranking-head" role="row">
        <span>Rank</span>
        <span>Halqa</span>
        <span>Attendance</span>
        <span>Education</span>
        <span>Sports</span>
        <span>Total</span>
      </div>
      ${halqaRankings
        .map(
          (item) => `
            <div class="ranking-row" role="row">
              <span class="rank-number">${item.rank}</span>
              <strong>${item.halqa}</strong>
              <span>${item.attendance}%</span>
              <span>${item.education}</span>
              <span>${item.sports}</span>
              <span class="total-score">${item.total}</span>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function getPositionRank(position) {
  const normalized = String(position || "").toLowerCase();

  if (normalized.includes("1")) {
    return 1;
  }

  if (normalized.includes("2")) {
    return 2;
  }

  if (normalized.includes("3")) {
    return 3;
  }

  return 99;
}

function getMedalLabel(rank) {
  if (rank === 1) {
    return "Gold";
  }

  if (rank === 2) {
    return "Silver";
  }

  if (rank === 3) {
    return "Bronze";
  }

  return `#${rank}`;
}

function buildCompetitionLeaderboardGroups() {
  const groups = new Map();

  const educationGroups = new Map();

  educationJudgeResults.forEach((result, index) => {
    const key = `Education|${result.competition}`;
    const participantKey = `${result.participantName}|${result.halqa}`;
    const group =
      educationGroups.get(key) ||
      {
        category: "Education",
        competition: result.competition,
        postedAt: result.postedAt || "",
        timeValue: getPostedTimeValue(result, index),
        participants: new Map(),
      };
    const participant =
      group.participants.get(participantKey) ||
      {
        name: result.participantName,
        halqa: result.halqa,
        judges: new Set(),
        total: 0,
      };

    participant.total += Number(result.total || 0);
    participant.judges.add(result.judge);
    group.postedAt = getPostedTimeValue(result, index) >= group.timeValue ? result.postedAt || group.postedAt : group.postedAt;
    group.timeValue = Math.max(group.timeValue, getPostedTimeValue(result, index));
    group.participants.set(participantKey, participant);
    educationGroups.set(key, group);
  });

  educationGroups.forEach((group, key) => {
    groups.set(key, {
      category: group.category,
      competition: group.competition,
      postedAt: group.postedAt,
      winners: Array.from(group.participants.values())
        .map((participant) => ({
          name: participant.name,
          halqa: participant.halqa,
          score: participant.judges.size ? Math.round(participant.total / participant.judges.size) : 0,
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map((participant, index) => ({
          ...participant,
          rank: index + 1,
          position: index === 0 ? "1st" : index === 1 ? "2nd" : index === 2 ? "3rd" : `${index + 1}th`,
        })),
    });
  });

  sportsPostedResults.forEach((result) => {
    const key = `Sports|${result.sport}`;
    const group = groups.get(key) || {
      category: "Sports",
      competition: result.sport,
      postedAt: result.postedAt || "",
      winners: [],
    };

    group.postedAt = result.postedAt || group.postedAt;
    group.winners.push({
      position: result.position,
      rank: getPositionRank(result.position),
      name: result.participantName,
      halqa: result.halqa,
      score: result.scoreValue ? `${result.scoreValue} ${result.scoreUnit || ""}`.trim() : result.points,
    });
    groups.set(key, group);
  });

  if (!groups.size) {
    competitionResults.forEach((result) => {
      const key = `${result.category}|${result.competition}`;
      const group = groups.get(key) || {
        category: result.category,
        competition: result.competition,
        postedAt: "",
        winners: [],
      };

      group.winners.push({
        position: result.position,
        rank: getPositionRank(result.position),
        name: result.name,
        halqa: result.halqa,
        score: "",
      });
      groups.set(key, group);
    });
  }

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      winners: group.winners.sort((a, b) => a.rank - b.rank).slice(0, 3),
    }))
    .sort((a, b) => a.category.localeCompare(b.category) || a.competition.localeCompare(b.competition));
}

function renderCompetitionResults() {
  const groups = buildCompetitionLeaderboardGroups();
  const resultsCount = groups.reduce((count, group) => count + group.winners.length, 0);
  const educationCount = groups.filter((group) => group.category === "Education").reduce((count, group) => count + group.winners.length, 0);
  const sportsCount = groups.filter((group) => group.category === "Sports").reduce((count, group) => count + group.winners.length, 0);
  const featuredWinners = groups
    .map((group) => ({ ...group.winners[0], category: group.category, competition: group.competition, postedAt: group.postedAt }))
    .filter((winner) => winner.name)
    .slice(0, 3);

  if (!groups.length) {
    return `<div class="access-note">Competition winners will appear after results are published.</div>`;
  }

  return `
    <div class="competition-board">
      <div class="competition-summary-grid" aria-label="Competition summary">
        <div>
          <span>Results Published</span>
          <strong>${resultsCount}</strong>
        </div>
        <div>
          <span>Education</span>
          <strong>${educationCount}</strong>
        </div>
        <div>
          <span>Sports</span>
          <strong>${sportsCount}</strong>
        </div>
      </div>

      <section class="champion-strip" aria-label="Latest champions">
        <div>
          <span class="competition-kicker">Featured Winners</span>
          <h3>Champions Board</h3>
        </div>
        <div class="featured-winner-grid">
          ${featuredWinners
            .map(
              (winner) => `
                <article>
                  <span class="medal-rank medal-${winner.rank}">#${winner.rank}</span>
                  <strong>${winner.name}</strong>
                  <p>${winner.competition}</p>
                  <small>${winner.halqa || winner.category}</small>
                </article>
              `
            )
            .join("")}
        </div>
      </section>

      <div class="competition-filter-row" aria-label="Competition filters">
        <span>All</span>
        <span>Education (${educationCount})</span>
        <span>Sports (${sportsCount})</span>
      </div>

      <div class="leaderboard-grid">
      ${groups
        .map(
          (group) => `
            <article class="leaderboard-card">
              <header>
                <span class="category-badge category-${group.category.toLowerCase()}">${group.category === "Education" ? "Education" : "Sports"}</span>
                <div>
                  <h3>${group.competition}</h3>
                  <p>${group.postedAt ? `Published ${group.postedAt}` : `${group.winners.length} winner${group.winners.length === 1 ? "" : "s"} posted`}</p>
                </div>
              </header>
              <div class="leaderboard-list">
                ${group.winners
                  .map(
                    (winner) => `
                      <div class="leaderboard-row">
                        <span class="medal-rank medal-${winner.rank}">#${winner.rank}</span>
                        <div>
                          <strong>${winner.name}</strong>
                          <small>${winner.halqa || "Ijtima competitor"}</small>
                        </div>
                        <em>${getMedalLabel(winner.rank)}</em>
                      </div>
                    `
                  )
                  .join("")}
              </div>
            </article>
          `
        )
        .join("")}
      </div>
    </div>
  `;
}

function getCurrentHalqaMembers() {
  if (!currentUser?.halqa) {
    return [];
  }

  return memberRecords.filter((member) => member.halqa === currentUser.halqa);
}

function getZaimPerformanceRows() {
  return halqajat
    .map((halqa) => {
      const members = memberRecords.filter((member) => member.halqa === halqa);
      const registered = members.filter((member) => member.registered).length;
      const present = members.filter((member) => isMemberPresent(member)).length;
      const tajnid = getHalqaTajnid(halqa);
      const registrationRate = getPercent(registered, tajnid);
      const attendanceRate = getPercent(present, registered);
      const score = Math.round(registrationRate * 0.55 + attendanceRate * 0.45);

      return {
        halqa,
        tajnid,
        registered,
        present,
        pendingRegistration: Math.max(tajnid - registered, 0),
        pendingAttendance: Math.max(registered - present, 0),
        registrationRate,
        attendanceRate,
        score,
      };
    })
    .sort((a, b) => b.score - a.score || b.registrationRate - a.registrationRate || b.attendanceRate - a.attendanceRate)
    .map((item, index) => ({ ...item, rank: index + 1 }));
}

function getCurrentZaimStats() {
  const halqa = currentUser?.halqa || "";
  const members = getCurrentHalqaMembers();
  const registeredMembers = members.filter((member) => member.registered);
  const presentMembers = members.filter((member) => isMemberPresent(member));
  const pendingRegistrationMembers = members.filter((member) => !member.registered);
  const pendingAttendanceMembers = registeredMembers.filter((member) => !isMemberPresent(member));
  const tajnid = getHalqaTajnid(halqa);
  const performanceRows = getZaimPerformanceRows();
  const performance = performanceRows.find((row) => row.halqa === halqa) || {
    halqa,
    tajnid,
    registered: registeredMembers.length,
    present: presentMembers.length,
    pendingRegistration: Math.max(tajnid - registeredMembers.length, 0),
    pendingAttendance: Math.max(registeredMembers.length - presentMembers.length, 0),
    registrationRate: getPercent(registeredMembers.length, tajnid),
    attendanceRate: getPercent(presentMembers.length, registeredMembers.length),
    score: 0,
    rank: performanceRows.length,
  };
  const eventAverageAttendance = getPercent(
    memberRecords.filter((member) => isMemberPresent(member)).length,
    memberRecords.filter((member) => member.registered).length
  );

  return {
    halqa,
    members,
    registeredMembers,
    presentMembers,
    pendingRegistrationMembers,
    pendingAttendanceMembers,
    tajnid,
    performanceRows,
    eventAverageAttendance,
    ...performance,
  };
}

function renderMiniProgress(label, value, detail) {
  return `
    <div class="zaim-progress-card">
      <div>
        <strong>${label}</strong>
        <span>${detail}</span>
      </div>
      <em>${value}%</em>
      <div class="zaim-progress-track"><span style="width: ${Math.min(Math.max(value, 0), 100)}%"></span></div>
    </div>
  `;
}

function renderZaimActionList(stats) {
  const followUpMembers = [...stats.pendingRegistrationMembers, ...stats.pendingAttendanceMembers]
    .filter((member, index, list) => list.findIndex((item) => item.code === member.code) === index)
    .slice(0, 6);
  const alerts = [
    stats.pendingRegistration > 0 ? `${stats.pendingRegistration} members not registered` : "",
    stats.pendingAttendance > 0 ? `${stats.pendingAttendance} members pending check-in` : "",
    stats.attendanceRate < stats.eventAverageAttendance ? "Attendance below event average" : "",
  ].filter(Boolean);

  return `
    <section class="zaim-card zaim-actions-card">
      <div class="section-title-row">
        <div>
          <p class="section-eyebrow">Action Required</p>
          <h3>Follow up today</h3>
        </div>
      </div>
      <div class="zaim-alert-list">
        ${
          alerts.length
            ? alerts.map((alert) => `<div class="zaim-alert"><strong>${alert}</strong></div>`).join("")
            : `<div class="zaim-alert is-clear"><strong>No urgent follow-up right now</strong></div>`
        }
      </div>
      <div class="zaim-follow-list">
        <strong>Members requiring follow-up</strong>
        ${
          followUpMembers.length
            ? followUpMembers
                .map(
                  (member) => `
                    <div>
                      <span>${member.name}</span>
                      <em>${member.registered ? "Pending check-in" : "Needs registration"}</em>
                    </div>
                  `
                )
                .join("")
            : `<p>Everyone in the current list is clear.</p>`
        }
      </div>
    </section>
  `;
}

function renderZaimDashboard() {
  const stats = getCurrentZaimStats();
  const topRows = stats.performanceRows.slice(0, 3);
  const currentRow = stats.performanceRows.find((row) => row.halqa === stats.halqa);

  return `
    <section class="zaim-dashboard">
      <div class="zaim-hero">
        <div>
          <p class="section-eyebrow">My Halqa Dashboard</p>
          <h2>${stats.halqa || "My Halqa"}</h2>
          <span>${stats.registered} registered from ${stats.tajnid} total Tajnid</span>
        </div>
        <div class="zaim-score-ring">
          <strong>${stats.score}</strong>
          <span>Score</span>
        </div>
      </div>

      <div class="zaim-kpi-grid">
        <div><span>Registration</span><strong>${stats.registrationRate}%</strong><em>${stats.registered} / ${stats.tajnid}</em></div>
        <div><span>Attendance</span><strong>${stats.attendanceRate}%</strong><em>${stats.present} / ${stats.registered}</em></div>
        <div><span>Rank</span><strong>#${stats.rank}</strong><em>of ${stats.performanceRows.length} halqas</em></div>
        <div><span>Pending</span><strong>${stats.pendingAttendance}</strong><em>check-ins</em></div>
      </div>

      <div class="zaim-grid">
        ${renderZaimActionList(stats)}
        <section class="zaim-card">
          <div class="section-title-row">
            <div>
              <p class="section-eyebrow">Halqa Performance</p>
              <h3>Progress</h3>
            </div>
          </div>
          ${renderMiniProgress("Registration Progress", stats.registrationRate, `${stats.registered} / ${stats.tajnid} registered`)}
          ${renderMiniProgress("Attendance Progress", stats.attendanceRate, `${stats.present} / ${stats.registered} present`)}
        </section>
      </div>

      <div class="zaim-grid">
        <section class="zaim-card">
          <div class="section-title-row">
            <div>
              <p class="section-eyebrow">Today's Goals</p>
              <h3>Accountability</h3>
            </div>
          </div>
          <div class="zaim-goal-list">
            <span class="${stats.pendingRegistration === 0 ? "is-done" : ""}">${stats.pendingRegistration === 0 ? "Done" : "Open"} Register all members</span>
            <span class="${stats.pendingAttendance === 0 ? "is-done" : ""}">${stats.pendingAttendance === 0 ? "Done" : "Open"} Reach 100% attendance</span>
            <span class="${stats.rank <= 5 ? "is-done" : ""}">${stats.rank <= 5 ? "Done" : "Open"} Move into top 5</span>
          </div>
        </section>

        <section class="zaim-card">
          <div class="section-title-row">
            <div>
              <p class="section-eyebrow">Leaderboard</p>
              <h3>Position context</h3>
            </div>
          </div>
          <div class="zaim-leaderboard-list">
            ${topRows
              .map((row) => `<div><strong>#${row.rank} ${row.halqa}</strong><span>${row.score} pts</span></div>`)
              .join("")}
            ${currentRow && currentRow.rank > 3 ? `<div class="is-current"><strong>#${currentRow.rank} ${currentRow.halqa}</strong><span>${currentRow.score} pts</span></div>` : ""}
          </div>
        </section>
      </div>
    </section>
  `;
}

function renderZaimRegistrationDetails() {
  const members = getCurrentHalqaMembers();
  const registeredMembers = members.filter((member) => member.registered);
  const stats = getCurrentZaimStats();

  return `
    <section class="zaim-page-shell">
      ${renderMiniProgress("Registration Progress", stats.registrationRate, `${registeredMembers.length} / ${stats.tajnid} registered`)}
      ${renderZaimActionList(stats)}
    </section>
    <div class="detail-table zaim-detail-table" role="table" aria-label="Zaim registration details">
      <div class="detail-row detail-head" role="row">
        <span>Code</span>
        <span>Name</span>
        <span>Status</span>
      </div>
      ${members
        .map(
          (member) => `
            <div class="detail-row" role="row">
              <strong>${member.code}</strong>
              <span>${member.name}</span>
              <span class="pill ${member.registered ? "pill-success" : "pill-muted"}">
                ${member.registered ? "Registered" : "Not registered"}
              </span>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function renderZaimAttendanceDetails() {
  const members = getCurrentHalqaMembers();
  const presentMembers = members.filter((member) => isMemberPresent(member));
  const stats = getCurrentZaimStats();

  return `
    <section class="zaim-page-shell">
      ${renderMiniProgress("Attendance Progress", stats.attendanceRate, `${presentMembers.length} / ${stats.registered} present`)}
      ${renderZaimActionList(stats)}
    </section>
    <div class="detail-table zaim-detail-table" role="table" aria-label="Zaim attendance details">
      <div class="detail-row detail-row-four detail-head" role="row">
        <span>Code</span>
        <span>Name</span>
        <span>Attendance</span>
        <span>Time</span>
      </div>
      ${members
        .map(
          (member) => `
            <div class="detail-row detail-row-four" role="row">
              <strong>${member.code}</strong>
              <span>${member.name}</span>
              <span class="pill ${isMemberPresent(member) ? "pill-success" : "pill-muted"}">
                ${isMemberPresent(member) ? "Present" : "Pending"}
              </span>
              <span>${getMemberCheckIn(member) || "-"}</span>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function renderZaimRankingsPage() {
  const stats = getCurrentZaimStats();
  const currentRow = stats.performanceRows.find((row) => row.halqa === stats.halqa);

  return `
    <section class="zaim-dashboard">
      <div class="zaim-hero compact">
        <div>
          <p class="section-eyebrow">Rankings</p>
          <h2>${stats.halqa}</h2>
          <span>Rank #${stats.rank} of ${stats.performanceRows.length}. Score ${stats.score}/100.</span>
        </div>
        <div class="zaim-score-ring">
          <strong>#${stats.rank}</strong>
          <span>Rank</span>
        </div>
      </div>
      <div class="zaim-grid">
        <section class="zaim-card">
          <div class="section-title-row">
            <div>
              <p class="section-eyebrow">Performance Score</p>
              <h3>What drives the rank</h3>
            </div>
          </div>
          ${renderMiniProgress("Registration", stats.registrationRate, `${stats.registered} / ${stats.tajnid} registered`)}
          ${renderMiniProgress("Attendance", stats.attendanceRate, `${stats.present} / ${stats.registered} present`)}
        </section>
        <section class="zaim-card">
          <div class="section-title-row">
            <div>
              <p class="section-eyebrow">Top 10 Target</p>
              <h3>${stats.rank <= 10 ? "Inside top 10" : `Need +${Math.max((stats.performanceRows[9]?.score || 0) - stats.score + 1, 1)} points`}</h3>
            </div>
          </div>
          <p class="zaim-muted">${stats.rank <= 10 ? "Keep attendance moving to hold the position." : "Improve registration coverage and check-ins to climb."}</p>
        </section>
      </div>
      <section class="zaim-card">
        <div class="section-title-row">
          <div>
            <p class="section-eyebrow">Leaderboard</p>
            <h3>All halqas</h3>
          </div>
        </div>
        <div class="zaim-ranking-table">
          ${stats.performanceRows
            .map(
              (row) => `
                <div class="${row.halqa === currentRow?.halqa ? "is-current" : ""}">
                  <strong>#${row.rank}</strong>
                  <span>${row.halqa}</span>
                  <em>${row.registrationRate}% reg</em>
                  <em>${row.attendanceRate}% att</em>
                  <b>${row.score}</b>
                </div>
              `
            )
            .join("")}
        </div>
      </section>
    </section>
  `;
}

function getAttendanceMatches() {
  const query = attendanceSearch.trim().toLowerCase();

  if (!query) {
    return memberRecords.slice(0, 8);
  }

  return memberRecords
    .filter((member) => {
      return (
        String(member.code || "").toLowerCase().includes(query) ||
        String(member.name || "").toLowerCase().includes(query) ||
        String(member.halqa || "").toLowerCase().includes(query)
      );
    })
    .slice(0, 12);
}

function getAttendanceStats() {
  const registeredMembers = memberRecords.filter((member) => member.registered);
  const presentMembers = registeredMembers.filter((member) => isMemberPresent(member));

  return {
    checkedIn: presentMembers.length,
    pending: Math.max(registeredMembers.length - presentMembers.length, 0),
    rate: registeredMembers.length ? Math.round((presentMembers.length / registeredMembers.length) * 100) : 0,
    total: registeredMembers.length,
  };
}

function normalizeAttendanceCode(code) {
  return String(code || "").trim();
}

function getAttendanceCodeSet() {
  return new Set(attendanceRecords.map((record) => normalizeAttendanceCode(record.code)).filter(Boolean));
}

function getAttendanceRecordForMember(code) {
  const normalizedCode = normalizeAttendanceCode(code);
  return attendanceRecords.find((record) => normalizeAttendanceCode(record.code) === normalizedCode);
}

function isMemberPresent(member) {
  return Boolean(member?.attended || getAttendanceRecordForMember(member?.code));
}

function getMemberCheckIn(member) {
  return member?.checkIn || getAttendanceRecordForMember(member?.code)?.checkIn || "";
}

function reconcileAttendanceState() {
  const attendanceByCode = new Map();

  attendanceRecords = attendanceRecords.filter((record) => {
    const code = normalizeAttendanceCode(record.code);

    if (!code || attendanceByCode.has(code)) {
      return false;
    }

    attendanceByCode.set(code, record);
    return true;
  });

  memberRecords = memberRecords.map((member) => {
    const attendanceRecord = attendanceByCode.get(normalizeAttendanceCode(member.code));

    if (!attendanceRecord && !member.attended) {
      return member;
    }

    return {
      ...member,
      attended: Boolean(member.attended || attendanceRecord),
      checkIn: member.checkIn || attendanceRecord?.checkIn || "",
    };
  });
}

function findAttendanceLookupMember(query) {
  const normalized = String(query || "").trim().toLowerCase();

  if (!normalized) {
    return null;
  }

  return (
    memberRecords.find((member) => String(member.code || "").toLowerCase() === normalized) ||
    memberRecords.find((member) => String(member.name || "").toLowerCase() === normalized) ||
    memberRecords.find((member) => String(member.code || "").toLowerCase().includes(normalized)) ||
    memberRecords.find((member) => String(member.name || "").toLowerCase().includes(normalized))
  );
}

function getCurrentCheckInTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function checkInMember(code) {
  const member = memberRecords.find((record) => record.code === code);

  if (!member) {
    attendanceMessage = "Member was not found.";
    return;
  }

  if (isMemberPresent(member)) {
    attendanceMessage = `${member.name} is already checked in.`;
    return;
  }

  try {
    const data = await apiRequest("/api/attendance/check-in", {
      method: "POST",
      body: JSON.stringify({
        code,
        checkedInBy: currentUser?.name || "Attendance Team",
      }),
    });

    memberRecords = data.memberRecords;
    attendanceRecords = data.attendanceRecords;
    reconcileAttendanceState();
    attendanceMessage = data.message;
    return;
  } catch (error) {
    if (error.data?.attendanceRecords) {
      attendanceRecords = error.data.attendanceRecords;
      reconcileAttendanceState();
    }

    if (!error.data) {
      attendanceMessage = "Backend is unavailable, using local check-in.";
    } else {
      attendanceMessage = error.message;
      return;
    }
  }

  const checkIn = getCurrentCheckInTime();
  member.attended = true;
  member.checkIn = checkIn;

  attendanceRecords.unshift({
    code: member.code,
    name: member.name,
    halqa: member.halqa,
    checkIn,
    checkedInBy: currentUser?.name || "Attendance Team",
  });

  attendanceMessage = `${member.name} checked in successfully.`;
}

function openAttendanceLookup() {
  const member = findAttendanceLookupMember(attendanceSearch);

  if (!member) {
    attendanceModal = {
      type: "not-found",
      title: "Member Not Found",
      message: attendanceSearch ? `No member matched "${attendanceSearch}".` : "Enter a code or name to search.",
    };
    renderDashboard(currentRole);
    return;
  }

  attendanceModal = {
    type: isMemberPresent(member) ? "duplicate" : "confirm",
    code: member.code,
  };
  renderDashboard(currentRole);
}

async function confirmAttendanceModalCheckIn() {
  if (!attendanceModal?.code) {
    return;
  }

  const member = memberRecords.find((record) => String(record.code) === String(attendanceModal.code));

  if (!member) {
    attendanceModal = { type: "not-found", title: "Member Not Found", message: "This member could not be found." };
    renderDashboard(currentRole);
    return;
  }

  await checkInMember(member.code);
  const refreshedMember = memberRecords.find((record) => String(record.code) === String(member.code)) || member;
  attendanceModal = {
    type: "success",
    code: refreshedMember.code,
    checkIn: refreshedMember.checkIn || getCurrentCheckInTime(),
  };
  attendanceSearch = "";
  renderDashboard(currentRole);
  window.setTimeout(() => {
    if (attendanceModal?.type === "success") {
      attendanceModal = null;
      renderDashboard(currentRole);
    }
  }, 1500);
}

function renderAttendanceModal() {
  if (!attendanceModal) {
    return "";
  }

  const member = attendanceModal.code
    ? memberRecords.find((record) => String(record.code) === String(attendanceModal.code))
    : null;
  const modalClass = `attendance-modal-card modal-${attendanceModal.type}`;

  if (attendanceModal.type === "not-found") {
    return `
      <div class="attendance-modal-backdrop" role="dialog" aria-modal="true">
        <article class="${modalClass}">
          <h3>${attendanceModal.title}</h3>
          <p>${attendanceModal.message}</p>
          <div class="attendance-modal-actions">
            <button class="secondary-button attendance-modal-close" type="button">Close</button>
            <button class="primary-button attendance-focus-search" type="button">Search Again</button>
          </div>
        </article>
      </div>
    `;
  }

  if (!member) {
    return "";
  }

  const attendanceRecord = getAttendanceRecordForMember(member.code) || {};
  const alreadyCheckedIn = attendanceModal.type === "duplicate";
  const isSuccess = attendanceModal.type === "success";

  return `
    <div class="attendance-modal-backdrop" role="dialog" aria-modal="true">
      <article class="${modalClass}">
        <p class="section-eyebrow">${isSuccess ? "Attendance Recorded" : alreadyCheckedIn ? "Already Checked In" : "Confirm Attendance"}</p>
        <h3>${member.name}</h3>
        <div class="attendance-member-card">
          <span class="member-photo-placeholder">${String(member.name || "M").slice(0, 1).toUpperCase()}</span>
          <div>
            <strong>Code: ${member.code}</strong>
            <span>Halqa: ${member.halqa}</span>
            <span>Status: ${isMemberPresent(member) ? "Present" : "Pending"}</span>
            ${(getMemberCheckIn(member) || attendanceModal.checkIn) ? `<span>Checked In: ${getMemberCheckIn(member) || attendanceModal.checkIn}</span>` : ""}
            ${attendanceRecord.checkedInBy ? `<span>Desk: ${attendanceRecord.checkedInBy}</span>` : ""}
          </div>
        </div>
        <div class="attendance-modal-actions">
          ${
            attendanceModal.type === "confirm"
              ? `
                <button class="secondary-button attendance-modal-close" type="button">Cancel</button>
                <button class="secondary-button attendance-issue-button" type="button">Report Issue</button>
                <button class="primary-button attendance-confirm-button" type="button">Check In</button>
              `
              : `<button class="primary-button attendance-modal-close" type="button">Close</button>`
          }
        </div>
      </article>
    </div>
  `;
}

function renderAttendanceCheckIn() {
  const matches = getAttendanceMatches().slice(0, 5);
  const stats = getAttendanceStats();
  const recentRecords = attendanceRecords.slice(0, 6);

  return `
    <section class="attendance-station-shell">
      <div class="attendance-station-hero">
        <div>
          <p class="section-eyebrow">Attendance Team Portal</p>
          <h2>Check-In Station</h2>
        </div>
        <div class="attendance-live-badge"><span></span>Live sync</div>
      </div>

      <div class="attendance-station-stats">
        <div><span>Checked In</span><strong>${stats.checkedIn}</strong></div>
        <div><span>Pending</span><strong>${stats.pending}</strong></div>
        <div><span>Attendance Rate</span><strong>${stats.rate}%</strong></div>
      </div>

      <div class="attendance-station-grid">
        <section class="attendance-checkin-panel">
          <p class="section-eyebrow">Member Check-In</p>
          <h3>Enter code, name, or scan badge</h3>
          <div class="attendance-search-row">
            <input id="attendanceSearchInput" value="${escapeAttribute(attendanceSearch)}" placeholder="Code, name, or badge scan" autocomplete="off" />
            <button class="primary-button attendance-lookup-button" type="button">Lookup</button>
          </div>
          <div class="attendance-shortcuts">
            <span>Enter: lookup</span>
            <span>F2: focus search</span>
            <span>Esc: close popup</span>
          </div>
          ${attendanceMessage ? `<div class="portal-message">${attendanceMessage}</div>` : ""}
          <div class="attendance-candidate-list">
            ${attendanceSearch && matches.length
              ? matches
                  .map(
                    (member) => `
                      <button class="attendance-candidate attendance-open-member" data-code="${member.code}" type="button">
                        <strong>${member.name}</strong>
                        <span>${member.code} - ${member.halqa}</span>
                        <em>${isMemberPresent(member) ? `Present ${getMemberCheckIn(member)}` : "Pending"}</em>
                      </button>
                    `
                  )
                  .join("")
              : `<div class="attendance-empty-state">Ready for the next member.</div>`}
          </div>
        </section>

        <aside class="attendance-activity-panel">
          <div class="section-title-row">
            <div>
              <p class="section-eyebrow">Recent Check-Ins</p>
              <h3>Activity feed</h3>
            </div>
          </div>
          <div class="attendance-activity-list">
            ${recentRecords.length
              ? recentRecords
                  .map(
                    (record) => `
                      <div>
                        <strong>${record.name}</strong>
                        <span>${record.halqa}</span>
                        <em>${record.checkIn}</em>
                      </div>
                    `
                  )
                  .join("")
              : `<div class="attendance-empty-state">No check-ins yet.</div>`}
          </div>
        </aside>
      </div>
      ${renderAttendanceModal()}
    </section>
  `;
}

function renderRecentAttendance() {
  const recentRecords = attendanceRecords.slice(0, 10);

  return `
    <section class="attendance-log-shell">
      <div class="attendance-station-hero compact">
        <div>
          <p class="section-eyebrow">Activity Log</p>
          <h2>Recent Attendance</h2>
        </div>
      </div>
    <div class="detail-table" role="table" aria-label="Recent attendance">
      <div class="detail-row detail-row-five detail-head" role="row">
        <span>Time</span>
        <span>Code</span>
        <span>Name</span>
        <span>Halqa</span>
        <span>By</span>
      </div>
      ${recentRecords
        .map(
          (record) => `
            <div class="detail-row detail-row-five" role="row">
              <strong>${record.checkIn}</strong>
              <span>${record.code}</span>
              <span>${record.name}</span>
              <span>${record.halqa}</span>
              <span>${record.checkedInBy}</span>
            </div>
          `
        )
        .join("")}
    </div>
    </section>
  `;
}

function renderAttendanceIssues() {
  const duplicateCodes = memberRecords
    .filter((member, index, list) => list.findIndex((item) => String(item.code) === String(member.code)) !== index)
    .slice(0, 12);

  return `
    <section class="attendance-log-shell">
      <div class="attendance-station-hero compact">
        <div>
          <p class="section-eyebrow">Issues</p>
          <h2>Review Queue</h2>
          <span>Badge problems, duplicate registrations, and missing records can be reviewed here.</span>
        </div>
      </div>
      <div class="attendance-issue-grid">
        <article class="attendance-issue-card">
          <strong>${duplicateCodes.length}</strong>
          <span>Potential duplicate records</span>
        </article>
        <article class="attendance-issue-card">
          <strong>0</strong>
          <span>Badge problems reported</span>
        </article>
        <article class="attendance-issue-card">
          <strong>0</strong>
          <span>Missing registrations reported</span>
        </article>
      </div>
      <div class="attendance-activity-panel">
        <p class="section-eyebrow">Issue Notes</p>
        <div class="attendance-empty-state">Use Report Issue from the check-in popup when a member needs manual review.</div>
      </div>
    </section>
  `;
}

function getLiveScheduleItem() {
  const now = new Date();
  const timedLiveItem = scheduleItems.find((item) => {
    const start = parseTodayTime(item.start);
    const end = parseTodayTime(item.end);
    return start && end && start.getTime() <= now.getTime() && end.getTime() > now.getTime();
  });

  return timedLiveItem || scheduleItems.find((item) => String(item.status || "").toLowerCase() === "live") || scheduleItems[0] || {};
}

function getNextScheduleItem() {
  const now = new Date();
  const timedNextItem = scheduleItems
    .map((item) => ({ ...item, startDate: parseTodayTime(item.start) }))
    .filter((item) => item.startDate && item.startDate.getTime() > now.getTime())
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())[0];

  return (
    timedNextItem ||
    scheduleItems.find((item) => String(item.status || "").toLowerCase() === "next") ||
    scheduleItems.find((item) => String(item.status || "").toLowerCase() === "upcoming") ||
    scheduleItems[1] ||
    {}
  );
}

function getLatestWinner() {
  return getEducationFinalPositions()[0] || getSportsFinalPositions()[0] || competitionResults[0] || {};
}

function renderAvSlide() {
  const slide = avSlides[avSlideIndex % avSlides.length];
  const liveItem = getLiveScheduleItem();
  const nextItem = getNextScheduleItem();
  const topHalqajat = halqaRankings.slice(0, 3);
  const latestWinner = getLatestWinner();
  const latestAnnouncements = announcements.slice(0, 2);
  const attendanceStats = getAttendanceStats();

  if (slide === "Welcome") {
    return `
      <div class="av-slide av-slide-welcome">
        <div class="av-centerpiece">
          <span class="av-kicker">Majlis Khuddamul Ahmadiyya Canada</span>
          <h2>IJTEMA 2025</h2>
          <p>Muqami</p>
        </div>
      </div>
    `;
  }

  if (slide === "Live Schedule") {
    return `
      <div class="av-slide av-slide-schedule">
        <div class="av-centerpiece">
          <span class="av-kicker">Live Now</span>
          <h2>${liveItem.title || "Program Live"}</h2>
          <div class="av-divider"></div>
          <p>${liveItem.location || "Main Hall"}</p>
          <h3>${liveItem.start || "--"} - ${liveItem.end || "--"}</h3>
        </div>
      </div>
    `;
  }

  if (slide === "Coming Up") {
    return `
      <div class="av-slide av-slide-coming">
        <div class="av-centerpiece">
          <span class="av-kicker">Coming Up</span>
          <h2>${nextItem.title || "Next Program"}</h2>
          <div class="av-feature">
            <strong>${nextItem.location || "Venue"}</strong>
            <span>${nextItem.start || "--"} - ${nextItem.end || "--"}</span>
          </div>
        </div>
      </div>
    `;
  }

  if (slide === "Attendance Live") {
    return `
      <div class="av-slide av-slide-attendance">
        <div class="av-centerpiece">
          <span class="av-kicker">Attendance Live</span>
          <div class="av-stat-grid">
            <div><strong>${attendanceStats.registered}</strong><span>Registered</span></div>
            <div><strong>${attendanceStats.present}</strong><span>Checked In</span></div>
            <div><strong>${attendanceStats.rate}%</strong><span>Attendance Rate</span></div>
          </div>
        </div>
      </div>
    `;
  }

  if (slide === "Announcements") {
    return `
      <div class="av-slide av-slide-announcement">
        <div class="av-centerpiece">
          <span class="av-kicker">Important Announcement</span>
          <h2>${latestAnnouncements[0]?.title || "Notice"}</h2>
          <p>${latestAnnouncements[0]?.message || "Please follow event staff directions."}</p>
          ${
            latestAnnouncements[1]
              ? `<div class="av-feature"><strong>${latestAnnouncements[1].title}</strong><span>${latestAnnouncements[1].message}</span></div>`
              : ""
          }
        </div>
      </div>
    `;
  }

  if (slide === "Leaderboard") {
    return `
      <div class="av-slide av-slide-leaderboard">
        <div class="av-centerpiece">
          <span class="av-kicker">Current Standings</span>
          <div class="av-list">
            ${topHalqajat
              .map(
                (item, index) => `
                  <div class="av-list-row">
                    <strong>${index === 0 ? "1st" : index === 1 ? "2nd" : "3rd"}</strong>
                    <span>${item.halqa}</span>
                    <em>${item.total} pts</em>
                  </div>
                `
              )
              .join("")}
          </div>
        </div>
      </div>
    `;
  }

  return `
    <div class="av-slide av-slide-winners">
      <div class="av-centerpiece">
        <span class="av-kicker">Winner</span>
        <h2>${latestWinner.competition || latestWinner.sport || "Competition"}</h2>
        <div class="av-winner-card">
          <span>${latestWinner.position || "First Place"}</span>
          <strong>${latestWinner.participantName || latestWinner.name || latestWinner.halqa || "Winner"}</strong>
          <em>${latestWinner.halqa || ""}</em>
        </div>
      </div>
    </div>
  `;
}

function renderAvDisplay() {
  return `
    <section class="av-display">
      ${renderAvDisplayContents()}
    </section>
  `;
}

function renderAvDisplayContents() {
  return `
    <button class="av-maximize" type="button" aria-label="Maximize AV display">Maximize</button>
    ${renderAvSlide()}
  `;
}

function refreshAvDisplayOnly() {
  const display = document.querySelector(".av-display");

  if (!display) {
    renderDashboard("av");
    return;
  }

  display.innerHTML = renderAvDisplayContents();
  bindAvDisplayControls();
}

function getRegistrationRows() {
  const query = registrationSearch.trim().toLowerCase();

  return memberRecords.filter((member) => {
    const matchesHalqa = registrationHalqaFilter === "All" || member.halqa === registrationHalqaFilter;
    const matchesQuery =
      !query ||
      String(member.code || "").toLowerCase().includes(query) ||
      String(member.name || "").toLowerCase().includes(query) ||
      String(member.halqa || "").toLowerCase().includes(query);

    return matchesHalqa && matchesQuery;
  });
}

function getHalqaTajnid(halqa) {
  return halqaTajnidReference[halqa]?.tajnid || 0;
}

function getTotalTajnid() {
  return halqajat.reduce((sum, halqa) => sum + getHalqaTajnid(halqa), 0);
}

function getPercent(numerator, denominator) {
  return denominator ? Math.round((numerator / denominator) * 1000) / 10 : 0;
}

function getRegistrationStats() {
  const registeredMembers = memberRecords.filter((member) => member.registered);
  const attendedMembers = memberRecords.filter((member) => isMemberPresent(member));
  const totalTajnid = getTotalTajnid();
  const halqaCounts = halqajat
    .map((halqa) => {
      const tajnid = getHalqaTajnid(halqa);
      const count = registeredMembers.filter((member) => member.halqa === halqa).length;
      const attended = attendedMembers.filter((member) => member.halqa === halqa).length;

      return {
        halqa,
        count,
        attended,
        tajnid,
        unregistered: Math.max(tajnid - count, 0),
        coverage: getPercent(count, tajnid),
      };
    })
    .sort((a, b) => b.count - a.count);
  const attendanceRate = registeredMembers.length ? Math.round((attendedMembers.length / registeredMembers.length) * 100) : 0;

  return {
    total: registeredMembers.length,
    totalTajnid,
    unregistered: Math.max(totalTajnid - registeredMembers.length, 0),
    registrationCoverage: getPercent(registeredMembers.length, totalTajnid),
    attended: attendedMembers.length,
    pending: Math.max(registeredMembers.length - attendedMembers.length, 0),
    attendanceRate,
    halqaCounts,
  };
}

function renderAdminRegistrations() {
  const stats = getRegistrationStats();
  const rows = getRegistrationRows();
  const lastUpdated = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const duplicateCount = getDuplicateRegistrationCount();
  const zeroRegistrationHalqas = stats.halqaCounts.filter((item) => item.count === 0);
  const lowRegistrationHalqas = stats.halqaCounts.filter((item) => item.coverage > 0 && item.coverage < 10);
  const topHalqas = [...stats.halqaCounts].sort((a, b) => b.coverage - a.coverage || b.count - a.count);
  const bottomHalqas = new Set([...stats.halqaCounts].sort((a, b) => a.coverage - b.coverage || a.count - b.count).slice(0, 3).map((item) => item.halqa));
  const attentionItems = [
    {
      tone: stats.pending > 0 ? "warning" : "success",
      label: `${stats.pending} members not checked in`,
      detail: stats.pending > 0 ? "Registered members still awaiting attendance check-in." : "All registered members are checked in.",
    },
    {
      tone: zeroRegistrationHalqas.length > 0 ? "danger" : "success",
      label: `${zeroRegistrationHalqas.length} halqas with 0 registrations`,
      detail: zeroRegistrationHalqas.length
        ? zeroRegistrationHalqas.slice(0, 3).map((item) => item.halqa).join(", ")
        : "Every halqa has at least one registration.",
    },
    {
      tone: duplicateCount > 0 ? "warning" : "success",
      label: `${duplicateCount} duplicate registrations detected`,
      detail: duplicateCount > 0 ? "Review matching member codes or repeated records." : "No duplicate registration codes found.",
    },
  ];

  return `
    <section class="registration-ops-shell">
      <div class="registration-ops-hero">
        <div>
          <p class="section-eyebrow">Registration Management</p>
          <h3>Live registration and attendance monitoring</h3>
          <span>Last updated ${lastUpdated}</span>
        </div>
        <div class="attendance-live-badge">
          <span></span>
          Live sync
        </div>
      </div>

      <div class="registration-kpi-grid">
        <div class="attendance-kpi">
          <span>Registered</span>
          <strong>${stats.total}</strong>
        </div>
        <div class="attendance-kpi">
          <span>Total Tajnid</span>
          <strong>${stats.totalTajnid}</strong>
        </div>
        <div class="attendance-kpi">
          <span>Not Registered</span>
          <strong>${stats.unregistered}</strong>
        </div>
        <div class="attendance-kpi">
          <span>Registration %</span>
          <strong>${stats.registrationCoverage}%</strong>
        </div>
      </div>

      <div class="attendance-progress-card">
        <div>
          <strong>${stats.total} / ${stats.totalTajnid} total members registered</strong>
          <span>${stats.attended} checked in so far. ${rows.length} member records visible with the current filters.</span>
        </div>
        <div class="attendance-progress-track" aria-label="Registration attendance progress">
          <span style="width: ${Math.min(Math.max(stats.registrationCoverage, 0), 100)}%"></span>
        </div>
      </div>

      <div class="attendance-action-row">
        <button class="secondary-button compact registration-excel-button" type="button">Excel Report</button>
        <button class="secondary-button compact registration-pdf-button" type="button">PDF Report</button>
        <button class="secondary-button compact registration-summary-button" type="button">Halqa Summary</button>
        <button class="secondary-button compact registration-print-button" type="button">Print List</button>
        <button class="primary-button compact registration-refresh-button" type="button">Refresh</button>
      </div>

      <div class="registration-ops-grid">
        <section class="attention-panel">
          <div class="section-title-row">
            <div>
              <p class="section-eyebrow">Attention Required</p>
              <h3>Registration issues</h3>
            </div>
          </div>
          <div class="attention-list">
            ${attentionItems
              .map(
                (item) => `
                  <div class="attention-item ${item.tone}">
                    <div>
                      <strong>${item.label}</strong>
                      <span>${item.detail}</span>
                    </div>
                  </div>
                `
              )
              .join("")}
          </div>
        </section>

        <section class="halqa-performance-panel">
          <div class="section-title-row">
            <div>
              <p class="section-eyebrow">Halqa Registration Rankings</p>
              <h3>Top and low registration halqas</h3>
            </div>
          </div>
          <div class="registration-halqa-list">
            ${topHalqas
              .map(
                (item, index) => {
                  const barWidth = Math.max(item.coverage > 0 ? 6 : 0, Math.min(Math.round(item.coverage), 100));
                  return `
                    <button class="registration-halqa-card registration-halqa-count ${registrationHalqaFilter === item.halqa ? "is-active" : ""} ${
                      bottomHalqas.has(item.halqa) || lowRegistrationHalqas.includes(item) ? "needs-attention" : ""
                    }" data-halqa="${item.halqa}" type="button">
                      <span class="halqa-rank">#${index + 1}</span>
                      <span class="halqa-name">${item.halqa}</span>
                      <strong>${item.coverage}%</strong>
                      <em>${item.count} / ${item.tajnid} registered</em>
                      <span class="registration-halqa-bar"><span style="width: ${barWidth}%"></span></span>
                    </button>
                  `;
                }
              )
              .join("")}
          </div>
        </section>
      </div>

      <section class="registration-toolbar-panel">
        <div class="section-title-row">
          <div>
            <p class="section-eyebrow">Search & Filters</p>
            <h3>Registration records</h3>
          </div>
        </div>
        <div class="filter-bar registration-filter-bar">
          <label class="search-field">
            <span>Search member</span>
            <input id="registrationSearchInput" value="${escapeAttribute(registrationSearch)}" placeholder="Name, code, or halqa" />
          </label>
          <label class="search-field">
            <span>Halqa</span>
            <select id="registrationHalqaFilter">
              <option ${registrationHalqaFilter === "All" ? "selected" : ""}>All</option>
              ${halqajat
                .map((halqa) => `<option ${registrationHalqaFilter === halqa ? "selected" : ""}>${halqa}</option>`)
                .join("")}
            </select>
          </label>
          <label class="search-field">
            <span>Attendance</span>
            <select>
              <option selected>All</option>
              <option>Checked In</option>
              <option>Pending</option>
            </select>
          </label>
        </div>
      </section>

      <div class="detail-table registration-ops-table" role="table" aria-label="Registration list">
        <div class="detail-row registration-row detail-head" role="row">
          <span>Code</span>
          <span>Name</span>
          <span>Halqa</span>
          <span>Registered</span>
          <span>Tajnid</span>
          <span>Check-In</span>
          <span>Status</span>
          <span>Actions</span>
        </div>
        ${rows
          .map(
            (member) => `
              <div class="detail-row registration-row" role="row">
                <strong>${member.code || "-"}</strong>
                <span>${member.name || "-"}</span>
                <span>${member.halqa || "-"}</span>
                <span class="pill ${member.registered ? "pill-success" : "pill-muted"}">${member.registered ? "Yes" : "No"}</span>
                <span>${getHalqaTajnid(member.halqa)}</span>
                <span>${getMemberCheckIn(member) || "-"}</span>
                <span class="pill ${isMemberPresent(member) ? "pill-success" : "pill-muted"}">${isMemberPresent(member) ? "Present" : "Pending"}</span>
                <span class="attendance-row-actions">
                  <button class="secondary-button compact" type="button">View</button>
                  <button class="secondary-button compact" type="button">Edit</button>
                </span>
              </div>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function getAttendanceReportRows() {
  const query = attendanceReportSearch.trim().toLowerCase();

  return memberRecords.filter((member) => {
    const matchesHalqa = attendanceReportHalqaFilter === "All" || member.halqa === attendanceReportHalqaFilter;
    const status = isMemberPresent(member) ? "Present" : "Pending";
    const matchesStatus = attendanceReportStatusFilter === "All" || attendanceReportStatusFilter === status;
    const matchesQuery =
      !query ||
      String(member.code || "").toLowerCase().includes(query) ||
      String(member.name || "").toLowerCase().includes(query) ||
      String(member.halqa || "").toLowerCase().includes(query);

    return matchesHalqa && matchesStatus && matchesQuery;
  });
}

function getAttendanceReportStats() {
  const registeredMembers = memberRecords.filter((member) => member.registered);
  const presentMembers = registeredMembers.filter((member) => isMemberPresent(member));
  const rate = registeredMembers.length ? Math.round((presentMembers.length / registeredMembers.length) * 100) : 0;
  const totalTajnid = getTotalTajnid();
  const halqaCounts = halqajat
    .map((halqa) => {
      const tajnid = getHalqaTajnid(halqa);
      const registered = registeredMembers.filter((member) => member.halqa === halqa).length;
      const present = presentMembers.filter((member) => member.halqa === halqa).length;
      const halqaRate = registered ? Math.round((present / registered) * 100) : 0;
      return {
        halqa,
        tajnid,
        registered,
        present,
        pending: Math.max(registered - present, 0),
        rate: halqaRate,
        registrationCoverage: getPercent(registered, tajnid),
        tajnidAttendanceRate: getPercent(present, tajnid),
      };
    })
    .sort((a, b) => b.rate - a.rate || b.present - a.present);

  return {
    registered: registeredMembers.length,
    totalTajnid,
    unregistered: Math.max(totalTajnid - registeredMembers.length, 0),
    present: presentMembers.length,
    pending: Math.max(registeredMembers.length - presentMembers.length, 0),
    rate,
    tajnidAttendanceRate: getPercent(presentMembers.length, totalTajnid),
    halqaCounts,
  };
}

function getAttendanceHealthTone(rate) {
  if (rate >= 80) {
    return "excellent";
  }

  if (rate >= 60) {
    return "good";
  }

  if (rate >= 40) {
    return "warning";
  }

  return "critical";
}

function getAttendanceTrendRows() {
  const buckets = new Map();

  memberRecords
    .filter((member) => isMemberPresent(member))
    .forEach((member) => {
      const attendanceRecord = getAttendanceRecordForMember(member.code) || {};
      const parsedTime = parseTodayTime(getMemberCheckIn(member) || attendanceRecord.checkIn);

      if (!parsedTime) {
        return;
      }

      const label = parsedTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }).replace(/:\d{2}\s/, " ");
      buckets.set(label, (buckets.get(label) || 0) + 1);
    });

  const rows = [...buckets.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => {
      const aDate = parseTodayTime(a.label.replace(/\s/, ":00 "));
      const bDate = parseTodayTime(b.label.replace(/\s/, ":00 "));
      return (aDate?.getTime() || 0) - (bDate?.getTime() || 0);
    });

  const max = Math.max(...rows.map((row) => row.count), 1);

  return rows.map((row) => ({
    ...row,
    width: Math.max(8, Math.round((row.count / max) * 100)),
  }));
}

function getDuplicateRegistrationCount() {
  const seen = new Map();
  let duplicates = 0;

  memberRecords
    .filter((member) => member.registered)
    .forEach((member) => {
      const key = String(member.code || `${member.name || ""}-${member.halqa || ""}`).trim().toLowerCase();

      if (!key) {
        return;
      }

      if (seen.has(key)) {
        duplicates += 1;
        return;
      }

      seen.set(key, true);
    });

  return duplicates;
}

function getRegistrationExportRows() {
  return getRegistrationRows().map((member) => [
    member.code || "-",
    member.name || "-",
    member.halqa || "-",
    member.registered ? "Yes" : "No",
    getHalqaTajnid(member.halqa),
    getMemberCheckIn(member) || "-",
    isMemberPresent(member) ? "Present" : "Pending",
  ]);
}

function exportRegistrationCsv(summaryOnly = false) {
  const stats = getRegistrationStats();

  if (summaryOnly) {
    downloadCsv(
      "halqa-registration-summary.csv",
      ["Halqa", "Registrations", "Tajnid", "Registration %", "Checked In", "Pending Check-In", "Not Registered"],
      stats.halqaCounts.map((item) => [
        item.halqa,
        item.count,
        item.tajnid,
        `${item.coverage}%`,
        item.attended,
        Math.max(item.count - item.attended, 0),
        item.unregistered,
      ])
    );
    return;
  }

  downloadCsv(
    "registration-report.csv",
    ["Code", "Name", "Halqa", "Registered", "Tajnid", "Check-In", "Status"],
    getRegistrationExportRows()
  );
}

function openRegistrationPdfReport() {
  const stats = getRegistrationStats();

  openReportWindow(
    "IJTEMA Registration Report",
    [
      ["Registered", stats.total],
      ["Total Tajnid", stats.totalTajnid],
      ["Not Registered", stats.unregistered],
      ["Registration Rate", `${stats.registrationCoverage}%`],
    ],
    ["Code", "Name", "Halqa", "Registered", "Tajnid", "Check-In", "Status"],
    getRegistrationExportRows()
  );
}

function getAttendanceExportRows() {
  return getAttendanceReportRows().map((member) => {
    const attendanceRecord = getAttendanceRecordForMember(member.code) || {};
    const checkInTime = getMemberCheckIn(member) || attendanceRecord.checkIn || "-";
    const checkedInBy = attendanceRecord.checkedInBy || (isMemberPresent(member) ? "Check-in desk" : "-");

    return [
      member.code || "-",
      member.name || "-",
      member.halqa || "-",
      getHalqaTajnid(member.halqa),
      isMemberPresent(member) ? "Present" : "Pending",
      checkInTime,
      checkedInBy,
      isMemberPresent(member) ? checkInTime : "-",
    ];
  });
}

function exportAttendanceCsv(summaryOnly = false) {
  const stats = getAttendanceReportStats();

  if (summaryOnly) {
    downloadCsv(
      "attendance-summary.csv",
      ["Halqa", "Tajnid", "Registered", "Registration %", "Present", "Pending", "Attendance Rate", "Tajnid Attendance %"],
      stats.halqaCounts.map((item) => [
        item.halqa,
        item.tajnid,
        item.registered,
        `${item.registrationCoverage}%`,
        item.present,
        Math.max(item.registered - item.present, 0),
        `${item.rate}%`,
        `${item.tajnidAttendanceRate}%`,
      ])
    );
    return;
  }

  downloadCsv(
    "attendance-report.csv",
    ["Code", "Name", "Halqa", "Tajnid", "Status", "Check-In Time", "Checked In By", "Last Updated"],
    getAttendanceExportRows()
  );
}

function openAttendancePdfReport() {
  const stats = getAttendanceReportStats();

  openReportWindow(
    "IJTEMA Attendance Report",
    [
      ["Present", stats.present],
      ["Pending", stats.pending],
      ["Attendance Rate", `${stats.rate}%`],
      ["Tajnid Reach", `${stats.tajnidAttendanceRate}%`],
    ],
    ["Code", "Name", "Halqa", "Tajnid", "Status", "Check-In Time", "Checked In By", "Last Updated"],
    getAttendanceExportRows()
  );
}

async function markAttendanceRowsPresent(rows = getAttendanceReportRows()) {
  const pendingRows = rows.filter((member) => member.registered && !isMemberPresent(member));

  for (const member of pendingRows) {
    await checkInMember(member.code);
  }

  attendanceMessage = pendingRows.length
    ? `${pendingRows.length} visible member${pendingRows.length === 1 ? "" : "s"} marked present.`
    : "No pending visible members to mark present.";
  reconcileAttendanceState();
  renderDashboard(currentRole);
}

async function markAttendanceRowsAbsent(rows = getAttendanceReportRows()) {
  const presentRows = rows.filter((member) => isMemberPresent(member));

  if (!presentRows.length) {
    attendanceMessage = "No visible present members to mark absent.";
    renderDashboard(currentRole);
    return;
  }

  try {
    const data = await apiRequest("/api/attendance/mark-absent", {
      method: "POST",
      body: JSON.stringify({
        codes: presentRows.map((member) => member.code),
      }),
    });
    memberRecords = data.memberRecords || memberRecords;
    attendanceRecords = data.attendanceRecords || attendanceRecords;
  } catch (error) {
    const absentCodes = new Set(presentRows.map((member) => normalizeAttendanceCode(member.code)));
    memberRecords = memberRecords.map((member) =>
      absentCodes.has(normalizeAttendanceCode(member.code)) ? { ...member, attended: false, checkIn: "" } : member
    );
    attendanceRecords = attendanceRecords.filter((record) => !absentCodes.has(normalizeAttendanceCode(record.code)));
  }

  attendanceMessage = `${presentRows.length} visible member${presentRows.length === 1 ? "" : "s"} marked absent.`;
  reconcileAttendanceState();
  renderDashboard(currentRole);
}

function renderAdminAttendanceReports() {
  const stats = getAttendanceReportStats();
  const rows = getAttendanceReportRows();
  const progress = Math.min(Math.max(stats.rate, 0), 100);
  const lastUpdated = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const lowAttendanceHalqas = stats.halqaCounts.filter((item) => item.registered > 0 && item.rate < 30);
  const missingLeaders = [...stats.halqaCounts]
    .map((item) => ({ ...item, missing: Math.max(item.registered - item.present, 0) }))
    .sort((a, b) => b.missing - a.missing);
  const halqaLeaders = [...stats.halqaCounts].sort((a, b) => b.rate - a.rate || b.present - a.present || b.registered - a.registered);
  const bottomHalqas = new Set([...halqaLeaders].reverse().slice(0, 3).map((item) => item.halqa));
  const trendRows = getAttendanceTrendRows();
  const attentionItems = [
    {
      tone: stats.pending > 0 ? "warning" : "success",
      label: `${stats.pending} members not checked in`,
      detail: stats.pending > 0 ? "Registered attendees still pending arrival." : "All registered members are checked in.",
    },
    {
      tone: lowAttendanceHalqas.length > 0 ? "danger" : "success",
      label: `${lowAttendanceHalqas.length} halqas below 30% attendance`,
      detail: lowAttendanceHalqas.length
        ? lowAttendanceHalqas.slice(0, 3).map((item) => item.halqa).join(", ")
        : "No halqa is below the critical threshold.",
    },
    {
      tone: missingLeaders[0]?.missing > 0 ? "warning" : "success",
      label: `${missingLeaders[0]?.halqa || "All halqas"} missing ${missingLeaders[0]?.missing || 0} attendees`,
      detail: missingLeaders[0]?.missing > 0 ? "Largest check-in gap by halqa right now." : "No attendance gaps detected.",
    },
  ];

  return `
    <section class="attendance-ops-shell">
      <div class="attendance-ops-hero">
        <div>
          <p class="section-eyebrow">Attendance Reports</p>
          <h3>Live attendance tracking and check-in analytics</h3>
          <span>Last updated ${lastUpdated}</span>
        </div>
        <div class="attendance-live-badge">
          <span></span>
          Live check-in
        </div>
      </div>

      <div class="attendance-kpi-grid">
        <div class="attendance-kpi">
          <span>Present</span>
          <strong>${stats.present}</strong>
        </div>
        <div class="attendance-kpi">
          <span>Pending</span>
          <strong>${stats.pending}</strong>
        </div>
        <div class="attendance-kpi">
          <span>Attendance Rate</span>
          <strong>${stats.rate}%</strong>
        </div>
        <div class="attendance-kpi">
          <span>Tajnid Reach</span>
          <strong>${stats.tajnidAttendanceRate}%</strong>
        </div>
      </div>

      <div class="attendance-progress-card">
        <div>
          <strong>${stats.present} / ${stats.registered} members checked in</strong>
          <span>${stats.present} present out of ${stats.totalTajnid} total Tajnid. ${rows.length} records visible with the current filters.</span>
        </div>
        <div class="attendance-progress-track" aria-label="Attendance progress">
          <span style="width: ${progress}%"></span>
        </div>
      </div>

      <div class="attendance-action-row">
        <button class="secondary-button compact attendance-excel-button" type="button">Excel Report</button>
        <button class="secondary-button compact attendance-pdf-button" type="button">PDF Report</button>
        <button class="secondary-button compact attendance-summary-button" type="button">Attendance Summary</button>
        <button class="secondary-button compact attendance-print-button" type="button">Print Sheet</button>
        <button class="primary-button compact attendance-refresh-button" type="button">Refresh</button>
      </div>

      <div class="attendance-ops-grid">
        <section class="attention-panel">
          <div class="section-title-row">
            <div>
              <p class="section-eyebrow">Attention Required</p>
              <h3>Items to review now</h3>
            </div>
          </div>
          <div class="attention-list">
            ${attentionItems
              .map(
                (item) => `
                  <div class="attention-item ${item.tone}">
                    <div>
                      <strong>${item.label}</strong>
                      <span>${item.detail}</span>
                    </div>
                  </div>
                `
              )
              .join("")}
          </div>
        </section>

        <section class="halqa-performance-panel">
          <div class="section-title-row">
            <div>
              <p class="section-eyebrow">Attendance Rankings</p>
              <h3>Halqa attendance performance</h3>
            </div>
          </div>
          <div class="halqa-performance-list">
            ${halqaLeaders
              .map(
                (item, index) => `
                  <button class="halqa-performance-card attendance-halqa-count ${attendanceReportHalqaFilter === item.halqa ? "is-active" : ""} ${
                    bottomHalqas.has(item.halqa) ? "needs-attention" : ""
                  } attendance-${getAttendanceHealthTone(item.rate)}" data-halqa="${item.halqa}" type="button">
                    <span class="halqa-rank">${index + 1 <= 3 ? `#${index + 1}` : `#${index + 1}`}</span>
                    <span class="halqa-name">${item.halqa}</span>
                    <strong>${item.rate}%</strong>
                    <em>${item.present} / ${item.registered} checked in. ${item.registered} / ${item.tajnid} registered</em>
                    <span class="halqa-attendance-bar"><span style="width: ${Math.min(Math.max(item.rate, 0), 100)}%"></span></span>
                  </button>
                `
              )
              .join("")}
          </div>
        </section>
      </div>

      <section class="attendance-trends-panel">
        <div class="section-title-row">
          <div>
            <p class="section-eyebrow">Check-In Trends</p>
            <h3>Check-ins by hour</h3>
          </div>
        </div>
        <div class="attendance-trend-list">
          ${
            trendRows.length
              ? trendRows
                  .map(
                    (row) => `
                      <div class="attendance-trend-row">
                        <strong>${row.label}</strong>
                        <span><span style="width: ${row.width}%"></span></span>
                        <em>${row.count}</em>
                      </div>
                    `
                  )
                  .join("")
              : `<div class="attendance-empty-state">No check-ins have been recorded yet.</div>`
          }
        </div>
      </section>

      <section class="attendance-bulk-panel">
        <div>
          <strong>Selected: ${rows.length} members</strong>
          <span>The current filters define this selection for export, print, and bulk attendance updates.</span>
        </div>
        <div class="attendance-action-row">
          <button class="secondary-button compact attendance-export-selection-button" type="button">Export Selection</button>
          <button class="secondary-button compact attendance-print-selection-button" type="button">Print Selection</button>
          <button class="secondary-button compact attendance-mark-present-button" type="button">Mark Present</button>
          <button class="secondary-button compact attendance-mark-absent-button" type="button">Mark Absent</button>
        </div>
      </section>

      <section class="attendance-toolbar-panel">
        <div class="section-title-row">
          <div>
            <p class="section-eyebrow">Search & Filters</p>
            <h3>Attendance records</h3>
          </div>
        </div>
        <div class="filter-bar attendance-filter-bar attendance-ops-toolbar">
          <label class="search-field">
            <span>Search member</span>
            <input id="attendanceReportSearchInput" value="${escapeAttribute(attendanceReportSearch)}" placeholder="Name, code, or halqa" />
          </label>
          <label class="search-field">
            <span>Halqa</span>
            <select id="attendanceReportHalqaFilter">
              <option ${attendanceReportHalqaFilter === "All" ? "selected" : ""}>All</option>
              ${halqajat
                .map((halqa) => `<option ${attendanceReportHalqaFilter === halqa ? "selected" : ""}>${halqa}</option>`)
                .join("")}
            </select>
          </label>
          <label class="search-field">
            <span>Attendance Status</span>
            <select id="attendanceReportStatusFilter">
              ${["All", "Present", "Pending"]
                .map((status) => `<option ${attendanceReportStatusFilter === status ? "selected" : ""}>${status}</option>`)
                .join("")}
            </select>
          </label>
          <label class="search-field">
            <span>Time Range</span>
            <select>
              <option selected>Today</option>
              <option>This Session</option>
              <option>All Records</option>
            </select>
          </label>
        </div>
      </section>

      <div class="detail-table attendance-ops-table" role="table" aria-label="Attendance report">
        <div class="detail-row attendance-report-row detail-head" role="row">
          <span>Code</span>
          <span>Name</span>
          <span>Halqa</span>
          <span>Tajnid</span>
          <span>Status</span>
          <span>Check-In Time</span>
          <span>Checked In By</span>
          <span>Last Updated</span>
        </div>
        ${rows
          .map((member) => {
            const attendanceRecord = getAttendanceRecordForMember(member.code) || {};
            const present = isMemberPresent(member);
            const checkInTime = getMemberCheckIn(member) || attendanceRecord.checkIn || "-";
            const statusLabel = present ? "Present" : "Pending";
            const checkedInBy = attendanceRecord.checkedInBy || (present ? "Check-in desk" : "-");
            const lastUpdatedValue = present ? checkInTime : "-";

            return `
              <div class="detail-row attendance-report-row" role="row">
                <strong>${member.code || "-"}</strong>
                <span>${member.name || "-"}</span>
                <span>${member.halqa || "-"}</span>
                <span>${getHalqaTajnid(member.halqa)}</span>
                <span class="pill ${present ? "pill-success" : "pill-muted"}">${statusLabel}</span>
                <span>${checkInTime}</span>
                <span>${checkedInBy}</span>
                <span>${lastUpdatedValue}</span>
              </div>
            `;
          })
          .join("")}
      </div>
    </section>
  `;
}

function getAdminCompetitionRows() {
  const query = competitionAdminSearch.trim().toLowerCase();
  const rows = competitionResults.filter((result) => {
    const matchesCategory = competitionAdminCategoryFilter === "All" || result.category === competitionAdminCategoryFilter;
    const matchesQuery =
      !query ||
      String(result.competition || "").toLowerCase().includes(query) ||
      String(result.name || "").toLowerCase().includes(query) ||
      String(result.halqa || "").toLowerCase().includes(query);

    return matchesCategory && matchesQuery;
  });

  return rows;
}

function renderEducationRosterManager() {
  const roster = getEducationAssignedRoster(educationRosterAdminCompetition);

  return `
    <section class="admin-subsection education-roster-manager">
      <div class="team-fields-head">
        <div>
          <h3>Education Competition Rosters</h3>
          <p>Assign names to each education competition before judges begin. Judges can still add a missed name from tajnid during scoring.</p>
        </div>
        <span>${roster.length} assigned</span>
      </div>
      <div class="form-grid">
        <label class="field">
          <span>Competition</span>
          <select id="educationRosterCompetition">
            ${educationCompetitions
              .map((competition) => `<option ${competition === educationRosterAdminCompetition ? "selected" : ""}>${competition}</option>`)
              .join("")}
          </select>
        </label>
        <label class="field">
          <span>Search tajnid by name / code</span>
          <input id="adminEducationRosterSearch" placeholder="M1001 or Ahmad Khan" />
        </label>
      </div>
      <div class="participant-search-results" id="adminEducationRosterResults"></div>
      <form class="manager-form compact-manager" id="adminEducationRosterManualForm">
        <div class="form-grid">
          <label class="field">
            <span>Name</span>
            <input name="name" placeholder="Participant name" required />
          </label>
          <label class="field">
            <span>Member code</span>
            <input name="code" placeholder="Optional" />
          </label>
          <label class="field">
            <span>Halqa</span>
            <select name="halqa">
              ${halqajat.map((halqa) => `<option>${halqa}</option>`).join("")}
            </select>
          </label>
          <div class="field form-end">
            <span>&nbsp;</span>
            <button class="secondary-button compact" type="submit">Add Name</button>
          </div>
        </div>
      </form>
      <div class="detail-table" role="table" aria-label="Education competition roster">
        <div class="detail-row education-roster-row detail-head" role="row">
          <span>Name</span>
          <span>Code</span>
          <span>Halqa</span>
          <span>Actions</span>
        </div>
        ${
          roster.length
            ? roster
                .map(
                  (participant) => `
                    <div class="detail-row education-roster-row" role="row">
                      <strong>${participant.name}</strong>
                      <span>${participant.code || "-"}</span>
                      <span>${participant.halqa}</span>
                      <span><button class="secondary-button compact remove-education-roster-name" data-code="${escapeAttribute(participant.code)}" data-name="${escapeAttribute(participant.name)}" type="button">Remove</button></span>
                    </div>
                  `
                )
                .join("")
            : `<div class="access-note">No names assigned yet. Judges will see the fallback queue until names are added here.</div>`
        }
      </div>
    </section>
  `;
}

function renderSportsRosterManager() {
  const sport = sportsCompetitions.find((item) => item.name === sportsRosterAdminSport) || sportsCompetitions[0];
  const sportName = sport.name;

  return `
    <section class="admin-subsection education-roster-manager">
      <div class="team-fields-head">
        <div>
          <h3>Sports Competition Rosters</h3>
          <p>Pre-assign participant names for each sport and podium position. Sports admins can add missed names during result entry.</p>
        </div>
        <span>${sportName}</span>
      </div>
      <div class="form-grid">
        <label class="field">
          <span>Sport</span>
          <select id="sportsRosterSport">
            ${sportsCompetitions.map((item) => `<option value="${item.name}" ${item.name === sportName ? "selected" : ""}>${item.name}</option>`).join("")}
          </select>
        </label>
        <label class="field">
          <span>Search tajnid by name / code</span>
          <input id="adminSportsRosterSearch" placeholder="M1001 or Ahmad Khan" />
        </label>
      </div>
      <div class="participant-search-results" id="adminSportsRosterResults"></div>
      <div class="sports-admin-roster-grid">
        ${sportsPodiumPositions
          .map((item) => {
            const roster = getSportsAssignedRoster(sportName, item.position);
            return `
              <section class="sports-result-card">
                <div class="team-fields-head">
                  <strong>${item.label}</strong>
                  <span>${roster.length} assigned</span>
                </div>
                <form class="manager-form compact-manager admin-sports-manual-form" data-position="${item.position}">
                  <div class="form-grid">
                    <label class="field">
                      <span>Name</span>
                      <input name="name" placeholder="Participant name" required />
                    </label>
                    <label class="field">
                      <span>Member code</span>
                      <input name="code" placeholder="Optional" />
                    </label>
                    <label class="field">
                      <span>Halqa</span>
                      <select name="halqa">${halqajat.map((halqa) => `<option>${halqa}</option>`).join("")}</select>
                    </label>
                    <div class="field form-end">
                      <span>&nbsp;</span>
                      <button class="secondary-button compact" type="submit">Add Name</button>
                    </div>
                  </div>
                </form>
                <div class="detail-table" role="table" aria-label="${item.label} sports roster">
                  ${
                    roster.length
                      ? roster
                          .map(
                            (participant) => `
                              <div class="detail-row education-roster-row" role="row">
                                <strong>${participant.name}</strong>
                                <span>${participant.code || "-"}</span>
                                <span>${participant.halqa}</span>
                                <span><button class="secondary-button compact remove-sports-roster-name" data-position="${item.position}" data-code="${escapeAttribute(participant.code)}" data-name="${escapeAttribute(participant.name)}" type="button">Remove</button></span>
                              </div>
                            `
                          )
                          .join("")
                      : `<div class="access-note">No names assigned for ${item.label}.</div>`
                  }
                </div>
              </section>
            `;
          })
          .join("")}
      </div>
    </section>
  `;
}

function renderAdminCompetitions() {
  const rows = getAdminCompetitionRows();
  const educationRows = rows.filter((result) => result.category === "Education");
  const sportsRows = rows.filter((result) => result.category === "Sports");
  const educationFinals = getEducationFinalPositions().slice(0, 10);
  const sportsFinals = getSportsFinalPositions().slice(0, 10);

  return `
    <div class="registration-summary">
      <div class="metric">
        <strong>${competitionResults.length}</strong>
        <span>Published results</span>
      </div>
      <div class="metric">
        <strong>${educationJudgeResults.length}</strong>
        <span>Education judge posts</span>
      </div>
      <div class="metric">
        <strong>${sportsPostedResults.length}</strong>
        <span>Sports posts</span>
      </div>
      <div class="metric">
        <strong>${educationRows.length}/${sportsRows.length}</strong>
        <span>Edu / Sports visible</span>
      </div>
    </div>

    <div class="filter-bar">
      <label class="search-field">
        <span>Search published results</span>
        <input id="competitionAdminSearchInput" value="${competitionAdminSearch}" placeholder="Competition, name, or halqa" />
      </label>
      <label class="search-field">
        <span>Category</span>
        <select id="competitionAdminCategoryFilter">
          ${["All", "Education", "Sports"]
            .map((category) => `<option ${competitionAdminCategoryFilter === category ? "selected" : ""}>${category}</option>`)
            .join("")}
        </select>
      </label>
    </div>

    <section class="admin-subsection">
      <h3>Published Competition Results</h3>
      <div class="detail-table" role="table" aria-label="Published competition results">
        <div class="detail-row competition-admin-row detail-head" role="row">
          <span>Category</span>
          <span>Competition</span>
          <span>Position</span>
          <span>Name</span>
          <span>Halqa</span>
          <span>Points</span>
        </div>
        ${rows
          .map(
            (result) => `
              <div class="detail-row competition-admin-row" role="row">
                <span class="pill ${result.category === "Education" ? "category-education" : "category-sports"}">${result.category}</span>
                <span>${result.competition || "-"}</span>
                <strong>${result.position || "-"}</strong>
                <span>${result.name || "-"}</span>
                <span>${result.halqa || "-"}</span>
                <span class="total-score">${result.points || "-"}</span>
              </div>
            `
          )
          .join("")}
      </div>
    </section>

    ${renderEducationRosterManager()}
    ${renderSportsRosterManager()}

    <section class="admin-subsection split">
      <div>
        <h3>Education Final Calculations</h3>
        ${educationFinals.length ? renderEducationFinalPositions() : `<div class="access-note">No posted education judge scores yet.</div>`}
      </div>
      <div>
        <h3>Sports Posted Results</h3>
        ${sportsFinals.length ? renderSportsFinalPositions() : `<div class="access-note">No posted sports results yet.</div>`}
      </div>
    </section>
  `;
}

function getAdminUserRows() {
  const query = adminUserSearch.trim().toLowerCase();

  return dashboardUsers.filter((user) => {
    const matchesRole = adminUserRoleFilter === "All" || user.role === adminUserRoleFilter;
    const matchesQuery =
      !query ||
      String(user.username || "").toLowerCase().includes(query) ||
      String(user.name || "").toLowerCase().includes(query) ||
      String(user.role || "").toLowerCase().includes(query) ||
      String(user.halqa || "").toLowerCase().includes(query);

    return matchesRole && matchesQuery;
  });
}

function getRoleCounts() {
  return dashboardUsers.reduce((counts, user) => {
    counts[user.role] = (counts[user.role] || 0) + 1;
    return counts;
  }, {});
}

function renderAdminUsers() {
  const rows = getAdminUserRows();
  const roleCounts = getRoleCounts();
  const roles = ["All", ...Array.from(new Set(dashboardUsers.map((user) => user.role).filter(Boolean)))];
  const roleOptions = ["admin", "zaim", "attendance", "educationJudge", "sportsAdmin", "av"];
  const editingItem = editingUserRow
    ? dashboardUsers.find((user, index) => getRowId(user, index) === editingUserRow)
    : null;

  return `
    <form class="manager-form" id="adminUserForm">
      <div class="form-grid">
        <label class="field">
          <span>Username</span>
          <input name="username" value="${escapeAttribute(editingItem?.username)}" placeholder="username" required />
        </label>
        <label class="field">
          <span>Password</span>
          <input name="password" type="password" placeholder="${editingItem ? "Leave blank to keep current" : "password"}" ${editingItem ? "" : "required"} />
        </label>
        <label class="field">
          <span>Name</span>
          <input name="name" value="${escapeAttribute(editingItem?.name)}" placeholder="Full name" required />
        </label>
        <label class="field">
          <span>Role</span>
          <select name="role" required>
            ${roleOptions
              .map((role) => `<option value="${role}" ${editingItem?.role === role ? "selected" : ""}>${role}</option>`)
              .join("")}
          </select>
        </label>
        <label class="field">
          <span>Halqa</span>
          <select name="halqa">
            <option value="">None</option>
            ${halqajat
              .map((halqa) => `<option value="${escapeAttribute(halqa)}" ${editingItem?.halqa === halqa ? "selected" : ""}>${halqa}</option>`)
              .join("")}
          </select>
        </label>
        <label class="field wide">
          <span>Access note</span>
          <input name="access" value="${escapeAttribute(editingItem?.access)}" placeholder="Full portal access" />
        </label>
      </div>
      <div class="form-actions">
        <button class="primary-button compact" type="submit">${editingItem ? "Save User" : "Add User"}</button>
        ${editingItem ? `<button class="secondary-button cancel-user-edit" type="button">Cancel</button>` : ""}
      </div>
    </form>

    <div class="role-card-grid">
      ${Object.entries(roleCounts)
        .map(
          ([role, count]) => `
            <button class="role-card ${adminUserRoleFilter === role ? "is-active" : ""}" data-role="${role}" type="button">
              <span>${role}</span>
              <strong>${count}</strong>
            </button>
          `
        )
        .join("")}
    </div>

    <div class="filter-bar">
      <label class="search-field">
        <span>Search users</span>
        <input id="adminUserSearchInput" value="${adminUserSearch}" placeholder="Username, name, role, or halqa" />
      </label>
      <label class="search-field">
        <span>Role</span>
        <select id="adminUserRoleFilter">
          ${roles.map((role) => `<option ${adminUserRoleFilter === role ? "selected" : ""}>${role}</option>`).join("")}
        </select>
      </label>
    </div>

    <div class="detail-table" role="table" aria-label="Admin users">
      <div class="detail-row users-row detail-head" role="row">
        <span>Username</span>
        <span>Name</span>
        <span>Role</span>
        <span>Halqa</span>
        <span>Access</span>
        <span>Actions</span>
      </div>
      ${rows
        .map(
          (user) => `
            <div class="detail-row users-row" role="row">
              <strong>${user.username || "-"}</strong>
              <span>${user.name || "-"}</span>
              <span class="pill pill-muted">${user.role || "-"}</span>
              <span>${user.halqa || "-"}</span>
              <span>${user.access || "-"}</span>
              <span class="row-actions">
                <button class="secondary-button edit-user-item" data-row="${getRowId(user, dashboardUsers.indexOf(user))}" type="button">Edit</button>
                <button class="danger-button delete-user-item" data-row="${getRowId(user, dashboardUsers.indexOf(user))}" type="button">Delete</button>
              </span>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function getEducationRubric(competition = educationSelectedCompetition) {
  return (
    educationRubrics[competition] || {
      competition,
      participantType: "Individual",
      criteria: defaultEducationCriteria.map((criterion) => ({ ...criterion })),
    }
  );
}

function saveEducationRubrics() {
  localStorage.setItem("educationRubrics", JSON.stringify(educationRubrics));
}

function saveEducationRosters() {
  localStorage.setItem("educationCompetitionRosters", JSON.stringify(educationCompetitionRosters));
}

function isEducationRubricLocked(competition = educationSelectedCompetition) {
  return educationJudgeResults.some((result) => result.competition === competition);
}

function getEducationCriteriaTotal(rubric) {
  return rubric.criteria.reduce((sum, criterion) => sum + Number(criterion.max || 0), 0);
}

function getEducationResultKey(result) {
  return `${result.competition}|${result.participantName}|${result.halqa}`;
}

function getEducationCompetitionResults(competition = educationSelectedCompetition) {
  return educationJudgeResults.filter((result) => result.competition === competition);
}

function normalizeEducationParticipant(participant) {
  return {
    name: String(participant?.name || "").trim(),
    code: String(participant?.code || "").trim(),
    halqa: String(participant?.halqa || halqajat[0] || "").trim(),
  };
}

function getEducationParticipantValue(participant) {
  return encodeURIComponent(JSON.stringify(normalizeEducationParticipant(participant)));
}

function parseEducationParticipantValue(value) {
  try {
    return normalizeEducationParticipant(JSON.parse(decodeURIComponent(value)));
  } catch (error) {
    const [name, code, halqa] = String(value || "").split("|");
    return normalizeEducationParticipant({ name, code, halqa });
  }
}

function getTajnidMatches(query, limit = 8) {
  const normalized = String(query || "").trim().toLowerCase();

  if (!normalized) {
    return [];
  }

  return memberRecords
    .filter((member) => {
      return (
        String(member.code || "").toLowerCase().includes(normalized) ||
        String(member.name || "").toLowerCase().includes(normalized) ||
        String(member.halqa || "").toLowerCase().includes(normalized)
      );
    })
    .slice(0, limit)
    .map(normalizeEducationParticipant);
}

function getEducationAssignedRoster(competition = educationSelectedCompetition) {
  return (educationCompetitionRosters[competition] || []).map(normalizeEducationParticipant).filter((participant) => participant.name);
}

function addEducationParticipantToRoster(competition, participant) {
  const normalized = normalizeEducationParticipant(participant);

  if (!normalized.name) {
    return false;
  }

  const roster = getEducationAssignedRoster(competition);
  const alreadyExists = roster.some((item) => {
    const codeMatches = normalized.code && item.code && item.code.toLowerCase() === normalized.code.toLowerCase();
    const nameMatches = item.name.toLowerCase() === normalized.name.toLowerCase() && item.halqa === normalized.halqa;
    return codeMatches || nameMatches;
  });

  if (alreadyExists) {
    return false;
  }

  educationCompetitionRosters[competition] = [...roster, normalized];
  saveEducationRosters();
  apiRequest("/api/education/rosters/add", {
    method: "POST",
    body: JSON.stringify({ competition, participant: normalized }),
  })
    .then((data) => {
      educationCompetitionRosters = data.educationCompetitionRosters || educationCompetitionRosters;
      saveEducationRosters();
    })
    .catch(() => {
      // Keep the local roster if the backend is unavailable.
    });
  return true;
}

function removeEducationParticipantFromRoster(competition, participantCode, participantName) {
  educationCompetitionRosters[competition] = getEducationAssignedRoster(competition).filter((participant) => {
    if (participantCode) {
      return participant.code !== participantCode;
    }

    return participant.name !== participantName;
  });
  saveEducationRosters();
  apiRequest("/api/education/rosters/remove", {
    method: "POST",
    body: JSON.stringify({ competition, code: participantCode, name: participantName }),
  })
    .then((data) => {
      educationCompetitionRosters = data.educationCompetitionRosters || educationCompetitionRosters;
      saveEducationRosters();
    })
    .catch(() => {
      // Keep the local roster if the backend is unavailable.
    });
}

function saveSportsRosters() {
  localStorage.setItem("sportsCompetitionRosters", JSON.stringify(sportsCompetitionRosters));
}

function getSportsAssignedRoster(sportName = sportsSelectedSport, position = "1st") {
  return (sportsCompetitionRosters[sportName]?.[position] || []).map(normalizeEducationParticipant).filter((participant) => participant.name);
}

function addSportsParticipantToRoster(sportName, position, participant) {
  const normalized = normalizeEducationParticipant(participant);

  if (!sportName || !position || !normalized.name) {
    return false;
  }

  const roster = getSportsAssignedRoster(sportName, position);
  const alreadyExists = roster.some((item) => {
    const codeMatches = normalized.code && item.code && item.code.toLowerCase() === normalized.code.toLowerCase();
    const nameMatches = item.name.toLowerCase() === normalized.name.toLowerCase() && item.halqa === normalized.halqa;
    return codeMatches || nameMatches;
  });

  if (alreadyExists) {
    return false;
  }

  sportsCompetitionRosters[sportName] = {
    ...(sportsCompetitionRosters[sportName] || {}),
    [position]: [...roster, normalized],
  };
  saveSportsRosters();
  apiRequest("/api/sports/rosters/add", {
    method: "POST",
    body: JSON.stringify({ sport: sportName, position, participant: normalized }),
  })
    .then((data) => {
      sportsCompetitionRosters = data.sportsCompetitionRosters || sportsCompetitionRosters;
      saveSportsRosters();
    })
    .catch(() => {
      // Keep the local roster if the backend is unavailable.
    });
  return true;
}

function removeSportsParticipantFromRoster(sportName, position, participantCode, participantName) {
  sportsCompetitionRosters[sportName] = {
    ...(sportsCompetitionRosters[sportName] || {}),
    [position]: getSportsAssignedRoster(sportName, position).filter((participant) => {
      if (participantCode) {
        return participant.code !== participantCode;
      }

      return participant.name !== participantName;
    }),
  };
  saveSportsRosters();
  apiRequest("/api/sports/rosters/remove", {
    method: "POST",
    body: JSON.stringify({ sport: sportName, position, code: participantCode, name: participantName }),
  })
    .then((data) => {
      sportsCompetitionRosters = data.sportsCompetitionRosters || sportsCompetitionRosters;
      saveSportsRosters();
    })
    .catch(() => {
      // Keep the local roster if the backend is unavailable.
    });
}

function getEducationParticipantQueue(rubric = getEducationRubric()) {
  const assignedRoster = getEducationAssignedRoster(rubric.competition);

  if (assignedRoster.length) {
    return assignedRoster;
  }

  if (rubric.participantType === "Team") {
    return halqajat.slice(0, 15).map((halqa, index) => ({
      name: `Team ${halqa}`,
      code: `T${String(index + 1).padStart(2, "0")}`,
      halqa,
    }));
  }

  return memberRecords.slice(0, 15).map((member) => ({
    name: member.name,
    code: member.code,
    halqa: member.halqa,
  }));
}

function getEducationSummary(competition = educationSelectedCompetition) {
  const rubric = getEducationRubric(competition);
  const queue = getEducationParticipantQueue(rubric);
  const scoredKeys = new Set(getEducationCompetitionResults(competition).map(getEducationResultKey));
  const totals = getEducationCompetitionResults(competition).map((result) => result.total);
  const average = totals.length ? (totals.reduce((sum, total) => sum + total, 0) / totals.length).toFixed(1) : "0.0";

  return {
    rubric,
    totalPossible: getEducationCriteriaTotal(rubric),
    participants: queue.length,
    scored: scoredKeys.size,
    remaining: Math.max(queue.length - scoredKeys.size, 0),
    average,
  };
}

function renderEducationSummaryCard(competition = educationSelectedCompetition) {
  const summary = getEducationSummary(competition);

  return `
    <div class="judge-summary-card">
      <div>
        <span>Today's Judging</span>
        <strong>${competition}</strong>
      </div>
      <div><span>Participants</span><strong>${summary.participants}</strong></div>
      <div><span>Scored</span><strong>${summary.scored}</strong></div>
      <div><span>Remaining</span><strong>${summary.remaining}</strong></div>
      <div><span>Average Score</span><strong>${summary.average}</strong></div>
    </div>
  `;
}

function renderEducationCompetitionSetup() {
  const rubric = getEducationRubric();
  const locked = isEducationRubricLocked(rubric.competition);

  return `
    <form class="judge-form education-setup-form" id="educationSetupForm">
      ${renderEducationSummaryCard(rubric.competition)}
      <div class="form-grid">
        <label class="field">
          <span>Competition</span>
          <select name="competition" id="educationSetupCompetition" required>
            ${educationCompetitions
              .map((competition) => `<option ${competition === rubric.competition ? "selected" : ""}>${competition}</option>`)
              .join("")}
          </select>
        </label>
        <label class="field">
          <span>Participant type</span>
          <select name="participantType" ${locked ? "disabled" : ""} required>
            ${["Individual", "Team"]
              .map((type) => `<option ${type === rubric.participantType ? "selected" : ""}>${type}</option>`)
              .join("")}
          </select>
        </label>
      </div>
      <div class="rubric-builder">
        <div class="team-fields-head">
          <strong>Scoring Criteria</strong>
          <span>Total Possible: ${getEducationCriteriaTotal(rubric)}</span>
        </div>
        <div class="rubric-grid rubric-head">
          <span>Criterion Name</span>
          <span>Max Score</span>
          <span></span>
        </div>
        ${rubric.criteria
          .map(
            (criterion, index) => `
              <div class="rubric-grid" data-criterion-row>
                <input name="criterionName${index}" value="${criterion.name}" ${locked ? "disabled" : ""} required />
                <input name="criterionMax${index}" type="number" min="1" max="100" step="0.5" value="${criterion.max}" ${locked ? "disabled" : ""} required />
                <button class="secondary-button remove-criterion" data-index="${index}" type="button" ${locked || rubric.criteria.length <= 1 ? "disabled" : ""}>Remove</button>
              </div>
            `
          )
          .join("")}
      </div>
      ${locked ? `<div class="portal-message">Rubric Locked. ${rubric.competition} has started, so criteria can no longer be changed.</div>` : ""}
      ${judgeMessage ? `<div class="portal-message">${judgeMessage}</div>` : ""}
      <div class="form-actions">
        <button class="secondary-button" id="addEducationCriterion" type="button" ${locked ? "disabled" : ""}>Add Criterion</button>
        <button class="primary-button compact" type="submit" ${locked ? "disabled" : ""}>Save Rubric</button>
      </div>
    </form>
  `;
}

function getEducationFinalPositions(competitionFilter = "") {
  const grouped = new Map();

  educationJudgeResults.forEach((result) => {
    if (competitionFilter && result.competition !== competitionFilter) {
      return;
    }

    const key = `${result.competition}|${result.participantName}|${result.halqa}`;
    const existing =
      grouped.get(key) ||
      {
        competition: result.competition,
        participantName: result.participantName,
        participantType: result.participantType,
        halqa: result.halqa,
        judges: new Set(),
        total: 0,
      };

    existing.total += result.total;
    existing.judges.add(result.judge);
    grouped.set(key, existing);
  });

  return Array.from(grouped.values())
    .map((item) => ({
      ...item,
      judgeCount: item.judges.size,
      average: item.judges.size ? Number((item.total / item.judges.size).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.average - a.average)
    .map((item, index) => ({
      ...item,
      position: index === 0 ? "1st" : index === 1 ? "2nd" : index === 2 ? "3rd" : `${index + 1}th`,
    }));
}

function renderEducationScoreEntry() {
  const rubric = getEducationRubric();
  const queue = getEducationParticipantQueue(rubric);
  const scoredKeys = new Set(getEducationCompetitionResults(rubric.competition).map(getEducationResultKey));
  const firstOpenParticipant = queue.find((participant) => !scoredKeys.has(`${rubric.competition}|${participant.name}|${participant.halqa}`)) || queue[0];
  const selectedParticipant = firstOpenParticipant || { name: "", code: "", halqa: halqajat[0] };

  return `
    <div class="education-score-layout">
      <form class="judge-form" id="educationJudgeForm">
        ${renderEducationSummaryCard(rubric.competition)}
        <div class="judge-competition-head">
          <div>
            <strong>${rubric.competition}</strong>
            <span>${rubric.participantType} Competition</span>
          </div>
          <span>${getEducationSummary(rubric.competition).scored} of ${queue.length} Participants Scored</span>
        </div>
        <input type="hidden" name="competition" value="${rubric.competition}" />
        <input type="hidden" name="participantType" value="${rubric.participantType}" />
        <div class="form-grid">
          <label class="field wide">
            <span>Participant</span>
            <input id="educationQueueSearch" placeholder="Search assigned queue by name, code, or halqa" />
            <select name="participantKey" id="educationParticipantSelect" required>
              ${queue
                .map((participant) => {
                  const value = getEducationParticipantValue(participant);
                  return `<option value="${value}" data-name="${escapeAttribute(participant.name)}" data-code="${escapeAttribute(participant.code)}" data-halqa="${escapeAttribute(participant.halqa)}" ${participant.name === selectedParticipant.name ? "selected" : ""}>${participant.name} - ${participant.halqa}${participant.code ? ` (${participant.code})` : ""}</option>`;
                })
                .join("")}
            </select>
          </label>
          <div class="participant-card wide" id="educationParticipantDetails">
            <span>Participant Details</span>
            <strong>${selectedParticipant.name}</strong>
            <small>Code: ${selectedParticipant.code || "N/A"} | Halqa: ${selectedParticipant.halqa}</small>
          </div>
        </div>
        <div class="participant-add-panel">
          <div class="team-fields-head">
            <strong>Add Missing Participant</strong>
            <span>Search tajnid or add manually</span>
          </div>
          <div class="form-grid">
            <label class="field">
              <span>Search name / member code</span>
              <input id="educationTajnidSearch" placeholder="M1001 or Ahmad Khan" />
            </label>
            <label class="field">
              <span>Manual name</span>
              <input id="educationManualName" placeholder="Participant name" />
            </label>
            <label class="field">
              <span>Manual code</span>
              <input id="educationManualCode" placeholder="Optional code" />
            </label>
            <label class="field">
              <span>Halqa</span>
              <select id="educationManualHalqa">
                ${halqajat.map((halqa) => `<option>${halqa}</option>`).join("")}
              </select>
            </label>
          </div>
          <div class="participant-search-results" id="educationTajnidResults"></div>
          <button class="secondary-button compact" id="educationAddManualParticipant" type="button">Add Name</button>
        </div>
        <div class="rubric-score-list">
          ${rubric.criteria
          .map(
            (criterion, index) => `
              <label class="rubric-score-row">
                <span>${criterion.name}</span>
                <span><input name="score${index}" data-score-input type="number" min="0" max="${criterion.max}" step="0.5" required /> /${criterion.max}</span>
              </label>
            `
          )
          .join("")}
        </div>
        <div class="live-total">
          <span>Total Score</span>
          <strong><span id="educationLiveTotal">0</span> / ${getEducationCriteriaTotal(rubric)}</strong>
        </div>
        <label class="field">
          <span>Judge notes</span>
          <textarea name="notes" rows="3" placeholder="Optional"></textarea>
        </label>
        ${judgeMessage ? `<div class="portal-message">${judgeMessage}</div>` : ""}
        <div class="form-actions">
          <button class="secondary-button compact" name="saveMode" value="save" type="submit">Save Score</button>
          <button class="primary-button compact" name="saveMode" value="next" type="submit">Save & Next</button>
        </div>
      </form>
      <aside class="participant-queue">
        <h3>Participant Queue</h3>
        ${queue
          .map((participant) => {
            const isScored = scoredKeys.has(`${rubric.competition}|${participant.name}|${participant.halqa}`);
            return `<button class="queue-item" data-participant="${getEducationParticipantValue(participant)}" type="button"><span>${isScored ? "Done" : "Pending"}</span><strong>${participant.name}</strong><small>${participant.code || "No code"} - ${participant.halqa}</small></button>`;
          })
          .join("")}
      </aside>
    </div>
  `;
}

function renderPostedEducationResults() {
  const competitionResults = getEducationFinalPositions(educationSelectedCompetition);

  if (!competitionResults.length) {
    return `<div class="access-note">No posted education scores yet.</div>`;
  }

  return `
    ${renderEducationSummaryCard(educationSelectedCompetition)}
    <div class="detail-table" role="table" aria-label="Posted education scores">
      <div class="detail-row judge-row detail-head" role="row">
        <span>Rank</span>
        <span>Participant</span>
        <span>Halqa</span>
        <span>Judges</span>
        <span>Average</span>
      </div>
      ${competitionResults
        .map(
          (result) => `
            <div class="detail-row judge-row" role="row">
              <span>${result.position}</span>
              <strong>${result.participantName}</strong>
              <span>${result.halqa}</span>
              <span>${result.judgeCount}/3</span>
              <span class="total-score">${result.average}</span>
            </div>
          `
        )
        .join("")}
    </div>
    <div class="form-actions results-actions">
      <button class="primary-button compact" type="button">Publish Results</button>
      <button class="secondary-button compact" id="exportEducationPdf" type="button">Export PDF</button>
      <button class="secondary-button compact" id="exportEducationCsv" type="button">Export Excel</button>
    </div>
  `;
}

function renderEducationFinalPositions() {
  const positions = getEducationFinalPositions(educationSelectedCompetition).slice(0, 3);

  if (!positions.length) {
    return `<div class="access-note">Final positions will appear after judges post scores.</div>`;
  }

  return `
    ${renderEducationSummaryCard(educationSelectedCompetition)}
    <div class="podium-list" aria-label="Education final positions">
      ${positions
        .map((item, index) => {
          const labels = ["First Place", "Second Place", "Third Place"];
          return `
            <div class="podium-item podium-${index + 1}">
              <span>${labels[index]}</span>
              <strong>${item.participantName}</strong>
              <small>${item.halqa}</small>
              <b>${item.average}</b>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function getSportsFinalPositions() {
  return [...sportsPostedResults].sort((a, b) => {
    if (a.sport !== b.sport) {
      return a.sport.localeCompare(b.sport);
    }

    return b.points - a.points;
  });
}

function getSelectedSport() {
  return sportsCompetitions.find((sport) => sport.name === sportsSelectedSport) || sportsCompetitions[0];
}

function getSportResults(sportName = sportsSelectedSport) {
  return sportsPostedResults
    .filter((result) => result.sport === sportName)
    .sort((a, b) => (positionPoints[b.position] || 0) - (positionPoints[a.position] || 0));
}

function getDefaultSportsRoster(halqa, count = 5) {
  return memberRecords
    .filter((member) => member.halqa === halqa)
    .slice(0, count)
    .map((member) => ({ name: member.name, code: member.code }));
}

function renderSportsSummaryCard() {
  const publishedSports = new Set(sportsPostedResults.map((result) => result.sport));
  const standings = getSportsStandings();
  const leader = standings[0]?.halqa || "Not set";

  return `
    <div class="judge-summary-card">
      <div><span>Sports Competitions</span><strong>${sportsCompetitions.length}</strong></div>
      <div><span>Published Results</span><strong>${publishedSports.size}</strong></div>
      <div><span>Pending Results</span><strong>${Math.max(sportsCompetitions.length - publishedSports.size, 0)}</strong></div>
      <div><span>Current Leader</span><strong>${leader}</strong></div>
    </div>
  `;
}

function renderSportsRosterInputs(position, halqa = halqajat[0], count = 1, sportName = sportsSelectedSport) {
  const assignedRoster = getSportsAssignedRoster(sportName, position);
  const roster = assignedRoster.length ? assignedRoster : [];
  const rowCount = Math.max(count, roster.length || count);

  return Array.from({ length: rowCount }, (_, index) => {
    const member = roster[index] || { name: "", code: "" };
    const number = index + 1;
    return `
      <div class="sports-member-row">
        <input name="${position}Member${number}Name" list="sportsParticipantOptions" value="${member.name}" placeholder="Participant ${number}" />
        <input name="${position}Member${number}Code" value="${member.code}" placeholder="Code" />
      </div>
    `;
  }).join("");
}

function renderSportsAnnouncementPreview(sport = getSelectedSport()) {
  return `
    <aside class="sports-preview-panel">
      <h3>Announcement Preview</h3>
      <strong>${sport.name}</strong>
      ${sportsPodiumPositions
        .map((item) => {
          const halqa = halqajat[sportsPodiumPositions.indexOf(item)] || halqajat[0];
          const roster = getDefaultSportsRoster(halqa);
          return `
            <div class="sports-preview-place">
              <span>${item.label}</span>
              <b>${halqa}</b>
              ${roster.map((member) => `<small>${member.name}</small>`).join("")}
            </div>
          `;
        })
        .join("")}
    </aside>
  `;
}

function renderSportsResultEntry() {
  const sport = getSelectedSport();
  const sportResults = getSportResults(sport.name);
  const status = sportResults.length >= 3 ? "Published" : "Results Not Published";

  return `
    <div class="sports-result-layout">
      <form class="judge-form sports-podium-form" id="sportsResultForm">
        ${renderSportsSummaryCard()}
        <div class="judge-competition-head">
          <div>
            <strong>${sport.name}</strong>
            <span>${sport.eventType} Competition</span>
          </div>
          <span>${status}</span>
        </div>
        <label class="field">
          <span>Sport</span>
          <select name="sport" id="sportsCompetitionSelect" required>
            ${sportsCompetitions
              .map((item) => `<option value="${item.name}" ${item.name === sport.name ? "selected" : ""}>${item.name}</option>`)
              .join("")}
          </select>
        </label>
        <datalist id="sportsParticipantOptions">
          ${memberRecords.map((member) => `<option value="${member.name}">${member.code} - ${member.halqa}</option>`).join("")}
        </datalist>
        <div class="sports-podium-grid">
          ${sportsPodiumPositions
            .map(
              (item, index) => `
                <section class="sports-podium-card podium-${index + 1}" data-sports-position="${item.position}">
                  <div class="team-fields-head">
                    <strong>${item.label}</strong>
                    <span>${item.points} pts</span>
                  </div>
                  <label class="field">
                    <span>Halqa / Team</span>
                    <select name="${item.position}Halqa" data-sports-halqa>
                      ${halqajat.map((halqa, halqaIndex) => `<option ${halqaIndex === index ? "selected" : ""}>${halqa}</option>`).join("")}
                    </select>
                  </label>
                  <label class="field">
                    <span>Score / time / distance</span>
                    <input name="${item.position}ScoreValue" placeholder="3-1, 12.8, 9.4" />
                  </label>
                  <div class="sports-roster-block">
                    <div class="team-fields-head">
                      <strong>Participants</strong>
                      <span>Search tajnid or type manually</span>
                    </div>
                    <div class="sports-card-search">
                      <input data-sports-tajnid-search="${item.position}" placeholder="Search member code or name" />
                      <div class="participant-search-results" data-sports-tajnid-results="${item.position}"></div>
                    </div>
                    <div data-sports-roster="${item.position}">
                      ${renderSportsRosterInputs(item.position, halqajat[index] || halqajat[0], 1, sport.name)}
                    </div>
                    <button class="secondary-button compact add-sports-roster-field" data-position="${item.position}" type="button">Add Participant</button>
                  </div>
                </section>
              `
            )
            .join("")}
        </div>
        ${sportsMessage ? `<div class="portal-message">${sportsMessage}</div>` : ""}
        <div class="sports-summary-strip">
          ${sportsPodiumPositions
            .map((item, index) => `<span>${item.label}: ${halqajat[index] || halqajat[0]}</span>`)
            .join("")}
        </div>
        <div class="form-actions">
          <button class="secondary-button compact" name="sportsMode" value="draft" type="submit">Save Draft</button>
          <button class="primary-button compact" name="sportsMode" value="publish" type="submit">Publish Results</button>
        </div>
      </form>
      ${renderSportsAnnouncementPreview(sport)}
    </div>
  `;
}

function renderPostedSportsResults() {
  if (!sportsPostedResults.length) {
    return `<div class="access-note">No published sports results yet.</div>`;
  }

  const grouped = sportsCompetitions
    .map((sport) => ({ sport, results: getSportResults(sport.name) }))
    .filter((group) => group.results.length);

  return `
    ${renderSportsSummaryCard()}
    <div class="sports-results-list">
      ${grouped
        .map((group) => `
          <section class="sports-result-card">
            <div class="team-fields-head">
              <strong>${group.sport.name}</strong>
              <span>Published</span>
            </div>
            ${group.results.map((result) => `
              <div class="sports-preview-place">
                <span>${sportsPodiumPositions.find((item) => item.position === result.position)?.label || result.position}</span>
                <b>${result.halqa}</b>
                ${(result.roster || []).map((member) => `<small>${member.name}</small>`).join("")}
              </div>
            `).join("")}
            <div class="form-actions">
              <button class="secondary-button compact edit-sports-result" data-sport="${group.sport.name}" type="button">Edit</button>
              <button class="secondary-button compact export-sports-csv" data-sport="${group.sport.name}" type="button">Export Excel</button>
              <button class="secondary-button compact" type="button" onclick="window.print()">Export PDF</button>
            </div>
          </section>
        `)
        .join("")}
    </div>
  `;
}

function getSportsStandings() {
  const standings = new Map();

  sportsPostedResults.forEach((result) => {
    const existing =
      standings.get(result.halqa) ||
      {
        halqa: result.halqa,
        points: 0,
        gold: 0,
        silver: 0,
        bronze: 0,
      };

    existing.points += result.points || 0;
    if (result.position === "1st") existing.gold += 1;
    if (result.position === "2nd") existing.silver += 1;
    if (result.position === "3rd") existing.bronze += 1;
    standings.set(result.halqa, existing);
  });

  return Array.from(standings.values()).sort((a, b) => b.points - a.points || b.gold - a.gold || b.silver - a.silver);
}

function downloadSportsCsv(sportName = "") {
  const rows = (sportName ? getSportResults(sportName) : getSportsFinalPositions()).flatMap((result) => {
    const roster = result.roster?.length ? result.roster : [{ name: result.participantName, code: "" }];

    return roster.map((member) => [
      result.sport,
      sportsPodiumPositions.find((item) => item.position === result.position)?.label || result.position,
      result.halqa,
      member.name,
      member.code || "",
      result.points || 0,
    ]);
  });

  downloadCsv(
    `${(sportName || "sports-ceremony").replace(/\W+/g, "-").toLowerCase()}-results.csv`,
    ["Sport", "Position", "Halqa", "Participant", "Code", "Points"],
    rows
  );
}

function renderSportsFinalPositions() {
  const standings = getSportsStandings();

  if (!standings.length) {
    return `<div class="access-note">Sports standings will appear after results are published.</div>`;
  }

  return `
    ${renderSportsSummaryCard()}
    <div class="detail-table" role="table" aria-label="Sports standings">
      <div class="detail-row sports-standings-row detail-head" role="row">
        <span>Halqa</span>
        <span>Gold</span>
        <span>Silver</span>
        <span>Bronze</span>
        <span>Points</span>
      </div>
      ${standings
        .map((item) => `
          <div class="detail-row sports-standings-row" role="row">
            <strong>${item.halqa}</strong>
            <span>${item.gold}</span>
            <span>${item.silver}</span>
            <span>${item.bronze}</span>
            <span class="total-score">${item.points}</span>
          </div>
        `)
        .join("")}
    </div>
  `;
}

function renderSportsCeremonySheet() {
  const grouped = sportsCompetitions
    .map((sport) => ({ sport, results: getSportResults(sport.name) }))
    .filter((group) => group.results.length);

  if (!grouped.length) {
    return `<div class="access-note">The closing ceremony sheet will appear after sports results are published.</div>`;
  }

  return `
    ${renderSportsSummaryCard()}
    <div class="ceremony-sheet">
      ${grouped
        .map((group) => `
          <section class="ceremony-sport">
            <h3>${group.sport.name}</h3>
            ${group.results.map((result) => `
              <div class="ceremony-place">
                <strong>${sportsPodiumPositions.find((item) => item.position === result.position)?.label || result.position} - ${result.halqa}</strong>
                <span>Participants</span>
                <ul>${(result.roster || []).map((member) => `<li>${member.name}</li>`).join("")}</ul>
              </div>
            `).join("")}
          </section>
        `)
        .join("")}
    </div>
    <div class="form-actions results-actions">
      <button class="secondary-button compact" id="printSportsCeremony" type="button">Print Ceremony Sheet</button>
      <button class="secondary-button compact" id="exportSportsCeremonyCsv" type="button">Export Excel</button>
      <button class="secondary-button compact" type="button" onclick="window.print()">Export PDF</button>
    </div>
  `;
}

function getComputedScheduleStatus(item, nextRowId = "") {
  const start = parseTodayTime(item.start);
  const end = parseTodayTime(item.end);
  const now = new Date();

  if (start && end) {
    if (start.getTime() <= now.getTime() && end.getTime() > now.getTime()) {
      return "Live";
    }

    if (end.getTime() <= now.getTime()) {
      return "Completed";
    }

    if (nextRowId && getRowId(item, scheduleItems.indexOf(item)) === nextRowId) {
      return "Next";
    }

    return "Upcoming";
  }

  return item.status || "Upcoming";
}

function getNextScheduleRowId() {
  const now = new Date();
  const nextItem = scheduleItems
    .map((item, index) => ({ item, index, startDate: parseTodayTime(item.start) }))
    .filter((entry) => entry.startDate && entry.startDate.getTime() > now.getTime())
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())[0];

  return nextItem ? getRowId(nextItem.item, nextItem.index) : "";
}

function getScheduleStats() {
  const nextRowId = getNextScheduleRowId();
  return scheduleItems.reduce(
    (stats, item) => {
      const status = getComputedScheduleStatus(item, nextRowId);
      stats.total += 1;
      stats[status.toLowerCase()] = (stats[status.toLowerCase()] || 0) + 1;
      return stats;
    },
    { total: 0, live: 0, next: 0, upcoming: 0, completed: 0 }
  );
}

function getScheduleOverlaps(candidate, candidateRowId = "") {
  const candidateStart = parseTodayTime(candidate.start);
  const candidateEnd = parseTodayTime(candidate.end);

  if (!candidateStart || !candidateEnd || candidateEnd.getTime() <= candidateStart.getTime()) {
    return [];
  }

  return scheduleItems.filter((item, index) => {
    const rowId = getRowId(item, index);
    const start = parseTodayTime(item.start);
    const end = parseTodayTime(item.end);

    if (rowId === candidateRowId || !start || !end) {
      return false;
    }

    return candidateStart.getTime() < end.getTime() && candidateEnd.getTime() > start.getTime();
  });
}

function renderAdminSchedulePreview(item) {
  const previewItem = {
    start: item?.start || "02:00 PM",
    end: item?.end || "02:45 PM",
    title: item?.title || "Final Session",
    location: item?.location || "Main Hall",
    lead: item?.lead || "Program Team",
  };
  const status = getComputedScheduleStatus(previewItem);

  return `
    <div class="schedule-public-preview" aria-label="Public preview">
      <span class="public-kicker">Public Preview</span>
      <strong>${previewItem.title}</strong>
      <p>${previewItem.start} - ${previewItem.end}</p>
      <p>${previewItem.location} - ${previewItem.lead}</p>
      <span class="pill ${status === "Live" ? "pill-success" : "pill-muted"}">${status}</span>
    </div>
  `;
}

function renderAdminScheduleManager() {
  const editingItem = editingScheduleRow
    ? scheduleItems.find((item, index) => getRowId(item, index) === editingScheduleRow)
    : null;
  const stats = getScheduleStats();
  const liveItem = scheduleItems.find((item) => getComputedScheduleStatus(item, getNextScheduleRowId()) === "Live");
  const overlaps = editingItem ? getScheduleOverlaps(editingItem, editingScheduleRow) : [];
  const templates = [
    ["Tilawat", "Tilawat & Nazm", "Main Hall", "Education Team", "09:30 AM", "10:15 AM"],
    ["Nazm", "Nazm", "Main Hall", "Education Team", "10:15 AM", "10:30 AM"],
    ["Speech", "Educational Competitions", "Classroom Block", "Taleem Department", "10:20 AM", "11:15 AM"],
    ["Sports", "Sports Round", "Sports Ground", "Sports Team", "10:30 AM", "12:00 PM"],
    ["Break", "Lunch & Prayer Break", "Dining Area", "Logistics Team", "12:15 PM", "01:00 PM"],
  ];

  return `
    <section class="schedule-manager-shell">
      <div class="schedule-manager-summary">
        <div class="metric"><strong>${stats.total}</strong><span>Programs</span></div>
        <div class="metric"><strong>${stats.live}</strong><span>Live</span></div>
        <div class="metric"><strong>${stats.upcoming + stats.next}</strong><span>Upcoming</span></div>
        <div class="metric"><strong>${stats.completed}</strong><span>Completed</span></div>
      </div>

      <div class="schedule-live-admin">
        <span class="public-kicker">Currently Live</span>
        <strong>${liveItem?.title || "No program live"}</strong>
        <p>${liveItem ? `${liveItem.location || "-"} - Ends ${liveItem.end || "-"}` : "The next live program will appear automatically from time."}</p>
      </div>

      <div class="schedule-manager-grid">
        <div class="schedule-editor-pane">
          <div class="admin-subsection-heading">
            <h3>${editingItem ? "Edit Program" : "Add Program"}</h3>
            <span>Auto-status from time</span>
          </div>

          <div class="template-row" aria-label="Quick schedule templates">
            ${templates
              .map(
                ([label, title, location, lead, start, end]) => `
                  <button class="template-chip" type="button" data-title="${title}" data-location="${location}" data-lead="${lead}" data-start="${start}" data-end="${end}">${label}</button>
                `
              )
              .join("")}
          </div>

          <form class="manager-form schedule-manager-form" id="scheduleForm">
            <input type="hidden" name="status" value="${editingItem ? getComputedScheduleStatus(editingItem) : "Upcoming"}" />
            <div class="form-grid">
              <label class="field">
                <span>Starts</span>
                <input name="start" value="${editingItem?.start || ""}" placeholder="02:00 PM" required />
              </label>
              <label class="field">
                <span>Ends</span>
                <input name="end" value="${editingItem?.end || ""}" placeholder="02:45 PM" required />
              </label>
              <label class="field wide">
                <span>Program name</span>
                <input name="title" value="${editingItem?.title || ""}" placeholder="Final Session" required />
              </label>
              <label class="field">
                <span>Location</span>
                <input name="location" value="${editingItem?.location || ""}" placeholder="Main Hall" required />
              </label>
              <label class="field">
                <span>Lead</span>
                <input name="lead" value="${editingItem?.lead || ""}" placeholder="Program Team" required />
              </label>
            </div>
            <div class="auto-status-note">Status is calculated automatically from start/end time.</div>
            ${overlaps.length ? `<div class="schedule-warning">Time overlaps with: ${overlaps.map((item) => item.title).join(", ")}</div>` : ""}
            ${renderAdminSchedulePreview(editingItem)}
            <div class="form-actions">
              <button class="primary-button compact" type="submit">${editingItem ? "Save Changes" : "Add Program"}</button>
              ${editingItem ? `<button class="secondary-button cancel-schedule-edit" type="button">Cancel</button>` : ""}
            </div>
          </form>
        </div>

        <div class="schedule-list-pane">
          ${renderAdminScheduleList()}
        </div>
      </div>
    </section>
  `;
}

function renderAdminAnnouncementManager() {
  const editingItem = editingAnnouncementRow
    ? announcements.find((item, index) => getRowId(item, index) === editingAnnouncementRow)
    : null;
  const activeCount = announcements.length;
  const pinnedCount = announcements.filter((item) => item.pinned || String(item.priority || "").toLowerCase() === "critical").length;
  const scheduledCount = announcements.filter((item) => getAnnouncementAdminStatus(item) === "Scheduled").length;
  const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const previewPriority = editingItem?.priority || "Info";
  const templates = [
    ["Registration", "Registration desk open", "Pre-registered members can collect badges from the entrance desk.", "Info"],
    ["Prayer", "Prayer reminder", "Please proceed to the prayer area and follow volunteer directions.", "Important"],
    ["Lunch", "Lunch service update", "Lunch service is now available in the dining area.", "Info"],
    ["Transport", "Transport update", "Please check the transport desk for departure and parking updates.", "Important"],
    ["Sports", "Sports location update", "Sports program location has been updated. Please follow event staff directions.", "Important"],
    ["Emergency", "Emergency announcement", "Please follow instructions from event officials immediately.", "Critical"],
  ];

  return `
    <section class="announcement-manager-shell">
      <div class="announcement-admin-summary">
        <div class="metric"><strong>${activeCount}</strong><span>Active</span></div>
        <div class="metric"><strong>${pinnedCount}</strong><span>Pinned</span></div>
        <div class="metric"><strong>${scheduledCount}</strong><span>Scheduled</span></div>
      </div>

      <div class="announcement-manager-grid">
        <div class="announcement-editor-pane">
          <div class="admin-subsection-heading">
            <h3>${editingItem ? "Edit Announcement" : "Create Announcement"}</h3>
            <span>Auto timestamp: ${editingItem?.time || currentTime}</span>
          </div>

          <div class="template-row" aria-label="Quick announcement templates">
            ${templates
              .map(
                ([label, title, message, priority]) => `
                  <button class="announcement-template-chip" type="button" data-title="${escapeAttribute(title)}" data-message="${escapeAttribute(message)}" data-priority="${priority}">${label}</button>
                `
              )
              .join("")}
          </div>

          <form class="manager-form announcement-manager-form" id="announcementForm">
            <input name="time" type="hidden" value="${editingItem?.time || currentTime}" />
            <input name="priority" type="hidden" value="${previewPriority}" />
            <input name="draft" type="hidden" value="false" />
            <div class="form-grid">
              <label class="field wide">
                <span>Title</span>
                <input name="title" value="${escapeAttribute(editingItem?.title)}" placeholder="Parking update" required maxlength="80" />
              </label>
              <label class="field wide">
                <span>Priority</span>
                <div class="priority-segmented" role="group" aria-label="Announcement priority">
                  ${["Info", "Important", "Critical", "Success"]
                    .map(
                      (priority) => `
                        <button class="priority-option ${previewPriority === priority ? "is-active" : ""}" data-priority="${priority}" type="button">${priority}</button>
                      `
                    )
                    .join("")}
                </div>
              </label>
              <label class="field wide">
                <span>Message</span>
                <textarea name="message" id="announcementMessageInput" maxlength="200" placeholder="Enter public announcement" required>${editingItem?.message || ""}</textarea>
                <small class="char-counter" id="announcementCharCounter">${String(editingItem?.message || "").length} / 200</small>
              </label>
            </div>

            <div class="announcement-options">
              <label><input name="pinned" type="checkbox" ${editingItem?.pinned ? "checked" : ""} /> Pin to top</label>
              <label><input name="showAv" type="checkbox" ${editingItem?.showAv !== false ? "checked" : ""} /> Show on AV screens</label>
              <label><input name="emergency" type="checkbox" ${String(editingItem?.priority || "").toLowerCase() === "critical" ? "checked" : ""} /> Emergency mode</label>
            </div>

            <div class="form-grid">
              <label class="field">
                <span>Expires after</span>
                <select name="expiresAfter">
                  ${["Never", "30 Minutes", "1 Hour", "End of Event"]
                    .map((option) => `<option ${editingItem?.expiresAfter === option ? "selected" : ""}>${option}</option>`)
                    .join("")}
                </select>
              </label>
              <label class="field">
                <span>Display to</span>
                <select name="audience">
                  ${["Public Dashboard", "Public + AV Screens", "Volunteer Dashboard", "Registration Team"]
                    .map((option) => `<option ${editingItem?.audience === option ? "selected" : ""}>${option}</option>`)
                    .join("")}
                </select>
              </label>
            </div>

            ${renderAdminAnnouncementPreview(editingItem || { title: "Parking update", message: "Announcement preview will appear here.", priority: previewPriority, time: currentTime })}

            <div class="form-actions split-actions">
              <button class="secondary-button save-announcement-draft" type="button">Save Draft</button>
              <button class="primary-button compact" type="submit">${editingItem ? "Publish Changes" : "Publish Now"}</button>
              ${editingItem ? `<button class="secondary-button cancel-announcement-edit" type="button">Cancel</button>` : ""}
            </div>
          </form>
        </div>

        <div class="announcement-list-pane">
          ${renderAdminAnnouncementList()}
        </div>
      </div>
    </section>
  `;
}

function getAnnouncementAdminStatus(item) {
  const time = parseTodayTime(item.time);

  if (time && time.getTime() > Date.now()) {
    return "Scheduled";
  }

  if (item.draft) {
    return "Draft";
  }

  return item.pinned || String(item.priority || "").toLowerCase() === "critical" ? "Pinned" : "Active";
}

function renderAdminAnnouncementPreview(item) {
  const meta = getAnnouncementPriorityMeta(item.priority);

  return `
    <div class="admin-announcement-preview priority-${meta.tone}" aria-label="Public announcement preview">
      <span class="announcement-kicker">Public Preview</span>
      <div class="featured-announcement-main">
        <span class="announcement-priority-mark">${meta.icon}</span>
        <div>
          <h3>${item.title || "Announcement title"}</h3>
          <p>${item.message || "Announcement message"}</p>
          <footer>
            <span class="category-tag">${item.audience || "Public Dashboard"}</span>
            <time>${item.time || "Now"}</time>
          </footer>
        </div>
      </div>
    </div>
  `;
}

function getRowId(item, index) {
  return String(item._rowNumber || item.id || index);
}

function renderAdminScheduleList() {
  const nextRowId = getNextScheduleRowId();
  const sortedItems = scheduleItems
    .map((item, index) => ({ item, index, startDate: parseTodayTime(item.start) }))
    .sort((a, b) => {
      if (a.startDate && b.startDate) {
        return a.startDate.getTime() - b.startDate.getTime();
      }

      return a.index - b.index;
    });

  return `
    <div class="admin-subsection schedule-timeline-admin">
      <div class="admin-subsection-heading">
        <h3>Today's Schedule</h3>
        <span>${scheduleItems.length} programs</span>
      </div>
      <div class="admin-schedule-timeline" aria-label="Editable schedule timeline">
        ${sortedItems
          .map(({ item, index }) => {
            const rowId = getRowId(item, index);
            const status = getComputedScheduleStatus(item, nextRowId);
            const pillClass = status === "Live" ? "pill-success" : status === "Completed" ? "pill-muted" : "pill-info";

            return `
              <article class="admin-schedule-row status-${status.toLowerCase()}">
                <div class="admin-schedule-time">
                  <strong>${item.start || "-"}</strong>
                  <span>${item.end || "-"}</span>
                </div>
                <div class="admin-schedule-marker" aria-hidden="true"></div>
                <div class="admin-schedule-copy">
                  <strong>${item.title || "-"}</strong>
                  <span>${item.location || "-"} - ${item.lead || "-"}</span>
                </div>
                <span class="pill ${pillClass}">${status}</span>
                <span class="row-actions">
                  <button class="secondary-button edit-schedule-item" data-row="${rowId}" type="button">Edit</button>
                  <button class="danger-button delete-schedule-item" data-row="${rowId}" type="button">Delete</button>
                </span>
              </article>
            `
          }
          )
          .join("")}
      </div>
    </div>
  `;
}

function renderAdminAnnouncementList() {
  const sortedAnnouncements = announcements
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const aPinned = a.item.pinned || String(a.item.priority || "").toLowerCase() === "critical";
      const bPinned = b.item.pinned || String(b.item.priority || "").toLowerCase() === "critical";

      if (aPinned !== bPinned) {
        return aPinned ? -1 : 1;
      }

      return b.index - a.index;
    });

  return `
    <div class="admin-subsection announcement-ops-list">
      <div class="admin-subsection-heading">
        <h3>Active Announcements</h3>
        <span>${announcements.length} notices</span>
      </div>
      <div class="admin-announcement-list" aria-label="Editable announcements">
        ${sortedAnnouncements
          .map(({ item, index }) => {
            const meta = getAnnouncementPriorityMeta(item.priority);
            const status = getAnnouncementAdminStatus(item);

            return `
              <article class="admin-announcement-row priority-${meta.tone}">
                <span class="announcement-feed-icon">${meta.icon}</span>
                <div class="admin-announcement-copy">
                  <div class="announcement-title-row">
                    <strong>${item.title || "-"}</strong>
                    <span class="pill priority-${meta.tone}">${item.priority || meta.label}</span>
                  </div>
                  <p>${item.message || "-"}</p>
                  <footer>
                    <time>${item.time || "-"}</time>
                    <span class="category-tag">${status}</span>
                    ${item.audience ? `<span class="category-tag">${item.audience}</span>` : ""}
                  </footer>
                </div>
                <span class="row-actions">
                  <button class="secondary-button edit-announcement-item" data-row="${getRowId(item, index)}" type="button">Edit</button>
                  <button class="danger-button delete-announcement-item" data-row="${getRowId(item, index)}" type="button">Delete</button>
                </span>
              </article>
            `
          }
          )
          .join("")}
      </div>
    </div>
  `;
}

function renderPanels(role) {
  dashboardGrid.innerHTML = "";

  if (!navItems[role].includes(currentSection)) {
    currentSection = navItems[role][0];
  }

  if (role === "admin" && currentSection === "Overview") {
    dashboardGrid.innerHTML = renderAdminOverview();
    return;
  }

  if (role === "zaim") {
    if (currentSection === "Overview") {
      currentSection = "Dashboard";
    }

    const zaimContent = {
      Dashboard: renderZaimDashboard,
      Members: renderZaimRegistrationDetails,
      Attendance: renderZaimAttendanceDetails,
      Rankings: renderZaimRankingsPage,
    };

    dashboardGrid.innerHTML = zaimContent[currentSection]?.() || renderZaimDashboard();
    bindDynamicControls();
    return;
  }

  if (role === "attendance") {
    const attendanceContent = {
      "Check-In Station": renderAttendanceCheckIn,
      "Activity Log": renderRecentAttendance,
      Issues: renderAttendanceIssues,
    };

    dashboardGrid.innerHTML = attendanceContent[currentSection]?.() || renderAttendanceCheckIn();
    bindDynamicControls();
    return;
  }

  if (role === "public" && currentSection === "Overview" && window.location.hash.replace(/^#/, "") === "public-schedule") {
    currentSection = "Schedule";
  }

  if (role === "public" && currentSection === "Overview") {
    dashboardGrid.innerHTML = renderPublicOverview();
    bindDynamicControls();

    const hash = window.location.hash.replace(/^#/, "");
    if (hash && hash !== "public-schedule") {
      scrollToDashboardTarget(hash);
    }

    return;
  }

  const visiblePanels =
    currentSection === "Overview"
      ? panels[role]
      : panels[role].filter((panel) => {
          if (currentSection === "Schedule" || currentSection === "Live Schedule") {
            return panel.title === "Live Schedule";
          }

          if (currentSection === "Halqa Positions" || currentSection === "Rankings") {
            return panel.title === "Halqa Position Report" || panel.title === "Leaderboard Position";
          }

          if (currentSection === "Competition Positions" || currentSection === "Competitions") {
            return role === "admin" ? panel.title === "Admin Competitions" : panel.title === "Competition Positions";
          }

          if (currentSection === "Locations") {
            return panel.title === "Location Quick Links";
          }

          if (currentSection === "Help") {
            return panel.title === "Help & Emergency";
          }

          if (currentSection === "Schedule Manager") {
            return panel.title === "Schedule Manager";
          }

          if (currentSection === "Users") {
            return panel.title === "Admin Users";
          }

          if (currentSection === "Announcements") {
            return panel.title === "Announcements" || panel.title === "Announcement Manager";
          }

          if (currentSection === "My Halqa") {
            return panel.title.includes("My Halqa") || panel.title === "Leaderboard Position";
          }

          if (currentSection === "Registrations") {
            return role === "admin" ? panel.title === "Admin Registrations" : panel.title.includes("Registration");
          }

          if (currentSection === "Attendance Details" || currentSection === "Attendance Reports") {
            return role === "admin" ? panel.title === "Admin Attendance Reports" : panel.title.includes("Attendance");
          }

          if (currentSection === "Check In" || currentSection === "Search Members") {
            return panel.title === "Member Check-In";
          }

          if (currentSection === "Recent Attendance") {
            return panel.title === "Recent Attendance";
          }

          if (currentSection === "Issue Review") {
            return panel.title === "Manual Review";
          }

          if (currentSection === "Score Entry") {
            return panel.title === "Education Score Entry";
          }

          if (currentSection === "Competition Setup") {
            return panel.title === "Education Competition Setup";
          }

          if (currentSection === "Posted Results") {
            return role === "sportsAdmin"
              ? panel.title === "Posted Sports Results"
              : panel.title === "Posted Education Results";
          }

          if (currentSection === "Published Results") {
            return panel.title === "Published Sports Results";
          }

          if (currentSection === "Final Positions") {
            return role === "sportsAdmin"
              ? panel.title === "Sports Final Positions"
              : panel.title === "Education Final Positions";
          }

          if (currentSection === "Sports Standings") {
            return panel.title === "Sports Standings";
          }

          if (currentSection === "Closing Ceremony Sheet") {
            return panel.title === "Closing Ceremony Sheet";
          }

          if (currentSection === "Result Entry") {
            return panel.title === "Sports Result Entry";
          }

          if (role === "av" && currentSection === "Display") {
            return panel.title === "Projector Slideshow";
          }

          return panel.title.includes(currentSection);
        });

  if (!visiblePanels.length) {
    const emptyPanel = document.createElement("article");
    emptyPanel.className = "panel full";
    emptyPanel.innerHTML = `
      <h2>${currentSection}</h2>
      <p>This section is reserved for the next component build.</p>
    `;
    dashboardGrid.append(emptyPanel);
    return;
  }

  visiblePanels.forEach((panel) => {
    const article = document.createElement("article");
    const isPublicSchedulePanel = role === "public" && panel.title === "Live Schedule";
    const isPublicAnnouncementPanel = role === "public" && panel.title === "Announcements";
    const isPublicCompetitionPanel = role === "public" && panel.title === "Competition Positions";
    const isAdminSchedulePanel = role === "admin" && panel.title === "Schedule Manager";
    const isAdminAnnouncementPanel = role === "admin" && panel.title === "Announcement Manager";
    let panelClass = isPublicSchedulePanel
      ? "full schedule-panel"
      : isPublicAnnouncementPanel
        ? "full announcement-panel"
        : isPublicCompetitionPanel
          ? "full competition-panel"
          : isAdminSchedulePanel
            ? "full admin-schedule-panel"
            : isAdminAnnouncementPanel
              ? "full admin-announcement-panel"
              : panel.size;
    if (visiblePanels.length === 1 && !panelClass.includes("full")) {
      panelClass = `full ${panelClass}`;
    }
    article.className = `panel ${panelClass}`;
    const panelId = role === "public" ? getPublicPanelId(panel.title) : "";

    if (panelId) {
      article.id = panelId;
    }

    const shouldShowPanelMetrics =
      !(role === "zaim" && panel.title.includes("My Halqa")) &&
      !isPublicSchedulePanel &&
      !isPublicAnnouncementPanel &&
      !isPublicCompetitionPanel;
    const metricMarkup = panel.metrics && shouldShowPanelMetrics
      ? `<div class="metric-row">${panel.metrics
          .map(([value, label]) => `<div class="metric"><strong>${value}</strong><span>${label}</span></div>`)
          .join("")}</div>`
      : "";

    const halqaNote =
      role === "zaim" && currentUser?.halqa ? `<div class="access-note">Scoped to ${currentUser.halqa}.</div>` : "";

    const scheduleMarkup = panel.title === "Live Schedule" ? renderSchedule() : "";
    const announcementMarkup = panel.title === "Announcements" ? renderAnnouncements() : "";
    const publicLocationsMarkup = panel.title === "Location Quick Links" && role === "public" ? renderPublicLocations() : "";
    const publicHelpMarkup = panel.title === "Help & Emergency" && role === "public" ? renderPublicHelp() : "";
    const rankingsMarkup = panel.title === "Halqa Position Report" ? renderHalqaRankings() : "";
    const competitionMarkup = panel.title === "Competition Positions" ? renderCompetitionResults() : "";
    const zaimRegistrationMarkup =
      panel.title === "My Halqa Registration" && role === "zaim" ? renderZaimRegistrationDetails() : "";
    const zaimAttendanceMarkup =
      panel.title === "My Halqa Attendance" && role === "zaim" ? renderZaimAttendanceDetails() : "";
    const attendanceCheckInMarkup =
      panel.title === "Member Check-In" && role === "attendance" ? renderAttendanceCheckIn() : "";
    const recentAttendanceMarkup =
      panel.title === "Recent Attendance" && role === "attendance" ? renderRecentAttendance() : "";
    const adminScheduleMarkup =
      panel.title === "Schedule Manager" && role === "admin" ? renderAdminScheduleManager() : "";
    const adminAnnouncementMarkup =
      panel.title === "Announcement Manager" && role === "admin" ? renderAdminAnnouncementManager() : "";
    const adminRegistrationsMarkup =
      panel.title === "Admin Registrations" && role === "admin" ? renderAdminRegistrations() : "";
    const adminAttendanceReportsMarkup =
      panel.title === "Admin Attendance Reports" && role === "admin" ? renderAdminAttendanceReports() : "";
    const adminCompetitionsMarkup =
      panel.title === "Admin Competitions" && role === "admin" ? renderAdminCompetitions() : "";
    const adminUsersMarkup = panel.title === "Admin Users" && role === "admin" ? renderAdminUsers() : "";
    const avDisplayMarkup = panel.title === "Projector Slideshow" && role === "av" ? renderAvDisplay() : "";
    const judgeScoreMarkup =
      panel.title === "Education Score Entry" && role === "educationJudge" ? renderEducationScoreEntry() : "";
    const judgeSetupMarkup =
      panel.title === "Education Competition Setup" && role === "educationJudge" ? renderEducationCompetitionSetup() : "";
    const judgePostedMarkup =
      panel.title === "Posted Education Results" && role === "educationJudge" ? renderPostedEducationResults() : "";
    const judgeFinalMarkup =
      panel.title === "Education Final Positions" && role === "educationJudge" ? renderEducationFinalPositions() : "";
    const sportsEntryMarkup =
      panel.title === "Sports Result Entry" && role === "sportsAdmin" ? renderSportsResultEntry() : "";
    const sportsPostedMarkup =
      panel.title === "Published Sports Results" && role === "sportsAdmin" ? renderPostedSportsResults() : "";
    const sportsFinalMarkup =
      panel.title === "Sports Standings" && role === "sportsAdmin" ? renderSportsFinalPositions() : "";
    const sportsCeremonyMarkup =
      panel.title === "Closing Ceremony Sheet" && role === "sportsAdmin" ? renderSportsCeremonySheet() : "";

    if (avDisplayMarkup) {
      article.className = "panel full av-stage-panel";
      article.innerHTML = avDisplayMarkup;
      dashboardGrid.append(article);
      return;
    }

    article.innerHTML = `
      <h2>${panel.title}</h2>
      <p>${panel.body}</p>
      ${metricMarkup}
      ${scheduleMarkup}
      ${announcementMarkup}
      ${publicLocationsMarkup}
      ${publicHelpMarkup}
      ${rankingsMarkup}
      ${competitionMarkup}
      ${zaimRegistrationMarkup}
      ${zaimAttendanceMarkup}
      ${attendanceCheckInMarkup}
      ${recentAttendanceMarkup}
      ${adminScheduleMarkup}
      ${adminAnnouncementMarkup}
      ${adminRegistrationsMarkup}
      ${adminAttendanceReportsMarkup}
      ${adminCompetitionsMarkup}
      ${adminUsersMarkup}
      ${avDisplayMarkup}
      ${judgeSetupMarkup}
      ${judgeScoreMarkup}
      ${judgePostedMarkup}
      ${judgeFinalMarkup}
      ${sportsEntryMarkup}
      ${sportsPostedMarkup}
      ${sportsFinalMarkup}
      ${sportsCeremonyMarkup}
      ${halqaNote}
    `;

    dashboardGrid.append(article);
  });

  bindDynamicControls();
}

function bindDynamicControls() {
  if (!document.body.dataset.publicNavBound) {
    document.body.dataset.publicNavBound = "true";

    document.addEventListener("click", (event) => {
      const button = event.target.closest(".widget-nav-button, .widget-nav-link");

      if (!button) {
        return;
      }

      const targetSection = button.dataset.section;
      const scrollTarget = button.dataset.scrollTarget;
      const url = button.dataset.url || button.getAttribute("href");
      const isInternalSection = Boolean(targetSection && navItems[currentRole]?.includes(targetSection));
      const isInternalScroll = Boolean(scrollTarget) || (typeof url === "string" && url.startsWith("#"));

      if (isInternalSection || isInternalScroll) {
        event.preventDefault();
      }

      if (isInternalSection) {
        currentSection = targetSection;
        renderDashboard(currentRole);
        return;
      }

      if (scrollTarget) {
        scrollToDashboardTarget(scrollTarget);
        return;
      }

      if (typeof url === "string" && url.startsWith("#")) {
        scrollToDashboardTarget(url.slice(1));
        return;
      }

      if (url && url.startsWith("javascript:")) {
        event.preventDefault();
      }
    });
  }

  if (!document.body.dataset.attendanceKeysBound) {
    document.body.dataset.attendanceKeysBound = "true";

    document.addEventListener("keydown", (event) => {
      if (currentRole !== "attendance") {
        return;
      }

      if (event.key === "F2") {
        event.preventDefault();
        document.querySelector("#attendanceSearchInput")?.focus();
      }

      if (event.key === "Escape" && attendanceModal) {
        attendanceModal = null;
        renderDashboard(currentRole);
      }

      if (event.key === "Enter" && attendanceModal?.type === "confirm") {
        event.preventDefault();
        confirmAttendanceModalCheckIn();
      }
    });
  }

  const searchInput = document.querySelector("#attendanceSearchInput");

  if (searchInput) {
    searchInput.focus();
    searchInput.addEventListener("input", (event) => {
      attendanceSearch = event.target.value;
      attendanceMessage = "";
      renderDashboard(currentRole);
      const refreshedInput = document.querySelector("#attendanceSearchInput");
      refreshedInput?.focus();
      refreshedInput?.setSelectionRange(attendanceSearch.length, attendanceSearch.length);
    });

    searchInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        openAttendanceLookup();
      }
    });
  }

  document.querySelectorAll(".check-in-button").forEach((button) => {
    button.addEventListener("click", async () => {
      await checkInMember(button.dataset.code);
      renderDashboard(currentRole);
    });
  });

  document.querySelector(".attendance-lookup-button")?.addEventListener("click", openAttendanceLookup);

  document.querySelectorAll(".attendance-open-member").forEach((button) => {
    button.addEventListener("click", () => {
      const member = memberRecords.find((record) => String(record.code) === String(button.dataset.code));
      if (!member) {
        return;
      }
      attendanceModal = { type: isMemberPresent(member) ? "duplicate" : "confirm", code: member.code };
      renderDashboard(currentRole);
    });
  });

  document.querySelector(".attendance-confirm-button")?.addEventListener("click", async () => {
    await confirmAttendanceModalCheckIn();
  });

  document.querySelectorAll(".attendance-modal-close, .attendance-focus-search").forEach((button) => {
    button.addEventListener("click", () => {
      attendanceModal = null;
      renderDashboard(currentRole);
    });
  });

  document.querySelector(".attendance-issue-button")?.addEventListener("click", () => {
    attendanceModal = {
      type: "not-found",
      title: "Issue Reported",
      message: "This member has been flagged for manual review.",
    };
    renderDashboard(currentRole);
  });

  const registrationSearchInput = document.querySelector("#registrationSearchInput");

  if (registrationSearchInput) {
    registrationSearchInput.addEventListener("input", (event) => {
      registrationSearch = event.target.value;
      renderDashboard(currentRole);
      const refreshedInput = document.querySelector("#registrationSearchInput");
      refreshedInput?.focus();
      refreshedInput?.setSelectionRange(registrationSearch.length, registrationSearch.length);
    });
  }

  const registrationHalqaSelect = document.querySelector("#registrationHalqaFilter");

  if (registrationHalqaSelect) {
    registrationHalqaSelect.addEventListener("change", (event) => {
      registrationHalqaFilter = event.target.value;
      renderDashboard(currentRole);
    });
  }

  document.querySelectorAll(".registration-halqa-count").forEach((button) => {
    button.addEventListener("click", () => {
      registrationHalqaFilter = button.dataset.halqa;
      renderDashboard(currentRole);
    });
  });

  const registrationRefreshButton = document.querySelector(".registration-refresh-button");

  if (registrationRefreshButton) {
    registrationRefreshButton.addEventListener("click", () => {
      renderDashboard(currentRole);
    });
  }

  const registrationPrintButton = document.querySelector(".registration-print-button");

  if (registrationPrintButton) {
    registrationPrintButton.addEventListener("click", () => {
      openRegistrationPdfReport();
    });
  }

  document.querySelector(".registration-excel-button")?.addEventListener("click", () => {
    exportRegistrationCsv();
  });

  document.querySelector(".registration-summary-button")?.addEventListener("click", () => {
    exportRegistrationCsv(true);
  });

  document.querySelector(".registration-pdf-button")?.addEventListener("click", () => {
    openRegistrationPdfReport();
  });

  const attendanceReportSearchInput = document.querySelector("#attendanceReportSearchInput");

  if (attendanceReportSearchInput) {
    attendanceReportSearchInput.addEventListener("input", (event) => {
      attendanceReportSearch = event.target.value;
      renderDashboard(currentRole);
      const refreshedInput = document.querySelector("#attendanceReportSearchInput");
      refreshedInput?.focus();
      refreshedInput?.setSelectionRange(attendanceReportSearch.length, attendanceReportSearch.length);
    });
  }

  const attendanceReportHalqaSelect = document.querySelector("#attendanceReportHalqaFilter");

  if (attendanceReportHalqaSelect) {
    attendanceReportHalqaSelect.addEventListener("change", (event) => {
      attendanceReportHalqaFilter = event.target.value;
      renderDashboard(currentRole);
    });
  }

  const attendanceReportStatusSelect = document.querySelector("#attendanceReportStatusFilter");

  if (attendanceReportStatusSelect) {
    attendanceReportStatusSelect.addEventListener("change", (event) => {
      attendanceReportStatusFilter = event.target.value;
      renderDashboard(currentRole);
    });
  }

  document.querySelectorAll(".attendance-halqa-count").forEach((button) => {
    button.addEventListener("click", () => {
      attendanceReportHalqaFilter = button.dataset.halqa;
      renderDashboard(currentRole);
    });
  });

  const attendanceRefreshButton = document.querySelector(".attendance-refresh-button");

  if (attendanceRefreshButton) {
    attendanceRefreshButton.addEventListener("click", () => {
      renderDashboard(currentRole);
    });
  }

  const attendancePrintButton = document.querySelector(".attendance-print-button");

  if (attendancePrintButton) {
    attendancePrintButton.addEventListener("click", () => {
      openAttendancePdfReport();
    });
  }

  document.querySelector(".attendance-excel-button")?.addEventListener("click", () => {
    exportAttendanceCsv();
  });

  document.querySelector(".attendance-summary-button")?.addEventListener("click", () => {
    exportAttendanceCsv(true);
  });

  document.querySelector(".attendance-pdf-button")?.addEventListener("click", () => {
    openAttendancePdfReport();
  });

  document.querySelector(".attendance-export-selection-button")?.addEventListener("click", () => {
    exportAttendanceCsv();
  });

  document.querySelector(".attendance-print-selection-button")?.addEventListener("click", () => {
    openAttendancePdfReport();
  });

  document.querySelector(".attendance-mark-present-button")?.addEventListener("click", async () => {
    await markAttendanceRowsPresent();
  });

  document.querySelector(".attendance-mark-absent-button")?.addEventListener("click", async () => {
    await markAttendanceRowsAbsent();
  });

  const competitionAdminSearchInput = document.querySelector("#competitionAdminSearchInput");

  if (competitionAdminSearchInput) {
    competitionAdminSearchInput.addEventListener("input", (event) => {
      competitionAdminSearch = event.target.value;
      renderDashboard(currentRole);
      const refreshedInput = document.querySelector("#competitionAdminSearchInput");
      refreshedInput?.focus();
      refreshedInput?.setSelectionRange(competitionAdminSearch.length, competitionAdminSearch.length);
    });
  }

  const competitionAdminCategorySelect = document.querySelector("#competitionAdminCategoryFilter");

  if (competitionAdminCategorySelect) {
    competitionAdminCategorySelect.addEventListener("change", (event) => {
      competitionAdminCategoryFilter = event.target.value;
      renderDashboard(currentRole);
    });
  }

  document.querySelector("#educationRosterCompetition")?.addEventListener("change", (event) => {
    educationRosterAdminCompetition = event.target.value;
    renderDashboard(currentRole);
  });

  const renderRosterSearchResults = (input, resultsContainer, buttonClass) => {
    const matches = getTajnidMatches(input.value);
    resultsContainer.innerHTML = matches.length
      ? matches
          .map(
            (participant) => `
              <button class="queue-item ${buttonClass}" data-participant="${getEducationParticipantValue(participant)}" type="button">
                <span>${participant.code || "No code"}</span>
                <strong>${participant.name}</strong>
                <small>${participant.halqa}</small>
              </button>
            `
          )
          .join("")
      : input.value.trim()
        ? `<div class="access-note">No tajnid match found. Add the name manually if needed.</div>`
        : "";
  };

  const adminRosterSearch = document.querySelector("#adminEducationRosterSearch");
  const adminRosterResults = document.querySelector("#adminEducationRosterResults");

  if (adminRosterSearch && adminRosterResults) {
    adminRosterSearch.addEventListener("input", () => {
      renderRosterSearchResults(adminRosterSearch, adminRosterResults, "admin-add-education-roster-name");
    });
    adminRosterResults.addEventListener("click", (event) => {
      const button = event.target.closest(".admin-add-education-roster-name");
      if (!button) {
        return;
      }
      addEducationParticipantToRoster(educationRosterAdminCompetition, parseEducationParticipantValue(button.dataset.participant));
      renderDashboard(currentRole);
    });
  }

  document.querySelector("#adminEducationRosterManualForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    addEducationParticipantToRoster(educationRosterAdminCompetition, {
      name: formData.get("name"),
      code: formData.get("code"),
      halqa: formData.get("halqa"),
    });
    renderDashboard(currentRole);
  });

  document.querySelectorAll(".remove-education-roster-name").forEach((button) => {
    button.addEventListener("click", () => {
      removeEducationParticipantFromRoster(educationRosterAdminCompetition, button.dataset.code, button.dataset.name);
      renderDashboard(currentRole);
    });
  });

  document.querySelector("#sportsRosterSport")?.addEventListener("change", (event) => {
    sportsRosterAdminSport = event.target.value;
    renderDashboard(currentRole);
  });

  const adminSportsRosterSearch = document.querySelector("#adminSportsRosterSearch");
  const adminSportsRosterResults = document.querySelector("#adminSportsRosterResults");

  if (adminSportsRosterSearch && adminSportsRosterResults) {
    adminSportsRosterSearch.addEventListener("input", () => {
      const matches = getTajnidMatches(adminSportsRosterSearch.value);
      adminSportsRosterResults.innerHTML = matches.length
        ? sportsPodiumPositions
            .map(
              (position) => `
                <div class="sports-result-card">
                  <strong>${position.label}</strong>
                  ${matches
                    .map(
                      (participant) => `
                        <button class="queue-item admin-add-sports-roster-name" data-position="${position.position}" data-participant="${getEducationParticipantValue(participant)}" type="button">
                          <span>${participant.code || "No code"}</span>
                          <strong>${participant.name}</strong>
                          <small>${participant.halqa}</small>
                        </button>
                      `
                    )
                    .join("")}
                </div>
              `
            )
            .join("")
        : adminSportsRosterSearch.value.trim()
          ? `<div class="access-note">No tajnid match found. Add the name manually under the correct position.</div>`
          : "";
    });

    adminSportsRosterResults.addEventListener("click", (event) => {
      const button = event.target.closest(".admin-add-sports-roster-name");
      if (!button) {
        return;
      }

      addSportsParticipantToRoster(sportsRosterAdminSport, button.dataset.position, parseEducationParticipantValue(button.dataset.participant));
      renderDashboard(currentRole);
    });
  }

  document.querySelectorAll(".admin-sports-manual-form").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      addSportsParticipantToRoster(sportsRosterAdminSport, form.dataset.position, {
        name: formData.get("name"),
        code: formData.get("code"),
        halqa: formData.get("halqa"),
      });
      renderDashboard(currentRole);
    });
  });

  document.querySelectorAll(".remove-sports-roster-name").forEach((button) => {
    button.addEventListener("click", () => {
      removeSportsParticipantFromRoster(sportsRosterAdminSport, button.dataset.position, button.dataset.code, button.dataset.name);
      renderDashboard(currentRole);
    });
  });

  const adminUserSearchInput = document.querySelector("#adminUserSearchInput");

  if (adminUserSearchInput) {
    adminUserSearchInput.addEventListener("input", (event) => {
      adminUserSearch = event.target.value;
      renderDashboard(currentRole);
      const refreshedInput = document.querySelector("#adminUserSearchInput");
      refreshedInput?.focus();
      refreshedInput?.setSelectionRange(adminUserSearch.length, adminUserSearch.length);
    });
  }

  const adminUserRoleSelect = document.querySelector("#adminUserRoleFilter");

  if (adminUserRoleSelect) {
    adminUserRoleSelect.addEventListener("change", (event) => {
      adminUserRoleFilter = event.target.value;
      renderDashboard(currentRole);
    });
  }

  document.querySelectorAll(".role-card").forEach((button) => {
    button.addEventListener("click", () => {
      adminUserRoleFilter = button.dataset.role;
      renderDashboard(currentRole);
    });
  });

  const adminUserForm = document.querySelector("#adminUserForm");

  if (adminUserForm) {
    adminUserForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(adminUserForm);
      const existingUser = editingUserRow
        ? dashboardUsers.find((user, index) => getRowId(user, index) === editingUserRow)
        : null;
      const password = String(formData.get("password") || "");
      const user = {
        rowId: editingUserRow,
        username: String(formData.get("username") || "").trim().toLowerCase(),
        password: password || existingUser?.password || "",
        name: String(formData.get("name") || "").trim(),
        role: formData.get("role"),
        halqa: formData.get("halqa"),
        access: String(formData.get("access") || "").trim(),
      };

      try {
        const data = await apiRequest(editingUserRow ? "/api/admin/users/update" : "/api/admin/users", {
          method: "POST",
          body: JSON.stringify(user),
        });
        dashboardUsers = data.users;
      } catch (error) {
        if (editingUserRow) {
          dashboardUsers = dashboardUsers.map((item, index) =>
            getRowId(item, index) === editingUserRow ? { ...item, ...user } : item
          );
        } else {
          dashboardUsers.push(user);
        }
      }

      editingUserRow = null;
      renderDashboard(currentRole);
    });
  }

  document.querySelectorAll(".edit-user-item").forEach((button) => {
    button.addEventListener("click", () => {
      editingUserRow = button.dataset.row;
      renderDashboard(currentRole);
    });
  });

  document.querySelectorAll(".delete-user-item").forEach((button) => {
    button.addEventListener("click", async () => {
      const rowId = button.dataset.row;

      try {
        const data = await apiRequest("/api/admin/users/delete", {
          method: "POST",
          body: JSON.stringify({ rowId }),
        });
        dashboardUsers = data.users;
      } catch (error) {
        dashboardUsers = dashboardUsers.filter((user, index) => getRowId(user, index) !== rowId);
      }

      if (editingUserRow === rowId) {
        editingUserRow = null;
      }
      renderDashboard(currentRole);
    });
  });

  document.querySelector(".cancel-user-edit")?.addEventListener("click", () => {
    editingUserRow = null;
    renderDashboard(currentRole);
  });

  const scheduleForm = document.querySelector("#scheduleForm");

  if (scheduleForm) {
    scheduleForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(scheduleForm);
      const scheduleItem = {
        rowId: editingScheduleRow,
        start: formData.get("start"),
        end: formData.get("end"),
        title: formData.get("title"),
        location: formData.get("location"),
        lead: formData.get("lead"),
        status: getComputedScheduleStatus({
          start: formData.get("start"),
          end: formData.get("end"),
          status: formData.get("status"),
        }),
      };
      const overlaps = getScheduleOverlaps(scheduleItem, editingScheduleRow || "");

      if (overlaps.length) {
        const shouldContinue = window.confirm(
          `This time overlaps with ${overlaps.map((item) => item.title).join(", ")}. Save anyway?`
        );

        if (!shouldContinue) {
          return;
        }
      }

      try {
        const data = await apiRequest(editingScheduleRow ? "/api/admin/schedule/update" : "/api/admin/schedule", {
          method: "POST",
          body: JSON.stringify(scheduleItem),
        });
        scheduleItems = data.scheduleItems;
      } catch (error) {
        if (editingScheduleRow) {
          scheduleItems = scheduleItems.map((item, index) =>
            getRowId(item, index) === editingScheduleRow ? { ...item, ...scheduleItem } : item
          );
        } else {
          scheduleItems.push(scheduleItem);
        }
      }

      editingScheduleRow = null;
      renderDashboard(currentRole);
    });
  }

  document.querySelectorAll(".template-chip").forEach((button) => {
    button.addEventListener("click", () => {
      const form = document.querySelector("#scheduleForm");

      if (!form) {
        return;
      }

      form.elements.title.value = button.dataset.title || "";
      form.elements.location.value = button.dataset.location || "";
      form.elements.lead.value = button.dataset.lead || "";
      form.elements.start.value = button.dataset.start || "";
      form.elements.end.value = button.dataset.end || "";
      form.elements.title.focus();
    });
  });

  const announcementForm = document.querySelector("#announcementForm");

  if (announcementForm) {
    announcementForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(announcementForm);
      const announcement = {
        rowId: editingAnnouncementRow,
        title: formData.get("title"),
        message: formData.get("message"),
        time: editingAnnouncementRow ? formData.get("time") || getCurrentCheckInTime() : getCurrentCheckInTime(),
        priority: formData.get("priority"),
        pinned: formData.get("pinned") === "on" || formData.get("emergency") === "on",
        showAv: formData.get("showAv") === "on",
        emergency: formData.get("emergency") === "on",
        expiresAfter: formData.get("expiresAfter"),
        audience: formData.get("audience"),
        draft: formData.get("draft") === "true",
      };

      if (announcement.emergency) {
        announcement.priority = "Critical";
      }

      try {
        const data = await apiRequest(
          editingAnnouncementRow ? "/api/admin/announcements/update" : "/api/admin/announcements",
          {
            method: "POST",
            body: JSON.stringify(announcement),
          }
        );
        announcements = data.announcements;
      } catch (error) {
        if (editingAnnouncementRow) {
          announcements = announcements.map((item, index) =>
            getRowId(item, index) === editingAnnouncementRow ? { ...item, ...announcement } : item
          );
        } else {
          announcements.unshift(announcement);
        }
      }

      editingAnnouncementRow = null;
      renderDashboard(currentRole);
    });
  }

  document.querySelectorAll(".priority-option").forEach((button) => {
    button.addEventListener("click", () => {
      const form = document.querySelector("#announcementForm");

      if (!form) {
        return;
      }

      form.elements.priority.value = button.dataset.priority;
      document.querySelectorAll(".priority-option").forEach((item) => item.classList.toggle("is-active", item === button));
      updateAnnouncementPreview();
    });
  });

  document.querySelectorAll(".announcement-template-chip").forEach((button) => {
    button.addEventListener("click", () => {
      const form = document.querySelector("#announcementForm");

      if (!form) {
        return;
      }

      form.elements.title.value = button.dataset.title || "";
      form.elements.message.value = button.dataset.message || "";
      form.elements.priority.value = button.dataset.priority || "Info";
      document.querySelectorAll(".priority-option").forEach((item) => {
        item.classList.toggle("is-active", item.dataset.priority === form.elements.priority.value);
      });
      updateAnnouncementPreview();
      form.elements.title.focus();
    });
  });

  document.querySelector(".save-announcement-draft")?.addEventListener("click", () => {
    const form = document.querySelector("#announcementForm");

    if (!form) {
      return;
    }

    form.elements.draft.value = "true";
    form.requestSubmit();
  });

  document.querySelector("#announcementMessageInput")?.addEventListener("input", updateAnnouncementPreview);
  document.querySelector("#announcementForm input[name='title']")?.addEventListener("input", updateAnnouncementPreview);
  document.querySelector("#announcementForm input[name='emergency']")?.addEventListener("change", (event) => {
    const form = document.querySelector("#announcementForm");

    if (!form) {
      return;
    }

    if (event.target.checked) {
      form.elements.priority.value = "Critical";
      form.elements.pinned.checked = true;
      document.querySelectorAll(".priority-option").forEach((item) => {
        item.classList.toggle("is-active", item.dataset.priority === "Critical");
      });
    }

    updateAnnouncementPreview();
  });

  document.querySelectorAll(".edit-schedule-item").forEach((button) => {
    button.addEventListener("click", () => {
      editingScheduleRow = button.dataset.row;
      renderDashboard(currentRole);
    });
  });

  document.querySelectorAll(".delete-schedule-item").forEach((button) => {
    button.addEventListener("click", async () => {
      const rowId = button.dataset.row;

      try {
        const data = await apiRequest("/api/admin/schedule/delete", {
          method: "POST",
          body: JSON.stringify({ rowId }),
        });
        scheduleItems = data.scheduleItems;
      } catch (error) {
        scheduleItems = scheduleItems.filter((item, index) => getRowId(item, index) !== rowId);
      }

      if (editingScheduleRow === rowId) {
        editingScheduleRow = null;
      }
      renderDashboard(currentRole);
    });
  });

  document.querySelector(".cancel-schedule-edit")?.addEventListener("click", () => {
    editingScheduleRow = null;
    renderDashboard(currentRole);
  });

  document.querySelectorAll(".edit-announcement-item").forEach((button) => {
    button.addEventListener("click", () => {
      editingAnnouncementRow = button.dataset.row;
      renderDashboard(currentRole);
    });
  });

  document.querySelectorAll(".delete-announcement-item").forEach((button) => {
    button.addEventListener("click", async () => {
      const rowId = button.dataset.row;

      try {
        const data = await apiRequest("/api/admin/announcements/delete", {
          method: "POST",
          body: JSON.stringify({ rowId }),
        });
        announcements = data.announcements;
      } catch (error) {
        announcements = announcements.filter((item, index) => getRowId(item, index) !== rowId);
      }

      if (editingAnnouncementRow === rowId) {
        editingAnnouncementRow = null;
      }
      renderDashboard(currentRole);
    });
  });

  document.querySelector(".cancel-announcement-edit")?.addEventListener("click", () => {
    editingAnnouncementRow = null;
    renderDashboard(currentRole);
  });

  const educationSetupForm = document.querySelector("#educationSetupForm");

  if (educationSetupForm) {
    const competitionSelect = document.querySelector("#educationSetupCompetition");

    competitionSelect?.addEventListener("change", () => {
      educationSelectedCompetition = competitionSelect.value;
      judgeMessage = "";
      renderDashboard(currentRole);
    });

    document.querySelector("#addEducationCriterion")?.addEventListener("click", () => {
      const rubric = getEducationRubric();
      educationRubrics[rubric.competition] = {
        ...rubric,
        criteria: [...rubric.criteria, { name: "New Criterion", max: 10 }],
      };
      saveEducationRubrics();
      renderDashboard(currentRole);
    });

    document.querySelectorAll(".remove-criterion").forEach((button) => {
      button.addEventListener("click", () => {
        const rubric = getEducationRubric();
        const index = Number(button.dataset.index);
        educationRubrics[rubric.competition] = {
          ...rubric,
          criteria: rubric.criteria.filter((_, criterionIndex) => criterionIndex !== index),
        };
        saveEducationRubrics();
        renderDashboard(currentRole);
      });
    });

    educationSetupForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(educationSetupForm);
      const competition = formData.get("competition");
      const criteria = Array.from(educationSetupForm.querySelectorAll("[data-criterion-row]"))
        .map((row, index) => ({
          name: formData.get(`criterionName${index}`)?.toString().trim(),
          max: Number(formData.get(`criterionMax${index}`) || 0),
        }))
        .filter((criterion) => criterion.name && criterion.max > 0);

      educationSelectedCompetition = competition;
      educationRubrics[competition] = {
        competition,
        participantType: formData.get("participantType") || getEducationRubric(competition).participantType,
        criteria: criteria.length ? criteria : defaultEducationCriteria.map((criterion) => ({ ...criterion })),
      };
      saveEducationRubrics();
      judgeMessage = "Rubric saved. Score Entry is ready for this competition.";
      renderDashboard(currentRole);
    });
  }

  const educationJudgeForm = document.querySelector("#educationJudgeForm");

  if (educationJudgeForm) {
    const rubric = getEducationRubric();
    const participantSelect = document.querySelector("#educationParticipantSelect");
    const participantDetails = document.querySelector("#educationParticipantDetails");
    const queueSearch = document.querySelector("#educationQueueSearch");
    const tajnidSearch = document.querySelector("#educationTajnidSearch");
    const tajnidResults = document.querySelector("#educationTajnidResults");
    const scoreInputs = educationJudgeForm.querySelectorAll("[data-score-input]");
    const liveTotal = document.querySelector("#educationLiveTotal");
    const syncParticipantDetails = () => {
      const participant = parseEducationParticipantValue(participantSelect?.value || "");
      if (participantDetails) {
        participantDetails.innerHTML = `
          <span>Participant Details</span>
          <strong>${escapeHtml(participant.name || "")}</strong>
          <small>Code: ${escapeHtml(participant.code || "N/A")} | Halqa: ${escapeHtml(participant.halqa || "")}</small>
        `;
      }
    };
    const syncLiveTotal = () => {
      const total = Array.from(scoreInputs).reduce((sum, input) => sum + Number(input.value || 0), 0);
      if (liveTotal) {
        liveTotal.textContent = total.toFixed(total % 1 ? 1 : 0);
      }
    };

    participantSelect?.addEventListener("change", syncParticipantDetails);
    queueSearch?.addEventListener("input", () => {
      const query = queueSearch.value.trim().toLowerCase();
      participantSelect?.querySelectorAll("option").forEach((option) => {
        const text = `${option.dataset.name || ""} ${option.dataset.code || ""} ${option.dataset.halqa || ""}`.toLowerCase();
        option.hidden = Boolean(query && !text.includes(query));
      });
    });
    tajnidSearch?.addEventListener("input", () => {
      if (tajnidResults) {
        renderRosterSearchResults(tajnidSearch, tajnidResults, "judge-add-education-roster-name");
      }
    });
    tajnidResults?.addEventListener("click", (event) => {
      const button = event.target.closest(".judge-add-education-roster-name");
      if (!button) {
        return;
      }

      const participant = parseEducationParticipantValue(button.dataset.participant);
      addEducationParticipantToRoster(rubric.competition, participant);
      judgeMessage = `${participant.name} added to ${rubric.competition}.`;
      renderDashboard(currentRole);
    });
    document.querySelector("#educationAddManualParticipant")?.addEventListener("click", () => {
      const participant = {
        name: document.querySelector("#educationManualName")?.value,
        code: document.querySelector("#educationManualCode")?.value,
        halqa: document.querySelector("#educationManualHalqa")?.value,
      };
      const added = addEducationParticipantToRoster(rubric.competition, participant);
      judgeMessage = added ? `${participant.name} added to ${rubric.competition}.` : "Participant already exists or name is missing.";
      renderDashboard(currentRole);
    });
    scoreInputs.forEach((input) => input.addEventListener("input", syncLiveTotal));
    syncParticipantDetails();
    syncLiveTotal();

    document.querySelectorAll(".queue-item").forEach((button) => {
      button.addEventListener("click", () => {
        if (participantSelect) {
          participantSelect.value = button.dataset.participant;
          syncParticipantDetails();
        }
      });
    });

    educationJudgeForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const submitter = event.submitter;
      const formData = new FormData(educationJudgeForm);
      const participant = parseEducationParticipantValue(formData.get("participantKey"));
      const scores = rubric.criteria.map((criterion, index) => Math.min(Number(formData.get(`score${index}`) || 0), Number(criterion.max || 0)));
      const total = scores.reduce((sum, score) => sum + score, 0);

      const postedResult = {
        competition: formData.get("competition"),
        participantType: formData.get("participantType"),
        participantName: participant.name,
        participantCode: participant.code,
        teamMembers: [],
        halqa: participant.halqa,
        criteria: Object.fromEntries(rubric.criteria.map((criterion, index) => [criterion.name, scores[index]])),
        rubric: rubric.criteria,
        notes: formData.get("notes"),
        total,
        judge: currentUser?.name || "Education Judge",
        postedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      try {
        const data = await apiRequest("/api/education/results", {
          method: "POST",
          body: JSON.stringify(postedResult),
        });
        educationJudgeResults = data.educationJudgeResults;
        judgeMessage = "Result posted live. Cumulative positions updated.";
      } catch (error) {
        const existingIndex = educationJudgeResults.findIndex((result) => {
          return (
            result.judge === postedResult.judge &&
            result.competition === postedResult.competition &&
            result.participantName.toLowerCase() === postedResult.participantName.toLowerCase() &&
            result.halqa === postedResult.halqa
          );
        });

        if (existingIndex >= 0) {
          educationJudgeResults[existingIndex] = postedResult;
          judgeMessage = "Backend unavailable. Previous local score replaced.";
        } else {
          educationJudgeResults.push(postedResult);
          judgeMessage = "Backend unavailable. Result saved locally.";
        }
      }

      educationJudgeForm.reset();
      if (submitter?.value === "next") {
        const scoredKeys = new Set(getEducationCompetitionResults(rubric.competition).map(getEducationResultKey));
        const nextParticipant = getEducationParticipantQueue(rubric).find((participant) => {
          return !scoredKeys.has(`${rubric.competition}|${participant.name}|${participant.halqa}`);
        });
        if (nextParticipant && participantSelect) {
          participantSelect.value = getEducationParticipantValue(nextParticipant);
        }
      }
      renderDashboard(currentRole);
    });
  }

  document.querySelector("#exportEducationPdf")?.addEventListener("click", () => {
    window.print();
  });

  document.querySelector("#exportEducationCsv")?.addEventListener("click", () => {
    const rows = [["Rank", "Participant", "Halqa", "Judges", "Average"], ...getEducationFinalPositions(educationSelectedCompetition).map((item) => [item.position, item.participantName, item.halqa, item.judgeCount, item.average])];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${educationSelectedCompetition.replace(/\W+/g, "-").toLowerCase()}-results.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  });

  const sportsResultForm = document.querySelector("#sportsResultForm");

  if (sportsResultForm) {
    const competitionSelect = document.querySelector("#sportsCompetitionSelect");
    const syncSportsPreview = () => {
      const formData = new FormData(sportsResultForm);
      const sportName = formData.get("sport") || sportsSelectedSport;
      const preview = document.querySelector(".sports-preview-panel");
      const summary = document.querySelector(".sports-summary-strip");

      if (preview) {
        preview.innerHTML = `
          <h3>Announcement Preview</h3>
          <strong>${escapeHtml(sportName)}</strong>
          ${sportsPodiumPositions
            .map((item) => {
              const halqa = formData.get(`${item.position}Halqa`) || "";
              const names = Array.from({ length: 5 }, (_, index) => formData.get(`${item.position}Member${index + 1}Name`))
                .filter(Boolean)
                .map((name) => `<small>${escapeHtml(name)}</small>`)
                .join("");
              return `
                <div class="sports-preview-place">
                  <span>${item.label}</span>
                  <b>${escapeHtml(halqa)}</b>
                  ${names}
                </div>
              `;
            })
            .join("")}
        `;
      }

      if (summary) {
        summary.innerHTML = sportsPodiumPositions
          .map((item) => `<span>${item.label}: ${escapeHtml(formData.get(`${item.position}Halqa`) || "")}</span>`)
          .join("");
      }
    };

    competitionSelect?.addEventListener("change", () => {
      sportsSelectedSport = competitionSelect.value;
      sportsMessage = "";
      renderDashboard(currentRole);
    });

    sportsResultForm.querySelectorAll("[data-sports-halqa]").forEach((select) => {
      select.addEventListener("change", () => {
        const card = select.closest("[data-sports-position]");
        const position = card?.dataset.sportsPosition;
        const rosterWrap = position ? sportsResultForm.querySelector(`[data-sports-roster="${position}"]`) : null;
        if (rosterWrap) {
          rosterWrap.innerHTML = renderSportsRosterInputs(position, select.value, 1, sportsSelectedSport);
          rosterWrap.querySelectorAll("input").forEach((input) => input.addEventListener("input", syncSportsPreview));
        }
        syncSportsPreview();
      });
    });

    sportsResultForm.querySelectorAll(".add-sports-roster-field").forEach((button) => {
      button.addEventListener("click", () => {
        const position = button.dataset.position;
        const rosterWrap = sportsResultForm.querySelector(`[data-sports-roster="${position}"]`);

        if (!position || !rosterWrap) {
          return;
        }

        const nextNumber = rosterWrap.querySelectorAll(".sports-member-row").length + 1;
        rosterWrap.insertAdjacentHTML(
          "beforeend",
          `
            <div class="sports-member-row">
              <input name="${position}Member${nextNumber}Name" list="sportsParticipantOptions" placeholder="Participant ${nextNumber}" />
              <input name="${position}Member${nextNumber}Code" placeholder="Code" />
            </div>
          `
        );
        rosterWrap.querySelectorAll(".sports-member-row:last-child input").forEach((input) => {
          input.addEventListener("input", syncSportsPreview);
          input.addEventListener("change", syncSportsPreview);
        });
        syncSportsPreview();
      });
    });

    sportsResultForm.querySelectorAll("[data-sports-tajnid-search]").forEach((input) => {
      input.addEventListener("input", () => {
        const position = input.dataset.sportsTajnidSearch;
        const resultsContainer = sportsResultForm.querySelector(`[data-sports-tajnid-results="${position}"]`);
        const matches = getTajnidMatches(input.value);

        if (!resultsContainer) {
          return;
        }

        resultsContainer.innerHTML = matches.length
          ? matches
              .map(
                (participant) => `
                  <button class="queue-item sports-add-roster-name" data-position="${position}" data-participant="${getEducationParticipantValue(participant)}" type="button">
                    <span>${participant.code || "No code"}</span>
                    <strong>${participant.name}</strong>
                    <small>${participant.halqa}</small>
                  </button>
                `
              )
              .join("")
          : input.value.trim()
            ? `<div class="access-note">No tajnid match found. Type the name manually below.</div>`
            : "";
      });
    });

    sportsResultForm.querySelectorAll("[data-sports-tajnid-results]").forEach((container) => {
      container.addEventListener("click", (event) => {
        const button = event.target.closest(".sports-add-roster-name");
        if (!button) {
          return;
        }

        const participant = parseEducationParticipantValue(button.dataset.participant);
        addSportsParticipantToRoster(sportsSelectedSport, button.dataset.position, participant);
        sportsMessage = `${participant.name} added to ${sportsSelectedSport} ${button.dataset.position}.`;
        renderDashboard(currentRole);
      });
    });

    sportsResultForm.querySelectorAll("input, select").forEach((input) => {
      input.addEventListener("input", syncSportsPreview);
      input.addEventListener("change", syncSportsPreview);
    });
    syncSportsPreview();

    sportsResultForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const submitter = event.submitter;
      const formData = new FormData(sportsResultForm);
      const sportName = formData.get("sport");
      const sport = sportsCompetitions.find((item) => item.name === sportName) || getSelectedSport();
      const results = sportsPodiumPositions.map((item) => {
        const halqa = formData.get(`${item.position}Halqa`);
        const rosterWrap = sportsResultForm.querySelector(`[data-sports-roster="${item.position}"]`);
        const rosterCount = rosterWrap?.querySelectorAll(`input[name^="${item.position}Member"][name$="Name"]`).length || 1;
        const roster = Array.from({ length: rosterCount }, (_, index) => {
          const number = index + 1;
          return {
            name: formData.get(`${item.position}Member${number}Name`),
            code: formData.get(`${item.position}Member${number}Code`),
          };
        }).filter((member) => member.name || member.code);

        return {
          sport: sport.name,
          eventType: sport.eventType,
          position: item.position,
          participantType: sport.eventType.includes("Individual") ? "Individual" : "Team",
          participantName: sport.eventType.includes("Individual") ? roster[0]?.name || halqa : `Team ${halqa}`,
          roster,
          halqa,
          scoreValue: formData.get(`${item.position}ScoreValue`),
          scoreUnit: sport.unit,
          points: item.points,
          published: submitter?.value === "publish",
          postedBy: currentUser?.name || "Sports Admin",
          postedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
      });

      if (submitter?.value === "draft") {
        localStorage.setItem(`sportsDraft:${sport.name}`, JSON.stringify(results));
        sportsMessage = "Draft saved on this device. Publish when the podium is confirmed.";
        renderDashboard(currentRole);
        return;
      }

      try {
        for (const postedResult of results) {
          const data = await apiRequest("/api/sports/results", {
            method: "POST",
            body: JSON.stringify(postedResult),
          });
          sportsPostedResults = data.sportsPostedResults;
        }
        sportsMessage = "Sports podium published. Standings and ceremony sheet updated.";
      } catch (error) {
        results.forEach((postedResult) => {
          const existingIndex = sportsPostedResults.findIndex((result) => {
            return result.sport === postedResult.sport && result.position === postedResult.position;
          });

          if (existingIndex >= 0) {
            sportsPostedResults[existingIndex] = postedResult;
          } else {
            sportsPostedResults.push(postedResult);
          }
        });
        sportsMessage = "Backend unavailable. Podium saved locally for this session.";
      }

      sportsResultForm.reset();
      renderDashboard(currentRole);
    });
  }

  document.querySelectorAll(".edit-sports-result").forEach((button) => {
    button.addEventListener("click", () => {
      sportsSelectedSport = button.dataset.sport;
      currentSection = "Result Entry";
      renderDashboard(currentRole);
    });
  });

  document.querySelectorAll(".export-sports-csv").forEach((button) => {
    button.addEventListener("click", () => {
      downloadSportsCsv(button.dataset.sport || sportsSelectedSport);
    });
  });

  document.querySelector("#printSportsCeremony")?.addEventListener("click", () => {
    window.print();
  });

  document.querySelector("#exportSportsCeremonyCsv")?.addEventListener("click", () => {
    downloadSportsCsv();
  });

  bindAvDisplayControls();
}

function bindAvDisplayControls() {
  document.querySelector(".av-maximize")?.addEventListener("click", async () => {
    const display = document.querySelector(".av-display");

    if (!display) {
      return;
    }

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await display.requestFullscreen();
      }
    } catch (error) {
      display.classList.toggle("is-browser-fullscreen");
    }
  });
}

function updateAnnouncementPreview() {
  const form = document.querySelector("#announcementForm");
  const preview = document.querySelector(".admin-announcement-preview");
  const counter = document.querySelector("#announcementCharCounter");

  if (!form || !preview) {
    return;
  }

  const title = form.elements.title?.value || "Announcement title";
  const message = form.elements.message?.value || "Announcement message";
  const priority = form.elements.priority?.value || "Info";
  const audience = form.elements.audience?.value || "Public Dashboard";
  const time = form.elements.time?.value || getCurrentCheckInTime();
  const meta = getAnnouncementPriorityMeta(priority);

  preview.className = `admin-announcement-preview priority-${meta.tone}`;
  preview.innerHTML = `
    <span class="announcement-kicker">Public Preview</span>
    <div class="featured-announcement-main">
      <span class="announcement-priority-mark">${meta.icon}</span>
      <div>
        <h3>${title}</h3>
        <p>${message}</p>
        <footer>
          <span class="category-tag">${audience}</span>
          <time>${time}</time>
        </footer>
      </div>
    </div>
  `;

  if (counter) {
    counter.textContent = `${message.length} / 200`;
  }
}

function renderDashboard(role) {
  currentRole = role;
  appShell?.classList.toggle("is-sidebar-collapsed", isSidebarCollapsed);
  sidebarToggle?.setAttribute("aria-label", isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar");
  pageTitle.textContent = roleLabels[role];
  sessionLabel.textContent = currentUser ? "Signed in as" : "Public view";
  signedInUser.textContent = currentUser ? `${currentUser.name} - ${currentUser.access}` : "General User";
  loginButton.hidden = Boolean(currentUser);
  logoutButton.hidden = !currentUser;
  renderNav(role);
  renderPanels(role);
  manageAvTimer(role);
}

sidebarToggle?.addEventListener("click", () => {
  isSidebarCollapsed = !isSidebarCollapsed;
  appShell?.classList.toggle("is-sidebar-collapsed", isSidebarCollapsed);
  sidebarToggle.setAttribute("aria-label", isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar");
});

function manageAvTimer(role) {
  if (avTimer) {
    clearTimeout(avTimer);
    avTimer = null;
  }

  if (role === "av") {
    const currentSlide = avSlides[avSlideIndex % avSlides.length];
    const delay = 8000;

    avTimer = setTimeout(() => {
      avSlideIndex = (avSlideIndex + 1) % avSlides.length;
      refreshAvDisplayOnly();
      manageAvTimer("av");
    }, delay);
  }
}

function isEditingForm() {
  const activeElement = document.activeElement;
  return ["INPUT", "SELECT", "TEXTAREA"].includes(activeElement?.tagName);
}

function startLiveRefresh() {
  if (liveRefreshTimer) {
    clearInterval(liveRefreshTimer);
  }

  liveRefreshTimer = setInterval(async () => {
    if (isEditingForm()) {
      return;
    }

    try {
      const data = await apiRequest("/api/bootstrap");
      applyBootstrapData(data);
      if (currentRole === "av") {
        refreshAvDisplayOnly();
      } else {
        renderDashboard(currentRole);
      }
    } catch (error) {
      // Keep the current screen if the backend is temporarily unavailable.
    }
  }, 10000);
}

function startPrayerClock() {
  if (prayerTimer) {
    clearInterval(prayerTimer);
  }

  prayerTimer = setInterval(() => {
    if (isEditingForm()) {
      return;
    }

    if (currentRole === "public" && currentSection === "Overview" && document.querySelector("#public-prayer-times")) {
      renderDashboard("public");
    }
  }, 30000);
}

async function signIn(username, password) {
  try {
    const data = await apiRequest("/api/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    return data.user;
  } catch (error) {
    return users.find((user) => user.username === username.trim().toLowerCase() && user.password === password);
  }
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const user = await signIn(usernameInput.value, passwordInput.value);

  if (!user) {
    loginError.textContent = "Invalid username or password.";
    passwordInput.value = "";
    passwordInput.focus();
    return;
  }

  currentUser = user;
  loginError.textContent = "";
  loginScreen.classList.add("is-hidden");
  currentSection = navItems[user.role][0];
  renderDashboard(user.role);
});

logoutButton.addEventListener("click", () => {
  currentUser = null;
  loginForm.reset();
  currentSection = "Overview";
  attendanceSearch = "";
  attendanceMessage = "";
  judgeMessage = "";
  sportsMessage = "";
  avSlideIndex = 0;
  renderDashboard("public");
});

loginButton.addEventListener("click", () => {
  loginScreen.classList.remove("is-hidden");
  usernameInput.focus();
});

closeLoginButton.addEventListener("click", () => {
  loginScreen.classList.add("is-hidden");
  loginError.textContent = "";
  loginForm.reset();
});

async function initializeApp() {
  try {
    const data = await apiRequest("/api/bootstrap");
    applyBootstrapData(data);
  } catch (error) {
    loadEducationRubricsFromStorage();
    console.warn("Backend bootstrap unavailable. Using local sample data.");
  }

  renderDashboard("public");
  startLiveRefresh();
  startPrayerClock();
}

initializeApp();
