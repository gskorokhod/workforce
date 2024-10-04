export interface Settings {
  development: boolean;
  assignmentMode: "simple" | "granular";
}

export const DEFAULTS: Settings = {
  development: true,
  assignmentMode: "simple"
};
