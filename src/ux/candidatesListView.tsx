import { useContext, useEffect, useState } from "react";
import { Candidate, Job } from "@lab/appSchema.js";
import { createTestCandidate } from "../utils/testData.js";
import React from "react";
import { AvailabilityView } from "./availabilityView.js";
import { Button } from "@fluentui/react-components";
import { getKeysByValue } from "../utils/util.js";
import { userAvatarGroupView } from "./userAvatarGroupView.js";
import { ISessionClient } from "@fluidframework/presence/alpha";
import { UserInfo } from "../utils/presenceManager.js";
import { useTreeNode } from "../utils/treeReactHooks.js";
import { PresenceContext } from "../index.js";

export function CandidatesListView(props: {
	job: Job;
	selectedCandidate: Candidate | undefined;
	setSelectedCandidate: (candidate: Candidate | undefined) => void;
}): JSX.Element {
	//############################ START MODULE 0 changes here ##############################
	// const [job, setJob] = useState(props.job);
	// if (job.jobId !== props.job.jobId) {
	// 	setJob(props.job);
	// }
	// const getJob = () => {
	// 	return job;
	// };
	// const addCandidate = (candidate: Candidate) => {
	// 	const newJob = { ...job };
	// 	newJob.candidates.push(candidate);
	// 	setJob(newJob);
	// };
	//////////////////////////////// END MODULE 0 changes here //////////////////////////////

	//############################ START MODULE 1 changes here ##############################
	useTreeNode(props.job.candidates);
	useTreeNode(props.job.onSiteSchedule);
	const getJob = () => {
		return props.job;
	};
	const addCandidate = (candidate: Candidate) => {
		props.job.addCandidate(candidate);
	};
	//////////////////////////////// END MODULE 1 changes here //////////////////////////////

	// {VIEW MOD_2}
	const presenceManager = useContext(PresenceContext);
	let presenceUserInfoList: UserInfo[][] = [];

	if (presenceManager) {
		const [candidatePresenceMap, setCandidatePresenceMap] = useState<
			Map<ISessionClient, string>
		>(
			new Map(
				[...presenceManager.getStates().candidateSelection.clientValues()].map(
					(cv) => [cv.client, cv.value.candidateSelected] as [ISessionClient, string],
				),
			),
		);
		useEffect(() => {
			return presenceManager.getStates().candidateSelection.events.on("updated", (update) => {
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
		presenceUserInfoList = getJob().candidates.map((candidate) => {
			return presenceManager.getUserInfo(
				getKeysByValue(candidatePresenceMap, candidate.candidateId),
			);
		});
	}
	// {END MOD_2}

	const setSelectedCandidate = (candidate: Candidate | undefined) => {
		props.setSelectedCandidate(candidate);

		// {VIEW MOD_2}
		if (presenceManager) {
			presenceManager.getStates().candidateSelection.local = {
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
				{getJob().candidates.length === 0 ? (
					<div className="my-8 text-center">😞 No candidates yet!</div>
				) : (
					getJob().candidates.map((candidate, index) => (
						<CandidateView
							key={index}
							candidate={candidate}
							// {VIEW MOD_2}
							presenceUserInfoList={presenceUserInfoList[index]}
							// {END MOD_2}
							job={getJob()}
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
						addCandidate(createTestCandidate());
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
	//############################ START MODULE 0 changes here ##############################
	// const [candidate, setCandidate] = useState(props.candidate);
	// const getCandidate = () => {
	// 	return candidate;
	// };
	// const setCandidateName = (name: string) => {
	// 	setCandidate({ ...candidate, name });
	// };
	// const setCandidateYearsOfExperience = (yearsOfExperience: number) => {
	// 	setCandidate({ ...candidate, yearsOfExperience });
	// };
	//////////////////////////////// END MODULE 0 changes here //////////////////////////////

	//############################ START MODULE 1 changes here ##############################
	useTreeNode(props.candidate);
	const getCandidate = () => {
		return props.candidate;
	};
	const setCandidateName = (name: string) => {
		props.candidate.name = name;
	};
	const setCandidateYearsOfExperience = (yearsOfExperience: number) => {
		props.candidate.yearsOfExperience = yearsOfExperience;
	};
	//////////////////////////////// END MODULE 1 changes here //////////////////////////////

	return (
		<div
			className={`flex flex-col gap-1 justify-center content-center m-1 p-2 cursor-pointer
                ${props.selectedCandidate?.candidateId == getCandidate().candidateId ? "bg-violet-50 border border-violet-300" : "bg-slate-50 hover:bg-slate-100"}
           `}
			onClick={() => {
				props.setSelectedCandidate(getCandidate());
			}}
		>
			<div className="flex justify-end gap-2">
				{(getCandidate().isUnread ||
					props.job.getOnSiteForCandidate(getCandidate().candidateId)?.isUnread) && (
					<div className="flex items-center p-2">
						<span className="w-2 h-2 bg-red-500 rounded-full"></span>
					</div>
				)}
				{!props.job.hasOnSiteForCandidate(getCandidate().candidateId) && (
					<Button
						appearance="primary"
						onClick={() =>
							props.job.addNewOnSiteForCandidate(getCandidate().candidateId)
						}
						className="inline-block"
					>
						Setup On-Site
					</Button>
				)}
			</div>
			{
				// {VIEW MOD_2}
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
					value={getCandidate().name}
					onChange={(event) => setCandidateName(event.target.value)}
				/>
			</div>
			<div className="mb-3">
				<label className="block mb-1 text-sm font-medium text-gray-900">
					Years of Experience:
				</label>
				<input
					className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
					value={getCandidate().yearsOfExperience}
					onChange={(event) =>
						setCandidateYearsOfExperience(parseInt(event.target.value))
					}
				/>
			</div>
			<AvailabilityView avail={getCandidate().availability} />
		</div>
	);
}
