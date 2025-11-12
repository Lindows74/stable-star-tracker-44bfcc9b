import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const getIsMobile = () => {
    if (typeof window === "undefined") return false
    return window.innerWidth < MOBILE_BREAKPOINT
  }

  const [isMobile, setIsMobile] = React.useState<boolean>(getIsMobile())

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)

    if (mql.addEventListener) {
      mql.addEventListener("change", handler)
    } else {
      // @ts-ignore - for Safari fallback
      mql.addListener(handler)
    }

    // Sync once in case of race conditions
    setIsMobile(mql.matches)

    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener("change", handler)
      } else {
        // @ts-ignore - for Safari fallback
        mql.removeListener(handler)
      }
    }
  }, [])

  return isMobile
}
