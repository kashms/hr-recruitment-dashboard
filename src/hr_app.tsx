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
import { UndoRedoContext, PresenceContext } from "./index.js";

//############################ START MODULE 0 changes here ##############################
export function HRApp(props: { data: HRData }): JSX.Element {
	const appData = props.data;
	//////////////////////////////// END MODULE 0 changes here //////////////////////////////

	//############################ START MODULE 1 changes here ##############################
	// export function HRApp(props: { data: TreeView<typeof HRData> }): JSX.Element {
	// 	const appData = props.data.root;
	//////////////////////////////// END MODULE 1 changes here //////////////////////////////

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
		<h1 key="header" className="text-xl font-bold text-white flex-grow">
			HR Recruitment Dashboard
		</h1>,
	);

	const [showAnimatedFrame, setShowAnimatedFrame] = useState(false);

	//############################ START MODULE 3 changes here ##############################
	// headerViews.push(
	// 	<AiChatView
	// 		treeRoot={props.data}
	// 		showAnimatedFrame={(show: boolean) => {
	// 			setShowAnimatedFrame(show);
	// 		}}
	// 	/>,
	// );
	//////////////////////////////// END MODULE 3 changes here //////////////////////////////

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

	const [invalidations, setInvalidations] = useState(0);

	useEffect(() => {
		const unsubJoin = presenceManager.getPresence().events.on("attendeeJoined", () => {
			setInvalidations(invalidations + Math.random());
		});
		const unsubDisconnect = presenceManager
			.getPresence()
			.events.on("attendeeDisconnected", () => {
				setInvalidations(invalidations + Math.random());
			});
		presenceManager.setUserInfoUpdateListener(() => {
			setInvalidations(invalidations + Math.random());
		});

		return () => {
			unsubJoin();
			unsubDisconnect();
			presenceManager.setUserInfoUpdateListener(() => {});
		};
	}, []);

	const connectedAttendees = [...presenceManager.getPresence().getAttendees()].filter(
		(attendee) => attendee.getConnectionStatus() === "Connected",
	);

	const userInfoList = presenceManager.getUserInfo(connectedAttendees);

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