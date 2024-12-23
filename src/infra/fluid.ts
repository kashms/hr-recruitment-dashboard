/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { ExperimentalPresenceManager } from "@fluidframework/presence/alpha";
import { OdspClient, OdspContainerServices } from "@fluidframework/odsp-client/beta";
import { type ContainerSchema, type IFluidContainer, SharedTree } from "fluid-framework";

/**
 * This function will create a container if no container ID is passed.
 * If a container ID is provided, it will load the container.
 *
 * @returns The loaded container and container services.
 */
export async function loadFluidData<T extends ContainerSchema>(
	containerId: string,
	containerSchema: T,
	client: OdspClient,
): Promise<{
	services: OdspContainerServices;
	container: IFluidContainer<T>;
}> {
	let container: IFluidContainer<T>;
	let services: OdspContainerServices;

	// Get or create the document depending if we are running through the create new flow
	if (containerId.length === 0) {
		// The client will create a new detached container using the schema
		// A detached container will enable the app to modify the container before attaching it to the client
		({ container, services } = await client.createContainer(containerSchema));
	} else {
		// Use the unique container ID to fetch the container created earlier. It will already be connected to the
		// collaboration session.
		({ container, services } = await client.getContainer(containerId, containerSchema));
	}

	return { services, container };
}

export const containerSchema = {
	initialObjects: {
		appData: SharedTree,
		// A Presence Manager object temporarily needs to be placed within container schema
		// https://github.com/microsoft/FluidFramework/blob/main/packages/framework/presence/README.md#onboarding
		presence: ExperimentalPresenceManager,
	},
} satisfies ContainerSchema;
