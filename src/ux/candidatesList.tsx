import { useEffect, useState } from "react";
import { Candidate, Job } from "../schema.js";
import { IMember, IServiceAudience, Tree } from "fluid-framework";
import React from "react";
import { AvailabilityView } from "./availabilityView.js";
import { createTestCandidate } from "../utils/testData.js";
import { Button } from "@fluentui/react-components";
import { getKeysByValue } from "../utils/util.js";
import { userAvatarGroup } from "./userAvatarGroup.js";
import { UserInfo } from "../hr_app.js";
import { ISessionClient, LatestValueManager } from "@fluid-experimental/presence";

export function CandidatesList(props: {
	job: Job;
	selectedCandidate: Candidate | undefined;
	setSelectedCandidate: (candidate: Candidate | undefined) => void;
	candidatePresenceMap: Map<ISessionClient, string>; // Client Session ID to Candidate ID map
	userInfoState: LatestValueManager<UserInfo> | undefined;
	audience: IServiceAudience<IMember>;
}): JSX.Element {
	const [invalidations, setInvalidations] = useState(0);
	useEffect(() => {
		const unsubscribe = Tree.on(props.job.candidates, "nodeChanged", () => {
			setInvalidations(invalidations + Math.random());

			if (
				props.selectedCandidate === undefined ||
				(props.selectedCandidate && !props.job.candidates.includes(props.selectedCandidate))
			) {
				props.setSelectedCandidate(undefined);
			}
		});
		return unsubscribe;
	}, [invalidations, props.job.candidates]);

	useEffect(() => {
		const unsubscribe = Tree.on(props.job.onSiteSchedule, "nodeChanged", () => {
			setInvalidations(invalidations + Math.random());
		});
		return unsubscribe;
	}, [invalidations, props.job.onSiteSchedule]);

	return (
		<div className="flex flex-col gap-1 content-center w-96 h-full border-r-4 overflow-auto">
			<div className="text-lg p-2 mx-0.5 font-bold bg-violet-600 text-white text-center">
				Candidates
			</div>
			<div className="flex-grow mx-2">
				{props.job.candidates.length === 0 ? (
					<div className="my-8 text-center">😞 No candidates yet!</div>
				) : (
					props.job.candidates.map((candidate, index) => (
						<CandidateView
							key={index}
							candidate={candidate}
							currentViewers={getKeysByValue(
								props.candidatePresenceMap,
								candidate.candidateId,
							)}
							{...props}
						/>
					))
				)}
			</div>
			<div className="flex mx-2 mb-2 justify-center">
				<button
					className="bg-blue-500 hover:bg-blue-300 text-white font-bold py-2 px-4 rounded w-1/2"
					onClick={() => {
						const newCandidate = createTestCandidate();
						props.job.candidates.insertAt(props.job.candidates.length, newCandidate);
					}}
				>
					+ Add New Candidate
				</button>
			</div>
		</div>
	);
}

export function CandidateView(props: {
	candidate: Candidate;
	job: Job;
	selectedCandidate?: Candidate;
	currentViewers: ISessionClient[];
	userInfoState: LatestValueManager<UserInfo> | undefined;
	audience: IServiceAudience<IMember>;
	setSelectedCandidate: (candidate: Candidate | undefined) => void;
}): JSX.Element {
	const [invalidations, setInvalidations] = useState(0);

	useEffect(() => {
		const unsubscribe = Tree.on(props.candidate, "nodeChanged", () => {
			setInvalidations(invalidations + Math.random());
		});
		return unsubscribe;
	}, [invalidations, props.candidate]);

	const currentViewingUsers = new Array<UserInfo>();
	props.currentViewers.forEach((clientSessionId) => {
		try {
			const viewingUser = props.userInfoState?.clientValue(clientSessionId).value;
			if (viewingUser) {
				currentViewingUsers.push(viewingUser);
			}
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (e) {
			// Do nothing
		}
	});

	return (
		<div
			className={`flex flex-col gap-1 justify-center content-center m-1 p-2 cursor-pointer
                ${props.selectedCandidate?.candidateId == props.candidate.candidateId ? "bg-violet-50 border border-violet-300" : "bg-slate-50 hover:bg-slate-100"}
           `}
			onClick={() => props.setSelectedCandidate(props.candidate)}
		>
			<div className="flex justify-end gap-2">
				{(props.candidate.llmCollaboration ||
					props.job.getOnSiteForCandidate(props.candidate.candidateId)
						?.llmCollaboration) && (
					<div className="flex items-center p-2">
						<span className="w-2 h-2 bg-red-500 rounded-full"></span>
					</div>
				)}
				{!props.job.hasOnSiteForCandidate(props.candidate.candidateId) && (
					<Button
						appearance="primary"
						onClick={() =>
							props.job.addNewOnSiteForCandidate(props.candidate.candidateId)
						}
						className="inline-block"
					>
						Setup On-Site
					</Button>
				)}
			</div>
			{userAvatarGroup({ members: currentViewingUsers, size: 24, layout: "stack" })}

			<div className="mb-3">
				<label className="block mb-1 text-sm font-medium text-gray-900">Name:</label>
				<input
					className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
					value={props.candidate.name}
					onChange={(event) => (props.candidate.name = event.target.value)}
				/>
			</div>
			<div className="mb-3">
				<label className="block mb-1 text-sm font-medium text-gray-900">
					Years of Experience:
				</label>
				<input
					className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
					value={props.candidate.yearsOfExperience}
					onChange={(event) =>
						(props.candidate.yearsOfExperience = Number(event.target.value))
					}
				/>
			</div>
			<AvailabilityView avail={props.candidate.availability} />
		</div>
	);
}
