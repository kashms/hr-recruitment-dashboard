/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */
import React, { useContext, useEffect, useState } from "react";
import { TreeView } from "fluid-framework";
import { Candidate, HRData, Job, type OnSiteSchedule } from "@lab/appSchema.js";
import { userAvatarGroupView } from "./ux/userAvatarGroupView.js";
import { InterviewerPoolView } from "./ux/interviewerPoolView.js";
import { OnSitePlanView } from "./ux/onSitePlanView.js";
import { CandidatesListView } from "./ux/candidatesListView.js";
import { JobsListView } from "./ux/jobsListView.js";
import { AiChatView } from "./mod3/aiChatView.js";
import { Button, FluentProvider, webLightTheme } from "@fluentui/react-components";
import { undoRedo } from "./utils/undo.js";
import { ArrowRedoFilled, ArrowUndoFilled } from "@fluentui/react-icons";
import { ISessionClient } from "@fluid-experimental/presence";
import { UndoRedoContext, PresenceContext } from "./index.js";

// {START MOD_1}
// export function HRApp(props: { data: TreeView<typeof HRData> }): JSX.Element {
// 	const appData = props.data.root;
	// {END MOD_1}

	// {START MOD_0}
	export function HRApp(props: { data: HRData }): JSX.Element {
		const appData = props.data;
	// {END MOD_0}
	const [selectedJob, setSelectedJob] = useState<Job>();
	const [selectedCandidate, setSelectedCandidate] = useState<Candidate>();
	const [onsiteScheduleSelectedCandidate, setOnsiteScheduleSelectedCandidate] =
		useState<OnSiteSchedule>();
	const [openDrawer, setOpenDrawer] = useState(false);

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

	const headerViews = [];
	headerViews.push(
		<h1 className="text-xl font-bold text-white flex-grow">HR Recruitment Dashboard</h1>,
	);

	const [showAnimatedFrame, setShowAnimatedFrame] = useState(false);

	// {START MOD_3}
	// headerViews.push(
	// 	<AiChatView
	// 		treeRoot={props.data}
	// 		showAnimatedFrame={(show: boolean) => {
	// 			setShowAnimatedFrame(show);
	// 		}}
	// 	/>,
	// );
	// {END MOD_3}

	const undoRedo = useContext(UndoRedoContext);
	if (undoRedo) {
		// Unsubscribe to undo-redo events when the component unmounts
		useEffect(() => {
			return undoRedo ? undoRedo.dispose : undefined;
		}, []);

		headerViews.push(<ActionToolBar undoRedo={undoRedo} />);
	}

	// {VIEW MOD_2}
	headerViews.push(<AppPresenceGroup />);
	// {END MOD_2}

	return (
		<div
			className={`h-screen frame 
			${showAnimatedFrame ? "animated-frame" : ""}`}
		>
			<div className="inner">
				<FluentProvider theme={webLightTheme}>
					<div className="flex flex-col h-fit w-full overflow-hidden overscroll-none gap-1">
						<div className="flex flex-row w-full bg-gray-800 p-4 gap-8 items-center">
							{headerViews}
						</div>
						<div className="flex flex-row flex-wrap w-full h-[calc(100vh-90px)]">
							<JobsListView
								jobs={appData.jobsList}
								setSelectedJob={handleJobSelected}
								selectedJob={selectedJob}
							/>
							{selectedJob && (
								<CandidatesListView
									job={selectedJob}
									selectedCandidate={selectedCandidate}
									setSelectedCandidate={handleCandidateSelected}
								/>
							)}
							{selectedCandidate && onsiteScheduleSelectedCandidate && (
								<OnSitePlanView
									candidate={selectedCandidate}
									onSiteSchedule={onsiteScheduleSelectedCandidate!}
									interviewerPool={appData.interviewerPool}
									handleToggleInterviewerList={() => setOpenDrawer(!openDrawer)}
								/>
							)}
							{onsiteScheduleSelectedCandidate && (
								<InterviewerPoolView
									interviewers={appData.interviewerPool}
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

export function AppPresenceGroup(): JSX.Element {
	const presenceManager = useContext(PresenceContext);
	if (presenceManager === undefined) {
		return <div></div>;
	}

	const [attendeesList, setAttendeesList] = useState<ISessionClient[]>([
		...presenceManager.getPresence().getAttendees(),
	]);

	const [invalidations, setInvalidations] = useState(0);
	useEffect(() => {
		presenceManager.getPresence().events.on("attendeeJoined", (attendee) => {
			setAttendeesList([...attendeesList, attendee]);
		});
		presenceManager.getPresence().events.on("attendeeDisconnected", (attendee) => {
			setAttendeesList(attendeesList.filter((a) => a.sessionId !== attendee.sessionId));
		});
		presenceManager.setUserInfoUpdateListener(() => {
			setInvalidations(invalidations + Math.random());
		});
	}, []);

	const userInfoList = presenceManager.getUserInfo(attendeesList);

	if (userInfoList) {
		return userAvatarGroupView({
			members: userInfoList,
			size: 40,
			layout: "spread",
		});
	} else {
		return <div>error</div>;
	}
}
