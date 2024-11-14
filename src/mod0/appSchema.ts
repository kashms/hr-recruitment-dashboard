/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

export class Availability extends Array<string> {
	constructor(...days: string[]) {
		super(...days);
	}

	// setDayAvailability method
	public readonly setDayAvailability = (day: string, available: boolean) => {
		if (available && !this.includes(day)) {
			this.unshift(day);
		} else {
			const index = this.indexOf(day);
			if (index !== -1) {
				this.splice(index, 1);
			}
		}
	};
}

export class OnSiteSchedule {
	day: string;
	interviewerIds: string[];
	candidateId: string;
	isUnread: boolean = false;

	constructor({
		day,
		interviewerIds,
		candidateId,
		isUnread,
	}: {
		day: string;
		interviewerIds: string[];
		candidateId: string;
		isUnread: boolean;
	}) {
		this.day = day;
		this.interviewerIds = interviewerIds;
		this.candidateId = candidateId;
		this.isUnread = isUnread;
	}

	public readonly addInterviewer = (interviewerId: string) => {
		this.interviewerIds.push(interviewerId);
	};

	public readonly removeInterviewer = (interviewerId: string) => {
		const index = this.interviewerIds.indexOf(interviewerId);
		this.interviewerIds.splice(index, 1);
	};
}

export class Interviewer {
	role: string;
	interviewerId: string;
	name: string;
	availability: Availability;

	constructor({
		role,
		interviewerId,
		name,
		availability,
	}: {
		role: string;
		interviewerId: string;
		name: string;
		availability: Availability;
	}) {
		this.role = role;
		this.interviewerId = interviewerId;
		this.name = name;
		this.availability = availability;
	}
}

export class Candidate {
	name: string;
	candidateId: string;
	yearsOfExperience: number;
	availability: Availability;
	isUnread: boolean = false;

	constructor({
		name,
		candidateId,
		yearsOfExperience,
		availability,
		isUnread,
	}: {
		name: string;
		candidateId: string;
		yearsOfExperience: number;
		availability: Availability;
		isUnread: boolean;
	}) {
		this.name = name;
		this.candidateId = candidateId;
		this.yearsOfExperience = yearsOfExperience;
		this.availability = availability;
		this.isUnread = isUnread;
	}
}

export class Job {
	jobId: string;
	jobState: string;
	jobTitle: string;
	jobDescription: string;
	candidates: Candidate[];
	onSiteSchedule: OnSiteSchedule[];
	isUnread: boolean;

	constructor({
		jobId,
		jobState,
		jobTitle,
		jobDescription,
		candidates,
		onSiteSchedule,
		isUnread,
	}: {
		jobId: string;
		jobState: string;
		jobTitle: string;
		jobDescription: string;
		candidates: Candidate[];
		onSiteSchedule: OnSiteSchedule[];
		isUnread: boolean;
	}) {
		this.jobId = jobId;
		this.jobState = jobState;
		this.jobTitle = jobTitle;
		this.jobDescription = jobDescription;
		this.candidates = candidates;
		this.onSiteSchedule = onSiteSchedule;
		this.isUnread = isUnread;
	}

	public readonly addNewOnSiteForCandidate = (candiadteId: string) => {
		const newOnSite = new OnSiteSchedule({
			day: "Monday",
			interviewerIds: [],
			candidateId: candiadteId,
			isUnread: false,
		});
		this.onSiteSchedule.push(newOnSite);
	};

	public readonly hasOnSiteForCandidate = (candidateId: string) => {
		return !!this.getOnSiteForCandidate(candidateId);
	};

	public readonly getOnSiteForCandidate = (candidateId: string) => {
		return this.onSiteSchedule.find((onSite) => onSite.candidateId === candidateId);
	};

	public readonly addCandidate = (candidate: Candidate) => {
		this.candidates.push(candidate);
	};
}

export class JobsArray extends Array<Job> {
	public addJob(job: Job) {
		this.push(job);
	}

	public deleteJob(job: Job) {
		const index = this.indexOf(job);
		this.splice(index, 1);
	}
}

export class InterviewerPool extends Array<Interviewer> {}

export class HRData {
	jobsList: JobsArray;
	interviewerPool: InterviewerPool;

	constructor({
		jobsList,
		interviewerPool,
	}: {
		jobsList: Job[];
		interviewerPool: Interviewer[];
	}) {
		this.jobsList = new JobsArray(...jobsList);
		this.interviewerPool = new InterviewerPool(...interviewerPool);
	}
}

export const treeConfiguration = undefined;
