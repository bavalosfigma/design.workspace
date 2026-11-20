const guests = [
  { id: "lead", name: "Noah", color: "#007BE5", top: "6%", left: "4%", fromX: "34px", fromY: "48px", delay: "80ms" },
  { id: "mark", name: "Taryn", color: "#14AE5C", top: "-4%", left: "62%", fromX: "24px", fromY: "55px", delay: "180ms" },
  { id: "note", name: "Kat", color: "#FF24BD", top: "58%", left: "7%", fromX: "45px", fromY: "27px", delay: "270ms" },
  { id: "close", name: "Rogie", color: "#FFCD29", top: "70%", left: "58%", fromX: "31px", fromY: "41px", delay: "360ms" },
]

export const introCursors = guests.map((guest) => ({
  id: guest.id,
  name: guest.name,
  color: guest.color,
  style: {
    top: guest.top,
    left: guest.left,
    "--from-x": guest.fromX,
    "--from-y": guest.fromY,
    "--delay": guest.delay,
  },
}))
