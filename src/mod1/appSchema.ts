/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

export class Availability extends Array<string> {
	constructor(days: string[]) {
		super(...days);
	}
	// insertAtStart method
	public insertAtStart(day: string) {
		this.unshift(day);
	}

	// removeAt method
	public removeAt(index: number) {
		this.splice(index, 1);
	}
}

export class OnSiteSchedule {
	day: string;
	interviewerIds: string[];
	candidateId: string;
	isUnread: boolean = false;

	constructor({ day, interviewerIds, candidateId, isUnread }: { day: string, interviewerIds: string[], candidateId: string, isUnread: boolean }) {
		this.day = day;
		this.interviewerIds = interviewerIds;
		this.candidateId = candidateId;
		this.isUnread = isUnread;
	}

	public readonly addInterviewer = (interviewerId: string) => {
		this.interviewerIds.push(interviewerId);
	}

	public readonly removeInterviewer = (interviewerId: string) => {
		const index = this.interviewerIds.indexOf(interviewerId);
		this.interviewerIds.splice(index, 1);
	}
}

export class Interviewer {
	role: string;
	interviewerId: string;
	name: string;
	availability: Availability;

	constructor({ role, interviewerId, name, availability }: { role: string, interviewerId: string, name: string, availability: Availability }) {
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

	constructor({ name, candidateId, yearsOfExperience, availability, isUnread }: { name: string, candidateId: string, yearsOfExperience: number, availability: Availability, isUnread: boolean }) {
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

	constructor({ jobId, jobState, jobTitle, jobDescription, candidates, onSiteSchedule, isUnread }: { jobId: string, jobState: string, jobTitle: string, jobDescription: string, candidates: Candidate[], onSiteSchedule: OnSiteSchedule[], isUnread: boolean }) {
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
	}

	public readonly getOnSiteForCandidate = (candidateId: string) => {
		return this.onSiteSchedule.find((onSite) => onSite.candidateId === candidateId);
	}

	public readonly addCandidate = (candidate: Candidate) => {
		this.candidates.push(candidate);
	}
}

export class JobsArray extends Array<Job> {
	public insertAt(index: number, job: Job) {
		this.splice(index, 0, job);
	}

	public deleteJob(job: Job) {
		const index = this.indexOf(job);
		this.splice(index, 1);
	}
}

export class InterviewerPool extends Array<Interviewer> {
	public removeAt(index: number) {
		this.splice(index, 1);
	}
}

export class HRData {
	jobsList: JobsArray;
	interviewerPool: InterviewerPool;

	constructor({ jobsList, interviewerPool }: { jobsList: Job[], interviewerPool: Interviewer[] }) {
		this.jobsList = new JobsArray(...jobsList);
		this.interviewerPool = new InterviewerPool(...interviewerPool);
	}
}



////////////////////////////////////////////////////////////////////////////
//////////////////////// Test Data Generation  /////////////////////////////
////////////////////////////////////////////////////////////////////////////
// export function createTestAppData() {
// 	const interviewers = [
// 		new Interviewer({
// 			interviewerId: "10",
// 			name: "Alice Johnson",
// 			role: "Technical Lead",
// 			availability: new Availability(["Monday", "Tuesday", "Wednesday"]),
// 		}),
// 		new Interviewer({
// 			interviewerId: "20",
// 			name: "Bob Smith",
// 			role: "HR Manager",
// 			availability: new Availability(["Monday", "Tuesday", "Wednesday"]),
// 		}),
// 		new Interviewer({
// 			interviewerId: "30",
// 			name: "Charlie Brown",
// 			role: "Senior Developer",
// 			availability: new Availability(["Thursday", "Friday"]),
// 		}),
// 		new Interviewer({
// 			interviewerId: "40",
// 			name: "Diana Prince",
// 			role: "Project Manager",
// 			availability: new Availability(["Thursday", "Friday"]),
// 		}),
// 		new Interviewer({
// 			interviewerId: "50",
// 			name: "Ethan Hunt",
// 			role: "QA Engineer",
// 			availability: new Availability(["Thursday", "Friday"]),
// 		}),
// 		new Interviewer({
// 			interviewerId: "60",
// 			name: "Fiona Gallagher",
// 			role: "DevOps Engineer",
// 			availability: new Availability(["Friday"]),
// 		}),
// 		new Interviewer({
// 			interviewerId: "70",
// 			name: "George Martin",
// 			role: "Product Owner",
// 			availability: new Availability(["Monday", "Tuesday", "Thursday", "Friday"]),
// 		}),
// 	];

// 	const hrData = new HRData({
// 		jobsList: [createTestJob(true)],
// 		interviewerPool: interviewers,
// 	});
// 	return hrData;
// }

// export function createTestCandidate() {
// 	const candidate = new Candidate({
// 		candidateId: Math.floor(Math.random() * 1001).toString(),
// 		name: getNextName(),
// 		yearsOfExperience: Math.floor(Math.random() * 20) + 1,
// 		availability: createFullyAvailable(),
// 		isUnread: false,
// 	});
// 	return candidate;
// }

// export function createTestJob(addCandidates: boolean) {
// 	const candidates = [
// 		new Candidate({
// 			candidateId: "1",
// 			name: "John Doe",
// 			yearsOfExperience: 5,
// 			availability: createFullyAvailable(),
// 			isUnread: false,
// 		}),
// 	];

// 	const onSiteSchedule = new OnSiteSchedule({
// 		day: "Monday",
// 		interviewerIds: ["10", "20", "70"],
// 		candidateId: "1",
// 		isUnread: false,
// 	});

// 	const job = new Job({
// 		jobId: Math.floor(Math.random() * 1001).toString(),
// 		jobState: "Open",
// 		jobTitle: "Software Engineer",
// 		jobDescription: `Overview
// 		We are seeking a Software Engineer to join our Microsoft Teams team, specializing in Enterprise Voice features. As an individual contributor, 
// 		you will lead the development, optimization, and maintenance of high-quality web applications, ensuring seamless integration with voice over 
// 		internet protocol (VoIP) and telephony systems. Collaborate with cross-functional teams to drive innovative solutions, enhance performance, and ensure reliability.
// 		Microsoft’s mission is to empower every person and every organization on the planet to achieve more. As employees we come together with a growth mindset, 
// 		innovate to empower others, and collaborate to realize our shared goals. Each day we build on our values of respect, integrity, and accountability to create a 
// 		culture of inclusion where everyone can thrive at work and beyond.

// 		Responsibilities
// 		- Web UI: Develop responsive web interfaces, leveraging modern front-end libraries and frameworks like React, Angular, or Vue.js to build intuitive user experiences. 
// 		- Automation and Tools: Create and refine internal tools to improve the stability of our products through automated testing, and minimize 
// 		long-term maintenance, release, and support costs. 
// 		- Research and Innovation: Stay informed about the latest trends in web technologies and tools, supporting the team in integrating new 
// 		technologies to maintain competitiveness and innovation. 
// 		- Technical Support and Collaboration: Work in a large cross-functional engineering team to implement end-to-end solutions by participating 
// 		in team and cross-functional discussions. Collaborate with Product Managers with diverse technological backgrounds. Work with support teams 
// 		and solve technical problems as they arise. 
		
// 		Qualifications
// 		Required Qualifications:
// 		- Bachelor's Degree in Computer Science, or related technical discipline with proven experience coding in languages including, but not limited to, 
// 		C, C++, C#, Java, JavaScript, or Python OR equivalent experience.
// 		- Experience with front-end web development and frameworks like React, Angular, or Vue.js. 
// 		- Experience with full-stack development, including databases and cloud technologies. 

// 		Preferred Qualifications:
// 		- Bachelor's Degree in Computer Science or related technical field AND 1+ year(s) technical engineering experience with coding in languages including, but not 
// 		limited to, C, C++, C#, Java, JavaScript, or Python OR Master's Degree in Computer Science or related technical field with proven experience coding in 
// 		languages including, but not limited to, C, C++, C#, Java, JavaScript, or Python OR equivalent experience.
// 		Experience with back-end development in Node.js, .NET, or Python. 
// 		Understanding of data structures, design patterns, and asynchronous programming. 
// 		`,
// 		candidates: addCandidates ? candidates : [],
// 		onSiteSchedule: addCandidates ? [onSiteSchedule] : [],
// 		isUnread: false,
// 	});
// 	return job;
// }

// const names = [
// 	"Carlos Hernandez",
// 	"Yuki Nakamura",
// 	"Liam O'Connor",
// 	"Maria Garcia",
// 	"Sofia Rossi",
// 	"Elena Petrova",
// 	"Jane Doe",
// 	"John Smith",
// 	"Amir Patel",
// 	"Robert Brown",
// 	"Emily Davis",
// 	"Michael Wilson",
// 	"Sarah Miller",
// 	"David Moore",
// 	"Laura Taylor",
// 	"James Anderson",
// 	"Wei Zhang",
// ];
// let currentIndex = 0;

// function getNextName() {
// 	const name = names[currentIndex];
// 	currentIndex = (currentIndex + 1) % names.length;
// 	return name;
// }

// function createFullyAvailable() {
// 	const avail = new Availability(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);
// 	return avail;
// }