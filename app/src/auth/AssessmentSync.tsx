import { useEffect } from "react";
import { useSession } from "./SessionProvider";
import { useAssessmentStore } from "../store/useAssessmentStore";

/** Loads assessments from Supabase whenever the signed-in user changes, and clears them on sign-out. */
export function AssessmentSync() {
  const { session } = useSession();
  const loadAssessments = useAssessmentStore((s) => s.loadAssessments);
  const clear = useAssessmentStore((s) => s.clear);

  useEffect(() => {
    if (session?.user.id) {
      void loadAssessments(session.user.id);
    } else {
      clear();
    }
  }, [session?.user.id, loadAssessments, clear]);

  return null;
}
