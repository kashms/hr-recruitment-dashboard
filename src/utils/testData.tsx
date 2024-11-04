import { Availability, Candidate, HRData, Interviewer, Job, OnSiteSchedule } from "../schema.js";

function createFullyAvailable() {
	const avail = new Availability(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);
	return avail;
}

export function createTestData() {
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

	const job = createTestJob();

	const hrData = new HRData({
		jobsList: [job],
		interviewerPool: interviewers,
	});
	return hrData;
}

export function createTestJob() {
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
		interviewerIds: ["10", "20", "40"],
		candidateId: "1",
		llmCollaboration: false,
	});

	const job = new Job({
		jobId: "1",
		jobState: "Open",
		jobTitle: "Software Engineer",
		jobDescription: "We are looking for a software engineer to join our team.",
		candidates: candidates,
		onSiteSchedule: [onSiteSchedule],
		llmCollaboration: false,
	});

	return job;
}

export function createTestCandidate() {
	const candidate = new Candidate({
		candidateId: Math.floor(Math.random() * 101).toString(),
		name: "Jane",
		yearsOfExperience: Math.floor(Math.random() * 20) + 1,
		availability: createFullyAvailable(),
		llmCollaboration: false,
	});
	return candidate;
}
