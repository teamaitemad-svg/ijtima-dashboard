const { appendValues, getValues, isSheetsConfigured } = require("./sheetsClient");

const tabs = {
  users: "Users",
  masterMembers: "Master Members",
  schedule: "Schedule",
  announcements: "Announcements",
  members: "Members",
  attendance: "Attendance",
  rankings: "Halqa Rankings",
  competitions: "Competition Results",
};

function truthy(value) {
  return ["true", "yes", "y", "1", "present", "registered"].includes(String(value || "").trim().toLowerCase());
}

function number(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function mapRows(rows, mapper) {
  return rows.filter((row) => row.some(Boolean)).map(mapper);
}

async function readUsers(fallbackUsers) {
  if (!isSheetsConfigured()) {
    return fallbackUsers;
  }

  const rows = await getValues(tabs.users, "A2:F");
  const sheetUsers = mapRows(rows, (row) => ({
    username: row[0],
    password: row[1],
    name: row[2],
    role: row[3],
    halqa: row[4] || undefined,
    access: row[5] || (row[4] ? `${row[4]} only` : ""),
  }));

  return sheetUsers.length ? sheetUsers : fallbackUsers;
}

async function readBootstrap(fallback) {
  if (!isSheetsConfigured()) {
    return fallback;
  }

  const [scheduleRows, announcementRows, masterMemberRows, memberRows, attendanceRows, rankingRows, competitionRows] = await Promise.all([
    getValues(tabs.schedule, "A1:G"),
    getValues(tabs.announcements, "A2:D"),
    getValues(tabs.masterMembers, "A2:D").catch(() => []),
    getValues(tabs.members, "A2:F"),
    getValues(tabs.attendance, "A2:E"),
    getValues(tabs.rankings, "A2:F"),
    getValues(tabs.competitions, "A2:E"),
  ]);

  const scheduleHeaders = (scheduleRows[0] || []).map((header) => String(header || "").trim().toLowerCase());
  const hasScheduleDate = scheduleHeaders.includes("date");
  const scheduleValueRows = scheduleHeaders.includes("start") ? scheduleRows.slice(1) : scheduleRows;
  const scheduleItems = mapRows(scheduleValueRows, (row) => ({
    date: hasScheduleDate ? row[scheduleHeaders.indexOf("date")] : "",
    start: hasScheduleDate ? row[scheduleHeaders.indexOf("start")] : row[0],
    end: hasScheduleDate ? row[scheduleHeaders.indexOf("end")] : row[1],
    title: hasScheduleDate ? row[scheduleHeaders.indexOf("title")] : row[2],
    location: hasScheduleDate ? row[scheduleHeaders.indexOf("location")] : row[3],
    lead: hasScheduleDate ? row[scheduleHeaders.indexOf("lead")] : row[4],
    status: (hasScheduleDate ? row[scheduleHeaders.indexOf("status")] : row[5]) || "Upcoming",
  }));

  const announcements = mapRows(announcementRows, (row) => ({
    title: row[0],
    message: row[1],
    time: row[2],
    priority: row[3] || "Info",
  }));

  const masterMemberRecords = mapRows(masterMemberRows, (row) => ({
    code: row[0],
    name: row[1],
    halqa: row[2],
    phone: row[3] || "",
    source: "master",
  }));

  const registrationRecords = mapRows(memberRows, (row) => ({
    code: row[0],
    name: row[1],
    halqa: row[2],
    registered: row[3] === undefined || row[3] === "" ? true : truthy(row[3]),
    attended: truthy(row[4]),
    checkIn: row[5] || "",
    source: "registration",
  }));
  const registrationByCode = new Map(registrationRecords.map((member) => [String(member.code || "").trim(), member]));
  const sourceMembers = masterMemberRecords.length ? masterMemberRecords : fallback.masterMemberRecords || fallback.memberRecords;
  const memberRecords = sourceMembers.map((member) => {
    const registration = registrationByCode.get(String(member.code || "").trim());
    return {
      ...member,
      registered: Boolean(registration?.registered),
      attended: Boolean(registration?.attended || member.attended),
      checkIn: registration?.checkIn || member.checkIn || "",
      registrationName: registration?.name || "",
    };
  });

  registrationRecords.forEach((registration) => {
    const hasMasterMember = memberRecords.some((member) => String(member.code || "").trim() === String(registration.code || "").trim());
    if (!hasMasterMember) {
      memberRecords.push({ ...registration, source: "registration-only" });
    }
  });

  const attendanceRecords = mapRows(attendanceRows, (row) => ({
    code: row[0],
    name: row[1],
    halqa: row[2],
    checkIn: row[3],
    checkedInBy: row[4],
  }));

  const halqaRankings = mapRows(rankingRows, (row) => ({
    halqa: row[0],
    attendance: number(row[1]),
    education: number(row[2]),
    sports: number(row[3]),
    total: row[4] ? number(row[4]) : Math.round(number(row[1]) * 0.5 + number(row[2]) + number(row[3])),
    rank: number(row[5]),
  }))
    .sort((a, b) => (a.rank || 999) - (b.rank || 999) || b.total - a.total)
    .map((item, index) => ({ ...item, rank: item.rank || index + 1 }));

  const competitionResults = mapRows(competitionRows, (row) => ({
    category: row[0],
    competition: row[1],
    position: row[2],
    name: row[3],
    halqa: row[4],
  }));

  return {
    ...fallback,
    scheduleItems: scheduleItems.length ? scheduleItems : fallback.scheduleItems,
    announcements: announcements.length ? announcements : fallback.announcements,
    masterMemberRecords: masterMemberRecords.length ? masterMemberRecords : fallback.masterMemberRecords || fallback.memberRecords,
    registrationRecords: registrationRecords.length ? registrationRecords : fallback.registrationRecords || fallback.memberRecords,
    memberRecords: memberRecords.length ? memberRecords : fallback.memberRecords,
    attendanceRecords: attendanceRecords.length ? attendanceRecords : fallback.attendanceRecords,
    halqaRankings: halqaRankings.length ? halqaRankings : fallback.halqaRankings,
    competitionResults: competitionResults.length ? competitionResults : fallback.competitionResults,
  };
}

async function appendScheduleItem(item) {
  if (!isSheetsConfigured()) {
    return;
  }

  const headerRows = await getValues(tabs.schedule, "A1:G").catch(() => []);
  const headers = (headerRows[0] || []).map((header) => String(header || "").trim().toLowerCase());

  if (headers.includes("date")) {
    await appendValues(tabs.schedule, "A:G", [[item.date, item.start, item.end, item.title, item.location, item.lead, item.status]]);
    return;
  }

  await appendValues(tabs.schedule, "A:F", [[item.start, item.end, item.title, item.location, item.lead, item.status]]);
}

async function appendAnnouncement(item) {
  if (!isSheetsConfigured()) {
    return;
  }

  await appendValues(tabs.announcements, "A:D", [[item.title, item.message, item.time, item.priority]]);
}

async function appendAttendance(record) {
  if (!isSheetsConfigured()) {
    return;
  }

  await appendValues(tabs.attendance, "A:E", [[record.code, record.name, record.halqa, record.checkIn, record.checkedInBy]]);
}

module.exports = {
  appendAnnouncement,
  appendAttendance,
  appendScheduleItem,
  isSheetsConfigured,
  readBootstrap,
  readUsers,
  tabs,
};
