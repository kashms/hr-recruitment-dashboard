import { ClientSessionId, IPresence, ISessionClient, Latest, PresenceStates } from "@fluid-experimental/presence";
import { OdspMember } from "@fluidframework/odsp-client/beta";
import { IMember, IServiceAudience } from "fluid-framework";

export class PresenceManager {
    private presence: IPresence;
    private audience: IServiceAudience<IMember>;
    private appSelectionPresenceState: PresenceStates<typeof appSelectionSchema>;
    private userInfoMap: Map<ISessionClient, UserInfo> = new Map();
    private userInfoCallback: (userInfoMap: Map<ISessionClient, UserInfo>) => void = () => { };

    constructor(presence: IPresence, audience: IServiceAudience<IMember>) {
        this.presence = presence;
        this.audience = audience;

        const appSelectionWorkspace = "appSelection:workspace";
        this.appSelectionPresenceState = presence.getStates(
            appSelectionWorkspace, // Worksapce address
            appSelectionSchema, // Worksapce schema
        );

        this.appSelectionPresenceState.props.userInfo.events.on("updated", (update) => {
            const remoteSessionClient = update.client;
            const remoteUserInfo = update.value;

            this.userInfoMap.set(remoteSessionClient, remoteUserInfo);
            this.userInfoCallback(this.userInfoMap);
        });

        this.audience.on("membersChanged", () => {
            const myselfMember = this.audience.getMyself();
            if (myselfMember) {
                const odspMember = myselfMember as IMember as OdspMember;

                // Broadcast current user's info to all clients
                this.appSelectionPresenceState.props.userInfo.local = {
                    userId: odspMember.id,
                    userName: odspMember.name,
                    userEmail: odspMember.email,
                };

                this.userInfoMap.set(this.presence.getMyself(), this.appSelectionPresenceState.props.userInfo.local);
                this.userInfoCallback(this.userInfoMap);
            }
        });
    }

    getStates() {
        return this.appSelectionPresenceState;
    }

    getPresence() {
        return this.presence;
    }

    getuserInfoMap() {
        return this.userInfoMap;
    }

    setUserInfoUpdateListener(callback: (userInfoMap: Map<ISessionClient, UserInfo>) => void) {
        this.userInfoCallback = callback;
    }

    // updateUserInfoList = () => {        
    //     const userInfoArray = [...this.appSelectionPresenceState.userInfo.clientValues()].map(
    //         (v) => v.value,
    //     );
    //     // if user array already contains the local user by using the userId, then don't add it again
    //     if (
    //         !userInfoArray.some(
    //             (v) =>
    //                 v.userId === this.appSelectionPresenceState.userInfo.local.userId,
    //         )
    //     ) {
    //         userInfoArray.push(this.appSelectionPresenceState.userInfo.local);
    //     }

    //     this.appUserInfo = userInfoArray;
    // };

    getConnectedUserInfoFromSessionIds(sessionList: ISessionClient<ClientSessionId>[]) {
        const userInfoList: UserInfo[] = [];

        for (const sessionClient of sessionList) {
            // If local user or remote user is connected, then only add it to the list
            if (this.presence.getMyself().sessionId === sessionClient.sessionId || this.presence.getAttendee(sessionClient.sessionId).getConnectionStatus() === "Connected") {
                try {
                    const userInfo = this.appSelectionPresenceState.props.userInfo.clientValue(sessionClient).value;
                    if (userInfo) {
                        userInfoList.push(userInfo);
                    }
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                } catch (e) {
                    // Do nothing
                }
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