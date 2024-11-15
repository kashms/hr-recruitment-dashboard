/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

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
