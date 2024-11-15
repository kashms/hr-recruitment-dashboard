/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { TreeViewConfiguration, SchemaFactory } from "fluid-framework";

// Define a schema factory that is used to generate classes for the schema
const sf = new SchemaFactory("ef0b8eff-2876-4801-9b6a-973f09aab904");

export class Availability extends sf.array("Availability", sf.string) {
	public readonly setDayAvailability = (day: string, available: boolean) => {
		if (available && !this.includes(day)) {
			this.insertAtStart(day);
		} else {
			const index = this.indexOf(day);
			if (index !== -1) {
				this.removeAt(index);
			}
		}
	};
}

export class OnSiteSchedule extends sf.object("OnSiteSchedule", {
	day: sf.required(sf.string),
	interviewerIds: sf.required(sf.array(sf.string)),
	candidateId: sf.required(sf.string),
	isUnread: sf.required(sf.boolean),
}) {
	public readonly addInterviewer = (interviewerId: string) => {
		if (this.interviewerIds.includes(interviewerId)) {
			return;
		}
		this.interviewerIds.insertAtEnd(interviewerId);
	};

	public readonly removeInterviewer = (interviewerId: string) => {
		const index = this.interviewerIds.indexOf(interviewerId);
		if (index !== -1) {
			this.interviewerIds.removeAt(index);
		}
	};
}

export class Interviewer extends sf.object("Interviewer", {
	role: sf.string,
	interviewerId: sf.required(sf.string),
	name: sf.required(sf.string),
	availability: sf.required(Availability),
}) {}

export class Candidate extends sf.object("Candidate", {
	name: sf.string,
	candidateId: sf.required(sf.string),
	yearsOfExperience: sf.number,
	availability: sf.required(Availability),
	isUnread: sf.required(sf.boolean),
}) {}

export class Job extends sf.object("Job", {
	jobId: sf.string,
	jobTitle: sf.required(sf.string),
	jobDescription: sf.required(sf.string),
	candidates: sf.required(sf.array(Candidate)),
	onSiteSchedule: sf.required(sf.array(OnSiteSchedule)),
	isUnread: sf.required(sf.boolean),
}) {
	public readonly addNewOnSiteForCandidate = (candiadteId: string) => {
		const newOnSite = new OnSiteSchedule({
			day: "Monday",
			interviewerIds: [],
			candidateId: candiadteId,
			isUnread: false,
		});
		this.onSiteSchedule.insertAtEnd(newOnSite);
	};

	public readonly hasOnSiteForCandidate = (candidateId: string) => {
		return !!this.getOnSiteForCandidate(candidateId);
	};

	public readonly getOnSiteForCandidate = (candidateId: string) => {
		return this.onSiteSchedule.find((onSite) => onSite.candidateId === candidateId);
	};

	public readonly addCandidate = (candidate: Candidate) => {
		this.candidates.insertAtEnd(candidate);
	};
}

export class JobsArray extends sf.array("JobsArray", Job) {
	public readonly addJob = (job: Job) => {
		this.insertAtEnd(job);
	};

	public readonly deleteJob = (job: Job) => {
		const index = this.indexOf(job);
		if (index !== -1) {
			this.removeAt(index);
		}
	};
}

export class InterviewerPool extends sf.array("InterviewerPool", Interviewer) {}

export class HRData extends sf.object("HRData", {
	jobsList: JobsArray,
	interviewerPool: sf.required(InterviewerPool),
}) {}

export const treeConfiguration = new TreeViewConfiguration({ schema: HRData });
