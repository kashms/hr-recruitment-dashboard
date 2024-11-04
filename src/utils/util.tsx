import { IMember, IServiceAudience } from "fluid-framework";

export const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
export const DAYS_OF_WEEK_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri"];

export function getKeysByValue<K, V>(map: Map<K, V>, value: V): K[] {
	const keys: K[] = [];

	for (const [key, val] of map.entries()) {
		if (val === value) {
			keys.push(key);
		}
	}

	return keys;
}

export function getMemberFromConnectionId(
	connectionId: string,
	audience: IServiceAudience<IMember>,
): IMember | undefined {
	// Iterate through all audience members to find the one with the given connection id and return
	for (const member of audience.getMembers().values()) {
		if (member.connections) {
			for (const connection of member.connections) {
				if (connection.id === connectionId) {
					return member;
				}
			}
		}
	}
	return undefined;
}
