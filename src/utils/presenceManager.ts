import { ClientSessionId, IPresence, ISessionClient, Latest, PresenceStates } from "@fluid-experimental/presence";

export class PresenceManager {
    private presence: IPresence;
    private appSelectionPresenceState: PresenceStates<typeof appSelectionSchema>;

    constructor(presence: IPresence) {
        this.presence = presence;

        const appSelectionWorkspace = "appSelection:workspace";
        this.appSelectionPresenceState = presence.getStates(
            appSelectionWorkspace, // Worksapce address
            appSelectionSchema, // Worksapce schema
        );
    }

    getStates() {
        return this.appSelectionPresenceState;
    }

    getConnectedUserInfoFromSessionIds(sessionList: ISessionClient<ClientSessionId>[]) {
        const userInfoList: UserInfo[] = [];

        for (const sessionClient of sessionList) {
            // If the client is not connected, skip it
            console.log("attendees", this.presence.getAttendees());
            console.log(this.presence.getAttendee(sessionClient.sessionId));
            if (this.presence.getAttendee(sessionClient.sessionId).getConnectionStatus() !== "Connected") {
                continue;
            }
            try {
                const userInfo = this.appSelectionPresenceState.userInfo.clientValue(sessionClient).value;
                if (userInfo) {
                    userInfoList.push(userInfo);
                }
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (e) {
                // Do nothing
            }
        }
        return userInfoList;
    }
}

export const appSelectionSchema = {
    jobSelelction: Latest({ jobSelected: "" }),
    candidateSelection: Latest({ candidateSelected: "" }),
    userInfo: Latest({ userId: "", userName: "", userEmail: "" } satisfies UserInfo),
};

export type UserInfo = { userId: string; userName: string; userEmail: string };
