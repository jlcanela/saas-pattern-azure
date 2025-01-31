/* eslint-disable @typescript-eslint/no-empty-object-type */

import { ProjectInfo, ProjectObjective } from "common";
import type { MachineParams } from "./types";
import { Schema } from "effect";

export const StateContext = Schema.Struct({
    display: Schema.Union(Schema.Literal("form"), Schema.Literal("review")).annotations({ title: "Display" }),
    navigationPrevious: Schema.Boolean.annotations({ title: "NavigationPrevious" }),
    info: Schema.optional(ProjectInfo).annotations({ title: "Project Info" }),
    objectives: Schema.optional(ProjectObjective).annotations({ title: "Project Objectives" }),
});


export type Context = Schema.Schema.Type<typeof StateContext>;
// context: {} as Context,

//export interface Context {
// readonly currentTime: number;
// readonly audioRef: HTMLAudioElement | null;
// readonly audioContext: AudioContext | null;
// readonly trackSource: MediaElementAudioSourceNode | null;
//}

export type Events = MachineParams<{
    info: { readonly data: ProjectInfo };
    objectives: { readonly data: ProjectObjective };
    previous: {};
    // play: {};
    // restart: {};
    // end: {};
    // pause: {};
    // loaded: {};
    // loading: { readonly audioRef: HTMLAudioElement };
    // error: { readonly message: unknown };
    // "init-error": { readonly message: unknown };
    // time: { readonly updatedTime: number };
}>;
