/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useEffect, useRef, useState } from "react";
import { TreeView, IServiceAudience, IMember } from "fluid-framework";
import { Candidate, HRData, Job, type OnSiteSchedule } from "./schema.js";
import { OdspMember } from "@fluidframework/odsp-client/beta";
import { userAvatarGroup } from "./ux/userAvatarGroup.js";
import { IPresence, Latest, PresenceStates } from "@fluid-experimental/presence";
import { InterviewerList } from "./ux/interviewerList.js";
import { OnSitePlan } from "./ux/onSitePlan.js";
import { CandidatesList } from "./ux/candidatesList.js";
import { JobsList } from "./ux/jobsList.js";
import { AiChatView } from "./ux/aiChat.js";
import { FluentProvider, webLightTheme } from "@fluentui/react-components";

export function HRApp(props: {
	data: TreeView<typeof HRData>;
	audience: IServiceAudience<IMember>;
	presence: IPresence;
}): JSX.Element {
	const [selectedJob, setSelectedJob] = useState<Job>();
	const [selectedCandidate, setSelectedCandidate] = useState<Candidate>();
	const [openDrawer, setOpenDrawer] = useState(false);
	const [onsiteScheduleSelectedCandidate, setOnsiteScheduleSelectedCandidate] =
		useState<OnSiteSchedule>();
	const [invalidations, setInvalidations] = useState(0);
	const [AiInProgress, setAiInProgress] = useState(false);

	const [jobPresenceMap, setJobPresenceMap] = useState<Map<string, string>>(new Map());
	const [candidatePresenceMap, setCandidatePresenceMap] = useState<Map<string, string>>(
		new Map(),
	);

	const handleSetJobSelected = (job: Job | undefined) => {
		setSelectedJob(job);
		setSelectedCandidate(undefined);
		setOnsiteScheduleSelectedCandidate(undefined);
		setOpenDrawer(false);

		if (job?.jobId) {
			if (appSelectionPresenceStateRef.current) {
				appSelectionPresenceStateRef.current.jobSelelction.local = {
					jobSelected: job?.jobId,
				};
				appSelectionPresenceStateRef.current.candidateSelelction.local = {
					candidateSelected: "",
				};
			}
		}
		if (job) {
			job.llmCollaboration = false;
		}
	};

	const handleCandidateClick = (candidate: Candidate) => {
		setSelectedCandidate(candidate);
		setOnsiteScheduleSelectedCandidate(undefined);
		selectedJob?.onSiteSchedule.forEach((onSiteSchedule) => {
			if (onSiteSchedule.candidateId === candidate.candidateId) {
				setOnsiteScheduleSelectedCandidate(onSiteSchedule);
			}
		});
		setOpenDrawer(false);

		if (appSelectionPresenceStateRef.current) {
			appSelectionPresenceStateRef.current.candidateSelelction.local = {
				candidateSelected: candidate.candidateId,
			};
		}
		if (candidate) {
			candidate.llmCollaboration = false;
		}
	};

	const handleAddInterviewer = (interviewerId: string) => {
		// Check if the interviewer is already in the list
		if (onsiteScheduleSelectedCandidate?.interviewerIds.includes(interviewerId)) {
			return;
		}
		onsiteScheduleSelectedCandidate?.interviewerIds.insertAtEnd(interviewerId);
	};

	useEffect(() => {
		const appSelectionWorkspace = "appSelection:workspace";
		appSelectionPresenceStateRef.current = props.presence.getStates(
			appSelectionWorkspace, // Worksapce address
			appSelectionSchema, // Worksapce schema
		);

		appSelectionPresenceStateRef.current.jobSelelction.events.on("updated", (update) => {
			const remoteConnectionId = update.client.connectionId();
			const remoteSelectedJobId = update.value.jobSelected;

			// if empty string, then no job is selected, remove it from the map
			if (remoteSelectedJobId === "") {
				jobPresenceMap.delete(remoteConnectionId);
				setJobPresenceMap(new Map(jobPresenceMap));
			} else {
				setJobPresenceMap(
					new Map(jobPresenceMap.set(remoteConnectionId, remoteSelectedJobId)),
				);
			}
		});
		appSelectionPresenceStateRef.current.candidateSelelction.events.on("updated", (update) => {
			const remoteConnectionId = update.client.connectionId();
			const remoteSelectedCandidateId = update.value.candidateSelected;

			if (remoteSelectedCandidateId === "") {
				candidatePresenceMap.delete(remoteConnectionId);
				setCandidatePresenceMap(new Map(candidatePresenceMap));
			} else {
				setCandidatePresenceMap(
					new Map(
						candidatePresenceMap.set(remoteConnectionId, remoteSelectedCandidateId),
					),
				);
			}
		});
		setInvalidations(invalidations + Math.random());
	}, []);

	const appSelectionPresenceStateRef = useRef<PresenceStates<typeof appSelectionSchema> | null>(
		null,
	);

	return (
		<div
			className={`h-screen frame 
			${AiInProgress ? "animated-frame" : ""}`}
		>
			<div className="inner">
				<FluentProvider theme={webLightTheme}>
					<div className="flex flex-col h-fit w-full overflow-hidden overscroll-none gap-1">
						<HeaderBar
							audience={props.audience}
							treeRoot={props.data}
							AiInProgress={(inProgress: boolean) => {
								setAiInProgress(inProgress);
							}}
						/>
						<div className="flex flex-row flex-wrap w-full h-[calc(100vh-90px)]">
							<JobsList
								jobs={props.data.root.jobsList}
								setSelectedJob={handleSetJobSelected}
								currentlySelectedJob={selectedJob}
								treeRoot={props.data}
								jobPresenceMap={jobPresenceMap}
								audience={props.audience}
							/>
							{selectedJob && (
								<CandidatesList
									job={selectedJob}
									selectedCandidate={selectedCandidate}
									onCandidateClick={handleCandidateClick}
									candidatePresenceMap={candidatePresenceMap}
									audience={props.audience}
								/>
							)}
							{selectedCandidate && onsiteScheduleSelectedCandidate && (
								<OnSitePlan
									candidate={selectedCandidate}
									onSiteSchedule={onsiteScheduleSelectedCandidate!}
									interviewerPool={props.data.root.interviewerPool}
									handleToggleInterviewerList={() => setOpenDrawer(!openDrawer)}
								/>
							)}
							{onsiteScheduleSelectedCandidate && (
								<InterviewerList
									interviewers={props.data.root.interviewerPool}
									isOpen={openDrawer}
									setIsOpen={setOpenDrawer}
									handleAddInterviewer={handleAddInterviewer}
								/>
							)}
						</div>
					</div>
				</FluentProvider>
			</div>
		</div>
	);
}

export function HeaderBar(props: {
	audience: IServiceAudience<IMember>;
	treeRoot: TreeView<typeof HRData>;
	AiInProgress: (inProgress: boolean) => void;
}): JSX.Element {
	return (
		<div className="flex flex-row w-full bg-gray-800 p-4 gap-8 items-center">
			<h1 className="text-xl font-bold text-white">HR Recruitment Dashboard</h1>
			<AiChatView treeRoot={props.treeRoot} AiInProgress={props.AiInProgress} />
			<CreateAvatarGroup audience={props.audience} />
		</div>
	);
}

export function CreateAvatarGroup(props: { audience: IServiceAudience<IMember> }): JSX.Element {
	const [fluidMembers, setFluidMembers] = useState<IMember[]>([]);

	const updateMembers = () => {
		if (props.audience.getMyself() == undefined) return;
		if (props.audience.getMyself()?.id == undefined) return;
		if (props.audience.getMembers() == undefined) return;

		setFluidMembers(Array.from(props.audience.getMembers().values()));
	};

	useEffect(() => {
		props.audience.on("membersChanged", updateMembers);

		return () => {
			props.audience.off("membersChanged", updateMembers);
		};
	}, []);

	const odspMembers = fluidMembers as OdspMember[];
	if (odspMembers[0]?.email) {
		return userAvatarGroup({ members: odspMembers, size: 40, layout: "spread" });
	} else {
		return <div>error</div>;
	}
}

const appSelectionSchema = {
	jobSelelction: Latest({ jobSelected: "" }),
	candidateSelelction: Latest({ candidateSelected: "" }),
};
