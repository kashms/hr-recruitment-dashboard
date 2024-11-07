/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useEffect, useRef, useState } from "react";
import { TreeView, IServiceAudience, IMember } from "fluid-framework";
import { Candidate, HRData, Job, type OnSiteSchedule } from "./schema.js";
import { OdspMember } from "@fluidframework/odsp-client/beta";
import { userAvatarGroup } from "./ux/userAvatarGroup.js";
import { IPresence, ISessionClient, Latest, PresenceStates } from "@fluid-experimental/presence";
import { InterviewerList } from "./ux/interviewerList.js";
import { OnSitePlan } from "./ux/onSitePlan.js";
import { CandidatesList } from "./ux/candidatesList.js";
import { JobsList } from "./ux/jobsList.js";
import { AiChatView } from "./ux/aiChat.js";
import { Button, FluentProvider, webLightTheme } from "@fluentui/react-components";
import { undoRedo } from "./utils/undo.js";
import { ArrowRedoFilled, ArrowUndoFilled } from "@fluentui/react-icons";

export function HRApp(props: {
	data: TreeView<typeof HRData>;
	audience: IServiceAudience<IMember>;
	presence: IPresence;
	undoRedo: undoRedo;
}): JSX.Element {
	const [selectedJob, setSelectedJob] = useState<Job>();
	const [selectedCandidate, setSelectedCandidate] = useState<Candidate>();
	const [openDrawer, setOpenDrawer] = useState(false);
	const [onsiteScheduleSelectedCandidate, setOnsiteScheduleSelectedCandidate] =
		useState<OnSiteSchedule>();
	const [invalidations, setInvalidations] = useState(0);

	// AI in progress state for showing the animation
	const [showAnimatedFrame, setShowAnimatedFrame] = useState(false);

	const [jobPresenceMap, setJobPresenceMap] = useState<Map<ISessionClient, string>>(new Map());
	const [candidatePresenceMap, setCandidatePresenceMap] = useState<Map<ISessionClient, string>>(
		new Map(),
	);
	const [appUserInfo, setAppUserInfo] = useState<UserInfo[]>();

	const handleJobSelected = (job: Job | undefined) => {
		setSelectedJob(job);
		setSelectedCandidate(undefined);
		setOnsiteScheduleSelectedCandidate(undefined);
		setOpenDrawer(false);

		if (job?.jobId) {
			if (appSelectionPresenceStateRef.current) {
				appSelectionPresenceStateRef.current.jobSelelction.local = {
					jobSelected: job?.jobId,
				};
				appSelectionPresenceStateRef.current.candidateSelection.local = {
					candidateSelected: "",
				};
			}
			job.setSeen();
		}
	};

	const handleCandidateSelected = (candidate: Candidate | undefined) => {
		setSelectedCandidate(candidate);

		if (candidate?.candidateId) {
			if (selectedJob?.hasOnSiteForCandidate(candidate.candidateId)) {
				const candidateSchedule = selectedJob.getOnSiteForCandidate(candidate.candidateId);
				if (candidateSchedule) {
					candidateSchedule.setSeen();
					setOnsiteScheduleSelectedCandidate(candidateSchedule);
				}
			} else {
				setOnsiteScheduleSelectedCandidate(undefined);
			}
			setOpenDrawer(false);

			if (appSelectionPresenceStateRef.current) {
				appSelectionPresenceStateRef.current.candidateSelection.local = {
					candidateSelected: candidate.candidateId,
				};
			}
		}
		candidate?.setSeen();
	};

	const handleAddInterviewer = (interviewerId: string) => {
		// Check if the interviewer is already in the list
		if (onsiteScheduleSelectedCandidate?.interviewerIds.includes(interviewerId)) {
			return;
		}
		onsiteScheduleSelectedCandidate?.interviewerIds.insertAtEnd(interviewerId);
	};

	const resetUserInfoList = () => {
		if (appSelectionPresenceStateRef.current) {
			const userInfoArray = [
				...appSelectionPresenceStateRef.current.userInfo.clientValues(),
			].map((v) => v.value);
			// if user array already contains the local user by using the userId, then don't add it again
			if (
				!userInfoArray.some(
					(v) =>
						appSelectionPresenceStateRef.current &&
						v.userId === appSelectionPresenceStateRef.current.userInfo.local.userId,
				)
			) {
				userInfoArray.push(appSelectionPresenceStateRef.current.userInfo.local);
			}

			setAppUserInfo(userInfoArray);
		}
	};

	const updateMyself = () => {
		const myselfMember = props.audience.getMyself();
		if (myselfMember && appSelectionPresenceStateRef.current) {
			const odspMember = myselfMember as IMember as OdspMember;
			appSelectionPresenceStateRef.current.userInfo.local = {
				userId: odspMember.id,
				userName: odspMember.name,
				userEmail: odspMember.email,
			};
			resetUserInfoList();
		}
	};

	/** Unsubscribe to undo-redo events when the component unmounts */
	useEffect(() => {
		return props.undoRedo.dispose;
	}, []);

	useEffect(() => {
		props.audience.on("membersChanged", updateMyself);

		return () => {
			props.audience.off("membersChanged", updateMyself);
		};
	}, []);

	useEffect(() => {
		const appSelectionWorkspace = "appSelection:workspace";
		appSelectionPresenceStateRef.current = props.presence.getStates(
			appSelectionWorkspace, // Worksapce address
			appSelectionSchema, // Worksapce schema
		);

		appSelectionPresenceStateRef.current.jobSelelction.events.on("updated", (update) => {
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
		appSelectionPresenceStateRef.current.candidateSelection.events.on("updated", (update) => {
			const remoteSessionClient = update.client;
			const remoteSelectedCandidateId = update.value.candidateSelected;

			if (remoteSelectedCandidateId === "") {
				candidatePresenceMap.delete(remoteSessionClient);
				setCandidatePresenceMap(new Map(candidatePresenceMap));
			} else {
				setCandidatePresenceMap(
					new Map(
						candidatePresenceMap.set(remoteSessionClient, remoteSelectedCandidateId),
					),
				);
			}
		});

		appSelectionPresenceStateRef.current.userInfo.events.on("updated", () => {
			resetUserInfoList();
		});

		setInvalidations(invalidations + Math.random());
	}, []);

	const appSelectionPresenceStateRef = useRef<PresenceStates<typeof appSelectionSchema> | null>(
		null,
	);

	return (
		<div
			className={`h-screen frame 
			${showAnimatedFrame ? "animated-frame" : ""}`}
		>
			<div className="inner">
				<FluentProvider theme={webLightTheme}>
					<div className="flex flex-col h-fit w-full overflow-hidden overscroll-none gap-1">
						<HeaderBar
							audience={props.audience}
							treeRoot={props.data}
							showAnimatedFrame={(show: boolean) => {
								setShowAnimatedFrame(show);
							}}
							appUserInfo={appUserInfo}
							undoRedo={props.undoRedo}
						/>
						<div className="flex flex-row flex-wrap w-full h-[calc(100vh-90px)]">
							<JobsList
								jobs={props.data.root.jobsList}
								setSelectedJob={handleJobSelected}
								currentlySelectedJob={selectedJob}
								treeRoot={props.data}
								jobPresenceMap={jobPresenceMap}
								userInfoState={appSelectionPresenceStateRef?.current?.userInfo}
								audience={props.audience}
							/>
							{selectedJob && (
								<CandidatesList
									job={selectedJob}
									selectedCandidate={selectedCandidate}
									setSelectedCandidate={handleCandidateSelected}
									candidatePresenceMap={candidatePresenceMap}
									userInfoState={appSelectionPresenceStateRef?.current?.userInfo}
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
	showAnimatedFrame: (show: boolean) => void;
	appUserInfo: UserInfo[] | undefined;
	undoRedo: undoRedo;
}): JSX.Element {
	return (
		<div className="flex flex-row w-full bg-gray-800 p-4 gap-8 items-center">
			<h1 className="text-xl font-bold text-white">HR Recruitment Dashboard</h1>
			<AiChatView treeRoot={props.treeRoot} showAnimatedFrame={props.showAnimatedFrame} />
			<ActionToolBar undoRedo={props.undoRedo} />
			<AppPresenceGroup appUserInfo={props.appUserInfo} />
		</div>
	);
}

// Action tool bar container undo redo buttons
export function ActionToolBar(props: { undoRedo: undoRedo }): JSX.Element {
	return (
		<div className="flex flex-row gap-4">
			<Button
				appearance="subtle"
				icon={<ArrowUndoFilled className="text-white" />}
				onClick={() => props.undoRedo.undo()}
			/>
			<Button
				appearance="subtle"
				icon={<ArrowRedoFilled className="text-white" />}
				onClick={() => props.undoRedo.redo()}
			/>
		</div>
	);
}

export function AppPresenceGroup(props: { appUserInfo: UserInfo[] | undefined }): JSX.Element {
	if (props.appUserInfo) {
		return userAvatarGroup({ members: props.appUserInfo, size: 40, layout: "spread" });
	} else {
		return <div>error</div>;
	}
}

export const appSelectionSchema = {
	jobSelelction: Latest({ jobSelected: "" }),
	candidateSelection: Latest({ candidateSelected: "" }),
	userInfo: Latest({ userId: "", userName: "", userEmail: "" } satisfies UserInfo),
};

export type UserInfo = { userId: string; userName: string; userEmail: string };
