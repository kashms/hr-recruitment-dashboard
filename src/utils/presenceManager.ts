import { IPresence, Latest, PresenceStates } from "@fluid-experimental/presence";

export class PresenceManager {
    private appSelectionPresenceState: PresenceStates<typeof appSelectionSchema>;

    constructor(presence: IPresence) {
        const appSelectionWorkspace = "appSelection:workspace";
        this.appSelectionPresenceState = presence.getStates(
            appSelectionWorkspace, // Worksapce address
            appSelectionSchema, // Worksapce schema
        );
    }

    getStates() {
        return this.appSelectionPresenceState;
    }
}

export const appSelectionSchema = {
    jobSelelction: Latest({ jobSelected: "" }),
    candidateSelection: Latest({ candidateSelected: "" }),
    userInfo: Latest({ userId: "", userName: "", userEmail: "" } satisfies UserInfo),
};

export type UserInfo = { userId: string; userName: string; userEmail: string };
