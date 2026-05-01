export type TASKS = {
  _id: string;
  submissionLink: string;
  page: string;
  status: "done" | "retry" | "pending";
  taskType: string;
  username: string;
  campaignId: string;
  campaignCompleted: string;
  validatedBy: string;
  user: string;
  createdAt?: string;
};

export type TASKSS = {
  _id: string;
  submissionLink: string;
  page: string;
  status: "done" | "retry" | "pending";
  taskType: string;
  username: string;
  questId: string;
  questCompleted: string;
  validatedBy: string;
  user: string;
  createdAt?: string;
};
