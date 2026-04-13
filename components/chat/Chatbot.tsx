// components/chat/Chatbot.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Intent = "accommodation" | "food" | "both";

/**
 * init            — greeting shown; user selects Student or Traveller
 * student-service — logged-in STUDENT with university; selects service type (auto-search)
 * service         — Traveller selects service type
 * location        — Traveller (or student follow-up) types a location
 */
type Step = "init" | "student-service" | "service" | "location";

type BotButton = {
  label: string;
  action: string;
  color?: "blue" | "green" | "purple" | "gray" | "red";
};

type ChatMessage = {
  sender: "user" | "bot";
  text: string;
  buttons?: BotButton[];
};

// ─── Button colour map ────────────────────────────────────────────────────────

const BTN: Record<string, string> = {
  blue:   "bg-blue-600 hover:bg-blue-700 text-white",
  green:  "bg-green-600 hover:bg-green-700 text-white",
  purple: "bg-purple-600 hover:bg-purple-700 text-white",
  red:    "bg-red-500 hover:bg-red-600 text-white",
  gray:   "bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300",
};

// ─── University value → display label map ────────────────────────────────────
// Keys match what the registration form stores in User.university

const UNIVERSITY_MAP: Record<string, string> = {
  iit_bombay:          "IIT Bombay",
  iit_delhi:           "IIT Delhi",
  bits_pilani:         "BITS Pilani",
  nit_trichy:          "NIT Trichy",
  aiims_delhi:         "AIIMS Delhi",
  pgimer_chandigarh:   "PGIMER Chandigarh",
  jipmer_puducherry:   "JIPMER Puducherry",
  kmc_manipal:         "KMC Manipal",
};

/** Convert the stored DB value (e.g. "iit_bombay") to a search-friendly label.
 *  If it is already a plain name (from profile edit), it is returned as-is. */
function getUniversityLabel(raw: string): string {
  if (!raw) return "";
  const key = raw.toLowerCase().replace(/\s+/g, "_");
  return UNIVERSITY_MAP[key] ?? raw;
}

// ─── Greeting builder (session-aware) ────────────────────────────────────────

function buildGreeting(session: any): { message: ChatMessage; initialStep: Step } {
  const userType    = (session?.user as any)?.userType  as string | undefined;
  const uniRaw      = (session?.user as any)?.university as string | undefined;
  const firstName   = session?.user?.name?.split(" ")[0] || "";

  // ── Logged-in STUDENT with a university set in profile ─────────────────────
  if (userType === "STUDENT" && uniRaw) {
    const uniLabel = getUniversityLabel(uniRaw);
    return {
      initialStep: "student-service",
      message: {
        sender: "bot",
        text:
          `👋 Hi ${firstName}! I can automatically find accommodation and food services` +
          ` near ${uniLabel} — your registered university.\n\nWhat are you looking for?`,
        buttons: [
          { label: "🏠  Accommodation",              action: "student-service:accommodation", color: "blue"   },
          { label: "🍱  Food Services",              action: "student-service:food",          color: "purple" },
          { label: "🔍  Both",                       action: "student-service:both",          color: "gray"   },
        ],
      },
    };
  }

  // ── Logged-in STUDENT but no university set ─────────────────────────────────
  if (userType === "STUDENT" && !uniRaw) {
    return {
      initialStep: "init",
      message: {
        sender: "bot",
        text:
          `👋 Hi ${firstName}! Your profile does not have a university set.\n\n` +
          `Update your profile for automatic nearby suggestions, or search manually as a traveller.`,
        buttons: [
          { label: "👤  Update Profile",  action: "nav:/profile",      color: "blue" },
          { label: "✈️  Search Manually", action: "role:traveller",    color: "gray" },
        ],
      },
    };
  }

  // ── Not logged in, or property owner (owner functionality removed) ──────────
  return {
    initialStep: "init",
    message: {
      sender: "bot",
      text:
        "👋 Hi! I am EduBot, your accommodation assistant.\n\n" +
        "I help you find PGs, hostels, flats, and food services near universities and cities.\n\n" +
        "Who are you?",
      buttons: [
        { label: "🎓  I am a Student",   action: "role:student",   color: "blue"  },
        { label: "✈️  I am a Traveller", action: "role:traveller", color: "green" },
      ],
    },
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Chatbot() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [isOpen,      setIsOpen]      = useState(false);
  const [messages,    setMessages]    = useState<ChatMessage[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [input,       setInput]       = useState("");
  const [isLoading,   setIsLoading]   = useState(false);
  const [step,        setStep]        = useState<Step>("init");
  const [intent,      setIntent]      = useState<Intent>("both");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── Build greeting once session is resolved ─────────────────────────────────
  useEffect(() => {
    if (status === "loading") return;
    if (!initialized) {
      const { message, initialStep } = buildGreeting(session);
      setMessages([message]);
      setStep(initialStep);
      setInitialized(true);
    }
  }, [status, session, initialized]);

  // ── Auto-scroll ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const pushMessages = (msgs: ChatMessage[]) =>
    setMessages((prev) => [...prev, ...msgs]);

  // ── DB search (calls /api/chatbot) ──────────────────────────────────────────

  const searchLocation = async (location: string, currentIntent: Intent) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: location, intent: currentIntent }),
      });

      const data = await res.json();
      const found = (data.count ?? 0) > 0;

      const afterButtons: BotButton[] = [
        { label: "🔍  Search Another Location", action: "search_again", color: "blue" },
        ...(found && (currentIntent === "accommodation" || currentIntent === "both")
          ? [{ label: "📋  All Accommodation", action: "nav:/student/accommodation", color: "gray" as const }]
          : []),
        ...(found && (currentIntent === "food" || currentIntent === "both")
          ? [{ label: "🍱  All Food Services", action: "nav:/student/food", color: "gray" as const }]
          : []),
        { label: "🔄  Start Over", action: "start_over", color: "gray" },
      ];

      pushMessages([{
        sender: "bot",
        text:    data.reply ?? "⚠️ Unexpected error. Please try again.",
        buttons: afterButtons,
      }]);
    } catch {
      pushMessages([{
        sender: "bot",
        text: "⚠️ Network error. Please check your connection and try again.",
        buttons: [
          { label: "🔍  Try Again",  action: "search_again", color: "blue" },
          { label: "🔄  Start Over", action: "start_over",   color: "gray" },
        ],
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Central action dispatcher ───────────────────────────────────────────────

  const handleAction = async (action: string) => {
    if (action.startsWith("nav:")) {
      setIsOpen(false);
      router.push(action.slice(4));
      return;
    }

    switch (action) {

      // ── role:student — not logged in, show login prompt ─────────────────────
      case "role:student":
        const isLoggedIn = status === "authenticated" && !!session?.user;
        const currentUserType = (session?.user as any)?.userType as string | undefined;

        if (!isLoggedIn) {
          pushMessages([
            { sender: "user", text: "🎓  I am a Student" },
            {
              sender: "bot",
              text:
                "Students get automatic location suggestions based on their registered university.\n\n" +
                "Please log in with your student account to use this feature.",
              buttons: [
                { label: "🔑  Login",        action: "nav:/auth/login",     color: "blue"  },
                { label: "📝  Register",      action: "nav:/auth/register",  color: "green" },
                { label: "🔄  Start Over",    action: "start_over",          color: "gray"  },
              ],
            },
          ]);
          break;
        }

        if (currentUserType !== "STUDENT") {
          pushMessages([
            { sender: "user", text: "🎓  I am a Student" },
            {
              sender: "bot",
              text:
                "You are currently logged in with a non-student account.\n\n" +
                "Please login or register as a student to continue.",
              buttons: [
                { label: "🔑  Login",        action: "nav:/auth/login",     color: "blue"  },
                { label: "📝  Register",      action: "nav:/auth/register",  color: "green" },
                { label: "🔄  Start Over",    action: "start_over",          color: "gray"  },
              ],
            },
          ]);
          break;
        }

        pushMessages([
          { sender: "user", text: "🎓  I am a Student" },
          {
            sender: "bot",
            text: "Great! What are you looking for today?",
            buttons: [
              { label: "🏠  Accommodation", action: "student-service:accommodation", color: "blue" },
              { label: "🍱  Food Services", action: "student-service:food",          color: "purple" },
              { label: "🔍  Both",          action: "student-service:both",          color: "gray" },
            ],
          },
        ]);
        setStep("student-service");
        break;

      // ── role:traveller — manual location search ─────────────────────────────
      case "role:traveller":
        pushMessages([
          { sender: "user", text: "✈️  I am a Traveller" },
          {
            sender: "bot",
            text: "Welcome, Traveller! 🌍\n\nWhat are you looking for?",
            buttons: [
              { label: "🏠  Accommodation\n(PG / Hostel / Flat)", action: "service:accommodation", color: "blue"   },
              { label: "🍱  Food Services\n(Mess / Tiffin / Cafe)", action: "service:food",        color: "purple" },
              { label: "🔍  Both",                                   action: "service:both",       color: "gray"   },
            ],
          },
        ]);
        setStep("service");
        break;

      // ── student-service:* — auto-search using registered university ──────────
      case "student-service:accommodation":
      case "student-service:food":
      case "student-service:both": {
        const uniRaw   = (session?.user as any)?.university ?? "";
        const uniLabel = getUniversityLabel(uniRaw);

        if (!uniLabel) {
          pushMessages([{
            sender: "bot",
            text: "❌ Could not read your university. Please update your profile.",
            buttons: [
              { label: "👤  Update Profile", action: "nav:/profile", color: "blue" },
              { label: "🔄  Start Over",     action: "start_over",   color: "gray" },
            ],
          }]);
          setStep("init");
          break;
        }

        const newIntent: Intent =
          action === "student-service:accommodation" ? "accommodation" :
          action === "student-service:food"          ? "food"          : "both";

        const label =
          newIntent === "accommodation" ? "🏠  Accommodation" :
          newIntent === "food"          ? "🍱  Food Services" : "🔍  Both";

        setIntent(newIntent);
        setStep("location");
        pushMessages([
          { sender: "user", text: label },
          { sender: "bot",  text: `🔍 Searching near ${uniLabel} (your registered university)...` },
        ]);
        await searchLocation(uniLabel, newIntent);
        break;
      }

      // ── Traveller service type selection ────────────────────────────────────
      case "service:accommodation":
        setIntent("accommodation");
        pushMessages([
          { sender: "user", text: "🏠  Accommodation" },
          {
            sender: "bot",
            text:
              "🏠 Looking for accommodation!\n\n" +
              "Type the city, area, or university you are near and I will find matching listings.\n\n" +
              "📌 e.g., IIT Bombay, Mumbai, Delhi, Chandigarh",
          },
        ]);
        setStep("location");
        break;

      case "service:food":
        setIntent("food");
        pushMessages([
          { sender: "user", text: "🍱  Food Services" },
          {
            sender: "bot",
            text:
              "🍱 Looking for food services!\n\n" +
              "Type the city, area, or university you are near.\n\n" +
              "📌 e.g., Mumbai, Delhi, IIT Bombay, Manipal",
          },
        ]);
        setStep("location");
        break;

      case "service:both":
        setIntent("both");
        pushMessages([
          { sender: "user", text: "🔍  Both — Accommodation & Food" },
          {
            sender: "bot",
            text:
              "🔍 Searching for both accommodation and food!\n\n" +
              "Type the city, area, or university you are near.",
          },
        ]);
        setStep("location");
        break;

      // ── Post-results actions ────────────────────────────────────────────────
      case "search_again":
        pushMessages([
          { sender: "user", text: "🔍  Search another location" },
          { sender: "bot",  text: "Sure! Enter the city, area or university name to search." },
        ]);
        setStep("location");
        break;

      case "start_over": {
        const { message, initialStep } = buildGreeting(session);
        setMessages([message]);
        setStep(initialStep);
        setIntent("both");
        break;
      }

      default:
        break;
    }
  };

  // ── Text input handler ──────────────────────────────────────────────────────

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");

    // hi / hello / restart → always reset
    if (/^(hi|hello|hey|start|restart|reset)$/i.test(text)) {
      const { message, initialStep } = buildGreeting(session);
      setMessages([message]);
      setStep(initialStep);
      setIntent("both");
      return;
    }

    // ── Location search (traveller manual input or student follow-up) ─────────
    if (step === "location") {
      pushMessages([{ sender: "user", text }]);
      await searchLocation(text, intent);
      return;
    }

    // ── Natural language at greeting (init) ───────────────────────────────────
    if (step === "init") {
      pushMessages([{ sender: "user", text }]);
      if (/student|study|university|college/i.test(text)) {
        await handleAction("role:student");
      } else if (/travel|tourist|visit|passing|traveller/i.test(text)) {
        await handleAction("role:traveller");
      } else if (/accommodation|pg|hostel|flat|food|mess|tiffin/i.test(text)) {
        await handleAction("role:traveller");
      } else {
        pushMessages([{
          sender: "bot",
          text: "Please select your role using the buttons above, or type 'hi' to restart.",
        }]);
      }
      return;
    }

    // ── Natural language at traveller service selection ───────────────────────
    if (step === "service") {
      pushMessages([{ sender: "user", text }]);
      if (/food|mess|canteen|tiffin|eat|restaurant|cafe/i.test(text)) {
        await handleAction("service:food");
      } else if (/accommodation|pg|hostel|flat|room|stay|rent/i.test(text)) {
        await handleAction("service:accommodation");
      } else if (/both/i.test(text)) {
        await handleAction("service:both");
      } else {
        pushMessages([{
          sender: "bot",
          text: "Please choose what you are looking for using the buttons above.",
        }]);
      }
      return;
    }

    // ── Natural language at student service selection ─────────────────────────
    if (step === "student-service") {
      pushMessages([{ sender: "user", text }]);
      if (/food|mess|canteen|tiffin|eat|restaurant|cafe/i.test(text)) {
        await handleAction("student-service:food");
      } else if (/accommodation|pg|hostel|flat|room|stay|rent/i.test(text)) {
        await handleAction("student-service:accommodation");
      } else {
        await handleAction("student-service:both");
      }
      return;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Input is shown when the traveller (or student follow-up) needs to type a location
  const showInput = step === "location";

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="relative">
      {/* Floating chat bubble */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white p-4 rounded-full shadow-xl hover:bg-blue-700 transition-colors"
          aria-label="Open EduBot chat"
          title="EduBot — Find accommodation & food"
        >
          💬
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="w-96 h-[540px] rounded-2xl shadow-2xl bg-white flex flex-col overflow-hidden border border-gray-200">

          {/* Header */}
          <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-base">🤖</div>
              <div>
                <div className="font-semibold text-sm leading-tight">EduBot</div>
                <div className="text-xs opacity-75 leading-tight">Accommodation Assistant</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-blue-500 transition-colors text-white"
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50 min-h-0">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                {/* Bubble */}
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.sender === "user"
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-white text-gray-800 border border-gray-100 rounded-bl-none"
                  }`}
                  style={{ whiteSpace: "pre-line" }}
                >
                  {msg.text}
                </div>

                {/* Action buttons */}
                {msg.buttons && msg.buttons.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%]">
                    {msg.buttons.map((btn, bi) => (
                      <button
                        key={bi}
                        onClick={() => handleAction(btn.action)}
                        disabled={isLoading}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors leading-tight ${BTN[btn.color ?? "gray"]} disabled:opacity-50`}
                        style={{ whiteSpace: "pre-line" }}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex items-start">
                <div className="bg-white border border-gray-100 shadow-sm px-3 py-2 rounded-2xl rounded-bl-none text-sm text-gray-400 italic">
                  EduBot is searching...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="p-3 border-t bg-white flex-shrink-0">
            {showInput ? (
              <div className="flex gap-2">
                <input
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50 bg-gray-50"
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter city, area or university..."
                  disabled={isLoading}
                  autoFocus
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="bg-blue-600 text-white px-4 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? "..." : "Search"}
                </button>
              </div>
            ) : (
              <p className="text-center text-xs text-gray-400 py-1">
                Use the buttons above  •  or type <span className="font-medium text-blue-500">hi</span> to restart
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
