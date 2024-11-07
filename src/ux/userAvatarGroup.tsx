import {
	AvatarGroup,
	AvatarGroupItem,
	AvatarGroupPopover,
	AvatarSize,
	Tooltip,
	partitionAvatarGroupItems,
} from "@fluentui/react-components";
import React from "react";
import { UserInfo } from "../utils/presenceManager.js";

export function userAvatarGroup(props: {
	members: UserInfo[];
	size: AvatarSize;
	layout: "spread" | "stack";
}): JSX.Element {
	const { inlineItems, overflowItems } = partitionAvatarGroupItems({
		items: props.members,
	});

	return (
		<AvatarGroup size={props.size} layout={props.layout} className="pr-2">
			{inlineItems.map((member) => (
				<Tooltip
					content={`${member.userName} - ${member.userEmail}`}
					key={member.userId}
					relationship="description"
				>
					<AvatarGroupItem
						active="active"
						activeAppearance="ring-shadow"
						color="colorful"
						name={`${member.userName} - ${member.userEmail}`}
						key={member.userId}
					/>
				</Tooltip>
			))}
			{overflowItems && (
				<AvatarGroupPopover>
					{overflowItems.map((member) => (
						<AvatarGroupItem
							name={`${member.userName} - ${member.userEmail}`}
							key={member.userId}
							active="active"
							color="colorful"
							activeAppearance="ring-shadow"
						/>
					))}
				</AvatarGroupPopover>
			)}
		</AvatarGroup>
	);
}
