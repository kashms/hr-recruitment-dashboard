import { ClientSessionId, IPresence, ISessionClient, Latest, PresenceStates } from "@fluid-experimental/presence";
import { OdspMember } from "@fluidframework/odsp-client/beta";
import { TinyliciousMember } from "@fluidframework/tinylicious-client";
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

        this.setMyUserInfo();
        this.audience.on("membersChanged", () => {
            this.setMyUserInfo();
        });
    }

    private setMyUserInfo() {
        const myselfMember = this.audience.getMyself();

        // Broadcast current user's info to all clients
        if (myselfMember) {
            if (myselfMember as IMember as OdspMember !== undefined) {
                const odspMember = myselfMember as IMember as OdspMember;
                this.appSelectionPresenceState.props.userInfo.local = {
                    userId: odspMember.id,
                    userName: odspMember.name,
                    userEmail: odspMember.email,
                };
            } else if (myselfMember as IMember as TinyliciousMember !== undefined) {
                const tinyliciousMember = myselfMember as IMember as TinyliciousMember;
                this.appSelectionPresenceState.props.userInfo.local = {
                    userId: tinyliciousMember.id,
                    userName: tinyliciousMember.name,
                    userEmail: "",
                };
            }

            this.userInfoMap.set(this.presence.getMyself(), this.appSelectionPresenceState.props.userInfo.local);
            this.userInfoCallback(this.userInfoMap);
        }
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

    getUserInfo(sessionList: ISessionClient<ClientSessionId>[]) {
        const userInfoList: UserInfo[] = [];

        for (const sessionClient of sessionList) {
            // If local user or remote user is connected, then only add it to the list
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

        return userInfoList;
    }
}

// Schema for the Presence Manager
export const appSelectionSchema = {
    jobSelelction: Latest({ jobSelected: "" }),
    candidateSelection: Latest({ candidateSelected: "" }),
    userInfo: Latest({ userId: "", userName: "", userEmail: "" } satisfies UserInfo),
};

export type UserInfo = { userId: string; userName: string; userEmail: string };
