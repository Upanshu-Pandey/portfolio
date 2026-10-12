// src/world/maps/town.ts
// ─── Upanshu Town: the overworld hub ───
// Legend: . grass  , tall grass  : path  o plaza  ~ water  = pier  * flowers
//         # fence  b bush  r rock  L ledge (hop down)  T tree (2×2 blocks)

import type { MapDef } from "../types.ts";

export const town: MapDef = {
  id: "town",
  name: "Upanshu Town",
  outdoor: true,
  tiles: [
    "TTTTTTTTTTTTTTTTTTTT.::.TTTTTTTTTTTTTTTTTTTT",
    "TTTTTTTTTTTTTTTTTTTT.::.TTTTTTTTTTTTTTTTTTTT",
    "TT............TTTT...::...TTTT........TT..TT",
    "TT............TTTT...::...TTTT........TT..TT",
    "TT...................::...................TT",
    "TT.##########........::...................TT",
    "TT.........**........::.....**........**..TT",
    "TT.**......**........::.....**........**..TT",
    "TT.**......**........::.....**........**..TT",
    "TT.**................::...................TT",
    "TT...................::...................TT",
    "TT..::::::::::::::::::::::::::::::::::::..TT",
    "TT..::::::::::::::::::::::::::::::::::::..TT",
    "TT..*******....b.....::.....b.............TT",
    "TT..~~~=~~~.....oooooooooooo..,,,,,,,,,,..TT",
    "TT..~~~=~~~.....oooooooooooo..,,,,,,,,,,..TT",
    "TT..~~~~~~~.....oooooooooooo..,,,,,,,,,,..TT",
    "TT..~~~~~~~.....oooooooooooo..,,,,,,,,,,..TT",
    "TT............b.oooooooooooo.LLLLLLLLLLL..TT",
    "TT.r............oooooooooooo............b.TT",
    "TT...........**.oooooooooooo...........r..TT",
    "TT...........**.oooooooooooo..............TT",
    "TT...........**.oooooooooooo..............TT",
    "TT...........**......::...................TT",
    "TT.b.................::................b..TT",
    "TT..::::::::::::::::::::::::::::::::::::..TT",
    "TT..::::::::::::::::::::::::::::::::::::..TT",
    "TT......................................r.TT",
    "TT...*************........*************...TT",
    "TT..###############......###############..TT",
    "TTTT......................................TT",
    "TTTT......................................TT",
    "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
    "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
  ],
  props: [
    { kind: "house", x: 5, y: 6 },
    { kind: "observatory", x: 14, y: 6 },
    { kind: "consultancy", x: 31, y: 6 },
    { kind: "townHall", x: 4, y: 19 },
    { kind: "platform", x: 31, y: 20 },
    { kind: "fountain", x: 20, y: 16, talk: { say: ["The fountain sparkles in the sun.\nSomeone tossed in a coin… and a USB stick?"] } },
    { kind: "lamp", x: 19, y: 13 }, { kind: "lamp", x: 24, y: 13 },
    { kind: "lamp", x: 19, y: 24 }, { kind: "lamp", x: 24, y: 24 },
    { kind: "lamp", x: 13, y: 10 }, { kind: "lamp", x: 29, y: 10 },
    {
      kind: "sign", x: 21, y: 21,
      talk: {
        say: [
          "WELCOME TO UPANSHU TOWN!\nHome of UPANSHU PANDEY:\nERP Consultant & Full-Stack Developer.",
          "ARROWS / WASD: walk     SHIFT: run\nSPACE / ENTER / Z: talk and read\nESC: open the menu",
          "Short on time? The menu (ESC, or the MENU\nbutton) has every project, the résumé\nand quick travel.",
        ],
        then: { kind: "menu" },
        ask: "Open the menu now?",
      },
    },
    { kind: "sign", x: 19, y: 4, talk: { say: ["UPANSHU TOWN\n\"Where ERP meets full-stack.\""] } },
    {
      kind: "sign", x: 24, y: 2,
      talk: {
        say: ["NORTH ROAD - NEXT ADVENTURE\nUpanshu is open to new roles.", "Hiring? His contact details are\nin the RÉSUMÉ."],
        then: { kind: "panel", id: "contact" },
        ask: "Show contact details?",
      },
    },
    { kind: "sign", x: 13, y: 24, talk: { say: ["TOWN HALL\nMeet the mayor · Career timeline · CV"] } },
    { kind: "sign", x: 30, y: 10, talk: { say: ["CONSULTANCY OFFICE\nBusiness Central client case files."] } },
    { kind: "sign", x: 30, y: 24, talk: { say: ["THE PLATFORM\nAn AI analytics platform, part by part."] } },
    { kind: "sign", x: 20, y: 10, talk: { say: ["OBSERVATORY\nDissertation & personal projects."] } },
    { kind: "mailbox", x: 11, y: 10, talk: { say: ["UPANSHU'S HOUSE\nThe mailbox is empty.\nThere's plenty of room for your message!"] } },
  ],
  npcs: [
    {
      id: "guide", outfit: "guide", x: 25, y: 18, dir: "left", wander: true,
      talk: {
        say: [
          "Hi there! First time in UPANSHU TOWN?",
          "South-west is the TOWN HALL. The mayor\nknows all about Upanshu, and his CV\nis there too!",
          "South-east is THE PLATFORM: the AI\nanalytics product he helped build.",
          "North-east is the CONSULTANCY OFFICE:\nhis Business Central client work.",
          "Up north is the OBSERVATORY: his\ndissertation and personal projects.",
          "Short on time? Press ESC. The menu can\ntake you straight to any building.",
        ],
      },
    },
    {
      id: "kid", outfit: "kid", x: 29, y: 15, dir: "down", wander: true,
      talk: {
        say: [
          "I tried to run a report in the long grass\nand the query just… kept… running.",
          "Turns out it needed an index!\nThe folks at THE PLATFORM fixed it in\nno time.",
        ],
      },
    },
    {
      id: "walker", outfit: "walker", x: 22, y: 30, dir: "up", wander: true,
      talk: {
        say: [
          "Did you know? Upanshu studied Computing at\nThe British College in Kathmandu.",
          "He graduated with FIRST CLASS HONOURS!\nHis diploma hangs in the TOWN HALL.",
        ],
      },
    },
  ],
  warps: [
    { x: 7, y: 10, to: "house", spawn: "door" },
    { x: 16, y: 10, to: "observatory", spawn: "door" },
    { x: 34, y: 10, to: "consultancy", spawn: "door" },
    { x: 8, y: 24, to: "hall", spawn: "door" },
    { x: 34, y: 24, to: "platform", spawn: "door" },
  ],
  spawns: {
    start: { x: 21, y: 20, dir: "down" },
    square: { x: 22, y: 19, dir: "down" },
    house: { x: 7, y: 11, dir: "down" },
    observatory: { x: 16, y: 11, dir: "down" },
    consultancy: { x: 34, y: 11, dir: "down" },
    hall: { x: 8, y: 25, dir: "down" },
    platform: { x: 34, y: 25, dir: "down" },
  },
};
