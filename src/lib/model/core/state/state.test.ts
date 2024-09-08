import { describe, expect, it } from "vitest";
import { Skill } from "../skill";
import { Task } from "../task";
import { State } from "./index";
import { has } from "$lib/model/utils";

describe("State tests", () => {
  it("should create a new state", () => {
    const state = new State();
    expect(state).toBeDefined();
  });

  it("should put a skill into the state", () => {
    const state = new State();
    const skill = new Skill({ name: "Skill" }, state);
    skill.commit();
    expect(state.has(skill)).toBeTruthy();
  });

  it("should get a skill from the state", () => {
    const state = new State();
    const skill = new Skill({ name: "Skill" }, state);
    state.put(skill);
    expect(state.get(skill.uuid)?.eq(skill)).toBeTruthy();
  });

  it("should put a task with a skill into the state", () => {
    const state = new State();
    const skill = new Skill({ name: "Skill" }, state);
    const task = new Task({ name: "Task", skills: [skill] }, state);
    task.commit();
    expect(state.has(skill)).toBeTruthy();
    expect(state.has(task)).toBeTruthy();
    expect(has(skill.getTasks(), task)).toBeTruthy();
  });

  it("should delete a skill from the state", () => {
    const state = new State();
    const skill = new Skill({ name: "Skill" }, state);
    const task = new Task({ name: "Task", skills: [skill] }, state);
    task.commit();

    skill.delete();
    // The references take a tick to update, so we need to force the update
    task.update(true);

    expect(state.has(skill)).toBeFalsy();
    expect(state.has(task)).toBeTruthy();
    expect(task.skills.length).toBe(0);
  });

  it("should update a skill in the state", () => {
    const state = new State();
    const skill = new Skill({ name: "Skill" }, state);
    const task = new Task({ name: "Task", skills: [skill] }, state);
    skill.commit();

    skill.name = "New Skill";
    skill.commit();
    // The references take a tick to update, so we need to force the update
    task.update(true);

    expect(skill.name).toBe("New Skill");
    expect(task.skills[0].name).toBe("New Skill");
  });
});
