export const tonightBackendFixture = {
  run: {
    id: "run-current",
    status: "RUNNING",
    startedAt: "2026-09-24T18:00:00Z",
    totalTeams: 2,
    completeTeams: 2,
    incompleteTeams: 0,
    p1Completed: 2,
    p1Queued: 0,
    currentStage: "PASS_1",
  },
  teams: [
    { id: "team-1", name: "Team One", track: "new_idea", status: "P1_DONE", pass1: { composite: 8.4, band: "FAST_TRACK" } },
    { id: "team-2", name: "Team Two", track: "existing_project", status: "P1_DONE", pass1: { composite: 6.2, band: "BORDERLINE" } },
  ],
  disputes: [{ id: "dispute-1", teamId: "team-1", status: "RESOLVED" }],
};