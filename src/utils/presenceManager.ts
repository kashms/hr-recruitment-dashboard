import {
	ClientSessionId,
	IPresence,
	ISessionClient,
	Latest,
	PresenceStates,
} from "@fluid-experimental/presence";
import { OdspMember, type IOdspAudience } from "@fluidframework/odsp-client/beta";
import { TinyliciousMember, type ITinyliciousAudience } from "@fluidframework/tinylicious-client";

function isOdspMember(member: OdspMember | TinyliciousMember): member is OdspMember {
	return "email" in member;
}

export class PresenceManager {
	private readonly appSelectionPresenceState: PresenceStates<typeof appSelectionSchema>;
	private readonly userInfoMap: Map<ISessionClient, UserInfo> = new Map();
	private userInfoCallback: (userInfoMap: Map<ISessionClient, UserInfo>) => void = () => {};

	constructor(
		private readonly presence: IPresence,
		private readonly audience: IOdspAudience | ITinyliciousAudience,
	) {
		this.presence = presence;
		this.audience = audience;

		const appSelectionWorkspaceAddress = "appSelection:workspace";
		this.appSelectionPresenceState = presence.getStates(
			appSelectionWorkspaceAddress, // Workspace address
			appSelectionSchema, // Workspace schema
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
			this.appSelectionPresenceState.props.userInfo.local = {
				userId: myselfMember.id,
				userName: myselfMember.name,
				userEmail: isOdspMember(myselfMember) ? myselfMember.email : "",
			};

			this.userInfoMap.set(
				this.presence.getMyself(),
				this.appSelectionPresenceState.props.userInfo.local,
			);
			this.userInfoCallback(this.userInfoMap);
		}
	}

	getStates() {
		return this.appSelectionPresenceState.props;
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
				const userInfo =
					this.appSelectionPresenceState.props.userInfo.clientValue(sessionClient).value;
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
	jobSelection: Latest({ jobSelected: "" }),
	candidateSelection: Latest({ candidateSelected: "" }),
	userInfo: Latest({ userId: "", userName: "", userEmail: "" } satisfies UserInfo),
};

export type UserInfo = { userId: string; userName: string; userEmail: string };
