/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */
import React, { useEffect, useState } from "react";
import { TreeView, IServiceAudience, IMember } from "fluid-framework";
import { Candidate, HRData, Job, type OnSiteSchedule } from "@lab/appSchema.js";
import { userAvatarGroup } from "./ux/userAvatarGroup.js";
import { InterviewerList } from "./ux/interviewerList.js";
import { OnSitePlan } from "./ux/onSitePlan.js";
import { CandidatesList } from "./ux/candidatesList.js";
import { JobsList } from "./ux/jobsList.js";
import { AiChatView } from "./ux/aiChat.js";
import { Button, FluentProvider, webLightTheme } from "@fluentui/react-components";
import { undoRedo } from "./utils/undo.js";
import { ArrowRedoFilled, ArrowUndoFilled } from "@fluentui/react-icons";
import { PresenceManager } from "./utils/presenceManager.js";
import { ISessionClient } from "@fluid-experimental/presence";

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

	// AI in progress state for showing the animation
	const [showAnimatedFrame, setShowAnimatedFrame] = useState(false);

	const handleJobSelected = (job: Job | undefined) => {
		setSelectedJob(job);
		setSelectedCandidate(undefined);
		setOnsiteScheduleSelectedCandidate(undefined);
		setOpenDrawer(false);

		if (job) {
			job.isUnread = false;
		}
	};

	const handleCandidateSelected = (candidate: Candidate | undefined) => {
		setSelectedCandidate(candidate);

		if (candidate) {
			if (selectedJob?.hasOnSiteForCandidate(candidate.candidateId)) {
				const candidateSchedule = selectedJob.getOnSiteForCandidate(candidate.candidateId);
				if (candidateSchedule) {
					candidateSchedule.isUnread = false;
					setOnsiteScheduleSelectedCandidate(candidateSchedule);
				}
			} else {
				setOnsiteScheduleSelectedCandidate(undefined);
			}
			setOpenDrawer(false);

			candidate.isUnread = false;
		}
	};

	const handleAddInterviewer = (interviewerId: string) => {
		onsiteScheduleSelectedCandidate?.addInterviewer(interviewerId);
	};

	/** Unsubscribe to undo-redo events when the component unmounts */
	useEffect(() => {
		return props.undoRedo.dispose;
	}, []);

	return (
		<div
			className={`h-screen frame 
			${showAnimatedFrame ? "animated-frame" : ""}`}
		>
			<div className="inner">
				<FluentProvider theme={webLightTheme}>
					<div className="flex flex-col h-fit w-full overflow-hidden overscroll-none gap-1">
						<div className="flex flex-row w-full bg-gray-800 p-4 gap-8 items-center">
							<h1 className="text-xl font-bold text-white flex-grow">
								HR Recruitment Dashboard
							</h1>
							<AiChatView
								treeRoot={props.data}
								showAnimatedFrame={(show: boolean) => {
									setShowAnimatedFrame(show);
								}}
							/>
							<ActionToolBar undoRedo={props.undoRedo} />
							<AppPresenceGroup presenceManager={props.presenceManager} />
						</div>
						<div className="flex flex-row flex-wrap w-full h-[calc(100vh-90px)]">
							<JobsList
								jobs={props.data.root.jobsList}
								setSelectedJob={handleJobSelected}
								currentlySelectedJob={selectedJob}
								presenceManager={props.presenceManager}
							/>
							{selectedJob && (
								<CandidatesList
									job={selectedJob}
									selectedCandidate={selectedCandidate}
									setSelectedCandidate={handleCandidateSelected}
									presenceManager={props.presenceManager}
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

export function AppPresenceGroup(props: { presenceManager: PresenceManager }): JSX.Element {
	const [attendeesList, setAttendeesList] = useState<ISessionClient[]>([
		...props.presenceManager.getPresence().getAttendees(),
	]);

	useEffect(() => {
		props.presenceManager.getPresence().events.on("attendeeJoined", (attendee) => {
			setAttendeesList([...attendeesList, attendee]);
		});
		props.presenceManager.getPresence().events.on("attendeeDisconnected", (attendee) => {
			setAttendeesList(attendeesList.filter((a) => a.sessionId !== attendee.sessionId));
		});
		props.presenceManager.setUserInfoUpdateListener(() => {
			setInvalidations(invalidations + Math.random());
		});
	}, []);

	const [invalidations, setInvalidations] = useState(0);

	const userInfoList = props.presenceManager.getUserInfo(attendeesList);

	if (userInfoList) {
		return userAvatarGroup({
			members: userInfoList,
			size: 40,
			layout: "spread",
		});
	} else {
		return <div>error</div>;
	}
}
