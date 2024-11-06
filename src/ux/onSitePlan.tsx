import { Tree, TreeArrayNode } from "fluid-framework";
import { Candidate, Interviewer, OnSiteSchedule } from "../schema.js";
import { useEffect, useState } from "react";
import { Button } from "@fluentui/react-components";
import React from "react";
import { AvailabilityView } from "./availabilityView.js";
import { DismissFilled, ListFilled } from "@fluentui/react-icons";
import { DAYS_OF_WEEK } from "../utils/util.js";

export function OnSitePlan(props: {
	candidate: Candidate;
	onSiteSchedule: OnSiteSchedule;
	interviewerPool: TreeArrayNode<typeof Interviewer>;
	handleToggleInterviewerList: () => void;
}): JSX.Element {
	const [invalidations, setInvalidations] = useState(0);

	useEffect(() => {
		const unsubscribe = Tree.on(props.onSiteSchedule, "treeChanged", () => {
			setInvalidations(invalidations + Math.random());
		});
		return unsubscribe;
	}, [invalidations, props.onSiteSchedule]);

	useEffect(() => {
		const unsubscribe = Tree.on(props.candidate, "treeChanged", () => {
			setInvalidations(invalidations + Math.random());
		});
		return unsubscribe;
	}, [invalidations, props.candidate]);

	useEffect(() => {
		const unsubscribe = Tree.on(props.interviewerPool, "treeChanged", () => {
			setInvalidations(invalidations + Math.random());
		});
		return unsubscribe;
	}, [invalidations, props.interviewerPool]);

	const onSiteInterviewers = props.onSiteSchedule.interviewerIds
		.map((intId) =>
			props.interviewerPool.find((interviewer) => interviewer.interviewerId === intId),
		)
		.filter((interviewer): interviewer is Interviewer => interviewer !== undefined);

	const checkValidity = () => {
		if (
			onSiteInterviewers.length !== 3 ||
			!props.candidate.availability.includes(props.onSiteSchedule.day)
		) {
			return false;
		}

		for (const interviewer of onSiteInterviewers) {
			if (!interviewer.availability.includes(props.onSiteSchedule.day)) {
				return false;
			}
		}

		return true;
	};
	const isValid = checkValidity();

	const handleRemoveInterviewer = (interviewerId: string) => {
		const index = props.onSiteSchedule.interviewerIds.indexOf(interviewerId);
		if (index !== -1) {
			props.onSiteSchedule.interviewerIds.removeAt(index);
		}
	};

	return (
		<div
			className={`flex flex-col gap-1 content-center w-96 h-full overflow-y-auto border-r-4`}
		>
			<div className="text-lg p-2 mx-0.5 font-bold bg-slate-600 text-white text-center">
				On Site Day
			</div>
			<div className={`flex flex-col p-2 mx-2 ${isValid ? "bg-green-100" : "bg-red-100"}`}>
				<div className="flex items-center space-x-2 mx-2">
					<select
						className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2"
						value={props.onSiteSchedule.day}
						onChange={(event) => (props.onSiteSchedule.day = event.target.value)}
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
					{onSiteInterviewers.map((interviewer) => (
						<InterviewerReadView
							key={interviewer.interviewerId}
							interviewer={interviewer}
							removeHandler={handleRemoveInterviewer}
							interviewerChanged={() =>
								setInvalidations(invalidations + Math.random())
							}
						/>
					))}
				</div>
			</div>
		</div>
	);
}

export function InterviewerReadView(props: {
	interviewer: Interviewer;
	removeHandler: (interviewerId: string) => void;
	interviewerChanged: () => void;
}): JSX.Element {
	const [invalidations, setInvalidations] = useState(0);

	useEffect(() => {
		const unsubscribe = Tree.on(props.interviewer, "nodeChanged", () => {
			setInvalidations(invalidations + Math.random());
		});
		return unsubscribe;
	}, [invalidations, props.interviewer]);

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