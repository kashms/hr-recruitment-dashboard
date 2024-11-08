/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { TreeViewConfiguration, SchemaFactory, Tree } from "fluid-framework";

// Define a schema factory that is used to generate classes for the schema
const sf = new SchemaFactory("ef0b8eff-2876-4801-9b6a-973f09aab904");

export class Availability extends sf.array("Availability", sf.string) { }

export class OnSiteSchedule extends sf.object(
	"OnSiteSchedule",
	{
		day: sf.required(sf.string, {
			metadata: {
				description: "The day of the week that the candidate is scheduled for an onsite interview. This field is required. Candidate and interviewers should be available on the day of the onsite interview.",
			}
		}),
		interviewerIds: sf.required(sf.array(sf.string), {
			metadata: {
				description: "The interviewerId of interviewers part of the onsite. This field is required. The default is an empty array. There have to be 3 interviewers for each onsite interview. The ids in this array should map to interviewerId field in Interviewer object",
			}
		}),
		candidateId: sf.required(sf.string, {
			metadata: {
				description: "The candidateId of the candidate that is scheduled for an onsite interview. This field is required. The candidateId should map to the id field in the Candidate object",
			}
		}),
		llmCollaboration: sf.required(sf.boolean, {
			metadata: {
				description: "The boolean value that determines if the LLM or AI help was used. This field is required. The default is false. This field should be set to true when llm or ai makes any edits to any objects of this type",
			}
		}),
	}) {
	public readonly isUnseen = () => {
		return this.llmCollaboration;
	}
	public readonly setSeen = () => {
		if (this.llmCollaboration) {
			this.llmCollaboration = false;
		}
	}
}

export class Interviewer extends sf.object(
	"Interviewer",
	{
		role: sf.string,
		interviewerId: sf.required(sf.string, {
			metadata: {
				description: "The unique identifier of the interviewer. This field is required. This field is used to cross identify and reference the interviewer in the OnSiteSchedule",
			}
		}),
		name: sf.required(sf.string, {
			metadata: {
				description: "The name of the interviewer. This field is required.",
			}
		}),
		availability: sf.required(Availability, {
			metadata: {
				description: "The availability of the interviewer. This field is required.",
			},
		}),
	}) { }

export class Candidate extends sf.object(
	"Candidate",
	{
		name: sf.string,
		candidateId: sf.required(sf.string, {
			metadata: {
				description: "The unique identifier of the candidate. This field is required. This field is used to cross identify and reference the candidate in the OnSiteSchedule.",
			}
		}),
		yearsOfExperience: sf.number,
		availability: sf.required(Availability, {
			metadata: {
				description: "The availability of the candidate. This field is required. The default is an empty array." +
					"For this field, the only allowed values are the strings Monday,Tuesday,Wednesday,Thursday,Friday",
			},
		}),
		llmCollaboration: sf.required(sf.boolean, {
			metadata: {
				description: "The boolean value that determines if the LLM or AI help was used. This field is required. The default is false. This field should be set to true when llm or ai makes any edits to any objects of this type",
			}
		}),
	}) {
	public readonly isUnseen = () => {
		return this.llmCollaboration;
	}
	public readonly setSeen = () => {
		if (this.llmCollaboration) {
			this.llmCollaboration = false;
		}
	}
}

export class Job extends sf.object(
	"Job",
	{
		jobId: sf.string,
		jobState: sf.required(sf.string, {
			metadata: {
				description: `The job state of the job. This field is required. For this field, the only allowed values are the strings "open", "closed", "draft". The default is "draft"`,
			},
		}),
		jobTitle: sf.required(sf.string, {
			metadata: {
				description: `The title of the job. This field is required. Titles are short and clear`,
			},
		}),
		jobDescription: sf.required(sf.string, {
			metadata: {
				description: `The description of the job. This field is required. For this field include a brief description of the job.`,
			},
		}),
		candidates: sf.required(sf.array(Candidate), {
			metadata: {
				description: `The candidates who have applied for this job. This field is required. The default is an empty array. The objects of type Candidate are put in arrays here.`,
			},
		}),
		onSiteSchedule: sf.required(sf.array(OnSiteSchedule), {
			metadata: {
				description: `The schedule of the onsite interviews. This field is required. The default is an empty array. The objects of type OnSiteSchedule are put in arrays here. A valid onsite schedule should have an onsite interview day when the candidate is available, 3 available interviewers and a candidate.`,
			},
		}),
		llmCollaboration: sf.required(sf.boolean, {
			metadata: {
				description: "The boolean value that determines if the LLM or AI help was used. This field is required. The default is false. This field should be set to true when llm or ai makes any edits to any objects of this type",
			}
		}),
	}) {
	public readonly delete = () => {
		const parent = Tree.parent(this);
		if (Tree.is(parent, JobsArray)) {
			const index = parent.indexOf(this);
			parent.removeAt(index);
		}
	};

	public readonly addNewOnSiteForCandidate = (candiadteId: string) => {
		const newOnSite = new OnSiteSchedule({
			day: "Monday",
			interviewerIds: [],
			candidateId: candiadteId,
			llmCollaboration: false,
		});
		this.onSiteSchedule.insertAtEnd(newOnSite);
	};

	public readonly hasOnSiteForCandidate = (candidateId: string) => {
		return !!this.getOnSiteForCandidate(candidateId);
	}

	public readonly getOnSiteForCandidate = (candidateId: string) => {
		return this.onSiteSchedule.find((onSite) => onSite.candidateId === candidateId);
	}

	public readonly isUnseen = () => {
		return this.llmCollaboration;
	}
	public readonly setSeen = () => {
		if (this.llmCollaboration) {
			this.llmCollaboration = false;
		}
	}
}

export class JobsArray extends sf.array(
	"JobsArray", Job) { }

export class InterviewerPool extends sf.array(
	"InterviewerPool", Interviewer) { }

export class HRData extends sf.object(
	"HRData",
	{
		jobsList: JobsArray,
		interviewerPool: sf.required(InterviewerPool, {
			metadata: {
				description: `The interviewers who have been allowed to interview candidates that have applied to this role.
				This field is required. The default is an empty array. The objects of type Interviewer are put in arrays here.
				Interviewers should not be removed from this array.`,
			},
		}),
	}) { }

export const treeConfiguration = new TreeViewConfiguration(
	{ schema: HRData },
);


////////////////////////////////////////////////////////////////////////////
//////////////////////// Test Data Generation  /////////////////////////////
////////////////////////////////////////////////////////////////////////////
export function createTestAppData() {
	const interviewers = [
		new Interviewer({
			interviewerId: "10",
			name: "Alice Johnson",
			role: "Technical Lead",
			availability: new Availability(["Monday", "Tuesday", "Wednesday"]),
		}),
		new Interviewer({
			interviewerId: "20",
			name: "Bob Smith",
			role: "HR Manager",
			availability: new Availability(["Monday", "Tuesday", "Wednesday"]),
		}),
		new Interviewer({
			interviewerId: "30",
			name: "Charlie Brown",
			role: "Senior Developer",
			availability: new Availability(["Thursday", "Friday"]),
		}),
		new Interviewer({
			interviewerId: "40",
			name: "Diana Prince",
			role: "Project Manager",
			availability: new Availability(["Thursday", "Friday"]),
		}),
		new Interviewer({
			interviewerId: "50",
			name: "Ethan Hunt",
			role: "QA Engineer",
			availability: new Availability(["Thursday", "Friday"]),
		}),
		new Interviewer({
			interviewerId: "60",
			name: "Fiona Gallagher",
			role: "DevOps Engineer",
			availability: new Availability(["Friday"]),
		}),
		new Interviewer({
			interviewerId: "70",
			name: "George Martin",
			role: "Product Owner",
			availability: new Availability(["Monday", "Tuesday", "Thursday", "Friday"]),
		}),
	];

	const hrData = new HRData({
		jobsList: [createTestJob(true)],
		interviewerPool: interviewers,
	});
	return hrData;
}

export function createTestCandidate() {
	const candidate = new Candidate({
		candidateId: Math.floor(Math.random() * 1001).toString(),
		name: getNextName(),
		yearsOfExperience: Math.floor(Math.random() * 20) + 1,
		availability: createFullyAvailable(),
		llmCollaboration: false,
	});
	return candidate;
}

export function createTestJob(addCandidates: boolean) {
	const candidates = [
		new Candidate({
			candidateId: "1",
			name: "John Doe",
			yearsOfExperience: 5,
			availability: createFullyAvailable(),
			llmCollaboration: false,
		}),
	];

	const onSiteSchedule = new OnSiteSchedule({
		day: "Monday",
		interviewerIds: ["10", "20", "70"],
		candidateId: "1",
		llmCollaboration: false,
	});

	const job = new Job({
		jobId: Math.floor(Math.random() * 1001).toString(),
		jobState: "Open",
		jobTitle: "Software Engineer",
		jobDescription: `Overview
		We are seeking a Software Engineer to join our Microsoft Teams team, specializing in Enterprise Voice features. As an individual contributor, 
		you will lead the development, optimization, and maintenance of high-quality web applications, ensuring seamless integration with voice over 
		internet protocol (VoIP) and telephony systems. Collaborate with cross-functional teams to drive innovative solutions, enhance performance, and ensure reliability.
		Microsoft’s mission is to empower every person and every organization on the planet to achieve more. As employees we come together with a growth mindset, 
		innovate to empower others, and collaborate to realize our shared goals. Each day we build on our values of respect, integrity, and accountability to create a 
		culture of inclusion where everyone can thrive at work and beyond.

		Responsibilities
		- Web UI: Develop responsive web interfaces, leveraging modern front-end libraries and frameworks like React, Angular, or Vue.js to build intuitive user experiences. 
		- Automation and Tools: Create and refine internal tools to improve the stability of our products through automated testing, and minimize 
		long-term maintenance, release, and support costs. 
		- Research and Innovation: Stay informed about the latest trends in web technologies and tools, supporting the team in integrating new 
		technologies to maintain competitiveness and innovation. 
		- Technical Support and Collaboration: Work in a large cross-functional engineering team to implement end-to-end solutions by participating 
		in team and cross-functional discussions. Collaborate with Product Managers with diverse technological backgrounds. Work with support teams 
		and solve technical problems as they arise. 
		
		Qualifications
		Required Qualifications:
		- Bachelor's Degree in Computer Science, or related technical discipline with proven experience coding in languages including, but not limited to, 
		C, C++, C#, Java, JavaScript, or Python OR equivalent experience.
		- Experience with front-end web development and frameworks like React, Angular, or Vue.js. 
		- Experience with full-stack development, including databases and cloud technologies. 

		Preferred Qualifications:
		- Bachelor's Degree in Computer Science or related technical field AND 1+ year(s) technical engineering experience with coding in languages including, but not 
		limited to, C, C++, C#, Java, JavaScript, or Python OR Master's Degree in Computer Science or related technical field with proven experience coding in 
		languages including, but not limited to, C, C++, C#, Java, JavaScript, or Python OR equivalent experience.
		Experience with back-end development in Node.js, .NET, or Python. 
		Understanding of data structures, design patterns, and asynchronous programming. 
		`,
		candidates: addCandidates ? candidates : [],
		onSiteSchedule: addCandidates ? [onSiteSchedule] : [],
		llmCollaboration: false,
	});
	return job;
}

const names = [
	"Carlos Hernandez",
	"Yuki Nakamura",
	"Liam O'Connor",
	"Maria Garcia",
	"Sofia Rossi",
	"Elena Petrova",
	"Jane Doe",
	"John Smith",
	"Amir Patel",
	"Robert Brown",
	"Emily Davis",
	"Michael Wilson",
	"Sarah Miller",
	"David Moore",
	"Laura Taylor",
	"James Anderson",
	"Wei Zhang",
];
let currentIndex = 0;

function getNextName() {
	const name = names[currentIndex];
	currentIndex = (currentIndex + 1) % names.length;
	return name;
}

function createFullyAvailable() {
	const avail = new Availability(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);
	return avail;
}