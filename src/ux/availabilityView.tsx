/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useState } from "react";
import { Availability } from "@lab/appSchema.js";
import { DAYS_OF_WEEK, DAYS_OF_WEEK_SHORT } from "../utils/util.js";
import { useTree } from "../utils/treeReactHooks.js";

// Component to display the availability status of a Candidate or Interviewer
export function AvailabilityView(props: { avail: Availability; readOnly?: boolean }): JSX.Element {
	//############################ START MODULE 0 changes here ##############################
	// State to manage the availability
	// const [avail, setAvail] = useState(props.avail);
	// const getAvail = (): Availability => {
	// 	return avail;
	// };
	// // Function to set the availability for a specific day
	// const setDayAvailability = (day: string, checked: boolean) => {
	// 	avail.setDayAvailability(day, checked);
	// 	const newAvail = new Availability(avail);
	// 	setAvail(newAvail);
	// };
	//////////////////////////////// END MODULE 0 changes here //////////////////////////////

	//############################ START MODULE 1 changes here ##############################
	useTree(props.avail);
	const getAvail = () => {
		return props.avail;
	};
	const setDayAvailability = (day: string, checked: boolean) => {
		// Set the availability for a specific day directly on the props.avail Fluid Object
		// This will also set the availability for remote clients
		props.avail.setDayAvailability(day, checked);
	};
	//////////////////////////////// END MODULE 1 changes here //////////////////////////////

	return (
		<div className="flex flex-col gap-1 justify-center content-center m-1">
			<div className="flex flex-row gap-1">
				{DAYS_OF_WEEK.map((day, index) => {
					const availability = getAvail();
					try {
						return (
							<DayView
								key={day}
								dayName={DAYS_OF_WEEK_SHORT[index]}
								isAvailable={availability.includes(day)}
								readOnly={props.readOnly}
								onChange={(checked: boolean) => setDayAvailability(day, checked)}
							/>
						);
					} catch (error) {
						console.error(error);
					}
				})}
			</div>
		</div>
	);
}

// DayView component to display the availability status of a specific day
export function DayView(props: {
	dayName: string; // Name of the day (e.g., "Monday")
	isAvailable: boolean; // Availability status for the day
	readOnly?: boolean; // Optional prop to make the view read-only
	onChange: (checked: boolean) => void; // Callback function to handle changes in availability
}): JSX.Element {
	return (
		<div
			className={`flex flex-col items-center justify-center p-1 rounded w-14 
				${props.isAvailable ? "bg-green-300" : "bg-red-300"}
				${props.readOnly ? "" : "cursor-pointer"}`} // Add cursor pointer if not read-only
			onClick={(event) => {
				if (!props.readOnly) {
					// Only handle click if not read-only
					event.stopPropagation(); // Prevent event from bubbling up
					props.onChange(!props.isAvailable); // Toggle availability status
				}
			}}
		>
			<label className="block mb-1 text-sm font-medium text-gray-900">{props.dayName}</label>
		</div>
	);
}
