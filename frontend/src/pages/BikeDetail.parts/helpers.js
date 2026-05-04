import { Gauge, Fuel, Zap } from "lucide-react";

const COLOR_HEX_RULES = [
  { match: ["white", "ross", "misty", "glare", "pearl precious"], hex: "#F5F5F5" },
  { match: ["black", "igneous", "ballistic"], hex: "#111111" },
  { match: ["red", "sangria", "rebel", "imperial", "spartan", "grand prix", "precious red", "sports red"], hex: "#C8102E" },
  { match: ["blue", "siren", "decent", "marvel", "athletic", "serenity", "shallow"], hex: "#1E4FA8" },
  { match: ["green", "marshal"], hex: "#2A6B3F" },
  { match: ["grey", "gray", "axis", "iridium", "foggy", "steel"], hex: "#666666" },
  { match: ["silver"], hex: "#B0B0B0" },
];

export const guessColorHex = (name) => {
  const n = (name || "").toLowerCase();
  for (const rule of COLOR_HEX_RULES) {
    if (rule.match.some(k => n.includes(k))) return rule.hex;
  }
  return "#999999";
};

export const SPEC_ICONS = { Gauge, Fuel, Zap };
