// Reown AppKit integration removed.
// Provide minimal compatibility helpers so imports don't break other modules.
import React from "react";

export type ReownAdapter = {
  isAvailable: false;
};

export async function loadReown(): Promise<ReownAdapter> {
  return { isAvailable: false };
}

export function useReownAdapter(): ReownAdapter {
  return { isAvailable: false };
}
