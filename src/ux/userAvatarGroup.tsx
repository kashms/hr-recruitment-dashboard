import {
	AvatarGroup,
	AvatarGroupItem,
	AvatarGroupPopover,
	AvatarSize,
	Tooltip,
	partitionAvatarGroupItems,
} from "@fluentui/react-components";
import React from "react";

export type AvatarUser = {
	id: string;
	name: string;
	email: string;
};

export function userAvatarGroup(props: {
	members: AvatarUser[];
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
					content={`${member.name} - ${member.email}`}
					key={member.id}
					relationship="description"
				>
					<AvatarGroupItem
						active="active"
						activeAppearance="ring-shadow"
						color="colorful"
						name={`${member.name} - ${member.email}`}
						key={member.id}
					/>
				</Tooltip>
			))}
			{overflowItems && (
				<AvatarGroupPopover>
					{overflowItems.map((member) => (
						<AvatarGroupItem
							name={`${member.name} - ${member.email}`}
							key={member.id}
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
