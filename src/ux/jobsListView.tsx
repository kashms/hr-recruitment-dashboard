import React, { useEffect, useState } from "react";
import { Job, JobsArray } from "@lab/appSchema.js";
import { createTestJob } from "../utils/testData.js";
import { Button } from "@fluentui/react-components";
import { DismissFilled } from "@fluentui/react-icons";
import { getKeysByValue } from "../utils/util.js";
import { userAvatarGroupView } from "./userAvatarGroupView.js";
import { ISessionClient } from "@fluid-experimental/presence";
import { PresenceManager } from "../utils/presenceManager.js";
import { useTreeNode } from "../utils/treeReactHooks.js";

export function JobsListView(props: {
	jobs: JobsArray;
	setSelectedJob: (job: Job | undefined) => void;
	selectedJob?: Job;
	presenceManager: PresenceManager;
}): JSX.Element {
	const [jobPresenceMap, setJobPresenceMap] = useState<Map<ISessionClient, string>>(
		new Map(
			[...props.presenceManager.getStates().props.jobSelelction.clientValues()].map(
				(cv) => [cv.client, cv.value.jobSelected] as [ISessionClient, string],
			),
		),
	);

	useTreeNode(props.jobs);

	useEffect(() => {
		return props.presenceManager
			.getStates()
			.props.jobSelelction.events.on("updated", (update) => {
				const remoteSessionClient = update.client;
				const remoteSelectedJobId = update.value.jobSelected;

				// if empty string, then no job is selected, remove it from the map
				if (remoteSelectedJobId === "") {
					jobPresenceMap.delete(remoteSessionClient);
					setJobPresenceMap(new Map(jobPresenceMap));
				} else {
					setJobPresenceMap(
						new Map(jobPresenceMap.set(remoteSessionClient, remoteSelectedJobId)),
					);
				}
			});
	}, []);

	return (
		<div className="flex flex-col gap-1 content-center w-96 h-full border-r-4 overflow-auto">
			<div className="text-lg p-2 mx-0.5 font-bold bg-cyan-600 text-white text-center">
				Jobs
			</div>
			<div className="flex-grow mx-2">
				{props.jobs.map((job, index) => (
					<JobView
						key={index}
						job={job}
						isSelected={props.selectedJob === job}
						setSelectedJob={(job: Job | undefined) => {
							props.setSelectedJob(job);
							props.presenceManager.getStates().props.jobSelelction.local = {
								jobSelected: job ? job.jobId : "",
							};
							props.presenceManager.getStates().props.candidateSelection.local = {
								candidateSelected: "",
							};
						}}
						deleteJob={(job: Job) => {
							props.jobs.deleteJob(job);
						}}
						currentViewers={getKeysByValue(jobPresenceMap, job.jobId)}
						presenceManager={props.presenceManager}
					/>
				))}
			</div>
			<div className="flex mx-2 mb-2 justify-center">
				<button
					className="bg-blue-500 hover:bg-blue-300 text-white font-bold py-2 px-4 rounded w-1/2"
					onClick={() => {
						props.jobs.addJob(createTestJob(false));
					}}
				>
					+ Add New Job
				</button>
			</div>
		</div>
	);
}

export function JobView(props: {
	job: Job;
	isSelected: boolean;
	setSelectedJob: (job: Job | undefined) => void;
	deleteJob: (job: Job) => void;
	currentViewers: ISessionClient[];
	presenceManager: PresenceManager;
}): JSX.Element {
	useTreeNode(props.job);

	const presentUserInfoList = props.presenceManager.getUserInfo(props.currentViewers);

	return (
		<div
			className={`flex flex-col p-2 justify-center content-center mb-2 mt-2 cursor-pointer 
                ${props.isSelected ? "bg-cyan-50 border border-cyan-300" : "bg-slate-50 hover:bg-slate-100"}`}
			onClick={() => {
				props.setSelectedJob(props.job);
			}}
		>
			<div className="flex items-center justify-between gap-2">
				<div className="flex flex-grow text-lg font-extrabold bg-transparent text-black">
					{userAvatarGroupView({
						members: presentUserInfoList,
						size: 24,
						layout: "stack",
					})}
				</div>
				{props.job.isUnread && (
					<div className="flex items-center">
						<span className="w-2 h-2 bg-red-500 rounded-full"></span>
					</div>
				)}
				<Button
					appearance="subtle"
					icon={<DismissFilled />}
					onClick={(event) => {
						event.stopPropagation();
						props.deleteJob(props.job);
						if (props.isSelected) {
							props.setSelectedJob(undefined);
						}
					}}
				/>
			</div>

			<div className="flex flex-col gap-3 justify-center flex-wrap w-full h-full">
				<div className="flex flex-col gap-3 justify-center content-center m-2">
					<div className="mb-1">
						<label className="block mb-1 text-sm font-medium text-gray-900">
							Title:
						</label>
						<input
							className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
							value={props.job.jobTitle}
							onChange={(event) => (props.job.jobTitle = event.target.value)}
						/>
					</div>

					<div className="mb-1">
						<label className="block mb-1 text-sm font-medium text-gray-900">
							Description:
						</label>
						<textarea
							className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
							value={props.job.jobDescription}
							onChange={(event) => (props.job.jobDescription = event.target.value)}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
