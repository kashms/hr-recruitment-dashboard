import React, { createContext } from "react";
import { createRoot, Root } from "react-dom/client";
import { containerSchema } from "./infra/fluid.js";
import { treeConfiguration } from "@lab/appSchema.js";
import { createTestAppData } from "./utils/testData.js";
import "./output.css";
import { AttachState, IFluidContainer } from "fluid-framework";
import { HRApp } from "./hr_app.js";
import { createUndoRedoStacks, undoRedo } from "./utils/undo.js";
import { acquirePresenceViaDataObject } from "@fluid-experimental/presence";
import { PresenceManager } from "./utils/presenceManager.js";
import {
	TinyliciousClient,
	TinyliciousContainerServices,
} from "@fluidframework/tinylicious-client";
import { speStart } from "./infra/speStart.js";

export const PresenceContext = createContext<PresenceManager | undefined>(undefined);
export const UndoRedoContext = createContext<undoRedo | undefined>(undefined);

async function tinyliciousStart() {
	// Create the root element for React
	const app = document.createElement("div");
	app.id = "app";
	document.body.appendChild(app);
	const root = createRoot(app);

	//############################ START MODULE 0 changes here ##############################
	root.render(<HRApp data={createTestAppData()} />);
	//////////////////////////////// END MODULE 0 changes here //////////////////////////////

	//############################ START MODULE 1 changes here ##############################
	// createFluidContainer(root);
	//////////////////////////////// END MODULE 1 changes here //////////////////////////////
}

async function createFluidContainer(root: Root) {
	const tinyliciousClient = new TinyliciousClient({});

	let containerId = "";
	if (typeof window !== "undefined") {
		containerId = new URL(window.location.href).searchParams.get("fluidContainerId") || "";
	}

	let container: IFluidContainer<typeof containerSchema>;
	let services: TinyliciousContainerServices;

	if (containerId === "") {
		// containerId not found, need to create a new container
		({ container, services } = await tinyliciousClient.createContainer(containerSchema, "2"));
	} else {
		// containerId found, need to load the container
		({ container, services } = await tinyliciousClient.getContainer(
			containerId,
			containerSchema,
			"2",
		));
	}

	let appView = <div></div>;

	//############################ START MODULE 1 changes here ##############################
	// // Initialize the SharedTree Data Structure
	// const appData = container.initialObjects.appData.viewWith(treeConfiguration);
	// if (appData.compatibility.canInitialize) {
	// 	appData.initialize(createTestAppData());
	// }
	// // Create undo/redo stacks for the app
	// const undoRedoContext = createUndoRedoStacks(appData.events);

	// const appPresence = acquirePresenceViaDataObject(container.initialObjects.presence);
	// const presenceManagerContext: PresenceManager = new PresenceManager(
	// 	appPresence,
	// 	services.audience,
	// );
	// appView = (
	// 	<UndoRedoContext.Provider value={undoRedoContext}>
	// 		<HRApp data={appData} />
	// 	</UndoRedoContext.Provider>
	// );
	//////////////////////////////// END MODULE 1 changes here //////////////////////////////

	//############################ START MODULE 2 changes here ##############################
	// appView = (
	// 	<PresenceContext.Provider value={presenceManagerContext}>
	// 		<UndoRedoContext.Provider value={undoRedoContext}>
	// 			<HRApp data={appData} />
	// 		</UndoRedoContext.Provider>
	// 	</PresenceContext.Provider>
	// );
	//////////////////////////////// END MODULE 2 changes here //////////////////////////////

	root.render(appView);

	if (container.attachState === AttachState.Detached) {
		containerId = await container.attach();

		const url = new URL(window.location.href);
		const searchParams = url.searchParams;
		searchParams.set("fluidContainerId", containerId);
		const newUrl = `${url.pathname}?${searchParams.toString()}`;
		window.history.replaceState({}, "", newUrl);
	}
}

const targetServer = process.env.FLUID_CLIENT;

if (targetServer === "tinylicious") {
	tinyliciousStart().catch((error) => console.error(error));
} else if (targetServer === "spe") {
	speStart().catch((error) => console.error(error));
}
