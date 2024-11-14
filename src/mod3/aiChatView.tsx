import React from "react";
import { asTreeViewAlpha } from "@fluidframework/tree/alpha";
import { Tree, TreeNode, TreeView } from "@fluidframework/tree";
import { aiCollab, AiCollabOptions } from "@fluidframework/ai-collab/alpha";
import { AzureOpenAI } from "openai";
import { HRData, OnSiteSchedule } from "./appSchema.js";

export interface AiChatViewProps {
	treeRoot: TreeView<typeof HRData>;
	showAnimatedFrame: (show: boolean) => void;
}

export function AiChatView(props: AiChatViewProps): JSX.Element {
	const executeAIChat = async () => {
		props.showAnimatedFrame(true);

		const inputPromptElement = document.getElementById(
			"ai-job-creation-input",
		) as HTMLInputElement;
		const inputPrompt = inputPromptElement.value;
		console.log("inputPrompt -->" + inputPrompt);

		const apiKey = process.env.AZURE_OPENAI_API_KEY;
		if (apiKey === null || apiKey === undefined) {
			throw new Error("AZURE_OPENAI_API_KEY environment variable not set");
		}

		const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
		if (endpoint === null || endpoint === undefined) {
			throw new Error("AZURE_OPENAI_ENDPOINT environment variable not set");
		}

		const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
		if (deployment === null || deployment === undefined) {
			throw new Error("AZURE_OPENAI_DEPLOYMENT environment variable not set");
		}

		// const originalBranch = getBranch(props.treeRoot);
		const viewAlpha = asTreeViewAlpha(props.treeRoot);
		const newBranchFork = viewAlpha.fork();

		const aiCollabOptions: AiCollabOptions = {
			openAI: {
				client: new AzureOpenAI({
					endpoint: endpoint,
					deployment: deployment,
					apiKey: apiKey,
					apiVersion: "2024-08-01-preview",
					dangerouslyAllowBrowser: true,
				}),
				modelName: "gpt-4o",
			},
			// planningStep: true,
			// finalReviewStep: true,
			treeNode: newBranchFork.root,
			prompt: {
				systemRoleContext:
					"You are an assistant that is helping out with a recruitment tool. You help draft job roles and responsibilities. You also help with on site interview plans and schedule." +
					"Some important information about the schema that you should be aware -- Each Candidate is uniquely identified by `candidateId` field. Each Interviewer is uniquely identified by `interviewerId` field." +
					"Each Job is uniquely identified by `jobId` field. Each job has an OnSiteSchedule array which is list of scheduled onsite interviews. An OnSiteSchedule object has candidateId which indicates the candidate for onsite and interviewerIds array" +
					" indicates which interviewers are doing the interviews. These ids help identify the candidate and interviewers uniquely and help map their objects in the app." +
					"Lastly, any object you update, make sure to set the `isUnread` field to true to indicate that the LLM or AI help was used. Only set the `llmCollboration` fields of object that you modify, not others.",
				userAsk: inputPrompt,
			},
			limiters: {
				maxModelCalls: 10,
			},
			dumpDebugLog: true,
			validator: (treeNode: TreeNode) => {
				const schemaIdentifier = Tree.schema(treeNode).identifier;
				if (schemaIdentifier === OnSiteSchedule.identifier) {
					(treeNode as OnSiteSchedule).validateInterviewers(
						newBranchFork.root.interviewerPool,
					);
				}
			},
		};
		console.log("sending request to llm");
		console.log(aiCollabOptions);

		try {
			const response = await aiCollab(aiCollabOptions);
			console.log("This will run if there's no error.");
			console.log("received response from llm");
			console.log(response);

			if (response.status === "success") {
				console.log("AI has completed request successfully");
				props.showAnimatedFrame(false);
				viewAlpha.merge(newBranchFork);
			} else {
				console.log("Copilot: Something went wrong processing your request");
				props.showAnimatedFrame(false);
			}
		} catch (error) {
			console.error("Caught an error:", error);
		}
	};

	return (
		<div className="flex flex-grow flex-row gap-1 content-center">
			<input
				id="ai-job-creation-input"
				className="bg-gray-50 p-2.5 flex-grow border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-500 focus:border-blue-500 block"
			/>
			<button
				className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-fit"
				onClick={() => executeAIChat()}
			>
				Ask AI for help!
			</button>
		</div>
	);
}
