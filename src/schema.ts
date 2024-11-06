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
		day: sf.required(sf.string),
		interviewerIds: sf.required(sf.array(sf.string)),
		candidateId: sf.required(sf.string),
		llmCollaboration: sf.required(sf.boolean),
	}) { }

export class Interviewer extends sf.object(
	"Interviewer",
	{
		role: sf.string,
		interviewerId: sf.required(sf.string),
		name: sf.required(sf.string),
		availability: sf.required(Availability),
	}) { }

export class Candidate extends sf.object(
	"Candidate",
	{
		name: sf.string,
		candidateId: sf.required(sf.string),
		yearsOfExperience: sf.number,
		availability: sf.required(Availability),
		llmCollaboration: sf.required(sf.boolean),
	}) { }

export class Job extends sf.object(
	"Job",
	{
		jobId: sf.string,
		jobState: sf.required(sf.string),
		jobTitle: sf.required(sf.string),
		jobDescription: sf.required(sf.string),
		candidates: sf.required(sf.array(Candidate)),
		onSiteSchedule: sf.required(sf.array(OnSiteSchedule)),
		llmCollaboration: sf.required(sf.boolean),
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
}

export class JobsArray extends sf.array(
	"JobsArray", Job) { }

export class HRData extends sf.object(
	"HRData",
	{
		jobsList: JobsArray,
		interviewerPool: sf.required(sf.array(Interviewer)),
	}) { }

export const treeConfiguration = new TreeViewConfiguration(
	{ schema: HRData },
);
