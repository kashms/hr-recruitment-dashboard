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

export function userAvatarGroupView(props: {
	members: UserInfo[];
	size: AvatarSize;
	layout: "spread" | "stack";
}): JSX.Element {
	const { inlineItems, overflowItems } = partitionAvatarGroupItems({
		items: props.members,
	});

	const getMemberName = (member: UserInfo) => {
		const emailPart = member.userEmail ? ` - ${member.userEmail}` : "";
		return `${member.userName}${emailPart}`;
	};

	return (
		<AvatarGroup size={props.size} layout={props.layout} className="pr-2">
			{inlineItems.map((member) => (
				<Tooltip
					content={getMemberName(member)}
					key={member.userId + Math.random()}
					relationship="description"
				>
					<AvatarGroupItem
						active="active"
						activeAppearance="ring-shadow"
						color="colorful"
						name={getMemberName(member)}
						key={member.userId + Math.random()}
					/>
				</Tooltip>
			))}
			{overflowItems && (
				<AvatarGroupPopover>
					{overflowItems.map((member) => (
						<AvatarGroupItem
							name={getMemberName(member)}
							key={member.userId + Math.random()}
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
