import React, { useState } from "react";
import { Availability } from "@lab/appSchema.js";
import { DAYS_OF_WEEK, DAYS_OF_WEEK_SHORT } from "../utils/util.js";
import { useTree } from "../utils/treeReactHooks.js";

export function AvailabilityView(props: { avail: Availability; readOnly?: boolean }): JSX.Element {
	// {START MOD_0}
	const [avail, setAvail] = useState(props.avail);
	const getAvail = (): Availability => {
		return avail;
	};
	const setDayAvailability = (day: string, checked: boolean) => {
		const newAvail = { ...avail };
		newAvail.setDayAvailability(day, checked);
		setAvail(newAvail);
	};
	// {END MOD_0}

	// {START MOD_1}
	// useTree(props.avail);
	// const getAvail = () => {
	//     return props.avail;
	// };
	// const setDayAvailability = (day: string, checked: boolean) => {
	//     props.avail.setDayAvailability(day, checked);
	// };
	// {END MOD_1}

	return (
		<div className="flex flex-col gap-1 justify-center content-center m-1">
			<div className="flex flex-row gap-1">
				{DAYS_OF_WEEK.map((day, index) => (
					<DayView
						key={day}
						dayName={DAYS_OF_WEEK_SHORT[index]}
						isAvailable={getAvail().includes(day)}
						readOnly={props.readOnly}
						onChange={(checked: boolean) => setDayAvailability(day, checked)}
					/>
				))}
			</div>
		</div>
	);
}

export function DayView(props: {
	dayName: string;
	isAvailable: boolean;
	readOnly?: boolean;
	onChange: (checked: boolean) => void;
}): JSX.Element {
	return (
		<div
			className={`flex flex-col items-center justify-center p-1 rounded w-14 
				${props.isAvailable ? "bg-green-300" : "bg-red-300"}
				${props.readOnly ? "" : "cursor-pointer"}`}
			onClick={(event) => {
				if (!props.readOnly) {
					event.stopPropagation();
					props.onChange(!props.isAvailable);
				}
			}}
		>
			<label className="block mb-1 text-sm font-medium text-gray-900">{props.dayName}</label>
		</div>
	);
}
