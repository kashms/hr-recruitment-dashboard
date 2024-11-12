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

	// {START MOD_0}
	root.render(<HRApp data={createTestAppData()} />);
	// {END MOD_0}

	// {START MOD_1}
	// crateFluidContainer(root);
	// {END MOD_1}
}

async function crateFluidContainer(root: Root) {
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

	// {START MOD_1}
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
	// {END MOD_1}

	// {START MOD_2}
	// appView = (
	// 	<PresenceContext.Provider value={presenceManagerContext}>
	// 		<UndoRedoContext.Provider value={undoRedoContext}>
	// 			<HRApp data={appData} />
	// 		</UndoRedoContext.Provider>
	// 	</PresenceContext.Provider>
	// );
	// {END MOD_2}

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
