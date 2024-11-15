/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { Candidate, Interviewer, InterviewerPool, OnSiteSchedule } from "@lab/appSchema.js";
import { Button } from "@fluentui/react-components";
import React, { useState } from "react";
import { AvailabilityView } from "./availabilityView.js";
import { DismissFilled, ListFilled } from "@fluentui/react-icons";
import { DAYS_OF_WEEK } from "../utils/util.js";
import { useTree } from "../utils/treeReactHooks.js";

export function OnSitePlanView(props: {
	candidate: Candidate;
	onSiteSchedule: OnSiteSchedule;
	interviewerPool: InterviewerPool;
	handleToggleInterviewerList: () => void;
}): JSX.Element {
	//############################ START MODULE 0 changes here ##############################
	// const [onSiteSchedule, setOnSiteSchedule] = useState(props.onSiteSchedule);
	// const getOnSiteSchedule = () => {
	// 	return onSiteSchedule;
	// };
	// const removeInterviewer = (interviewerId: string) => {
	// 	onSiteSchedule.removeInterviewer(interviewerId);
	// 	setOnSiteSchedule({ ...onSiteSchedule });
	// };
	// const setOnSiteDay = (day: string) => {
	// 	onSiteSchedule.day = day;
	// 	setOnSiteSchedule({ ...onSiteSchedule });
	// };
	//////////////////////////////// END MODULE 0 changes here //////////////////////////////

	//############################ START MODULE 1 changes here ##############################
	useTree(props.onSiteSchedule);
	useTree(props.candidate);
	useTree(props.interviewerPool);
	const getOnSiteSchedule = () => {
		return props.onSiteSchedule;
	};
	const removeInterviewer = (interviewerId: string) => {
		props.onSiteSchedule.removeInterviewer(interviewerId);
	};
	const setOnSiteDay = (day: string) => {
		props.onSiteSchedule.day = day;
	};
	//////////////////////////////// END MODULE 1 changes here //////////////////////////////

	const onSiteInterviewers = getOnSiteSchedule()
		.interviewerIds.map((intId) =>
			props.interviewerPool.find((interviewer) => interviewer.interviewerId === intId),
		)
		.filter((interviewer): interviewer is Interviewer => interviewer !== undefined);

	const checkValidity = () => {
		if (
			onSiteInterviewers.length !== 3 ||
			!props.candidate.availability.includes(getOnSiteSchedule().day)
		) {
			return false;
		}

		for (const interviewer of onSiteInterviewers) {
			if (!interviewer.availability.includes(getOnSiteSchedule().day)) {
				return false;
			}
		}

		return true;
	};
	const isValid = checkValidity();

	return (
		<div
			className={`flex flex-col gap-1 content-center w-96 min-w-96 h-full overflow-y-auto border-r-4`}
		>
			<div className="text-lg p-2 mx-0.5 font-bold bg-slate-600 text-white text-center">
				On Site Day
			</div>
			<h3 className="text-center p-2 border">
				A valid on-site day should: <br />
				- Have 3 interviewers <br />
				- Be a day that the candidate is available <br />
				- Be a day that all interviewers are available <br />
			</h3>
			<div className={`flex flex-col p-2 mx-2 ${isValid ? "bg-green-100" : "bg-red-100"}`}>
				<div className="flex items-center space-x-2 mx-2">
					<select
						className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2"
						value={getOnSiteSchedule().day}
						onChange={(event) => setOnSiteDay(event.target.value)}
					>
						{DAYS_OF_WEEK.map((day) => (
							<option key={day} value={day}>
								{day}
							</option>
						))}
					</select>
					<Button
						appearance="subtle"
						icon={<ListFilled />}
						onClick={() => props.handleToggleInterviewerList()}
					/>
				</div>
				<div className="flex flex-col gap-1 content-center">
					{onSiteInterviewers.length > 0 ? (
						onSiteInterviewers.map((interviewer) => (
							<InterviewerReadView
								key={interviewer.interviewerId}
								interviewer={interviewer}
								removeHandler={removeInterviewer}
							/>
						))
					) : (
						<div className="flex justify-center items-center p-4">
							No interviewers added yet
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export function InterviewerReadView(props: {
	interviewer: Interviewer;
	removeHandler: (interviewerId: string) => void;
}): JSX.Element {
	return (
		<div className="relative flex flex-col gap-1 justify-center content-center m-2 border border-gray-300 p-2 rounded">
			<div className="flex items-center justify-between">
				<div>
					<div className="mb-1 text-sm">Interviewer</div>
					<div className="text-lg">{props.interviewer.name}</div>
					<div>{props.interviewer.role}</div>
				</div>
				<div className="ml-4">
					<Button
						appearance="subtle"
						icon={<DismissFilled />}
						onClick={() => props.removeHandler(props.interviewer.interviewerId)}
					/>
				</div>
			</div>
			<AvailabilityView avail={props.interviewer.availability} readOnly={true} />
		</div>
	);
}
