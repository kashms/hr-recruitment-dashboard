/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */
import React, { useEffect, useState } from "react";
import { TreeView, IServiceAudience, IMember } from "fluid-framework";
import { Candidate, HRData, Job, type OnSiteSchedule } from "./schema.js";
import { OdspMember } from "@fluidframework/odsp-client/beta";
import { userAvatarGroup } from "./ux/userAvatarGroup.js";
import { InterviewerList } from "./ux/interviewerList.js";
import { OnSitePlan } from "./ux/onSitePlan.js";
import { CandidatesList } from "./ux/candidatesList.js";
import { JobsList } from "./ux/jobsList.js";
import { AiChatView } from "./ux/aiChat.js";
import { Button, FluentProvider, webLightTheme } from "@fluentui/react-components";
import { undoRedo } from "./utils/undo.js";
import { ArrowRedoFilled, ArrowUndoFilled } from "@fluentui/react-icons";
import { PresenceManager, UserInfo } from "./utils/presenceManager.js";

export function HRApp(props: {
	data: TreeView<typeof HRData>;
	audience: IServiceAudience<IMember>;
	presenceManager: PresenceManager;
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
	const [appUserInfo, setAppUserInfo] = useState<UserInfo[]>();

	const handleJobSelected = (job: Job | undefined) => {
		setSelectedJob(job);
		setSelectedCandidate(undefined);
		setOnsiteScheduleSelectedCandidate(undefined);
		setOpenDrawer(false);

		if (job?.jobId) {
			props.presenceManager.getStates().candidateSelection.local = {
				candidateSelected: "",
			};
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

			props.presenceManager.getStates().candidateSelection.local = {
				candidateSelected: candidate.candidateId,
			};
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
		const userInfoArray = [...props.presenceManager.getStates().userInfo.clientValues()].map(
			(v) => v.value,
		);
		// if user array already contains the local user by using the userId, then don't add it again
		if (
			!userInfoArray.some(
				(v) =>
					props.presenceManager.getStates() &&
					v.userId === props.presenceManager.getStates().userInfo.local.userId,
			)
		) {
			userInfoArray.push(props.presenceManager.getStates().userInfo.local);
		}

		setAppUserInfo(userInfoArray);
	};

	const updateMyself = () => {
		const myselfMember = props.audience.getMyself();
		if (myselfMember) {
			const odspMember = myselfMember as IMember as OdspMember;
			props.presenceManager.getStates().userInfo.local = {
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
		props.presenceManager.getStates().userInfo.events.on("updated", () => {
			resetUserInfoList();
		});

		setInvalidations(invalidations + Math.random());
	}, []);

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
								presenceManager={props.presenceManager}
								audience={props.audience}
							/>
							{selectedJob && (
								<CandidatesList
									job={selectedJob}
									selectedCandidate={selectedCandidate}
									setSelectedCandidate={handleCandidateSelected}
									presenceManager={props.presenceManager}
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
