/**
 * Language helpers that run entirely in the browser: nothing here makes a network request.
 */

/**
 * First language in the browser's preference list (for example ["hi-IN", "en-US"]) that the app
 * supports and that is not `exclude`. Matching uses the primary language subtag only.
 */
export function firstSupportedLanguage<T extends string>(
  tags: readonly string[],
  supported: readonly T[],
  exclude?: T,
): T | undefined {
  for (const tag of tags) {
    const primary = tag.trim().toLowerCase().split(/[-_]/)[0]
    const match = supported.find(code => code === primary)
    if (match && match !== exclude) return match
  }
  return undefined
}

/** localStorage read that never throws (storage can be blocked, for example in private mode). */
export function readStored(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

/** localStorage write that never throws. */
export function writeStored(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // storage unavailable: the choice simply is not remembered
  }
}
