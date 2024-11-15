/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useContext, useEffect, useState } from "react";
import { Job, JobsArray } from "@lab/appSchema.js";
import { createTestJob } from "../utils/testData.js";
import { Button } from "@fluentui/react-components";
import { DismissFilled } from "@fluentui/react-icons";
import { getKeysByValue } from "../utils/util.js";
import { userAvatarGroupView } from "./userAvatarGroupView.js";
import { ISessionClient } from "@fluidframework/presence/alpha";
import { UserInfo } from "../utils/presenceManager.js";
import { useTreeNode } from "../utils/treeReactHooks.js";
import { PresenceContext } from "../index.js";

export function JobsListView(props: {
	jobs: JobsArray;
	setSelectedJob: (job: Job | undefined) => void;
	selectedJob?: Job;
}): JSX.Element {
	//############################ START MODULE 0 changes here ##############################
	const [jobs, setJobs] = useState(props.jobs);
	const getJobs = () => {
		return jobs;
	};
	const deleteJob = (job: Job) => {
		const newJobs = new JobsArray(...jobs);
		newJobs.deleteJob(job);
		setJobs(newJobs);
	};
	const addJob = (job: Job) => {
		const newJobs = new JobsArray(...jobs);
		newJobs.addJob(job);
		setJobs(newJobs);
	};
	//////////////////////////////// END MODULE 0 changes here //////////////////////////////

	//############################ START MODULE 1 changes here ##############################
	// useTreeNode(props.jobs);
	// const getJobs = () => {
	//     return props.jobs;
	// }
	// const deleteJob = (job: Job) => {
	//     props.jobs.deleteJob(job);
	// }
	// const addJob = (job: Job) => {
	//     props.jobs.addJob(job);
	// }
	//////////////////////////////// END MODULE 1 changes here //////////////////////////////

	// {VIEW MOD_2}
	const presenceManager = useContext(PresenceContext);
	let presenceUserInfoList: UserInfo[][] = [];
	if (presenceManager) {
		const [jobPresenceMap, setJobPresenceMap] = useState<Map<ISessionClient, string>>(
			new Map(
				[...presenceManager.getStates().jobSelection.clientValues()].map(
					(cv) => [cv.client, cv.value.jobSelected] as [ISessionClient, string],
				),
			),
		);
		useEffect(() => {
			return presenceManager.getStates().jobSelection.events.on("updated", (update) => {
				if (jobPresenceMap) {
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
				}
			});
		}, []);
		presenceUserInfoList = getJobs().map((job) => {
			return presenceManager.getUserInfo(getKeysByValue(jobPresenceMap, job.jobId));
		});
	}
	// {END MOD_2}

	const setSelectedJob = (job: Job | undefined) => {
		props.setSelectedJob(job);

		// {VIEW MOD_2}
		if (presenceManager) {
			presenceManager.getStates().jobSelection.local = {
				jobSelected: job ? job.jobId : "",
			};
			presenceManager.getStates().candidateSelection.local = {
				candidateSelected: "",
			};
		}
		// {END MOD_2}
	};

	return (
		<div className="flex flex-col gap-1 content-center w-96 min-w-96 h-full border-r-4 overflow-auto">
			<div className="text-lg p-2 mx-0.5 font-bold bg-cyan-600 text-white text-center">
				Jobs
			</div>
			<div className="flex-grow mx-2">
				{getJobs().map((job, index) => (
					<JobView
						key={index}
						job={job}
						isSelected={props.selectedJob === job}
						setSelectedJob={setSelectedJob}
						deleteJob={(job: Job) => {
							deleteJob(job);
						}}
						// {VIEW MOD_2}
						presenceUserInfoList={presenceUserInfoList[index]}
						// {END MOD_2}
					/>
				))}
			</div>
			<div className="flex mx-2 mb-2 justify-center">
				<button
					className="bg-blue-500 hover:bg-blue-300 text-white font-bold py-2 px-4 rounded w-1/2"
					onClick={() => {
						addJob(createTestJob(false));
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
	presenceUserInfoList?: UserInfo[];
}): JSX.Element {
	//############################ START MODULE 0 changes here ##############################
	const [job, setJob] = useState(props.job);
	const getjob = () => {
		return job;
	};
	const setJobTitle = (newTitle: string) => {
		setJob({ ...job, jobTitle: newTitle });
	};
	const setJobDescription = (newDescription: string) => {
		setJob({ ...job, jobDescription: newDescription });
	};
	//////////////////////////////// END MODULE 0 changes here //////////////////////////////

	//############################ START MODULE 1 changes here ##############################
	// useTreeNode(props.job);
	// const getjob = () => {
	//     return props.job;
	// };
	// const setJobTitle = (newTitle: string) => {
	//     props.job.jobTitle = newTitle;
	// };
	// const setJobDescription = (newDescription: string) => {
	//     props.job.jobDescription = newDescription;
	// };
	//////////////////////////////// END MODULE 1 changes here //////////////////////////////

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
					{
						// {VIEW MOD_2}
						userAvatarGroupView({
							members: props.presenceUserInfoList,
							size: 24,
							layout: "stack",
						})
						// {END MOD_2}
					}
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
							value={getjob().jobTitle}
							onChange={(event) => setJobTitle(event.target.value)}
						/>
					</div>

					<div className="mb-1">
						<label className="block mb-1 text-sm font-medium text-gray-900">
							Description:
						</label>
						<textarea
							className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
							value={getjob().jobDescription}
							onChange={(event) => setJobDescription(event.target.value)}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
