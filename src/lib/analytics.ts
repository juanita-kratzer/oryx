/**
 * Record daily aggregates for card analytics (taps, vCard downloads, pass downloads).
 */

export {
  recordLandingVisit,
  recordLandingTap,
  recordVcardDownload,
  recordPassDownload,
  logCardAnalyticsEvent,
} from "@/lib/firestore/analytics";
