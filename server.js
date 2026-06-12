const http = require("http");
const fs = require("fs");
const path = require("path");
const {
  appendAnnouncement,
  appendAttendance,
  appendScheduleItem,
  isSheetsConfigured,
  readBootstrap,
  readUsers,
} = require("./sheetsStore");

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;
const BASE_PATH = normalizeBasePath(process.env.BASE_PATH || "");

function loadEnvFile() {
  const envPath = path.join(PUBLIC_DIR, ".env");

  if (!fs.existsSync(envPath)) {
    return;
  }

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      return;
    }

    const equalsIndex = trimmed.indexOf("=");

    if (equalsIndex === -1) {
      return;
    }

    const key = trimmed.slice(0, equalsIndex).trim();
    let value = trimmed.slice(equalsIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
}

function normalizeBasePath(value) {
  const trimmed = String(value || "").trim();

  if (!trimmed || trimmed === "/") {
    return "";
  }

  return `/${trimmed.replace(/^\/+|\/+$/g, "")}`;
}

function resolveRequestPath(pathname) {
  if (!BASE_PATH) {
    return pathname;
  }

  if (pathname === BASE_PATH || pathname === `${BASE_PATH}/`) {
    return "/";
  }

  if (pathname.startsWith(`${BASE_PATH}/`)) {
    return pathname.slice(BASE_PATH.length);
  }

  return null;
}

loadEnvFile();

function isAppsScriptConfigured() {
  return Boolean(process.env.APPS_SCRIPT_URL);
}

async function appsScriptRequest(action, payload) {
  const url = process.env.APPS_SCRIPT_URL;
  const requestUrl = action === "bootstrap" ? `${url}?action=bootstrap` : url;
  const response = await fetch(requestUrl, {
    method: action === "bootstrap" ? "GET" : "POST",
    headers: { "Content-Type": "application/json" },
    body: action === "bootstrap" ? undefined : JSON.stringify({ action, payload }),
  });
  const data = await response.json();

  if (data.error) {
    const error = new Error(data.error);
    error.data = data;
    throw error;
  }

  if (!response.ok) {
    throw new Error(data.error || "Apps Script request failed.");
  }

  return data;
}

const halqajat = [
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

const users = [
  { username: "admin", password: "admin123", name: "Admin User", role: "admin", access: "Full portal access" },
  ...halqajat.map((halqa, index) => {
    const number = String(index + 1).padStart(2, "0");
    return {
      username: `zaim${number}`,
      password: "zaim123",
      name: `Zaim ${number}`,
      role: "zaim",
      halqa,
      access: `${halqa} only`,
    };
  }),
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
  { username: "av", password: "av123", name: "AV Team", role: "av", access: "Projector display access" },
];

const scheduleItems = [
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

const announcements = [
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

const halqaRankings = [
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
  .map((item) => ({ ...item, total: Math.round(item.attendance * 0.5 + item.education + item.sports) }))
  .sort((a, b) => b.total - a.total)
  .map((item, index) => ({ ...item, rank: index + 1 }));

const competitionResults = [
  {
    category: "Education",
    competition: "Tilawat",
    position: "1st",
    name: "Ahmad Khan",
    halqa: "Peace Village Center West",
  },
  { category: "Education", competition: "Nazm", position: "1st", name: "Bilal Ahmed", halqa: "Vaughan South" },
  { category: "Education", competition: "Speech", position: "1st", name: "Sameer Malik", halqa: "Kleinburg North" },
  { category: "Sports", competition: "Football", position: "1st", name: "Team Springside", halqa: "Springside" },
  { category: "Sports", competition: "100m Race", position: "1st", name: "Usman Raza", halqa: "Maple" },
  {
    category: "Sports",
    competition: "Tug of War",
    position: "1st",
    name: "Team Woodbridge South",
    halqa: "Woodbridge South",
  },
];

const memberRecords = halqajat.flatMap((halqa, halqaIndex) => {
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

const attendanceRecords = memberRecords
  .filter((member) => member.attended)
  .map((member) => ({
    code: member.code,
    name: member.name,
    halqa: member.halqa,
    checkIn: member.checkIn,
    checkedInBy: "Demo seed",
  }));

const educationJudgeResults = [];
const educationCompetitionRosters = {};
const sportsCompetitionRosters = {};
const sportsPostedResults = [];

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { "Content-Type": "application/json" });
  response.end(JSON.stringify(payload));
}

function sendError(response, statusCode, message) {
  sendJson(response, statusCode, { error: message });
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        request.destroy();
        reject(new Error("Request body is too large."));
      }
    });
    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    request.on("error", reject);
  });
}

function publicUser(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}

function fallbackBootstrapPayload() {
  return {
    halqajat,
    users,
    scheduleItems,
    announcements,
    halqaRankings,
    competitionResults,
    memberRecords,
    attendanceRecords,
    educationJudgeResults,
    educationCompetitionRosters,
    sportsCompetitionRosters,
    sportsPostedResults,
  };
}

function normalizeAttendanceCode(code) {
  return String(code || "").trim();
}

function mergeAttendanceIntoMembers(members, attendance) {
  const attendanceByCode = new Map();
  const uniqueAttendance = [];

  attendance.forEach((record) => {
    const code = normalizeAttendanceCode(record.code);

    if (!code || attendanceByCode.has(code)) {
      return;
    }

    attendanceByCode.set(code, record);
    uniqueAttendance.push(record);
  });

  return {
    memberRecords: members.map((member) => {
      const attendanceRecord = attendanceByCode.get(normalizeAttendanceCode(member.code));

      if (!attendanceRecord && !member.attended) {
        return member;
      }

      return {
        ...member,
        attended: Boolean(member.attended || attendanceRecord),
        checkIn: member.checkIn || attendanceRecord?.checkIn || "",
      };
    }),
    attendanceRecords: uniqueAttendance,
  };
}

async function bootstrapPayload() {
  const fallback = fallbackBootstrapPayload();

  if (isAppsScriptConfigured()) {
    const data = await appsScriptRequest("bootstrap");
    const mergedAttendance = mergeAttendanceIntoMembers(
      data.memberRecords || fallback.memberRecords,
      data.attendanceRecords || fallback.attendanceRecords
    );
    return {
      ...fallback,
      ...data,
      ...mergedAttendance,
      educationCompetitionRosters: data.educationCompetitionRosters || educationCompetitionRosters,
      sportsCompetitionRosters: data.sportsCompetitionRosters || sportsCompetitionRosters,
    };
  }

  const data = await readBootstrap(fallback);
  return {
    ...data,
    ...mergeAttendanceIntoMembers(data.memberRecords || fallback.memberRecords, data.attendanceRecords || fallback.attendanceRecords),
  };
}

function getCurrentCheckInTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function getRowId(item, index) {
  return String(item._rowNumber || item.id || index);
}

function updateByRowId(items, rowId, patch) {
  const index = items.findIndex((item, itemIndex) => getRowId(item, itemIndex) === String(rowId));

  if (index >= 0) {
    items[index] = { ...items[index], ...patch };
  }

  return items;
}

function deleteByRowId(items, rowId) {
  const index = items.findIndex((item, itemIndex) => getRowId(item, itemIndex) === String(rowId));

  if (index >= 0) {
    items.splice(index, 1);
  }

  return items;
}

function normalizeUserPayload(payload, existingUser = {}) {
  return {
    username: String(payload.username || existingUser.username || "").trim().toLowerCase(),
    password: String(payload.password || existingUser.password || ""),
    name: String(payload.name || existingUser.name || "").trim(),
    role: String(payload.role || existingUser.role || "zaim"),
    halqa: String(payload.halqa || ""),
    access: String(payload.access || existingUser.access || "").trim(),
  };
}

async function handleApi(request, response, url) {
  const requestPath = resolveRequestPath(url.pathname);

  if (requestPath === null) {
    return false;
  }

  if (request.method === "GET" && requestPath === "/api/bootstrap") {
    sendJson(response, 200, await bootstrapPayload());
    return true;
  }

  if (request.method === "POST" && requestPath === "/api/login") {
    const body = await readJson(request);
    const availableUsers = isAppsScriptConfigured() ? (await bootstrapPayload()).users || users : await readUsers(users);
    const user = availableUsers.find(
      (candidate) =>
        candidate.username === String(body.username || "").trim().toLowerCase() && candidate.password === body.password
    );

    if (!user) {
      sendError(response, 401, "Invalid username or password.");
      return true;
    }

    sendJson(response, 200, { user: publicUser(user) });
    return true;
  }

  if (request.method === "POST" && requestPath === "/api/attendance/check-in") {
    const body = await readJson(request);

    if (isAppsScriptConfigured()) {
      const data = await appsScriptRequest("attendanceCheckIn", body);
      sendJson(response, 200, data);
      return true;
    }

    const activeData = await bootstrapPayload();
    const activeMembers = activeData.memberRecords;
    const activeAttendance = activeData.attendanceRecords;
    const member = activeMembers.find((record) => record.code === body.code);

    if (!member) {
      sendError(response, 404, "Member was not found.");
      return true;
    }

    if (member.attended) {
      sendJson(response, 409, { error: `${member.name} is already checked in.`, member, attendanceRecords });
      return true;
    }

    const checkIn = getCurrentCheckInTime();
    member.attended = true;
    member.checkIn = checkIn;

    const attendanceRecord = {
      code: member.code,
      name: member.name,
      halqa: member.halqa,
      checkIn,
      checkedInBy: body.checkedInBy || "Attendance Team",
    };
    activeAttendance.unshift(attendanceRecord);

    if (!isSheetsConfigured()) {
      const fallbackMember = memberRecords.find((record) => record.code === body.code);
      if (fallbackMember) {
        fallbackMember.attended = true;
        fallbackMember.checkIn = checkIn;
      }
      attendanceRecords.unshift(attendanceRecord);
    }

    await appendAttendance(attendanceRecord);

    sendJson(response, 200, {
      memberRecords: activeMembers,
      attendanceRecords: activeAttendance,
      message: `${member.name} checked in successfully.`,
    });
    return true;
  }

  if (request.method === "POST" && requestPath === "/api/attendance/mark-absent") {
    const body = await readJson(request);
    const absentCodes = new Set((body.codes || []).map(normalizeAttendanceCode).filter(Boolean));

    if (!absentCodes.size) {
      sendError(response, 400, "No members were selected.");
      return true;
    }

    if (isAppsScriptConfigured()) {
      const data = await appsScriptRequest("attendanceMarkAbsent", { codes: [...absentCodes] });
      sendJson(response, 200, data);
      return true;
    }

    const activeData = await bootstrapPayload();
    const activeMembers = activeData.memberRecords.map((member) =>
      absentCodes.has(normalizeAttendanceCode(member.code)) ? { ...member, attended: false, checkIn: "" } : member
    );
    const activeAttendance = activeData.attendanceRecords.filter((record) => !absentCodes.has(normalizeAttendanceCode(record.code)));

    if (!isSheetsConfigured()) {
      memberRecords = memberRecords.map((member) =>
        absentCodes.has(normalizeAttendanceCode(member.code)) ? { ...member, attended: false, checkIn: "" } : member
      );
      attendanceRecords = attendanceRecords.filter((record) => !absentCodes.has(normalizeAttendanceCode(record.code)));
    }

    sendJson(response, 200, {
      memberRecords: activeMembers,
      attendanceRecords: activeAttendance,
      message: `${absentCodes.size} member${absentCodes.size === 1 ? "" : "s"} marked absent.`,
    });
    return true;
  }

  if (request.method === "POST" && requestPath === "/api/admin/schedule") {
    const body = await readJson(request);

    if (isAppsScriptConfigured()) {
      const data = await appsScriptRequest("addSchedule", body);
      sendJson(response, 200, data);
      return true;
    }

    const scheduleItem = {
      start: body.start,
      end: body.end,
      title: body.title,
      location: body.location,
      lead: body.lead,
      status: body.status || "Upcoming",
    };
    scheduleItems.push(scheduleItem);
    await appendScheduleItem(scheduleItem);
    sendJson(response, 200, { scheduleItems: isSheetsConfigured() ? (await bootstrapPayload()).scheduleItems : scheduleItems });
    return true;
  }

  if (request.method === "POST" && requestPath === "/api/admin/schedule/update") {
    const body = await readJson(request);

    if (isAppsScriptConfigured()) {
      const data = await appsScriptRequest("updateSchedule", body);
      sendJson(response, 200, data);
      return true;
    }

    updateByRowId(scheduleItems, body.rowId, body);
    sendJson(response, 200, { scheduleItems });
    return true;
  }

  if (request.method === "POST" && requestPath === "/api/admin/schedule/delete") {
    const body = await readJson(request);

    if (isAppsScriptConfigured()) {
      const data = await appsScriptRequest("deleteSchedule", body);
      sendJson(response, 200, data);
      return true;
    }

    deleteByRowId(scheduleItems, body.rowId);
    sendJson(response, 200, { scheduleItems });
    return true;
  }

  if (request.method === "POST" && requestPath === "/api/admin/announcements") {
    const body = await readJson(request);

    if (isAppsScriptConfigured()) {
      const data = await appsScriptRequest("addAnnouncement", body);
      sendJson(response, 200, data);
      return true;
    }

    const announcement = {
      title: body.title,
      message: body.message,
      time: body.time,
      priority: body.priority || "Info",
    };
    announcements.unshift(announcement);
    await appendAnnouncement(announcement);
    sendJson(response, 200, {
      announcements: isSheetsConfigured() ? (await bootstrapPayload()).announcements : announcements,
    });
    return true;
  }

  if (request.method === "POST" && requestPath === "/api/admin/announcements/update") {
    const body = await readJson(request);

    if (isAppsScriptConfigured()) {
      const data = await appsScriptRequest("updateAnnouncement", body);
      sendJson(response, 200, data);
      return true;
    }

    updateByRowId(announcements, body.rowId, body);
    sendJson(response, 200, { announcements });
    return true;
  }

  if (request.method === "POST" && requestPath === "/api/admin/announcements/delete") {
    const body = await readJson(request);

    if (isAppsScriptConfigured()) {
      const data = await appsScriptRequest("deleteAnnouncement", body);
      sendJson(response, 200, data);
      return true;
    }

    deleteByRowId(announcements, body.rowId);
    sendJson(response, 200, { announcements });
    return true;
  }

  if (request.method === "POST" && requestPath === "/api/admin/users") {
    const body = await readJson(request);

    if (isAppsScriptConfigured()) {
      const data = await appsScriptRequest("addUser", body);
      sendJson(response, 200, data);
      return true;
    }

    users.push(normalizeUserPayload(body));
    sendJson(response, 200, { users });
    return true;
  }

  if (request.method === "POST" && requestPath === "/api/admin/users/update") {
    const body = await readJson(request);

    if (isAppsScriptConfigured()) {
      const data = await appsScriptRequest("updateUser", body);
      sendJson(response, 200, data);
      return true;
    }

    const existingIndex = users.findIndex((user, index) => getRowId(user, index) === String(body.rowId));
    if (existingIndex >= 0) {
      users[existingIndex] = normalizeUserPayload(body, users[existingIndex]);
    }
    sendJson(response, 200, { users });
    return true;
  }

  if (request.method === "POST" && requestPath === "/api/admin/users/delete") {
    const body = await readJson(request);

    if (isAppsScriptConfigured()) {
      const data = await appsScriptRequest("deleteUser", body);
      sendJson(response, 200, data);
      return true;
    }

    deleteByRowId(users, body.rowId);
    sendJson(response, 200, { users });
    return true;
  }

  if (request.method === "POST" && requestPath === "/api/education/results") {
    const result = await readJson(request);

    if (isAppsScriptConfigured()) {
      const data = await appsScriptRequest("educationResult", result);
      sendJson(response, 200, data);
      return true;
    }

    const existingIndex = educationJudgeResults.findIndex((existing) => {
      return (
        existing.judge === result.judge &&
        existing.competition === result.competition &&
        String(existing.participantName || "").toLowerCase() === String(result.participantName || "").toLowerCase() &&
        existing.halqa === result.halqa
      );
    });

    if (existingIndex >= 0) {
      educationJudgeResults[existingIndex] = result;
    } else {
      educationJudgeResults.push(result);
    }

    sendJson(response, 200, { educationJudgeResults });
    return true;
  }

  if (request.method === "POST" && requestPath === "/api/education/rosters/add") {
    const body = await readJson(request);
    const competition = String(body.competition || "").trim();
    const participant = {
      name: String(body.participant?.name || "").trim(),
      code: String(body.participant?.code || "").trim(),
      halqa: String(body.participant?.halqa || "").trim(),
    };

    if (!competition || !participant.name) {
      sendError(response, 400, "Competition and participant name are required.");
      return true;
    }

    const roster = educationCompetitionRosters[competition] || [];
    const exists = roster.some((item) => {
      const codeMatches = participant.code && item.code && String(item.code).toLowerCase() === participant.code.toLowerCase();
      const nameMatches = String(item.name || "").toLowerCase() === participant.name.toLowerCase() && item.halqa === participant.halqa;
      return codeMatches || nameMatches;
    });

    if (!exists) {
      educationCompetitionRosters[competition] = [...roster, participant];
    }

    if (isAppsScriptConfigured()) {
      try {
        const data = await appsScriptRequest("educationRosterAdd", { competition, participant });
        sendJson(response, 200, {
          ...data,
          educationCompetitionRosters: data.educationCompetitionRosters || educationCompetitionRosters,
        });
        return true;
      } catch (error) {
        // Use local in-memory roster until the deployed Apps Script includes roster actions.
      }
    }

    sendJson(response, 200, { educationCompetitionRosters });
    return true;
  }

  if (request.method === "POST" && requestPath === "/api/education/rosters/remove") {
    const body = await readJson(request);
    const competition = String(body.competition || "").trim();
    const code = String(body.code || "").trim();
    const name = String(body.name || "").trim();

    if (!competition) {
      sendError(response, 400, "Competition is required.");
      return true;
    }

    educationCompetitionRosters[competition] = (educationCompetitionRosters[competition] || []).filter((participant) => {
      if (code) {
        return participant.code !== code;
      }

      return participant.name !== name;
    });

    if (isAppsScriptConfigured()) {
      try {
        const data = await appsScriptRequest("educationRosterRemove", { competition, code, name });
        sendJson(response, 200, {
          ...data,
          educationCompetitionRosters: data.educationCompetitionRosters || educationCompetitionRosters,
        });
        return true;
      } catch (error) {
        // Use local in-memory roster until the deployed Apps Script includes roster actions.
      }
    }

    sendJson(response, 200, { educationCompetitionRosters });
    return true;
  }

  if (request.method === "POST" && requestPath === "/api/sports/rosters/add") {
    const body = await readJson(request);
    const sport = String(body.sport || "").trim();
    const position = String(body.position || "").trim();
    const participant = {
      name: String(body.participant?.name || "").trim(),
      code: String(body.participant?.code || "").trim(),
      halqa: String(body.participant?.halqa || "").trim(),
    };

    if (!sport || !position || !participant.name) {
      sendError(response, 400, "Sport, position, and participant name are required.");
      return true;
    }

    const roster = sportsCompetitionRosters[sport]?.[position] || [];
    const exists = roster.some((item) => {
      const codeMatches = participant.code && item.code && String(item.code).toLowerCase() === participant.code.toLowerCase();
      const nameMatches = String(item.name || "").toLowerCase() === participant.name.toLowerCase() && item.halqa === participant.halqa;
      return codeMatches || nameMatches;
    });

    if (!exists) {
      sportsCompetitionRosters[sport] = {
        ...(sportsCompetitionRosters[sport] || {}),
        [position]: [...roster, participant],
      };
    }

    if (isAppsScriptConfigured()) {
      try {
        const data = await appsScriptRequest("sportsRosterAdd", { sport, position, participant });
        sendJson(response, 200, {
          ...data,
          sportsCompetitionRosters: data.sportsCompetitionRosters || sportsCompetitionRosters,
        });
        return true;
      } catch (error) {
        // Use local in-memory roster until the deployed Apps Script includes roster actions.
      }
    }

    sendJson(response, 200, { sportsCompetitionRosters });
    return true;
  }

  if (request.method === "POST" && requestPath === "/api/sports/rosters/remove") {
    const body = await readJson(request);
    const sport = String(body.sport || "").trim();
    const position = String(body.position || "").trim();
    const code = String(body.code || "").trim();
    const name = String(body.name || "").trim();

    if (!sport || !position) {
      sendError(response, 400, "Sport and position are required.");
      return true;
    }

    sportsCompetitionRosters[sport] = {
      ...(sportsCompetitionRosters[sport] || {}),
      [position]: (sportsCompetitionRosters[sport]?.[position] || []).filter((participant) => {
        if (code) {
          return participant.code !== code;
        }

        return participant.name !== name;
      }),
    };

    if (isAppsScriptConfigured()) {
      try {
        const data = await appsScriptRequest("sportsRosterRemove", { sport, position, code, name });
        sendJson(response, 200, {
          ...data,
          sportsCompetitionRosters: data.sportsCompetitionRosters || sportsCompetitionRosters,
        });
        return true;
      } catch (error) {
        // Use local in-memory roster until the deployed Apps Script includes roster actions.
      }
    }

    sendJson(response, 200, { sportsCompetitionRosters });
    return true;
  }

  if (request.method === "POST" && requestPath === "/api/sports/results") {
    const result = await readJson(request);

    if (isAppsScriptConfigured()) {
      const data = await appsScriptRequest("sportsResult", result);
      sendJson(response, 200, data);
      return true;
    }

    const existingIndex = sportsPostedResults.findIndex((existing) => {
      return existing.sport === result.sport && existing.position === result.position;
    });

    if (existingIndex >= 0) {
      sportsPostedResults[existingIndex] = result;
    } else {
      sportsPostedResults.push(result);
    }

    sendJson(response, 200, { sportsPostedResults });
    return true;
  }

  return false;
}

function serveStatic(request, response, url) {
  const requestPath = resolveRequestPath(url.pathname);

  if (requestPath === null) {
    sendError(response, 404, "Not found.");
    return;
  }

  const requestedPath = requestPath === "/" ? "/index.html" : requestPath;
  const filePath = path.normalize(path.join(PUBLIC_DIR, requestedPath));

  if (!filePath.startsWith(PUBLIC_DIR)) {
    sendError(response, 403, "Forbidden.");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      sendError(response, 404, "Not found.");
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    const contentTypes = {
      ".html": "text/html",
      ".css": "text/css",
      ".js": "text/javascript",
      ".json": "application/json",
    };

    response.writeHead(200, { "Content-Type": contentTypes[extension] || "application/octet-stream" });
    response.end(content);
  });
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);

  try {
    if (url.pathname.startsWith("/api/")) {
      const handled = await handleApi(request, response, url);
      if (!handled) {
        sendError(response, 404, "API route not found.");
      }
      return;
    }

    serveStatic(request, response, url);
  } catch (error) {
    sendError(response, 500, error.message || "Server error.");
  }
});

server.listen(PORT, () => {
  console.log(`Ijtima Dashboard backend running at http://localhost:${PORT}`);
  console.log(`Base path: ${BASE_PATH || "/"}`);
  console.log(`Apps Script bridge: ${isAppsScriptConfigured() ? "enabled" : "not configured"}`);
  console.log(`Google Sheets integration: ${isSheetsConfigured() ? "enabled" : "not configured, using sample data"}`);
});
