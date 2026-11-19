// Pages open over the grid. The kind decides how.
//
// slim       A narrow column. About, Team, and other reading.
// takeover   A wide sheet with margins, so the grid still shows around it. Gallery.
// rearrange  No sheet. The grid itself moves. News.
//
// navTitle   Replaces the department name in the top bar while the page is open.

export const pages = {
  about: {
    id: "about",
    kind: "slim",
    label: "About",
    navTitle: "About",
    title:
      "We keep the Figma Design department on one board, so the work in progress can sit out where we can see it. We design Figma, and we also keep a room for the work while it is still moving. A launch is one kind of truth. The board is another: the studies, the type, the pictures, and the pages that are not ready to leave the room. We put them out because looking changes the work. A thing kept in a file can be defended. A thing on the board has to hold up next to its neighbors, in the light, at the size a person will actually meet it. That is a kinder test than a meeting, and a stricter one. What follows is how we try to work. These are not rules, and they are not a brand. They are the ideas we come back to when a study is still finding its shape, and when we have to decide what a page is for.",
    sections: [
      {
        heading: "Show the work",
        body: "A study belongs where people can see it. We would rather put an unfinished thing on the board than wait until it can introduce itself. Waiting for polish is a way of hiding. The work gets better when someone else can point at it, and it gets worse when the only audience is the person who made it. Showing the work is also a kind of respect. The department is not a row of private desks. If a question is worth our time, it is worth a place on the board, even when the answer is still clumsy. The clumsiness is information. It tells us what we actually believe, before we have had time to tidy the belief into a story.",
      },
      {
        heading: "At the right size",
        body: "Type, pictures, and layout get judged at the size they will be read. A thumbnail is a map. It can tell you where something sits, and it cannot tell you whether the thing is any good. We have been fooled by small pictures often enough to stop trusting them. Scale changes the argument. A headline that feels calm in a frame can shout when it becomes a page. A margin that looks generous on a laptop can disappear in the hand. So we try to meet the work where a person will actually meet it, and we let that meeting decide what stays.",
      },
      {
        heading: "Leave air",
        body: "The space around a card is part of the page. Edges do not have to touch for two things to belong together. Air is not what is left over after the content is placed. It is how one object keeps its name when another object is nearby. We would rather a board feel a little empty than a little desperate. Crowding asks the eye to work before the mind has been invited in. The gap is where a person decides to stay. If everything is asking at once, nothing gets heard, and the page starts to argue with itself.",
      },
      {
        heading: "Say it plainly",
        body: "We write the way we talk about the work. A sentence should name the thing, and then stop. Decoration in language spends the same attention that decoration in a layout spends. If a paragraph cannot be read aloud in the room, it is not finished. Plain is not the same as simple, and it is not cold. It takes longer to say a precise thing in ordinary words than to borrow a grand one. We would rather be understood by the person who just walked in than admired by the person who already agrees.",
      },
      {
        heading: "Look together",
        body: "The board is a table, not a folder. A folder sorts work so it can be found later. A table puts work where it can be argued with now. The department looks at what is up, and a card is an invitation to do that looking in public, without waiting for a review to make it official. Taste that never leaves one person's head becomes a private weather system. Shared looking is how a department gets a memory. We remember what we stood in front of together, not what we described in a document no one opened. The board is that memory, still in the room.",
      },
      {
        heading: "Keep it open",
        body: "Nothing here is sealed. A page can stay, change, or come down once it has been seen enough. Permanence is a kind of vanity. Some studies need a week. Some need a season. The board should be able to tell the difference without a ceremony. Open also means we can be wrong in front of each other. A direction that looked right on Tuesday can look thin on Friday, and taking it down is not a failure. It is the reason for having the work out where we can see it. A closed page can only be admired. An open one can still be changed.",
      },
    ],
  },
}
