import { useContext, useEffect, useState } from "react";
import { Candidate, Job } from "@lab/appSchema.js";
import { createTestCandidate } from "../utils/testData.js";
import React from "react";
import { AvailabilityView } from "./availabilityView.js";
import { Button } from "@fluentui/react-components";
import { getKeysByValue } from "../utils/util.js";
import { userAvatarGroupView } from "./userAvatarGroupView.js";
import { ISessionClient } from "@fluid-experimental/presence";
import { UserInfo } from "../utils/presenceManager.js";
import { useTreeNode } from "../utils/treeReactHooks.js";
import { AppContext } from "../index.js";

export function CandidatesListView(props: {
	job: Job;
	selectedCandidate: Candidate | undefined;
	setSelectedCandidate: (candidate: Candidate | undefined) => void;
}): JSX.Element {
	// {START MOD_1}

	useTreeNode(props.job.candidates);
	useTreeNode(props.job.onSiteSchedule);

	// {END MOD_1}

	// {START MOD_2}
	const presenceManager = useContext(AppContext)?.presenceManager;
	let presenceUserInfoList: UserInfo[][] = [];

	if (presenceManager) {
		const [candidatePresenceMap, setCandidatePresenceMap] = useState<
			Map<ISessionClient, string>
		>(
			new Map(
				[...presenceManager.getStates().props.candidateSelection.clientValues()].map(
					(cv) => [cv.client, cv.value.candidateSelected] as [ISessionClient, string],
				),
			),
		);
		useEffect(() => {
			return presenceManager
				.getStates()
				.props.candidateSelection.events.on("updated", (update) => {
					const remoteSessionClient = update.client;
					const remoteSelectedCandidateId = update.value.candidateSelected;

					if (remoteSelectedCandidateId === "") {
						candidatePresenceMap.delete(remoteSessionClient);
						setCandidatePresenceMap(new Map(candidatePresenceMap));
					} else {
						setCandidatePresenceMap(
							new Map(
								candidatePresenceMap.set(
									remoteSessionClient,
									remoteSelectedCandidateId,
								),
							),
						);
					}
				});
		}, []);
		presenceUserInfoList = props.job.candidates.map((candidate) => {
			return presenceManager.getUserInfo(
				getKeysByValue(candidatePresenceMap, candidate.candidateId),
			);
		});
	}

	// {END MOD_2}

	const setSelectedCandidate = (candidate: Candidate | undefined) => {
		props.setSelectedCandidate(candidate);

		// {START MOD_2}
		if (presenceManager) {
			presenceManager.getStates().props.candidateSelection.local = {
				candidateSelected: candidate ? candidate.candidateId : "",
			};
		}

		// {END MOD_2}
	};

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
							// {START MOD_2}
							presenceUserInfoList={presenceUserInfoList[index]}
							// {END MOD_2}
							job={props.job}
							selectedCandidate={props.selectedCandidate}
							setSelectedCandidate={setSelectedCandidate}
						/>
					))
				)}
			</div>
			<div className="flex mx-2 mb-2 justify-center">
				<button
					className="bg-blue-500 hover:bg-blue-300 text-white font-bold py-2 px-4 rounded w-1/2"
					onClick={() => {
						const newCandidate = createTestCandidate();
						props.job.addCandidate(newCandidate);
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
	setSelectedCandidate: (candidate: Candidate | undefined) => void;
	presenceUserInfoList?: UserInfo[];
}): JSX.Element {
	// {START MOD_1}

	useTreeNode(props.candidate);

	// {END MOD_1}

	return (
		<div
			className={`flex flex-col gap-1 justify-center content-center m-1 p-2 cursor-pointer
                ${props.selectedCandidate?.candidateId == props.candidate.candidateId ? "bg-violet-50 border border-violet-300" : "bg-slate-50 hover:bg-slate-100"}
           `}
			onClick={() => {
				props.setSelectedCandidate(props.candidate);
			}}
		>
			<div className="flex justify-end gap-2">
				{(props.candidate.isUnread ||
					props.job.getOnSiteForCandidate(props.candidate.candidateId)?.isUnread) && (
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
			{
				// {START MOD_2}

				userAvatarGroupView({
					members: props.presenceUserInfoList,
					size: 24,
					layout: "stack",
				})

				// {END MOD_2}
			}

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
