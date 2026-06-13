export type Message = {
  id: string;
  role: "bot" | "user";
  content: string;
  bullets?: string[];
  citations?: { id: number; title: string; pages: string; type: string }[];
};

export type Session = {
  id: string;
  title: string;
  time: string;
  date: string;
  msgs: number;
  status: "active" | "done";
  starred: boolean;
};

// ── Seed messages per session ────────────────────────────────────────────────

const greetingMsg = (id: string): Message => ({
  id,
  role: "bot",
  content: "Xin chào! Tôi là StudyMate AI. Bạn cần tôi giúp gì trong phiên học này?",
});

export const seedMessages: Record<string, Message[]> = {
  "1": [
    {
      id: "m1",
      role: "bot",
      content: "Xin chào! Chúng ta cùng ôn lại Chương 3 — Phân tích yêu cầu phần mềm nhé.",
    },
    { id: "m2", role: "user", content: "Use case diagram là gì?" },
    {
      id: "m3",
      role: "bot",
      content: "Use case diagram là sơ đồ mô tả các tương tác giữa actor và hệ thống.",
      bullets: [
        "**Actor:** Người dùng hoặc hệ thống bên ngoài tương tác với hệ thống.",
        "**Use Case:** Một chức năng hoặc tính năng của hệ thống.",
        "**Relationship:** Mối liên kết giữa actor và use case.",
      ],
      citations: [
        { id: 1, title: "Phân tích yêu cầu phần mềm.pdf", pages: "Trang 12-15", type: "PDF" },
      ],
    },
  ],
  "2": [
    {
      id: "m1",
      role: "bot",
      content: "Chào bạn! Hôm nay chúng ta so sánh MVC và MVVM.",
    },
    { id: "m2", role: "user", content: "Sự khác nhau cơ bản giữa MVC và MVVM là gì?" },
    {
      id: "m3",
      role: "bot",
      content: "Hai kiến trúc này có sự khác biệt ở tầng trung gian:",
      bullets: [
        "**MVC (Controller):** Controller xử lý input và cập nhật Model, sau đó View tự render.",
        "**MVVM (ViewModel):** ViewModel bind hai chiều với View, không cần Controller.",
        "**Ưu điểm MVVM:** Dễ test hơn, tách biệt logic UI tốt hơn.",
      ],
    },
  ],
  "3": [
    greetingMsg("m1"),
    { id: "m2", role: "user", content: "Giải thích kiến trúc microservices?" },
    {
      id: "m3",
      role: "bot",
      content: "Microservices là kiến trúc chia ứng dụng thành các dịch vụ nhỏ, độc lập.",
      citations: [{ id: 1, title: "Kiến trúc phần mềm.pdf", pages: "Chương 5", type: "PDF" }],
    },
  ],
  "4": [
    greetingMsg("m1"),
    { id: "m2", role: "user", content: "Vẽ use case cho hệ thống đặt vé." },
    {
      id: "m3",
      role: "bot",
      content: "Hệ thống đặt vé cần các actor: Khách hàng, Quản trị viên, Hệ thống thanh toán...",
    },
  ],
  "5": [
    greetingMsg("m1"),
    { id: "m2", role: "user", content: "Quy trình Scrum hoạt động như thế nào?" },
    {
      id: "m3",
      role: "bot",
      content: "Scrum chia công việc thành các Sprint ngắn (1-4 tuần).",
      bullets: [
        "**Sprint Planning:** Chọn user stories từ Product Backlog.",
        "**Daily Scrum:** Họp 15 phút mỗi ngày.",
        "**Sprint Review & Retrospective:** Đánh giá và cải tiến sau mỗi sprint.",
      ],
    },
  ],
  "6": [
    greetingMsg("m1"),
    { id: "m2", role: "user", content: "Cách viết test case cho module thanh toán?" },
    {
      id: "m3",
      role: "bot",
      content:
        "Test case cần bao gồm các kịch bản: thanh toán thành công, thất bại, hết hạn thẻ...",
    },
  ],
};

// ── Session list (mutable so new sessions can be pushed) ─────────────────────

export const sessionList: Session[] = [
  {
    id: "1",
    title: "Chương 3 — Phân tích yêu cầu phần mềm",
    time: "2 giờ trước",
    date: "Hôm nay",
    msgs: 14,
    status: "active",
    starred: true,
  },
  {
    id: "2",
    title: "Sự khác nhau giữa MVC và MVVM",
    time: "Hôm qua",
    date: "Hôm qua",
    msgs: 22,
    status: "done",
    starred: false,
  },
  {
    id: "3",
    title: "Tóm tắt kiến trúc microservices",
    time: "2 ngày trước",
    date: "Tuần này",
    msgs: 9,
    status: "done",
    starred: true,
  },
  {
    id: "4",
    title: "Use case cho hệ thống đặt vé",
    time: "3 ngày trước",
    date: "Tuần này",
    msgs: 31,
    status: "done",
    starred: false,
  },
  {
    id: "5",
    title: "Quy trình Scrum và vai trò",
    time: "5 ngày trước",
    date: "Tuần này",
    msgs: 12,
    status: "done",
    starred: false,
  },
  {
    id: "6",
    title: "Test case cho module thanh toán",
    time: "1 tuần trước",
    date: "Trước đó",
    msgs: 18,
    status: "done",
    starred: false,
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

export function getMessages(sessionId: string): Message[] {
  return (
    seedMessages[sessionId] ?? [
      {
        id: "init",
        role: "bot",
        content:
          "Xin chào! Tôi là StudyMate AI, trợ lý học tập của bạn. Bạn cần tôi giúp gì hôm nay?",
      },
    ]
  );
}

export function addMessage(sessionId: string, msg: Message) {
  if (!seedMessages[sessionId]) seedMessages[sessionId] = [];
  seedMessages[sessionId].push(msg);
}

export function createSession(title = "Phiên chat mới"): Session {
  const id = Date.now().toString();
  const newSession: Session = {
    id,
    title,
    time: "Vừa xong",
    date: "Hôm nay",
    msgs: 0,
    status: "active",
    starred: false,
  };
  sessionList.unshift(newSession);
  seedMessages[id] = [
    {
      id: "init",
      role: "bot",
      content: "Xin chào! Tôi là StudyMate AI. Bạn muốn học gì hôm nay?",
    },
  ];
  return newSession;
}

export function deleteSession(id: string) {
  const index = sessionList.findIndex((s) => s.id === id);
  if (index !== -1) {
    sessionList.splice(index, 1);
  }
  delete seedMessages[id];
}
